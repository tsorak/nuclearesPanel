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

export const dpLocalStorage = {
  allKeys: () => {
    return Object.keys(localStorage).filter((k) =>
      k.startsWith("DISPLAYPRESET_")
    ).map((k) => removeDPConstantFromString(k));
  },
  get: (name) => {
    if (!name) return null;
    const v = localStorage.get(`DISPLAYPRESET_${name}`);

    if (v) {
      return JSON.parse(v);
    } else {
      return null;
    }
  },
  set: (name, obj) => {
    localStorage.setItem(`DISPLAYPRESET_${name}`, JSON.stringify(obj));
  },
};

function removeDPConstantFromString(s) {
  return s.split("_").splice(1).join("_");
}

export function loadDisplays(displayNames) {
  if (!displayNames) return null;

  return Object.fromEntries(
    Object.entries(displayNames).map((
      [sec, name],
    ) => [sec, dpLocalStorage.get(name)]),
  );
}
