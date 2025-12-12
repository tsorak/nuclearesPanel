import * as tileHelper from "../helper/tile.js";
import { rescueDisplay, saveDisplay } from "../helper/store.js";

const persistStore = {
  save: (storeData) => {
    const tiles = (() => {
      const tiles = Object.entries(storeData.tiles).map(
        ([varName, { sections, pointer }]) => {
          const {
            title,
            unit,
            parse,
            rate,
            displays,
          } = pointer();

          const displayPresetNames = Object.entries(displays.section).map((
            [sec, obj],
          ) => {
            const { presetName, presetId } = obj;
            if (!presetId) {
              rescueDisplay(obj);
              return [null, null];
            }
            saveDisplay(obj);
            if (presetName) {
              return [sec, { presetName, presetId }];
            } else if (presetId) {
              return [sec, { presetId }];
            } else {
              return [sec, null];
            }
          }).filter(([_, v]) => v !== null);

          return {
            varName,
            title,
            unit,
            parse,
            rate: rate.get(),
            sections,
            displays: Object.fromEntries(displayPresetNames),
          };
        },
      );

      return tiles;
    })();

    console.log(tiles);
    // console.log(displaysByPresetName);

    const str = JSON.stringify(tiles);
    localStorage.setItem("store", str);
  },
  load: () => {
    const storeData = localStorage.getItem("store");

    if (storeData) {
      try {
        return JSON.parse(storeData);
      } catch (_e) {
        //
      }
    }

    return null;
  },
  loadOrDefault: function () {
    const defaultTiles = [
      {
        varName: "CORE_PRESSURE",
        title: "Vessel Pressure",
        unit: "bar",
        parse: "1Decimal",
        rate: 2000,
        parserOverride: null,
        sections: ["core", "pressurizer"],
      },
      {
        varName: "CORE_TEMP",
        title: "Internal Temperature",
        unit: "°c",
        parse: "Decimal",
        rate: 1000,
        parserOverride: null,
        sections: ["core"],
      },
    ];

    return tileHelper.tileToStoreStructure(this.load() ?? defaultTiles);
  },
};

export default persistStore;
