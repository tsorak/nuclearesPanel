import { For, Suspense } from "solid-js";

import persistStore from "../helper/persistStore.js";
import { useAppState } from "../AppState.jsx";

import Tile from "./Tile.jsx";
import AddTile from "./AddTile.jsx";
import PollerActiveControls from "./PollerActiveControls.jsx";

import SegmentDisplay from "./displays/SegmentDisplay.jsx";

export default function UserTiles(_props) {
  const { store, setStore, pollers, storeHelper } = useAppState();

  const sections = () => {
    return Array.from(Object.entries(store.sections));
  };

  globalThis.addEventListener("beforeunload", () => {
    persistStore.save(store);
  });

  return (
    <div class="flex flex-col gap-2">
      <Nav {...{ store, setStore, pollers }} />
      <div class="flex flex-wrap gap-2 mx-auto max-w-xs md:max-w-2xl lg:max-w-6xl">
        <Suspense>
          <For each={sections()}>
            {([section, tiles]) => {
              //TODO: persist resize
              return (
                <div class="min-w-xs resize-x overflow-auto">
                  <div class="warning-stripes flex justify-center">
                    <h5 class="bg-black text-white font-mono uppercase px-2 leading-6">
                      {section}
                    </h5>
                  </div>
                  <div class="flex flex-wrap justify-evenly bg-gray-600 text-white pb-2">
                    <For each={tiles}>
                      {(tile, _i) => (
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
