import { createSignal } from "solid-js";

import * as helper from "../helper/tile.js";

import { SECTIONS } from "../constants.js";

export default function AddTile(props) {
  const onsubmit = (ev) => {
    ev.preventDefault();

    const form = ev.target;

    const v = (el) => el.value;
    const getSections = () => {
      return SECTIONS.map((s) => form[`section_${s}`].checked ? s : null)
        .filter((v) => v !== null);
    };

    const tile = {
      varName: v(form["Variable"]),
      title: v(form["Title"]) ?? v(form["Variable"]),
      unit: v(form["Unit"]) ?? "",
      parse: v(form["Parser Preset"]),
      rate: Number(v(form["Polling Interval"])),
      sections: getSections(),
    };

    try {
      helper.validTile(tile);
    } catch (e) {
      console.error(e);
      return false;
    }

    try {
      helper.addTile(props, tile);
    } catch (err) {
      if (err instanceof helper.error.Exists) {
        console.error(`Tile with Variable '${tile.varName}' exists already`);
      }
    }
  };

  return (
    <div class="flex flex-col justify-center items-center">
      <details class="text-white flex flex-col">
        <summary class="bg-gray-600 px-2 py-1 cursor-pointer select-none text-center">
          Add Tile
        </summary>
        <div class="bg-gray-600 p-2 w-xs">
          <form
            class="flex flex-col gap-2"
            onsubmit={onsubmit}
          >
            <Input type="text" title="Variable" />
            <Input type="text" title="Title" />
            <PresetInput type="text" title="Unit" presets={["°c"]} />
            <PresetInput
              type="text"
              title="Parser Preset"
              presets={[
                "Number",
                "String",
                "Decimal",
                "1Decimal",
                "2Decimal",
                "3Decimal",
                "Boolean",
                "StringNewlineList",
              ]}
              default="String"
            />
            <PresetInput
              type="number"
              title="Polling Interval"
              presets={[
                100,
                500,
                1000,
                2000,
                3000,
                5000,
                10000,
              ]}
              default={1000}
            />
            <MultiOption
              title="Panel Sections"
              id="section"
              options={[
                "fuel",
                "pressurizer",
                "core",
                "energy",
                "steam",
                "condenser",
                "chemical",
              ]}
              class="flex flex-wrap gap-2"
            />
            <button
              class="warning-stripes flex justify-center items-center hover:scale-105 transition-transform cursor-pointer"
              type="submit"
            >
              <span class="bg-black px-1">Add Tile</span>
            </button>
          </form>
        </div>
      </details>
    </div>
  );
}

export function Input(props) {
  return (
    <label for={props.title} class="border-b border-dashed flex flex-col">
      <p class="select-none">{props.title}</p>
      <input
        {...props}
        type={props.type ?? "text"}
        id={props.title}
        class="min-w-0"
        name={props.name ?? null}
        value={props.value ?? null}
      />
    </label>
  );
}

export function PresetInput(props) {
  const [v, setV] = createSignal(props.default ?? "");

  if (!props.presets) {
    throw new Error("Missing prop 'presets'");
  }

  return (
    <label for={props.title} class="border-b border-dashed">
      <p class="select-none">{props.title}</p>
      <div class="grid grid-cols-[1fr_64px]">
        <input
          type={props.type ?? "text"}
          id={props.title}
          oninput={function () {
            setV(this.value);
          }}
          value={v()}
          class="min-w-0"
          autocomplete={props.autocomplete ?? null}
          name={props.title ?? props.name ?? null}
        />
        <select
          onchange={(ev) => setV(ev.target.value)}
          class="bg-gray-600 text-end truncate"
          value={props.default ?? ""}
        >
          {props.default ? null : <option></option>}
          {props.presets.map((v) => (
            <option key={v} class="truncate">{v}</option>
          ))}
        </select>
      </div>
    </label>
  );
}

export function MultiOption(props) {
  if (!props.options) {
    throw new Error("Missing prop 'options'");
  }

  return (
    <div>
      <p class="select-none">{props.title}</p>
      <ul class={props.class ?? ""}>
        {props.options.map((v) => {
          if (typeof v === "string") {
            return (
              <Checkbox key={v} id={`${props.id}_${v}`}>
                {v}
              </Checkbox>
            );
          } else {
            const { value, checked } = v;
            return (
              <Checkbox
                key={value}
                id={`${props.id}_${value}`}
                {...{ checked }}
              >
                {value}
              </Checkbox>
            );
          }
        })}
      </ul>
    </div>
  );
}

export function Checkbox(props) {
  return (
    <label for={props.id}>
      <input
        type="checkbox"
        class="hidden peer"
        id={props.id}
        checked={props.checked ?? false}
        name={props.name ?? null}
        oninput={props.oninput ?? null}
      />
      <div class="rounded bg-gray-700 peer-checked:bg-green-600 cursor-pointer select-none px-2 py-1">
        {props.children}
      </div>
    </label>
  );
}
