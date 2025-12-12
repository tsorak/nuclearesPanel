import { Suspense } from "solid-js";
import "./app.css";

import ContextMenu from "./components/ContextMenu.jsx";
import UserTiles from "./components/UserTiles.jsx";
import AppState from "./AppState.jsx";

export default function App() {
  return (
    <AppState.Provider>
      <ContextMenu>
        <Suspense>
          <main class="bg-neutral-900 h-screen">
            <UserTiles />
          </main>
        </Suspense>
      </ContextMenu>
    </AppState.Provider>
  );
}
