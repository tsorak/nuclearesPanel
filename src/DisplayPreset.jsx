export const dpLocalStorage = {
  allKeys: () => {
    return Object.keys(localStorage).filter((k) =>
      k.startsWith("DISPLAY_PRESET_")
    ).map((k) => removeDPConstantFromString(k));
  },
  get: (name) => {
    if (!name) return null;
    const v = localStorage.getItem(`DISPLAY_PRESET_${name}`);

    if (v) {
      return JSON.parse(v);
    } else {
      return null;
    }
  },
  set: (name, obj) => {
    localStorage.setItem(`DISPLAY_PRESET_${name}`, JSON.stringify(obj));
  },

  getUnnamed: (id) => {
    if (!id) return null;
    const v = localStorage.getItem(`UNNAMED_DISPLAY_PRESET_${id}`);

    if (v) {
      return JSON.parse(v);
    } else {
      return null;
    }
  },
  setUnnamed: (id, obj) => {
    localStorage.setItem(`UNNAMED_DISPLAY_PRESET_${id}`, JSON.stringify(obj));
  },

  migrateToNamed: (id, name, obj, opts) => {
    const overwrite = opts.overwrite ?? false;

    if (dpLocalStorage.get(name) && !overwrite) {
      throw new Error("Preset with name already exists");
    }

    dpLocalStorage.set(name, obj);
    throw "WIP";
    localStorage.removeItem(`UNNAMED_DISPLAY_PRESET_${id}`);

    return true;
  },
};

function removeDPConstantFromString(s) {
  return s.split("_").splice(1).join("_");
}

export function loadDisplays(displays) {
  if (!displays) return null;

  return Object.fromEntries(
    Object.entries(displays).map((
      [sec, obj],
    ) => {
      if (obj.presetName) {
        return [sec, dpLocalStorage.get(obj.presetName)];
      } else {
        return [sec, dpLocalStorage.getUnnamed(obj.presetId)];
      }
    }),
  );
}
