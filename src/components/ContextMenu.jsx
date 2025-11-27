import { createSignal } from "solid-js";
import { useContext } from "solid-js";
import { createContext } from "solid-js";

const o = {
  shownElem: createObjSignal(null, { equals: false }),
  show: function (menu) {
    return (ev) => {
      ev.preventDefault();
      const { clientX, clientY } = ev;
      this.shownElem.set({ clientX, clientY, menu });
    };
  },
};

const ContextMenu = createContext(o);

export function useContextMenu() {
  return useContext(ContextMenu);
}

export default function ContextMenuElem(props) {
  return (
    <ContextMenu.Provider>
      <div class="relative">
        <Presenter />
      </div>
      {props.children}
    </ContextMenu.Provider>
  );
}

function Presenter(_props) {
  const cmenu = useContextMenu();

  const elem = () => {
    const v = cmenu.shownElem.get();
    if (!v) return null;

    const { clientX, clientY, menu } = v;

    return (
      <div
        class="relative w-min"
        style={{ "left": `${clientX}px`, "top": `${clientY}px` }}
      >
        {menu()}
      </div>
    );
  };

  const open = () => !!cmenu.shownElem.get();

  return (
    <div
      id="contextmenucloser"
      class="absolute w-screen h-screen z-1000"
      style={{ "pointer-events": !open() ? "none" : null }}
      onclick={(ev) => {
        if (ev.target.id !== "contextmenucloser") return;
        cmenu.shownElem.set(null);
      }}
    >
      {elem()}
    </div>
  );
}

/**
 * @param {T} initialValue
 * @returns {{get: () => T, set: (v: T) => void | (cb: (p: T) => T) => void}}
 */
function createObjSignal(initialValue, opts = {}) {
  const [get, set] = createSignal(initialValue, opts);
  return { get, set };
}
