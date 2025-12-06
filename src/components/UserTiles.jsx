import { For, Suspense } from "solid-js";
import { createStore } from "solid-js/store";

import Tile from "./Tile.jsx";
import AddTile from "./AddTile.jsx";
import * as pollerHelper from "../helper/poller.js";
import * as tileHelper from "../helper/tile.js";
import {
  createStoreHelper,
  rescueDisplay,
  saveDisplay,
} from "../helper/store.js";
import PollerActiveControls from "./PollerActiveControls.jsx";

import SegmentDisplay from "../components/SegmentDisplay.jsx";

export default function UserTiles(props) {
  const [store, setStore] = createStore(persistStore.loadOrDefault());
  const pollers = pollerHelper.makePollerStore(store.tiles);

  const storeHelper = createStoreHelper(store, setStore);

  const sections = () => {
    return Array.from(Object.entries(store.sections));
  };

  globalThis.addEventListener("beforeunload", () => {
    persistStore.save(store);
  });

  return (
    <div class="flex flex-col gap-2">
      <div class="flex">
        <SegmentDisplay segments={3} />
      </div>
      <Nav {...{ store, setStore, pollers }} />
      <div class="flex flex-wrap gap-2 mx-auto max-w-xs md:max-w-2xl lg:max-w-6xl">
        <Suspense>
          <For each={sections()}>
            {([section, tiles]) => {
              return (
                <div class="min-w-xs resize-x overflow-auto">
                  <div class="warning-stripes flex justify-center">
                    <h5 class="bg-black text-white font-mono uppercase px-2 leading-6">
                      {section}
                    </h5>
                  </div>
                  <div class="flex justify-evenly bg-gray-600 text-white pb-2">
                    <For each={tiles}>
                      {(tile, i) => (
                        <Tile
                          tilePointer={tile}
                          pollerStore={pollers}
                          storeHelper={storeHelper}
                          currentSection={section}
                        />
                      )}
                    </For>
                  </div>
                </div>
              );
            }}
          </For>
        </Suspense>
      </div>
    </div>
  );
}

function Nav(props) {
  const { store, setStore, pollers } = props;

  return (
    <div class="flex justify-center items-start">
      <div>
        <p class="text-[8pt] text-white warning-stripes">
          <span class="bg-black px-1">Config</span>
        </p>
        <div class="flex items-start">
          <AddTile store={store} setStore={setStore} />
          <button
            type="button"
            class="bg-gray-600 text-white py-1 px-2 cursor-pointer"
            onclick={() => persistStore.save(store)}
          >
            Save
          </button>
        </div>
      </div>

      <div>
        <p class="text-[8pt] text-white warning-stripes">
          <span class="bg-black px-1">Poller controls</span>
        </p>
        <div class="flex items-start">
          <PollerActiveControls pollerStore={pollers.store.proxy} />
        </div>
      </div>
    </div>
  );
}

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

          const displayPresetNames = Object.entries(displays.get).map((
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
