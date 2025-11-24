import { For } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { clientOnly } from "@solidjs/start";

import Poller from "./Poller.jsx";
import { makePoller } from "../poller.js";
import { onCleanup } from "solid-js";

export default clientOnly(async () => ({ default: UserTiles }), { lazy: true });

function UserTiles(props) {
  const [store, setStore] = createStore(persistStore.load_or_default());
  const pollers = makePollerStore();

  const mutAndSaveStore = (...args) => {
    setStore(...args);
    persistStore.save(store);
  };

  return (
    <>
      <For each={store.tiles}>
        {(tile, i) => (
          <Poller
            storeEntry={tile}
            mutStoreEntry={(...args) => mutAndSaveStore("tiles", i(), ...args)}
            pollerStore={pollers}
          />
        )}
      </For>
    </>
  );
}

const persistStore = {
  save: (storeProxy) => {
    const storeData = unwrap(storeProxy);
    localStorage.setItem("store", JSON.stringify(storeData));
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
  load_or_default: function () {
    return this.load() ?? {
      // Sections:
      // fuel
      // pressurizer
      // core
      // energy
      // steam
      // condenser
      // chemical
      tiles: [
        {
          varName: "CORE_PRESSURE",
          title: "Vessel Pressure",
          unit: "bar",
          parse: "1Decimal",
          rate: 2000,
          parserOverride: null,
          sections: ["core"],
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
      ],
    };
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
