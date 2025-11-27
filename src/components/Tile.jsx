import { createEffect, createSignal, onCleanup } from "solid-js";
import { useContextMenu } from "./ContextMenu.jsx";

export default function Tile({ tilePointer, pollerStore, addToSection }) {
  const {
    varName,
    parse: parsePreset,
    parserOverride,
    title,
    unit,
    rate,
  } = tilePointer();

  const poller = pollerStore.subscribe({
    variable: varName,
    getRate: rate.get,
    parsePreset,
    parserOverride,
  });

  let lastRate = rate.get();
  const [editingPollRate, setEditingPollRate] = createSignal(false);

  const mutPollRate = {
    dec: () => {
      rate.set((p) => {
        if (p <= 100) {
          return p;
        } else {
          return p - 100;
        }
      });
    },
    inc: () => {
      rate.set((p) => p + 100);
    },
  };

  const pollRateHumanFormat = () => {
    const rawRate = rate.get();
    if (rawRate < 1000) {
      return `${rawRate}ms`;
    } else {
      return `${rawRate / 1000}s`;
    }
  };

  createEffect(() => {
    if (!editingPollRate()) {
      const r = rate.get();
      if (r !== lastRate) {
        poller.interval.restart();
        lastRate = r;
      }
    }
  });

  onCleanup(() => {
    pollerStore.unsubscribe(varName);
  });

  const [bgTimeout, setBgTimeout] = createSignal(false);

  createEffect(() => {
    if (poller.value.loading) {
      setBgTimeout(true);
      setTimeout(() => {
        setBgTimeout(false);
      }, 100);
    }
  });

  const pollerStatusBg = () => {
    if (bgTimeout() || poller.value.loading) return "#08f";

    return poller.interval.active() ? "#0f0" : "#f00";
  };
  const pollerToggle = () => {
    if (poller.interval.active()) {
      poller.interval.stop();
    } else {
      poller.interval.restart();
    }
  };

  const displayValue = () => {
    const v = poller.value.latest;
    if (v instanceof Error) {
      return "ERROR";
    } else {
      return `${v}${unit}`;
    }
  };

  const cmenu = useContextMenu();

  return (
    <div
      class="flex px-2 pt-2"
      onpointerenter={() => setEditingPollRate(true)}
      onpointerleave={() => setEditingPollRate(false)}
      onwheel={(ev) => ev.deltaY > 0 ? mutPollRate.dec() : mutPollRate.inc()}
      oncontextmenu={cmenu.show(() => <ContextMenu {...{ tilePointer }} />)}
    >
      <div class="relative flex flex-col items-center">
        <span
          class="absolute w-2 h-2 rounded-full -left-1 -top-1 leading-0 cursor-pointer text-center"
          onclick={cmenu.show(() => <ContextMenu {...{ tilePointer }} />)}
        >
          .
        </span>
        <span class="text-[8pt] leading-0">
          {pollRateHumanFormat()}
        </span>
        <span
          class="absolute w-2 h-2 rounded-full -right-1 -top-1"
          style={{ "background": pollerStatusBg() }}
          onclick={pollerToggle}
        >
        </span>
        <h6>
          {title}
        </h6>
        <div class="bg-black w-full flex justify-center">
          <p class="flex gap-1 text-yellow-400 font-mono">
            {displayValue()}
          </p>
        </div>
      </div>
    </div>
  );
}

function ContextMenu(props) {
  const { tilePointer } = props;

  const {
    varName,
    parse: parsePreset,
    parserOverride,
    title,
    unit,
    rate,
  } = tilePointer();

  return (
    <div class="bg-gray-500 rounded p-2 text-white">
      <h6>{varName}</h6>
    </div>
  );
}
