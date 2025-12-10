import { createResource, createSignal } from "solid-js";
import { createStore } from "solid-js/store";

// We may want to display the same variable in multiple tiles
// Instead of doing poll logic within the tile component,
// have components ask this store for the latest data
export function makePollerStore(tileStore) {
  const [store, setStore] = createStore({});

  for (const [varName, { pointer }] of Object.entries(tileStore)) {
    const { parse, rate, parserOverride } = pointer();

    const config = {
      variable: varName,
      getRate: rate.get,
      parsePreset: parse,
      parserOverride,
    };

    const poller = makePoller(config);

    setStore(varName, poller);
  }

  startLastActive(store);

  // const pollerA = {
  //   value,
  //   refetch,
  //   poller,
  //   subscribers,
  // }

  globalThis.addEventListener("beforeunload", () => beforeUnload(store));

  return ({
    store: { proxy: store, set: setStore },
    subscribe: function (config) {
      const { variable } = config;

      const poller = this.store.proxy[variable];

      if (!poller) {
        const poller = makePoller(config);
        poller.subscribers = 1;
        this.store.set(variable, poller);
        return this.store.proxy[variable];
      }

      if (poller.deleteId) {
        this.clearScheduledDeletion(variable);
      }

      this.store.set(variable, "subscribers", (p) => {
        if (!p) {
          return 1;
        } else {
          return p++;
        }
      });

      return poller;
    },
    unsubscribe: function (variable) {
      const poller = this.store.proxy[variable];

      if (!poller) {
        return;
      }

      if (poller.subscribers <= 1) {
        this.scheduleDeletion(variable);
        this.store.set(variable, "subscribers", 0);
      } else {
        this.store.set(variable, "subscribers", (p) => p--);
      }
    },
    scheduleDeletion: function (variable) {
      if (this.store.proxy[variable].deleteId) return;

      const id = setTimeout(() => {
        this.store.proxy[variable].interval.stop();
        this.store.set(variable, undefined);
      }, 1000);

      this.store.set(variable, "deleteId", id);
    },
    clearScheduledDeletion: function (variable) {
      const poller = this.store.proxy[variable];
      clearTimeout(poller.deleteId);
      this.store.set(variable, "deleteId", undefined);
    },
  });
}

function startLastActive(store) {
  const v = localStorage.getItem("lastActivePollers");
  if (v) {
    let variables;
    try {
      variables = JSON.parse(v);
    } catch (_e) {
      localStorage.removeItem("lastActivePollers");
      return;
    }

    for (const varName of variables) {
      store[varName]?.interval.restart();
    }
  }
}

function beforeUnload(pollers) {
  const data = Object.entries(pollers).filter(([_varName, poller]) => {
    return poller.interval.active();
  }).map(([varName, _]) => varName);
  const str = JSON.stringify(data);
  localStorage.setItem("lastActivePollers", str);
}

/**
 * variable, getRate, parsePreset, parserOverride
 */
export function makePoller(config) {
  const { variable, getRate, parsePreset, parserOverride } = config;

  const [value, { refetch }] = createResource(
    async () => {
      const value = await getVariable(variable);

      // for some reason getVariable refuses to throw errors up the stack...
      // ugly way required
      if (value instanceof Error) {
        return value;
      }

      if (parserOverride) {
        return await parserOverride(value);
      }

      return await parseVariable(value, parsePreset);
    },
  );

  const [active, setActive] = createSignal(false);

  let id = null;
  const interval = {
    active,
    // id: null,
    restart: function () {
      this.stop();

      id = setInterval(() => {
        refetch();
      }, getRate());
      setActive(true);
    },
    stop: function () {
      if (id) {
        clearInterval(id);
        id = null;
        setActive(false);
      }
    },
  };

  // interval.restart();

  return {
    value,
    refetch,
    interval,
  };
}

async function getVariable(variable) {
  let res;
  try {
    res = await fetch(`http://localhost:8785/?variable=${variable}`);
  } catch (_e) {
    return new Error("Failed to fetch " + variable);
  }

  return await res.text();
}

function parseVariable(v, type) {
  // In windows the Nucleares webserver responds with a comma instead of a period char.
  // Javascripts Number constructor does not accept commas. Therefore we need this workaround:
  if (shouldCheckForDecimal(type)) {
    v = v.replace(",", ".");
  }

  try {
    switch (type) {
      case "Number":
        return Math.round(new Number(v));
      case "String":
        return v;
      case "Decimal":
        return new Number(v);
      case "1Decimal":
        return Math.round(new Number(v) * 10) / 10;
      case "2Decimal":
        return Math.round(new Number(v) * 100) / 100;
      case "3Decimal":
        return Math.round(new Number(v) * 1000) / 1000;
      case "Boolean":
        return v === "True";
      case "StringNewlineList":
        return "".split("\n");
      // case "Json":
      //   return JSON.parse(v);
      default:
        return "ERROR: NO PARSER MATCHED";
    }
  } catch (err) {
    return "PARSER ERROR:" + err;
  }
}

function shouldCheckForDecimal(parser) {
  return ["Number", "Decimal", "1Decimal", "2Decimal", "3Decimal"].includes(
    parser,
  );
}
