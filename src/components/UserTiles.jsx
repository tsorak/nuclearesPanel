import { For } from "solid-js";
import { createStore, unwrap } from "solid-js/store";
import { clientOnly } from "@solidjs/start";

import Poller from "./Poller.jsx";

export default clientOnly(async () => ({ default: UserTiles }), { lazy: true });

function UserTiles(props) {
  "use client";
  const [store, setStore] = createStore(persistStore.load_or_default());

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
      tiles: [
        {
          varName: "CORE_PRESSURE",
          title: "Vessel Pressure",
          unit: "bar",
          parse: "1Decimal",
          rate: 2000,
          parserOverride: null,
        },
        {
          varName: "CORE_TEMP",
          title: "Internal Temperature",
          unit: "°c",
          parse: "Decimal",
          rate: 1000,
          parserOverride: null,
        },
      ],
    };
  },
};
