import { getCurrentWindow } from "@tauri-apps/api/window";

export default function WindowControls(props) {
  const w = getCurrentWindow();

  return (
    <div class="flex px-2 bg-neutral-800 text-neutral-300">
      <div>
        ☢
      </div>
      <button
        type="button"
        class="flex-grow select-none"
        onmousedown={async () => {
          console.count("dragging");
          const dragging = w.startDragging();

          await dragging;
          console.count("done");
        }}
      >
      </button>
      <div class="flex gap-2 items-center">
        <button
          class="cursor-pointer hover:bg-neutral-700 transition-colors w-6 h-6"
          type="button"
          onclick={() => w.minimize()}
        >
          -
        </button>

        <button
          class="cursor-pointer hover:bg-neutral-700 transition-colors w-6 h-6"
          type="button"
          onclick={async () =>
            await w.isMaximized() ? w.unmaximize() : w.maximize()}
        >
          □
        </button>

        <button
          class="cursor-pointer hover:bg-neutral-700 transition-colors w-6 h-6"
          type="button"
          onclick={() => w.close()}
        >
          X
        </button>
      </div>
    </div>
  );
}
