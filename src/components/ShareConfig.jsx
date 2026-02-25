import { createSignal, Show } from "solid-js";
import * as clipboard from "@tauri-apps/plugin-clipboard-manager";
import { ask, message, open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

import { useAppState } from "../AppState.jsx";
import persistStore from "../helper/persistStore.js";
import { tileToStoreStructure } from "../helper/tile.js";

const CONFIG_VERSION = 1;

const btnClass =
  "bg-gray-600 hover:bg-gray-500 active:bg-gray-700 transition-colors text-white py-1 px-2 cursor-pointer";

const dropdownBtnClass =
  "block w-full text-left px-3 py-2 hover:bg-gray-500 transition-colors cursor-pointer";

export default function ShareConfig(props) {
  const [openDropdown, setOpenDropdown] = createSignal(null);

  const DropdownMenu = (props) => (
    <div class="absolute bg-gray-600 border border-gray-600 rounded-b-md shadow-lg z-10 min-w-max overflow-hidden">
      {props.children}
    </div>
  );

  return (
    <div class="flex">
      <div
        class="relative"
        onmouseenter={() => setOpenDropdown("export")}
        onmouseleave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          class={btnClass}
        >
          Export
        </button>
        <Show when={openDropdown() === "export"}>
          <DropdownMenu>
            <button
              type="button"
              class={`${dropdownBtnClass} text-white`}
              onclick={async () => {
                try {
                  helper.exportToClipboard();
                  await message("Settings copied to clipboard!");
                } catch (_e) {
                  await message("Error exporting config", { kind: "error" });
                }
              }}
            >
              To clipboard
            </button>
            <button
              type="button"
              class={`${dropdownBtnClass} text-white border-t border-gray-600`}
              onclick={() => helper.exportToFile()}
            >
              To json file
            </button>
          </DropdownMenu>
        </Show>
      </div>

      <div
        class="relative"
        onmouseenter={() => setOpenDropdown("import")}
        onmouseleave={() => setOpenDropdown(null)}
      >
        <button
          type="button"
          class={btnClass}
        >
          Import
        </button>
        <Show when={openDropdown() === "import"}>
          <DropdownMenu>
            <button
              type="button"
              class={`${dropdownBtnClass} text-white`}
              onclick={() => helper.importFromClipboard()}
            >
              From clipboard
            </button>
            <button
              type="button"
              class={`${dropdownBtnClass} text-white border-t border-gray-600`}
              onclick={() => helper.importFromFile()}
            >
              From json file
            </button>
          </DropdownMenu>
        </Show>
      </div>
    </div>
  );
}

const helper = {
  exportToClipboard: () => {
    const data = helper.getConfigJson();
    clipboard.writeText(data);
    return data;
  },

  importFromClipboard: async () => {
    let str;
    try {
      str = await clipboard.readText();
    } catch (e) {
      return helper.parseError(e.message);
    }

    let data;
    try {
      data = JSON.parse(str);
    } catch (e) {
      return helper.parseError(e.message);
    }

    const exportCurrent = await ask(
      "Would you like to export your current config before importing?\nPressing 'No' will delete the current data forever.",
      { kind: "warning" },
    );

    if (exportCurrent) {
      const currentData = helper.exportToClipboard();
      await clipboard.writeText(currentData);
      await message("The config has been saved to your clipboard!");
    }

    helper.applyConfig(data);
  },

  exportToFile: async () => {
    const path = await save({
      title: "Export Config",
      filters: [{ name: "JSON", extensions: ["json"] }],
      defaultPath: "nucleares-panel-config.json",
    });

    if (!path) return;

    try {
      const data = helper.getConfigJson();
      await writeTextFile(path, data);
      await message("Config exported to file!");
    } catch (_e) {
      await message("Error exporting config to file", { kind: "error" });
    }
  },

  importFromFile: async () => {
    const path = await open({
      title: "Import Config",
      filters: [{ name: "JSON", extensions: ["json"] }],
      multiple: false,
      directory: false,
    });

    if (!path) return;

    let str;
    try {
      str = await readTextFile(path);
    } catch (e) {
      return helper.parseError(e.message);
    }

    let data;
    try {
      data = JSON.parse(str);
    } catch (e) {
      return helper.parseError(e.message);
    }

    const exportCurrent = await ask(
      "Would you like to export your current config before importing?\nCanceling will delete the current data forever.",
      { kind: "warning" },
    );

    if (exportCurrent) {
      const currentData = helper.exportToClipboard();
      await clipboard.writeText(currentData);
      await message("The config has been saved to your clipboard!");
    }

    helper.applyConfig(data);
  },

  parseError: async (s = "unknown error") => {
    await message(`Could not parse the config input.\nError: ${s}`, {
      kind: "error",
    });
  },

  getConfigJson: () => {
    const config = helper.formatConfigForExport();
    config.version = CONFIG_VERSION;
    return JSON.stringify(config);
  },

  formatConfigForExport: () => {
    const { store } = useAppState();
    persistStore.save(store);

    const cfg = {
      namedPresets: [],
      unnamedPresets: [],
      lastActivePollers: [],
      store: null,
    };

    const ls = Object.entries(localStorage);

    ls.forEach(([k, v]) => {
      if (k.startsWith("DISPLAY_PRESET_")) {
        cfg.namedPresets.push([k, v]);
      } else if (k.startsWith("UNNAMED_DISPLAY_PRESET_")) {
        cfg.unnamedPresets.push([k, v]);
      }
    });

    const lsobj = Object.fromEntries(ls);

    cfg.lastActivePollers = lsobj.lastActivePollers ?? [];
    cfg.store = lsobj.store ?? null;

    return cfg;
  },

  applyConfig: (config) => {
    config.namedPresets.forEach(([k, v]) => {
      localStorage.setItem(k, v);
    });
    config.unnamedPresets.forEach(([k, v]) => {
      localStorage.setItem(k, v);
    });
    localStorage.setItem("lastActivePollers", config.lastActivePollers);
    localStorage.setItem("store", config.store);

    const { setStore } = useAppState();

    const storeData = tileToStoreStructure(JSON.parse(config.store));
    setStore(storeData);
  },
};
