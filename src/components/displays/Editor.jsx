import { createSignal, For, Match, onCleanup, Show, Switch } from "solid-js";
import { Checkbox, Input, PresetInput } from "../AddTile.jsx";
import { dpLocalStorage } from "../../helper/displayPreset.js";
import { unwrap } from "solid-js/store";

const DISPLAY_TYPES = ["radial", "7seg"];

export default function Editor(props) {
  const { section, displays } = props;

  const [presetId, setPresetId] = createSignal(
    displays.get[section]?.presetId ?? crypto.randomUUID(),
  );
  const [presetName, setPresetName] = createSignal(
    displays.get[section]?.presetName ?? null,
  );

  const [addType, setAddType] = createSignal("radial");

  const applyToCurrentSection = (data) => {
    const identifiers = { presetId: presetId() };
    if (presetName()) identifiers.presetName = presetName();

    const updatedAt = (p = {}) => (
      {
        self: new Date(),
        preset: p?.preset ?? null,
      }
    );

    displays.updateSection(section, (p) => {
      if (p) {
        return {
          ...p,
          ...data,
          ...identifiers,
          updatedAt: updatedAt(p.updatedAt ?? {}),
        };
      } else {
        return { ...data, ...identifiers, updatedAt: updatedAt() };
      }
    });
  };

  return (
    <div class="bg-gray-500 rounded p-2 text-white flex flex-col max-w-xs">
      <h4 class="flex warning-stripes border-b-2 border-white font-mono font-bold">
        <span class="bg-black px-1">TILE CONTROLS</span>
      </h4>
      <Button
        onclick={() => displays.unassignSection(section)}
        tooltip="Unassign the current display from this specific tile. No preset will be removed from storage."
      >
        <span>⚠️ Unassign display for current tile</span>
      </Button>
      <h4 class="flex warning-stripes border-b-2 border-white font-mono font-bold">
        <span class="bg-black px-1">DISPLAY EDITOR</span>
      </h4>
      <div class="flex gap-2 items-center">
        <span class="whitespace-nowrap">Form variant</span>
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
          <RadialForm
            {...{
              applyToCurrentSection,
              default: displays.getSection(section),
            }}
          />
        </Match>
      </Switch>
      <PresetSaver {...{ section, displays }} />
    </div>
  );
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

  let form;

  const [highlights, setHighlights] = createSignal(
    unwrap(props?.default?.highlights) ?? [],
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
      highlights: structuredClone(highlights()),
      unit: d.unit,
      valueBox: d.valueBox ? true : false,
      size: Number(d.size),
    };

    props.applyToCurrentSection(data);
  };

  // onCleanup(() => {
  //   form.requestSubmit();
  // });

  return (
    <form
      onsubmit={onsubmit}
      class="flex flex-col gap-2"
      ref={form}
      onchange={() => {
        form.requestSubmit();
      }}
    >
      <Input type="number" title="Minimum Value" name="min" value={min} />
      <Input type="number" title="Maximum Value" name="max" value={max} />
      <Input
        type="text"
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
              u.push([
                prevHighlightMaxOrGlobalMin(),
                Number(new FormData(form).get("max") ?? max),
                "#f009",
              ]);
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
  const { section, displays } = props;

  const [mode, setMode] = createSignal(
    displays.hasSection(section) ? "save" : "load",
  );

  const presetName = () => {
    let v = displays[section];
    return v ? v.presetName ?? "" : "";
  };

  const [includeUnsaved, setIncludeUnsaved] = createSignal(false);

  const presets = () => {
    if (includeUnsaved()) {
      return dpLocalStorage.allKeys();
    } else {
      return dpLocalStorage.allNamedKeys();
    }
  };

  // warnings
  // scenario 1
  // Editor is opened for the first time without any current display.
  //
  // this means:
  // 1. loading enabled
  // 2. saving disabled
  //
  //
  // scenario 2
  // The current display does not have a related preset
  //
  // this means:
  // 1. loading disabled (or warning saying the current display will be lost)
  // 2. saving enabled
  //
  //
  // scenario 3
  // The current display has a related preset and is up to date with it
  //
  // this means:
  // 1. loading enabled
  // 2. saving enabled
  //
  //
  // scenario 4
  // The current display has a related preset and has changes made
  //
  // this means:
  // 1. loading warning
  // 2. saving enabled

  // random thoughts:
  //
  // - PresetsContext
  // displays(subjective) related to a preset without any local changes can use a signal containing the preset data
  //
  // - Saving the state between sessions for each scenario
  // 1: x
  //
  // 2: load from unnamed
  //
  // 3 and 4: load based on the most recent (updatedAt.self <> updatedAt.preset)

  // TODO:
  // Separate "presetId", "presetName" and "updatedAt" from display specific entries.
  // the display specific entries should be in "unnamed/preset" entry so we can save correctly to localstorage when a user quits their browser

  // const tileDisplayState = () => {
  //   const currentDisplay = displays.get[section];
  //
  //   const updatedAt = currentDisplay.updatedAt;
  //
  //   if (!currentDisplay) {
  //     return "empty";
  //   }
  //
  //   if (currentDisplay.presetName) {
  //     return "saved";
  //   }
  //
  //   if (updatedAt.self) {
  //     return "unsaved";
  //   }
  // };

  const savePreset = (ev) => {
    ev.preventDefault();

    const d = Object.fromEntries(new FormData(ev.target).entries());

    const name = d["Preset Name"] ?? "";
    if (!name) return;
    if (dpLocalStorage.get(name)) {
      const overwrite = confirm(
        "A preset already exists with the provided name.\n\nDo you want to overwrite?",
      );
      if (!overwrite) return;
    }

    console.log("WRITING PRESET TO STORAGE");
    dpLocalStorage.set(name, displays.get[section]);
  };

  const loadPreset = (ev) => {
    ev.preventDefault();

    const d = Object.fromEntries(new FormData(ev.target).entries());
    const name = d["Preset Name"] ?? "";
    if (!name) return;

    const preset = dpLocalStorage.get(name);
    if (!preset) {
      console.error(`Loading preset failed: Rreset "${name}" does not exist`);
      return;
    }

    if ((displays.get[section] ?? {}).presetId) {
      const yes = confirm(
        "The current display WILL BE LOST.\n\n Do you want to continue?",
      );
      if (!yes) return;
    }

    console.log("LOADING PRESET FROM STORAGE");

    displays.set(section, preset);
  };

  let saveForm, loadForm;

  return (
    <div class="mb-2">
      <h4 class="flex warning-stripes border-b-2 border-white font-mono font-bold">
        <span class="bg-black">PRESET CONTROLS</span>
      </h4>
      <div class="flex items-center gap-2">
        {/* <Switch> */}
        {/*   <Match when={mode() === "save"}> */}
        {/*     <Switch> */}
        {/*       <Match when={tileDisplayState() === "empty"}> */}
        {/*         <dot.Red /> */}
        {/*         <span>No display currently assigned</span> */}
        {/*       </Match> */}
        {/*       <Match when={tileDisplayState() === "unsaved"}> */}
        {/*         <dot.Yellow /> */}
        {/*         <span>Unsaved changes</span> */}
        {/*       </Match> */}
        {/*       <Match when={tileDisplayState() === "saved"}> */}
        {/*         <dot.Green /> */}
        {/*         <span>Saved</span> */}
        {/*       </Match> */}
        {/*     </Switch> */}
        {/*   </Match> */}
        {/*   <Match when={mode() === "load"}> */}
        {/*     <Switch> */}
        {/*       <Match when={tileDisplayState() === "empty"}> */}
        {/*         <dot.Green /> */}
        {/*         <span>No display currently assigned</span> */}
        {/*       </Match> */}
        {/*       <Match when={tileDisplayState() === "unsaved"}> */}
        {/*         <dot.Red /> */}
        {/*         <span>Unsaved</span> */}
        {/*         {/* TODO: verify whether current preset has changes made */}
        {/*       </Match> */}
        {/*       <Match when={tileDisplayState() === "saved"}> */}
        {/*         <dot.Yellow /> */}
        {/*         <span>Saved</span> */}
        {/*       </Match> */}
        {/*     </Switch> */}
        {/*   </Match> */}
        {/* </Switch> */}
      </div>
      <div class="flex flex-col">
        <Button
          title="Switch Mode"
          onclick={() => setMode((p) => p === "save" ? "load" : "save")}
        >
          Operational Mode ⇆
        </Button>
        <div class="flex items-center">
          <div class="border-b-2 border-dashed border-white flex-grow" />
          <h2 class="uppercase font-mono font-bold px-2 py-1">
            {mode()}
          </h2>
          <div class="border-b-2 border-dashed border-white flex-grow" />
        </div>
      </div>
      <p class="text-xs select-none">
        CAVEATS:
        <span>When loading a preset you should treat it as read only.</span>
        <br />
        <span>
          If you want to make changes to a preset from another tile you should
          load it and save a new unique preset before making changes.
        </span>
      </p>
      <Switch>
        <Match when={mode() === "load"}>
          <form
            class="grid grid-cols-[1fr_min-content] gap-2"
            onsubmit={loadPreset}
            ref={loadForm}
          >
            <PresetInput
              type="text"
              title="Preset Name"
              class="truncate"
              autocomplete="off"
              presets={presets()}
            />
            <Checkbox
              checked={includeUnsaved()}
              oninput={() => setIncludeUnsaved((p) => !p)}
            >
              <p class="text-center">Include unsaved</p>
            </Checkbox>
          </form>
          <Button title="Load" onclick={() => loadForm.requestSubmit()} />
        </Match>

        <Match when={mode() === "save"}>
          <form
            class="flex gap-2 justify-center items-center"
            onsubmit={savePreset}
            ref={saveForm}
          >
            <PresetInput
              type="text"
              title="Preset Name"
              class="truncate"
              autocomplete="off"
              presets={presets()}
              default={presetName()}
            />
          </form>
          <p class="text-xs select-none">
            WARNING: overwrites preset with same name
          </p>
          <Button title="Save" onclick={() => saveForm.requestSubmit()} />
        </Match>
      </Switch>
    </div>
  );
}

