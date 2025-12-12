import { createContext, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import * as pollerHelper from "./helper/poller.js";
import { createStoreHelper } from "./helper/store.js";
import persistStore from "./helper/persistStore.js";

const AppState = createContext(initAppState());

export function useAppState() {
  return useContext(AppState);
}

function initAppState() {
  const [store, setStore] = createStore(persistStore.loadOrDefault());
  const pollers = pollerHelper.makePollerStore(store.tiles);

  const storeHelper = createStoreHelper(store, setStore);

  return { store, setStore, pollers, storeHelper };
}

export default AppState;
