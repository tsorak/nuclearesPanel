import * as cg from "canvas-gauges";
import { createEffect, onMount } from "solid-js";
import { clientOnly } from "@solidjs/start";

export default clientOnly(async () => ({ default: RadialGauge }), {
  lazy: true,
});

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

function RadialGauge(props) {
  const {
    min,
    max,
    value,
    highlights,
    unit,
    valueBox,
    size,
    configOverride,
  } = {
    min: props.min ?? 0,
    max: props.max ?? 100,
    value: props.value ?? (() => 0),
    highlights: parseHighlights(props),
    unit: props.unit ?? "",
    valueBox: props.valueBox ?? false,
    size: props.size ?? 96,
    configOverride: props.configOverride ?? {},
  };

  let el;

  onMount(() => {
    // https://canvas-gauges.com/documentation/user-guide/configuration
    const gauge = new cg.RadialGauge({
      borders: false,
      valueBox,
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
      width: size,
      height: size,
      units: unit,
      title: false,
      value: 0,
      minValue: min,
      maxValue: max,
      majorTicks: [
        min,
        max / 2,
        max,
      ],
      minorTicks: 30,
      strokeTicks: false,
      highlights,
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
      ...configOverride,
    });
    gauge.draw();

    createEffect(() => {
      gauge.value = value();
    });
  });

  return (
    <>
      <canvas ref={el} />
    </>
  );
}

function parseHighlights(props) {
  if (!props.highlights) {
    props.highlights = [
      [0, 33, "#0f09"],
      [33, 66, "#ff09"],
      [66, 100, "#f009"],
    ];
  }
  if (Array.isArray(props.highlights[0])) {
    return props.highlights.map(([from, to, color]) => ({
      from,
      to,
      color,
    }));
  }
  return props.highlights;
}
