import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import { useContextMenu } from "./ContextMenu.jsx";
import { MultiOption } from "./AddTile.jsx";
import { batch } from "solid-js";

import * as rg from "./displays/RadialGauge.jsx";
import DisplayEditor from "./displays/Editor.jsx";
import { dpLocalStorage } from "../DisplayPreset.jsx";

export default function Tile(
  { tilePointer, pollerStore, storeHelper, currentSection },
) {
  const {
    varName,
    parse: parsePreset,
    parserOverride,
    title,
    unit,
    rate,
    displays,
  } = tilePointer();

  const poller = pollerStore.subscribe({
    variable: varName,
    getRate: rate.get,
    parsePreset,
    parserOverride,
  });

  let lastRate = rate.get();
  const [editingPollRate, setEditingPollRate] = createSignal(false);

  const mutPollRate = {
    dec: () => {
      rate.set((p) => {
        if (p <= 100) {
          return p;
        } else {
          return p - 100;
        }
      });
    },
    inc: () => {
      rate.set((p) => p + 100);
    },
  };

  const pollRateHumanFormat = () => {
    const rawRate = rate.get();
    if (rawRate < 1000) {
      return `${rawRate}ms`;
    } else {
      return `${rawRate / 1000}s`;
    }
  };

  createEffect(() => {
    if (!editingPollRate()) {
      const r = rate.get();
      if (r !== lastRate) {
        poller.interval.restart();
        lastRate = r;
      }
    }
  });

  onCleanup(() => {
    pollerStore.unsubscribe(varName);
  });

  const [bgTimeout, setBgTimeout] = createSignal(false);

  createEffect(() => {
    if (poller.value.loading) {
      setBgTimeout(true);
      setTimeout(() => {
        setBgTimeout(false);
      }, 100);
    }
  });

  const pollerStatusBg = () => {
    if (bgTimeout() || poller.value.loading) return "#08f";

    return poller.interval.active() ? "#0f0" : "#f00";
  };
  const pollerToggle = () => {
    if (poller.interval.active()) {
      poller.interval.stop();
    } else {
      poller.interval.restart();
    }
  };

  const displayValue = () => {
    const v = poller.value.latest;
    if (v instanceof Error) {
      return "ERROR";
    } else {
      return `${v}${unit}`;
    }
  };

  const cmenu = useContextMenu();

  return (
    <div
      class="flex px-2 pt-2"
      onpointerenter={() => setEditingPollRate(true)}
      onpointerleave={() => setEditingPollRate(false)}
      onwheel={(ev) => ev.deltaY > 0 ? mutPollRate.dec() : mutPollRate.inc()}
    >
      <div class="flex flex-col">
        <div
          class="relative flex flex-col items-center"
          oncontextmenu={cmenu.show(() => (
            <ContextMenu {...{ tilePointer, storeHelper }} />
          ))}
        >
          <span
            class="absolute w-2 h-2 rounded-full -left-1 -top-1 leading-0 cursor-pointer text-center"
            onclick={cmenu.show(() => (
              <ContextMenu {...{ tilePointer, storeHelper }} />
            ))}
          >
            .
          </span>
          <span class="text-[8pt] leading-0">
            {pollRateHumanFormat()}
          </span>
          <span
            class="absolute w-2 h-2 rounded-full -right-1 -top-1"
            style={{ "background": pollerStatusBg() }}
            onclick={pollerToggle}
          >
          </span>
          <h6>
            {title}
          </h6>
        </div>
        <div
          oncontextmenu={cmenu.show(() => (
            <DisplayEditor
              {...{
                section: currentSection,
                displays,
              }}
            />
          ))}
          class="flex justify-center"
        >
          <Show
            when={displays.get[currentSection] ?? null}
            fallback={
              <div class="bg-black w-full flex justify-center self-stretch">
                <p class="flex gap-1 text-yellow-400 font-mono">
                  {displayValue()}
                </p>
              </div>
            }
          >
            <rg.default
              {...{
                store: displays.get[currentSection],
                value: poller.value,
              }}
            />
          </Show>
        </div>
      </div>
    </div>
  );
}

function ContextMenu(props) {
  const { tilePointer, storeHelper } = props;

  const {
    varName,
    // parse: parsePreset,
    // parserOverride,
    // title,
    // unit,
    // rate,
  } = tilePointer();

  let sectionForm;

  const sections = storeHelper.getSections(varName);

  onCleanup(() => {
    const sectionDiff = getSectionFormData(sectionForm).diffWith(sections);

    batch(() => {
      for (const [section, enable] of sectionDiff) {
        if (enable) {
          storeHelper.addToSection(section, tilePointer);
        } else {
          storeHelper.removeFromSection(section, tilePointer);
        }
      }
    });
  });

  return (
    <div class="bg-gray-500 rounded p-2 text-white flex flex-col max-w-xs">
      <form ref={sectionForm}>
        <MultiOption
          id="tileEditSection"
          title="Panel Sections"
          class="flex flex-wrap min-w-[12rem] gap-1"
          options={sections.map((
            [section, present],
          ) => ({ value: section, checked: present }))}
        />
      </form>
    </div>
  );
}

function getSectionFormData(elem) {
  const newSectionData = Array.from(elem.querySelectorAll(
    "[id*='tileEditSection']",
  )).map((el) => [el.id.split("_")[1], el.checked ?? false]);

  return {
    newSectionData,
    diffWith: sectionDiff,
  };
}

function sectionDiff(oldState) {
  oldState = Array.isArray(oldState) ? Object.fromEntries(oldState) : oldState;

  return this.newSectionData.filter(([section, enabled]) =>
    oldState[section] !== enabled
  );
}
