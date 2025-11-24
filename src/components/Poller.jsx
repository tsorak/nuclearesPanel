import { createEffect } from "solid-js";
import { onCleanup } from "solid-js";
import { createResource, createSignal } from "solid-js";

async function getVariable(varName) {
  let res;
  try {
    res = await fetch(`http://localhost:8785/?variable=${varName}`);
  } catch (_e) {
    return "";
  }

  return await res.text();
}

/*
 * parse, parserOverride, varName, title, unit, rate
 */
export default function Poller(props) {
  const { varName } = props;
  const parsePreset = props.parse ?? "String";
  const parserOverride = props.parserOverride ?? null;

  const [value, { refetch: refetchValue }] = createResource(async () => {
    const value = await getVariable(varName);

    if (parserOverride) {
      return await parserOverride(value);
    }

    return await parseVariable(value, parsePreset);
  });

  const title = props.title ?? varName ?? "";
  const unit = props.unit ?? "";

  const [pollRate, setPollRate] = createSignal(props.rate ?? 1000);
  const [editingPollRate, setEditingPollRate] = createSignal(false);

  const mutPollRate = {
    dec: () => {
      setPollRate((p) => {
        if (p <= 100) {
          return p;
        } else {
          return p - 100;
        }
      });
    },
    inc: () => {
      setPollRate((p) => p + 100);
    },
  };

  const pollRateHumanFormat = () => {
    const rawRate = pollRate();
    if (rawRate < 1000) {
      return `${rawRate}ms`;
    } else {
      return `${rawRate / 1000}s`;
    }
  };

  const poller = {
    id: null,
    currentRate: { get: pollRate, set: setPollRate },
    restart: function () {
      this.stop();

      this.id = setInterval(() => {
        refetchValue();
      }, this.currentRate.get());
    },
    stop: function () {
      if (this.id) {
        clearInterval(this.id);
      }
    },
  };

  createEffect(() => {
    if (!editingPollRate()) {
      poller.restart();
    }
  });

  onCleanup(() => {
    poller.stop();
  });

  return (
    <div
      class="flex bg-gray-500 px-2 pt-2"
      onpointerenter={() => setEditingPollRate(true)}
      onpointerleave={() => setEditingPollRate(false)}
      onwheel={(ev) => ev.deltaY > 0 ? mutPollRate.dec() : mutPollRate.inc()}
    >
      <div class="flex flex-col items-center">
        <span class="text-[8pt] leading-0">
          {pollRateHumanFormat()}
        </span>
        <h6>
          {title}
        </h6>
        <div class="bg-black w-full flex justify-center">
          <p class="flex gap-1 text-yellow-400 font-mono">
            {value.latest + unit}
          </p>
        </div>
      </div>
    </div>
  );
}

/*
 * parse, parserOverride, varName, title, unit, rate
 */
export function StoreCompatPoller({ storeEntry, mutStoreEntry }) {
  const {
    varName,
    parse: parsePreset,
    parserOverride,
    title,
    unit,
    rate,
  } = storeEntry;

  const getRate = () => storeEntry.rate;

  const [value, { refetch: refetchValue }] = createResource(
    varName,
    async (v) => {
      const value = await getVariable(v);

      if (parserOverride) {
        return await parserOverride(value);
      }

      return await parseVariable(value, parsePreset);
    },
  );

  // const [pollRate, setPollRate] = createSignal(rate ?? 1000);
  const [editingPollRate, setEditingPollRate] = createSignal(false);

  const mutPollRate = {
    dec: () => {
      mutStoreEntry("rate", (p) => {
        if (p <= 100) {
          return p;
        } else {
          return p - 100;
        }
      });
    },
    inc: () => {
      mutStoreEntry("rate", (p) => p + 100);
    },
  };

  const pollRateHumanFormat = () => {
    const rawRate = getRate();
    if (rawRate < 1000) {
      return `${rawRate}ms`;
    } else {
      return `${rawRate / 1000}s`;
    }
  };

  const poller = {
    id: null,
    restart: function () {
      this.stop();

      this.id = setInterval(() => {
        refetchValue();
      }, getRate());
    },
    stop: function () {
      if (this.id) {
        clearInterval(this.id);
      }
    },
  };

  createEffect(() => {
    if (!editingPollRate()) {
      poller.restart();
    }
  });

  onCleanup(() => {
    poller.stop();
  });

  return (
    <div
      class="flex bg-gray-500 px-2 pt-2"
      onpointerenter={() => setEditingPollRate(true)}
      onpointerleave={() => setEditingPollRate(false)}
      onwheel={(ev) => ev.deltaY > 0 ? mutPollRate.dec() : mutPollRate.inc()}
    >
      <div class="flex flex-col items-center">
        <span class="text-[8pt] leading-0">
          {pollRateHumanFormat()}
        </span>
        <h6>
          {title}
        </h6>
        <div class="bg-black w-full flex justify-center">
          <p class="flex gap-1 text-yellow-400 font-mono">
            {value.latest + unit}
          </p>
        </div>
      </div>
    </div>
  );
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
