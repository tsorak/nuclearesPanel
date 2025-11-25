export function validTile({ varName, title, unit, parse, rate, sections }) {
  if (!varName) throw new Error("Tile must contain a Variable to poll");
  if (rate < 100) {
    throw new Error("Polling Interval must not be lower than 100ms");
  }
  return true;
}

/**
 * Will add or update the tile containing the same Variable
 */
export function setTile(
  { store, setStore },
  { varName, title, unit, parse, rate, sections },
) {
  const existingTileId = store["tiles"].findIndex((t) => t.varName === varName);

  if (existingTileId > -1) {
    setStore("tiles", existingTileId, {
      varName,
      title,
      unit,
      parse,
      rate,
      sections,
    });
  } else {
    setStore("tiles", (p) => [...p, {
      varName,
      title,
      unit,
      parse,
      rate,
      sections,
    }]);
  }
}
