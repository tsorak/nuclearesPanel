import { createEffect, createSignal, For, onCleanup, onMount } from "solid-js";
import { createObjSignal } from "./ContextMenu.jsx";

import Display from "./segment/Display.jsx";

export default function SegmentDisplay(props) {
  const segmentsAmount = props.segments;
  const value = props.value ?? counter();
  const size = props.size ?? 2;

  const segments = new Array(segmentsAmount).fill(null).map(() =>
    createObjSignal(0)
  );

  createEffect(() => {
    const arr = getNumberPerSegments(value(), segmentsAmount);

    segments.forEach(({ set }, i) => {
      set(arr[i]);
    });
  });

  return (
    <div class="flex gap-1 bg-black p-1">
      <For each={segments}>
        {({ get }, i) => <Display v={get} size={size} />}
      </For>
    </div>
  );
}

const counter = () => {
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

const getNumberPerSegments = (v, segCount) => {
  let vStr = `${v}`;
  if (vStr.length < segCount) {
    // how many 0s to the left we are missing
    // example: we have 3 segments but get a value of 14.
    // Expected output: 014.
    const n = segCount - vStr.length;

    const arr = [...(new Array(n).fill("0")), ...vStr.split("")];

    return arr.map(Number);
  } else {
    const n = vStr.length - segCount;

    if (n === 0) {
      return vStr.split("").map(Number);
    } else {
      return vStr.substring(n).split("").map(Number);
    }
  }
};
