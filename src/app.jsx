import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import "./app.css";
import ContextMenu from "./components/ContextMenu.jsx";

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <ContextMenu>
            <Suspense>{props.children}</Suspense>
          </ContextMenu>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
