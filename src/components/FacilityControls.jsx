import { createEffect } from "solid-js";
import { useAppState } from "../AppState.jsx";

import rodsController from "../controller/rods.js";

export default function FacilityControls(props) {
  return (
    <div>
      <div class="warning-stripes flex justify-center">
        <h5 class="bg-black text-lg text-white font-mono uppercase px-2 leading-6">
          Controls
        </h5>
      </div>
      <div class="min-w-xs resize-x overflow-auto">
        <div class="warning-stripes flex justify-center">
          <h5 class="bg-black text-white font-mono uppercase px-2 leading-6">
            Autopilot
          </h5>
        </div>
        <div class="flex flex-wrap justify-evenly bg-gray-600 text-white pb-2">
          <Rods />
        </div>
      </div>
    </div>
  );
}

function Rods(props) {
  const { pollers } = useAppState();

  const coreTempPoller = pollers.subscribe(
    pollerConfig("CORE_TEMP"),
  );
  const reactivityPoller = pollers.subscribe(
    pollerConfig("CORE_STATE_CRITICALITY"),
  );

  const rods = rodsController();

  createEffect(() => {
    const v = coreTempPoller.value.latest ?? null;
    if (v instanceof Error) return;
    rods.sensors.coreTemp = v;
  });

  createEffect(() => {
    const v = reactivityPoller.value.latest ?? null;
    if (v instanceof Error) return;
    rods.sensors.reactivity = v;
  });

  return (
    <div>
      <button
        onclick={() => rods.toggle()}
      >
        Toggle rods Autopilot
      </button>
    </div>
  );
}

function pollerConfig(v) {
  return {
    variable: v,
    getRate: () => 1000,
    parsePreset: "Decimal",
  };
}
