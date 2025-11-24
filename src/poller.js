import { createResource, createSignal } from "solid-js";

/**
 * variable, getRate, parsePreset, parserOverride
 */
export function makePoller(config) {
  const { variable, getRate, parsePreset, parserOverride } = config;

  const [value, { refetch }] = createResource(
    async () => {
      const value = await getVariable(variable);

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
    return "";
  }

  return await res.text();
}

function parseVariable(v, type) {
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
