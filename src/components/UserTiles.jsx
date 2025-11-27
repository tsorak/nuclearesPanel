import { For, Suspense } from "solid-js";
import { createStore } from "solid-js/store";
import { clientOnly } from "@solidjs/start";

import Poller from "./Poller.jsx";
import AddTile from "./AddTile.jsx";
import { makePoller } from "../poller.js";
import * as tileHelper from "../helper/tile.js";
import { createStoreHelper } from "../helper/store.js";
import PollerActiveControls from "./PollerActiveControls.jsx";

export default clientOnly(async () => ({ default: UserTiles }), { lazy: true });

function UserTiles(props) {
  const [store, setStore] = createStore(persistStore.loadOrDefault());
  const pollers = makePollerStore();

  const storeHelper = createStoreHelper(store, setStore);

  const sections = () => {
    return Array.from(Object.entries(store.sections));
  };

  return (
    <div class="flex flex-col gap-2">
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
      <div class="flex flex-wrap gap-2 mx-auto max-w-xs md:max-w-2xl">
        <Suspense>
          <For each={sections()}>
            {([section, tiles]) => {
              return (
                <div class="min-w-xs">
                  <div class="warning-stripes flex justify-center">
                    <h5 class="bg-black text-white font-mono uppercase px-2 leading-6">
                      {section}
                    </h5>
                  </div>
                  <div class="flex justify-evenly bg-gray-600 text-white pb-2">
                    <For each={tiles}>
                      {(tile, i) => (
                        <Poller
                          tilePointer={tile}
                          pollerStore={pollers}
                          addToSection={storeHelper.addToSection}
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
          } = pointer();

          return {
            varName,
            title,
            unit,
            parse,
            rate: rate.get(),
            sections,
          };
        },
      );

      return tiles;
    })();

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

// We may want to display the same variable in multiple tiles
// Instead of doing poll logic within the tile component,
// have components ask this store for the latest data
function makePollerStore() {
  const [store, setStore] = createStore({});

  // const pollerA = {
  //   value,
  //   refetch,
  //   poller,
  //   subscribers,
  // }

  return ({
    store: { proxy: store, set: setStore },
    subscribe: function (config) {
      const { variable } = config;

      const poller = this.store.proxy[variable];

      if (!poller) {
        const poller = makePoller(config);
        poller.subscribers = 1;
        this.store.set(variable, poller);
        return this.store.proxy[variable];
      }

      this.store.set(variable, "subscribers", (p) => {
        if (!p) {
          return 1;
        } else {
          return p++;
        }
      });

      return poller;
    },
    unsubscribe: function (variable) {
      const poller = this.store.proxy[variable];

      if (!poller) {
        return;
      }

      if (poller.subscribers <= 1) {
        poller.interval.stop();
        this.store.set(variable, null);
      } else {
        this.store.set(variable, "subscribers", (p) => p--);
      }
    },
  });
}
