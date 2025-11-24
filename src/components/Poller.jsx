import { createEffect, createSignal, onCleanup } from "solid-js";

export default function Poller({ storeEntry, mutStoreEntry, pollerStore }) {
  const {
    varName,
    parse: parsePreset,
    parserOverride,
    title,
    unit,
  } = storeEntry;
  const getRate = () => storeEntry.rate;

  const poller = pollerStore.subscribe({
    variable: varName,
    getRate,
    parsePreset,
    parserOverride,
  });

  let lastRate = getRate();
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

  createEffect(() => {
    if (!editingPollRate()) {
      const rate = getRate();
      if (rate !== lastRate) {
        poller.interval.restart();
        lastRate = rate;
      }
    }
  });

  onCleanup(() => {
    pollerStore.unsubscribe(varName);
  });

  const pollerStatusBg = () => poller.interval.active() ? "#0f0" : "#f00";
  const pollerToggle = () => {
    if (poller.interval.active()) {
      poller.interval.stop();
    } else {
      poller.interval.restart();
    }
  };

  return (
    <div
      class="flex px-2 pt-2"
      onpointerenter={() => setEditingPollRate(true)}
      onpointerleave={() => setEditingPollRate(false)}
      onwheel={(ev) => ev.deltaY > 0 ? mutPollRate.dec() : mutPollRate.inc()}
    >
      <div class="relative flex flex-col items-center">
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
            {poller.value.latest + unit}
          </p>
        </div>
      </div>
    </div>
  );
}
