import { onMount, Suspense } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import "./app.css";

import ContextMenu from "./components/ContextMenu.jsx";
import UserTiles from "./components/UserTiles.jsx";
import WindowControls from "./components/WindowControls.jsx";
import AppState from "./AppState.jsx";
import FacilityControls from "./components/FacilityControls.jsx";

export default function App() {
  onMount(() => {
    setTimeout(() => invoke("close_splash"), 1000);
  });

  return (
    <AppState.Provider>
      <ContextMenu>
        <Suspense>
          <main class="bg-neutral-900 h-screen flex flex-col gap-2 select-none">
            <WindowControls />
            <UserTiles />
            <FacilityControls />
          </main>
        </Suspense>
      </ContextMenu>
    </AppState.Provider>
  );
}
