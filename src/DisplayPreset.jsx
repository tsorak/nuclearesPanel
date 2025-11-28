import { useContext } from "solid-js";
import { createContext } from "solid-js";

const o = {
  storage: JSON.parse(localStorage.getItem("displayPresets")) ?? [],
  beforeUnload: function () {
    localStorage.setItem("displayPresets", JSON.stringify(this.storage));
  },
};

export const DisplayPresets = createContext(o);

export const useDisplayPresetsContext = () => useContext(DisplayPresets);

globalThis.addEventListener(
  "beforeunload",
  () => {
    useDisplayPresetsContext().beforeUnload();
  },
);
