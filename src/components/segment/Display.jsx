import { Hbar, Vbar } from "./Bar.jsx";
import { Show } from "solid-js";

export default function Display(props) {
  const { size } = props;
  const v = props.v ?? 0;
  const enabled = props.enabled ?? true;

  const cfg = (i) => !!barConfigPerWholeNumber[v()][i];

  return (
    <div class="flex flex-col">
      <div class="grid grid-cols-[auto_1fr_auto]">
        <div />
        <Show when={enabled && cfg(0)} fallback={<Hbar size={size} />}>
          <Hbar size={size} lit={cfg(0)} />
        </Show>
        <div />

        <Show when={enabled && cfg(1)} fallback={<Vbar size={size} />}>
          <Vbar size={size} lit={cfg(1)} />
        </Show>
        <div />
        <Show when={enabled && cfg(2)} fallback={<Vbar size={size} />}>
          <Vbar size={size} lit={cfg(2)} />
        </Show>

        <div />
        <Show when={enabled && cfg(3)} fallback={<Hbar size={size} />}>
          <Hbar size={size} lit={cfg(3)} />
        </Show>
        <div />

        <Show when={enabled && cfg(4)} fallback={<Vbar size={size} />}>
          <Vbar size={size} lit={cfg(4)} />
        </Show>
        <div />
        <Show when={enabled && cfg(5)} fallback={<Vbar size={size} />}>
          <Vbar size={size} lit={cfg(5)} />
        </Show>

        <div />
        <Show when={enabled && cfg(6)} fallback={<Hbar size={size} />}>
          <Hbar size={size} lit={cfg(6)} />
        </Show>
        <div />
      </div>
    </div>
  );
}

const barConfigPerWholeNumber = [
  [1, 1, 1, 0, 1, 1, 1],
  [0, 0, 1, 0, 0, 1, 0],
  [1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 0, 1, 1],
  [0, 1, 1, 1, 0, 1, 0],
  [1, 1, 0, 1, 0, 1, 1],
  [1, 1, 0, 1, 1, 1, 1],
  [1, 0, 1, 0, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 0, 1, 1],
];
