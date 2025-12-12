import {
  createContext,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";

const rodControls = {
  getRodHeight: async () => {
    let res = null;
    try {
      res = await fetch(`http://localhost:8785/?variable=RODS_POS_ACTUAL`);
    } catch (_e) {
      //
    }

    if (res === null) return;

    const s = await res.text();
    return s;
  },
  lowerRodsByPoint1: async () => {
    const s = await rodControls.getRodHeight();
    if (!s) return null;

    const usedDecimalChar = s.includes(".") ? "." : ",";

    const arr = s.split(usedDecimalChar);
    if (arr.length > 1) {
      const v = arr[1] - 1;
      arr[1] = v;
    } else {
      arr[0] = arr[0] - 1;
      arr.push(9);
    }

    const rodHeight = arr.join(usedDecimalChar);

    log("Last rod height:", s, "New rod height:", rodHeight);

    rodControls.setRodHeight(rodHeight);
  },
  setRodHeight: async (value) => {
    let res = null;
    log("Attempting to set rod height to:", value);
    try {
      res = await fetch(
        `http://localhost:8785/?variable=RODS_ALL_POS_ORDERED&value=${value}`,
        { method: "POST" },
      );
    } catch (_e) {
      //
    }

    if (res === null || !res.ok) {
      return log("FAILED TO SET ROD HEIGHT:", value);
    }

    log("Set the rod height to:", value);
  },
};

const controller = {
  targetTemp: 360,
  sensors: {
    coreTemp: null,
    reactivity: null,
  },
  intervalIds: {
    step: null,
    safetyStep: null,
  },
  toggle: function () {
    if (this.intervalIds.step !== null) {
      clearInterval(this.intervalIds.step);
      clearInterval(this.intervalIds.safetyStep);
    } else {
      setInterval(this.step, 10000);
      setInterval(this.safetyStep, 1000);
    }
  },
  stop: function () {
    if (this.intervalIds.step !== null) {
      clearInterval(this.intervalIds.step);
    }

    if (this.intervalIds.safetyStep !== null) {
      clearInterval(this.intervalIds.safetyStep);
    }
  },

  step: function () {
    let state;

    if (this.sensors.coreTemp === null || this.sensors.reactivity === null) {
      state = "CANCELLING_DUE_TO_DEAD_SENSOR";
    } else if (this.sensors.reactivity > 0) {
      state = "WORKING";
    } else if (this.sensors.coreTemp < this.targetTemp) {
      state = "TARGET_UNREACHED";
    } else if (this.sensors.coreTemp >= this.targetTemp) {
      state = "TARGET_REACHED";
    }

    log(state);

    switch (state) {
      case "CANCELLING_DUE_TO_DEAD_SENSOR":
        this.stop();
        return;
      case "WORKING":
        return;
      case "TARGET_UNREACHED":
        rodControls.lowerRodsByPoint1();
        return;
      case "TARGET_REACHED":
        return;
    }
  },
  safetyStep: async function () {
    if (this.sensors.coreTemp >= this.targetTemp + 20) {
      log("TEMPERATURE CRITICALLY OVERSHOT");
    }

    let rodHeight = await rodControls.getRodHeight();
    if (rodHeight) {
      rodHeight = Number(rodHeight.replace(",", "."));

      if (rodHeight <= 10) {
        log("RODS EFFICIENCY CRITICALLY LOW, CANCELLING");
        this.stop();
      }
    }
  },
};

function log(...parts) {
  console.log("[RODS_CONTROLLER]:", ...parts);
}
