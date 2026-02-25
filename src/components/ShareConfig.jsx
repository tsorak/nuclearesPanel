import * as clipboard from "@tauri-apps/plugin-clipboard-manager";
import { ask, message, open, save } from "@tauri-apps/plugin-dialog";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

import { useAppState } from "../AppState.jsx";
import persistStore from "../helper/persistStore.js";
import { tileToStoreStructure } from "../helper/tile.js";
import Dropdown, { DropdownItem } from "./Dropdown.jsx";

const CONFIG_VERSION = 1;

export default function ShareConfig(props) {
  return (
    <div class="flex">
      <Dropdown label="Import">
        <DropdownItem onclick={() => helper.importFromClipboard()}>
          From clipboard
        </DropdownItem>
        <DropdownItem onclick={() => helper.importFromFile()}>
          From json file
        </DropdownItem>
      </Dropdown>

      <Dropdown label="Export">
        <DropdownItem
          onclick={() => helper.exportToClipboard()}
        >
          To clipboard
        </DropdownItem>
        <DropdownItem onclick={() => helper.exportToFile()}>
          To json file
        </DropdownItem>
      </Dropdown>
    </div>
  );
}

const helper = {
  exportToClipboard: async () => {
    try {
      const data = helper.getConfigJson();
      clipboard.writeText(data);
      await message("Settings copied to clipboard!");
      return data;
    } catch (_e) {
      await message("Error exporting config", { kind: "error" });
    }
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
