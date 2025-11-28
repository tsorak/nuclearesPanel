import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import ContextMenu from "./components/ContextMenu.jsx";
import { DisplayPresets } from "./DisplayPreset.jsx";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <DisplayPresets.Provider>
            <ContextMenu>
              <Suspense>{props.children}</Suspense>
            </ContextMenu>
          </DisplayPresets.Provider>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
