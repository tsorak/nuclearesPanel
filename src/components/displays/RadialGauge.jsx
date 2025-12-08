import * as cg from "canvas-gauges";
import { createEffect, onMount, Show } from "solid-js";

import Light from "./Light.jsx";

export function createProps(
  min = null,
  max = null,
  value = null,
  highlights = null,
  unit = null,
  valueBox = null,
  size = null,
  configOverride = null,
) {
  return Object.fromEntries(
    Object.entries({
      min,
      max,
      value,
      highlights,
      unit,
      valueBox,
      size,
      configOverride,
    })
      .filter(([_, v]) => v !== null),
  );
}

export default function RadialGauge(props) {
  const store = props.store;

  const highlights = () => parseHighlights(store.highlights);

  let el;

  onMount(() => {
    let gauge = {};

    // we need to effect here to redraw when any store value changes.
    createEffect(() => {
      // https://canvas-gauges.com/documentation/user-guide/configuration
      gauge = new cg.RadialGauge({
        borders: false,
        valueBox: store.valueBox,
        valueBoxStroke: 0,
        barWidth: 0,
        barStrokeWidth: 0,
        fontUnitsSize: 28,
        fontNumbersSize: -8,
        fontValueSize: 40,
        // startAngle: 75,
        // ticksAngle: 210,
        //
        renderTo: el,
        width: store.size,
        height: store.size,
        units: store.unit,
        title: false,
        value: store.min,
        minValue: store.min,
        maxValue: store.max,
        majorTicks: [
          store.min,
          store.max - ((store.max - store.min) / 2),
          store.max,
        ],
        minorTicks: 30,
        strokeTicks: false,
        highlights: highlights(),
        // Steam gen Volume config:
        // highlights: [
        //   { from: 0, to: 120, color: "#f009" },
        //   { from: 120, to: 240, color: "#ff09" },
        //   { from: 240, to: 360, color: "#0f09" },
        //   { from: 360, to: 480, color: "#ff09" },
        //   { from: 480, to: 600, color: "#f009" },
        // ],
        colorPlate: "#222",
        colorMajorTicks: "#f5f5f5",
        colorMinorTicks: "#ddd",
        colorTitle: "#fff",
        colorUnits: "#ccc",
        colorNumbers: "#eee",
        colorNeedle: "rgba(240, 128, 128, 1)",
        colorNeedleEnd: "rgba(255, 160, 122, .9)",
        colorValueText: "#eee",
        colorValueBoxBackground: "#0000",
        animationRule: "bounce",
        animationDuration: 250,
        ...store.configOverride,
      });
      gauge.draw();
    });

    createEffect(() => {
      gauge.value = store.valueMult * props.value.latest;
    });
  });

  return (
    <Show when={store.light} fallback={<canvas ref={el} />}>
      <div class="relative">
        <canvas ref={el} />
        <LightWrapper
          store={props.store}
          value={props.value}
        />
      </div>
    </Show>
  );
}

function parseHighlights(highlights) {
  if (!highlights) {
    highlights = [
      [0, 33, "#0f09"],
      [33, 66, "#ff09"],
      [66, 100, "#f009"],
    ];
  }
  if (Array.isArray(highlights[0])) {
    return highlights.map(([from, to, color]) => ({
      from,
      to,
      color,
    }));
  }
  return highlights;
}

function LightWrapper(props) {
  const radial = props.store;
  const value = props.value;

  const colorIntervals = () => props.store.light.colorIntervals;
  const size = () => props.store.light.size;

  const offset = () => {
    return radial.size / Math.PI + size() / 1.6;
  };

  return (
    <div class="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
      <div
        class="relative"
        style={{
          "left": `${offset()}px`,
          "top": `-${offset()}px`,
        }}
      >
        <Light
          colorIntervals={colorIntervals}
          size={size}
          value={value}
        />
      </div>
    </div>
  );
}

function colorIntervalsFromHighlights(arr) {
  return arr.map(([from, _to, color]) => [from, color]);
}