function Button(props) {
  const {
    tooltip,
  } = {
    tooltip: props.tooltip ?? null,
  };

  return (
    <button
      class="cursor-pointer bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded my-2 w-full"
      type="button"
      {...props}
    >
      {tooltip
        ? (
          <div class="flex justify-between items-center">
            {props.children}
            <span
              class="rounded-full text-center bg-blue-500 hover:bg-blue-400 hover:scale-110 transition-all duration-500 leading-[1.3] h-5 w-5"
              title={tooltip}
            >
              ?
            </span>
          </div>
        )
        : (
          <>
            {props.children ?? props.title}
          </>
        )}
    </button>
  );
}

const dot = {
  Green: (props) => {
    const size = isNaN(props.size)
      ? Number(props.size ?? 8) + "px"
      : props.size;
    return (
      <span
        class="rounded-full bg-green-500"
        style={{ "width": size, "height": size }}
      />
    );
  },
  Yellow: (props) => {
    const size = isNaN(props.size)
      ? Number(props.size ?? 8) + "px"
      : props.size;
    return (
      <span
        class="rounded-full bg-yellow-500"
        style={{ "width": size, "height": size }}
      />
    );
  },
  Red: (props) => {
    const size = isNaN(props.size)
      ? Number(props.size ?? 8) + "px"
      : props.size;
    return (
      <span
        class="rounded-full bg-red-500"
        style={{ "width": size, "height": size }}
      />
    );
  },
};
