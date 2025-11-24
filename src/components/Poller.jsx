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
      poller.interval.restart();
    }
  });

  onCleanup(() => {
    pollerStore.unsubscribe(varName);
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
            {poller.value.latest + unit}
          </p>
        </div>
      </div>
    </div>
  );
}
