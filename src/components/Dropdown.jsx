import { createSignal, Show } from "solid-js";

const btnClass =
  "bg-gray-600 hover:bg-gray-500 active:bg-gray-700 transition-colors text-white py-1 px-2 cursor-pointer";

const itemClass =
  "block w-full text-left px-3 py-2 hover:bg-gray-500 transition-colors cursor-pointer text-white";

export default function Dropdown(props) {
  const [open, setOpen] = createSignal(false);

  return (
    <div
      class="relative"
      onmouseenter={() => setOpen(true)}
      onmouseleave={() => setOpen(false)}
    >
      <button type="button" class={props.btnClass ?? btnClass}>
        {props.label}
      </button>
      <Show when={open()}>
        <div class="absolute bg-gray-600 border border-gray-600 rounded-b-md shadow-lg z-10 min-w-max overflow-hidden">
          {props.children}
        </div>
      </Show>
    </div>
  );
}

export function DropdownItem(props) {
  return (
    <button
      type="button"
      class={`${itemClass} ${props.class ?? ""}`}
      onclick={props.onclick}
    >
      {props.children}
    </button>
  );
}
