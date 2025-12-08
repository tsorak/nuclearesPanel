import { createSignal, For, Show } from "solid-js";
import { unwrap } from "solid-js/store";

import { Input } from "../../AddTile.jsx";

export default function Light(props) {
  const {
    colorIntervals,
    size,
  } = {
    colorIntervals: unwrap(props.default?.light?.colorIntervals) ?? [],
    size: props.default?.light?.size ?? 16,
  };

  const [intervals, setIntervals] = createSignal(
    colorIntervals,
    {
      equals: false,
    },
  );

  const updateInterval = (i, field, parser = (v) => v) => {
    return (ev) => {
      setIntervals((p) => {
        const u = p;
        u[i][field] = parser(ev.target.value);
        return u;
      });
    };
  };

  const Jsx = () => (
    <div>
      <Show when={!!intervals().length}>
        <div class="grid grid-cols-3">
          <h5>Trigger Value</h5>
          <h5>Color</h5>
          <h5>Pulse Rate</h5>
        </div>
      </Show>
      <For each={intervals()}>
        {(range, i) => {
          const rangeId = i();
          return (
            <div class="flex">
              <div class="grid grid-cols-3">
                <Input
                  type="text"
                  value={range[0]}
                  oninput={updateInterval(rangeId, 0, (s) => Number(s))}
                />
                <Input
                  type="text"
                  value={range[1]}
                  oninput={updateInterval(rangeId, 1)}
                />
                <select
                  name="lightPulseRate"
                  class="bg-gray-500"
                  value={range[2]?.animation?.[1] ?? ""}
                  oninput={updateInterval(rangeId, 2, (s) => {
                    if (!s) return undefined;

                    return {
                      animation: [
                        "pulse",
                        Number(s),
                      ],
                    };
                  })}
                >
                  <option value="" />
                  <option value="1">Slow</option>
                  <option value="0.5">Medium</option>
                  <option value="0.2">Fast</option>
                </select>
              </div>
              <button
                class="cursor-pointer"
                type="button"
                onclick={() =>
                  setIntervals((p) => {
                    const u = new Set(p);
                    u.delete(range);
                    return Array.from(u);
                  })}
              >
                X
              </button>
            </div>
          );
        }}
      </For>
      <button
        class="cursor-pointer bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded whitespace-nowrap"
        type="button"
        onclick={() =>
          setIntervals((p) => {
            let prevItem = p.length - 1;
            prevItem = prevItem >= 0 ? prevItem : null;

            const u = p;
            u.push([
              prevItem !== null ? p[prevItem][0] : 0,
              "#f009",
            ]);
            return u;
          })}
      >
        <Show when={intervals().length} fallback="Add a level indicator light">
          Add another light interval
        </Show>
      </button>
      <Show when={!!intervals().length}>
        <Input
          type="text"
          title="Light size (px)"
          name="lightSize"
          value={size}
        />
      </Show>
    </div>
  );

  return {
    Jsx,
    signals: {
      intervals: { get: intervals, set: setIntervals },
    },
  };
}

function colorIntervalsFromHighlights(arr) {
  return arr.map(([from, _to, color]) => [from, color]);
}
