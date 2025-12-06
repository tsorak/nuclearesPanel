import { Suspense } from "solid-js";
import "./app.css";

import ContextMenu from "./components/ContextMenu.jsx";
import UserTiles from "./components/UserTiles.jsx";

export default function App() {
  return (
    <ContextMenu>
      <Suspense>
        <main class="bg-neutral-900 h-screen">
          <UserTiles />
        </main>
      </Suspense>
    </ContextMenu>
  );
}
