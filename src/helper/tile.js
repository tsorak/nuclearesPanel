import { batch } from "solid-js";
import { createObjSignal } from "../components/ContextMenu.jsx";
import { createStore } from "solid-js/store";

import { loadDisplays } from "../DisplayPreset.jsx";

export function validTile({ varName, title, unit, parse, rate, sections }) {
  if (!varName) throw new Error("Tile must contain a Variable to poll");
  if (rate < 100) {
    throw new Error("Polling Interval must not be lower than 100ms");
  }
  return true;
}

export function addTile(
  { store, setStore },
  //{ varName, title, unit, parse, rate, sections },
  tile,
) {
  const exists = store.tiles[tile.varName];
  if (exists) throw new error.Exists();

  const t = {
    ...tile,
    parserOverride: null,
  };

  const { tiles, sections } = tileToStoreStructure(t, {
    tilesAsEntries: true,
  });

  console.log(tiles[0][0], tiles[0][1], sections);

  batch(() => {
    setStore("tiles", tiles[0][0], tiles[0][1]);

    Object.entries(sections).map(([sec, pointers]) => {
      return [sec, (p) => p ? [...p, ...pointers] : pointers];
    }).forEach(([sec, mutFn]) => {
      setStore("sections", sec, mutFn);
    });
  });
}

/**
 * @param {Object | Object[]} tiles
 */
export function tileToStoreStructure(arg, opts) {
  const o = {
    tilesAsEntries: opts?.tilesAsEntries ?? false,
  };

  let array;
  if (!arg.map) {
    const obj = arg;
    array = [obj];
  } else {
    array = arg;
  }

  const [tiles, sections] = array.map(
    (obj) => {
      const { varName, title, unit, parse, rate, parserOverride, sections } =
        obj;
      // const displays = createObjSignal(obj.displays ?? []);

      // {presetName:"steamgenvol", ... }
      const [getCD, setCD] = createStore(loadDisplays(obj.displays) ?? {});

      const rateSignal = createObjSignal(rate);

      const pointer = () => ({
        varName,
        title,
        unit,
        parse,
        displays: {
          get: getCD,
          set: setCD,
          hasSection: (sec) => !!getCD[sec],
          getSection: (sec) => {
            const displayPreset = getCD[sec];
            return displayPreset ? displayPreset : null;
            //TODO: storage should not be reactive? users of the same display in different sections should not edit the preset for the both of them.
          },
          updateSection: (sec, presetData) => {
            setCD(sec, presetData);
          },
        },
        rate: rateSignal,
      });

      return [
        [varName, { pointer, sections }],
        sections.map((s) => [s, pointer]),
      ];
    },
  )
    .reduce((acc, [p, sec], i) => {
      acc[0].push(p);
      for (const [s, p] of sec) {
        const existingSection = acc[1][s];

        if (existingSection) {
          existingSection.push(p);
        } else {
          acc[1][s] = [p];
        }
      }

      return acc;
    }, [[], {}]).map((el, i) => {
      if (i < 1) {
        return o.tilesAsEntries ? el : Object.fromEntries(el);
      } else {
        return el;
      }
    });

  return {
    tiles,
    sections,
  };
}

export const error = {
  Exists: class Exists extends Error {},
};
