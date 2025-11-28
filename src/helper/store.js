import { batch } from "solid-js";
import { SECTIONS } from "../constants.js";

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

  const removeFromSection = (section, pointer) => {
    const t = pointer();

    if (!store.tiles[t.varName].sections.includes(section)) return;

    batch(() => {
      setStore(
        "tiles",
        t.varName,
        "sections",
        (p) => {
          const u = p;
          u.splice(p.findIndex((s) => s === section), 1);
          return u.map((v) => v);
        },
      );
      if (store.sections[section]) {
        setStore("sections", section, (p) => {
          if (p.length <= 1) {
            return undefined;
          } else {
            const u = new Set(p);

            u.delete(pointer);

            return Array.from(u.values());
          }
        });
      }
      if (store.tiles[t.varName].sections.length === 0) {
        setStore("tiles", t.varName, undefined);
        console.log(store);
      }
    });
  };

  return {
    addToSection,
    removeFromSection,
    /**
     * @returns {[string, boolean][]}
     */
    getSections: (forVar) => {
      const { sections } = store.tiles[forVar];

      return SECTIONS.map((sec) =>
        sections.includes(sec) ? [sec, true] : [sec, false]
      );
    },
  };
}
