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
      await navigator.clipboard.writeText(data);
      alert("Settings copied to clipboard!");
      return data;
    } catch (_e) {
      alert("Error exporting config");
    }
  },

  importFromClipboard: async () => {
    let str;
    try {
      str = await navigator.clipboard.readText();
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
      "Would you like to export your current config before importing?\nPressing 'Cancel' will delete the current data forever.",
    );

    if (exportCurrent) {
      await helper.exportToClipboard();
      alert("The config has been saved to your clipboard!");
    }

    helper.applyConfig(data);
  },

  exportToFile: async () => {
    try {
      const data = helper.getConfigJson();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "nucleares-panel-config.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (_e) {
      alert("Error exporting config to file");
    }
  },

  importFromFile: async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";

    const file = await new Promise((resolve) => {
      input.onchange = () => resolve(input.files[0] ?? null);
      input.click();
    });

    if (!file) return;

    let str;
    try {
      str = await file.text();
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
      "Would you like to export your current config before importing?\nPressing 'Cancel' will delete the current data forever.",
    );

    if (exportCurrent) {
      await helper.exportToClipboard();
      alert("The config has been saved to your clipboard!");
    }

    helper.applyConfig(data);
  },

  parseError: (s = "unknown error") => {
    alert(`Could not parse the config input.\nError: ${s}`);
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
