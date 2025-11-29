import { createSignal, For, Match, Show, Switch } from "solid-js";
import { Checkbox, Input, PresetInput } from "../AddTile.jsx";
import { dpLocalStorage } from "../../DisplayPreset.jsx";

const DISPLAY_TYPES = ["radial", "7seg"];

export default function Editor(props) {
  const { section, currentDisplay, updateSection } = props;

  const [addType, setAddType] = createSignal("radial");
  const [presetBody, setPresetBody] = createSignal({}, { equals: false });

  const applyToCurrentSection = (data) => {
    console.log("current", currentDisplay, "new", data);
    // updateSection(section, (p) => )
  };

  return (
    <div class="bg-gray-500 rounded p-2 text-white flex flex-col max-w-xs">
      <h4 class="flex warning-stripes border-b-2 border-white">
        <span class="bg-black px-1">Add Form</span>
      </h4>
      <div class="flex gap-2">
        <span class="whitespace-nowrap">Form variant:</span>
        <select
          class="bg-gray-500"
          oninput={(ev) => setAddType(ev.target.value)}
        >
          <option></option>
          <For each={DISPLAY_TYPES}>
            {(v) => {
              const selected = () => v === addType();
              return <option selected={selected()}>{v}</option>;
            }}
          </For>
        </select>
      </div>
      <Switch>
        <Match when={addType() === "radial"}>
          <RadialForm {...{ applyToCurrentSection, default: currentDisplay }} />
        </Match>
      </Switch>
      <PresetSaver {...{ presetBody, section }} />
    </div>
  );
}

function diffRadialChanges() {
}

function RadialForm(props) {
  const {
    min,
    max,
    valueMult,
    // highlights,
    unit,
    valueBox,
    size,
    configOverride,
  } = {
    min: props?.default?.min ?? 0,
    max: props?.default?.max ?? 100,
    valueMult: props?.default?.valueMult ?? 1,
    // highlights: parseHighlights(props?.default?),
    unit: props?.default?.unit ?? "",
    valueBox: props?.default?.valueBox ?? false,
    size: props?.default?.size ?? 96,
    configOverride: props?.default?.configOverride ?? {},
  };

  const [highlights, setHighlights] = createSignal(
    props?.default?.highlights ?? [],
    {
      equals: false,
    },
  );

  const updateHighlight = (i, field, parser = (v) => v) => {
    return (ev) => {
      setHighlights((p) => {
        const u = p;
        u[i][field] = parser(ev.target.value);
        return u;
      });
    };
  };

  const onsubmit = (ev) => {
    ev.preventDefault();

    const d = Object.fromEntries(new FormData(ev.target).entries());

    const data = {
      displayType: "radial",
      min: Number(d.min),
      max: Number(d.max),
      valueMult: Number(d.valueMult),
      highlights: highlights(),
      unit: d.unit,
      valueBox: d.valueBox ? true : false,
      size: Number(d.size),
    };

    console.log(data);
  };

  return (
    <form
      onsubmit={onsubmit}
      class="flex flex-col gap-2"
    >
      <Input type="number" title="Minimum Value" name="min" value={min} />
      <Input type="number" title="Maximum Value" name="max" value={max} />
      <Input
        type="number"
        title="Value Multiplier"
        name="valueMult"
        value={valueMult}
      />
      <div>
        <Show when={!!highlights().length}>
          <div class="grid grid-cols-3">
            <h5>Min</h5>
            <h5>Max</h5>
            <h5>Color</h5>
          </div>
        </Show>
        <For each={highlights()}>
          {(range, i) => {
            const rangeId = i();
            return (
              <div class="flex">
                <div class="grid grid-cols-3">
                  <Input
                    type="number"
                    value={range[0]}
                    oninput={updateHighlight(rangeId, 0, (s) => Number(s))}
                  />
                  <Input
                    type="number"
                    value={range[1]}
                    oninput={updateHighlight(rangeId, 1, (s) => Number(s))}
                  />
                  <Input
                    type="text"
                    value={range[2]}
                    oninput={updateHighlight(rangeId, 2)}
                  />
                </div>
                <button
                  class="cursor-pointer"
                  type="button"
                  onclick={() =>
                    setHighlights((p) => {
                      const u = new Set(p);
                      u.delete(range);
                      return Array.from(u);
                    })}
                >
                  X
                </button>
              </div>
            );
          }}
        </For>
        <button
          class="cursor-pointer bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
          type="button"
          onclick={() =>
            setHighlights((p) => {
              let prevItem = p.length - 1;
              prevItem = prevItem >= 0 ? prevItem : null;

              const prevHighlightMaxOrGlobalMin = () =>
                prevItem !== null ? p[prevItem][1] : min;

              const u = p;
              u.push([prevHighlightMaxOrGlobalMin(), max, "#0000"]);
              return u;
            })}
        >
          <Show when={highlights().length} fallback="Add a highlight range">
            Add another highlight range
          </Show>
        </button>
      </div>
      <Input type="text" title="Unit" name="unit" value={unit} />
      <Checkbox name="valueBox" checked={valueBox}>
        Enable Digital Display
      </Checkbox>
      <Input type="number" title="Size" name="size" value={size} />
      <button
        class="cursor-pointer bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded mb-2"
        type="submit"
      >
        Apply
      </button>
    </form>
  );
}

function PresetSaver(props) {
  const { section, presetBody } = props;

  return (
    <div class="mb-2">
      <h4 class="flex warning-stripes">
        <span class="bg-black">Save as preset</span>
      </h4>
      <p class="text-xs select-none">
        WARNING: overwrites preset with same name
      </p>
      <PresetInput
        type="text"
        title="Preset Name"
        // default={section}
        presets={dpLocalStorage.allKeys()}
      />
    </div>
  );
}
