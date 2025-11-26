import { batch, createSignal } from "solid-js";

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
    ({ varName, title, unit, parse, rate, parserOverride, sections }) => {
      const [r, setRate] = createSignal(rate);

      const pointer = () => ({
        varName,
        title,
        unit,
        parse,
        rate: { get: r, set: setRate },
        drop: function (setStore) {
          setStore((p) => {
            const u = p;
            for (const sec of p.tiles[this.varName].sections) {
              u.sections[sec] = p.sections[sec].filter((p) => p !== ptr);
            }

            delete u.tiles[this.varName];
            return u;
          });
        },
      });

      const ptr = pointer;

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
