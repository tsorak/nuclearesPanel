import * as clipboard from "@tauri-apps/plugin-clipboard-manager";
import { open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

import { useAppState } from "../AppState.jsx";
import persistStore from "../helper/persistStore.js";
import { tileToStoreStructure } from "../helper/tile.js";

const CONFIG_VERSION = 1;

const btnClass =
  "bg-gray-600 hover:bg-gray-500 active:bg-gray-700 transition-colors text-white py-1 px-2 cursor-pointer";

export default function ShareConfig(props) {
  return (
    <>
      <button
        type="button"
        class={btnClass}
        onclick={() => {
          try {
            helper.exportToClipboard();
            alert("Settings copied to clipboard!");
          } catch (_e) {
            alert("Error exporting config");
          }
        }}
      >
        Export
      </button>

      <button
        type="button"
        class={btnClass}
        onclick={() => helper.importFromClipboard()}
      >
        Import
      </button>

      <button
        type="button"
        class={btnClass}
        onclick={() => helper.exportToFile()}
      >
        Export File
      </button>

      <button
        type="button"
        class={btnClass}
        onclick={() => helper.importFromFile()}
      >
        Import File
      </button>
    </>
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

    const exportCurrent = confirm(
      "Would you like to export your current config before importing?\r\nCanceling will delete the current data forever.",
    );

    if (exportCurrent) {
      const currentData = helper.exportToClipboard();
      await clipboard.writeText(currentData);
      alert("The config has been saved to your clipboard!");
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
      alert("Config exported to file!");
    } catch (_e) {
      alert("Error exporting config to file");
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

    const exportCurrent = confirm(
      "Would you like to export your current config before importing?\r\nCanceling will delete the current data forever.",
    );

    if (exportCurrent) {
      const currentData = helper.exportToClipboard();
      await clipboard.writeText(currentData);
      alert("The config has been saved to your clipboard!");
    }

    helper.applyConfig(data);
  },

  parseError: (s = "unknown error") => {
    alert(`Could not parse the config input.\r\nError: ${s}`);
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
