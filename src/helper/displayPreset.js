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
        if (k === "saveDate") {
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
      JSON.stringify({
        ...obj,
        presetId: undefined,
        modifiedDate: undefined,
      }),
    );
  },

  getUnnamed: (id) => {
    if (!id) return null;
    const v = localStorage.getItem(`UNNAMED_DISPLAY_PRESET_${id}`);

    if (v) {
      return JSON.parse(v, (k, v) => {
        if (k === "modifiedDate") {
          return new Date(v);
        }
        return v;
      });
    } else {
      return null;
    }
  },
  setUnnamed: (id, obj) => {
    localStorage.setItem(
      `UNNAMED_DISPLAY_PRESET_${id}`,
      JSON.stringify({
        ...obj,
        saveDate: undefined,
      }),
    );
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
        const unnamed = dpLocalStorage.getUnnamed(obj.presetId);
        const preset = dpLocalStorage.get(obj.presetName);

        if (!unnamed || !unnamed.modifiedDate) {
          return [sec, { ...preset, presetId: obj.presetId }];
        }

        if (unnamed.modifiedDate > preset.saveDate) {
          return [sec, unnamed];
        } else {
          return [sec, { ...preset, presetId: obj.presetId }];
        }
      } else {
        return [sec, dpLocalStorage.getUnnamed(obj.presetId)];
      }
    }),
  );
}
