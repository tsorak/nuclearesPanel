import { batch } from "solid-js";

export function createStoreHelper(store, setStore) {
  const addToSection = (section, pointer) => {
    const t = pointer();

    if (store.tiles[t.varName].sections.includes(section)) return;

    batch(() => {
      setStore(
        "tiles",
        t.varName,
        "sections",
        (p) => p ? [...p, section] : [section],
      );
      if (store.sections[section]) {
        setStore("sections", section, (p) => [...p, pointer]);
      } else {
        setStore("sections", section, [pointer]);
      }
    });
  };

  return {
    addToSection,
  };
}
