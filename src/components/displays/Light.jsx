import { createSignal, onCleanup, onMount } from "solid-js";

export default function Light(props) {
  const colorIntervals = props.colorIntervals ??
    [[false, null], [true, "#f00"]];
  const size = props.size ?? 16;
  const value = props.value ?? counter();

  const map = Object.fromEntries(
    colorIntervals.map((
      [k, color, opts],
    ) => [k, opts ? { color, ...opts } : { color }]),
  );

  const intervals = colorIntervals.map(([k]) => k);

  const v = () => {
    let v = findClosestFloor(intervals, value());
    if (v === null) return null;

    if (typeof value() === "boolean") {
      v = !!v;
    }

    return map[v];
  };

  const _LOAD_TAILWIND_CLASSES = ["animate-pulse"];

  const animation = (v) => {
    v = v();
    if (!v.animation) return {};
    if (typeof v?.animation == "string") {
      return {
        "animation": `${v.animation} 1s infinite`,
      };
    } else if (v?.animation?.[0]) {
      return {
        "animation": `${v.animation[0]} ${v.animation[1] ?? 1}s infinite`,
      };
    }
  };

  return (
    <div
      class="rounded-full border-gray-400"
      style={{
        "width": size + "px",
        "height": size + "px",
        "border-width": size / 8 + "px",
      }}
    >
      <div
        class="w-full h-full rounded-full"
        style={{
          "background": v()?.color ?? "#333",
        }}
      >
        <div
          class="rounded-full w-full h-full"
          style={{
            ...(animation(v)),
            ...(v()?.color
              ? {
                "box-shadow": `0px 0px ${
                  size * (1 + (v().bloomIntensity ?? 0) * 2)
                }px ${
                  size * (0.25 + (v().bloomIntensity ?? 0))
                }px ${v().color}`,
              }
              : {}),
          }}
        />
      </div>
    </div>
  );
}

export const counter = () => {
  const [count, setCount] = createSignal(0);

  let id;

  onMount(() => {
    id = setInterval(() => setCount((p) => p + 1), 1000);
  });

  onCleanup(() => {
    clearInterval(id);
  });

  return count;
};

function findClosestFloor(arr, n) {
  const filtered = arr.filter((val) => val <= n);
  return filtered.length > 0 ? Math.max(...filtered) : null;
}
