export const dpLocalStorage = {
  allKeys: () => {
    return Object.keys(localStorage).filter((k) => {
      return k.startsWith("DISPLAY_PRESET_") ||
        k.startsWith("UNNAMED_DISPLAY_PRESET_");
    }).map((k) => toPresetEntry(k));
  },
  allNamedKeys: () => {
    return Object.keys(localStorage).filter((k) =>
      k.startsWith("DISPLAY_PRESET_")
    ).map((k) => toPresetEntry(k));
  },

  get: (name) => {
    if (!name) return null;
    const v = localStorage.getItem(`DISPLAY_PRESET_${name}`);

    if (v) {
      return JSON.parse(v, (k, v) => {
        if (k === "updatedAt") {
          return new Date(v);
        }

        return v;
      });
    } else {
      return null;
    }
  },
  set: (name, obj) => {
    localStorage.setItem(
      `DISPLAY_PRESET_${name}`,
      JSON.stringify({ ...obj, presetId: undefined }),
    );
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

    if (!overwrite && dpLocalStorage.get(`DISPLAY_PRESET_${name}`)) {
      throw new Error("Preset with name already exists");
    }

    dpLocalStorage.set(name, obj);
    localStorage.removeItem(`UNNAMED_DISPLAY_PRESET_${id}`);

    return true;
  },
};

function toPresetEntry(str) {
  const v = str.split("PRESET_").splice(1).join("_");
  if (str.startsWith("DISPLAY_PRESET_")) {
    return v;
  } else if (str.startsWith("UNNAMED_DISPLAY_PRESET_")) {
    return v;
  }
  return null;
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
