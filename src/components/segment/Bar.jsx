const UNLIT = "0.1";

export function Hbar(props) {
  const bg = props.color ?? "#fc0";
  const size = props.size ?? 8;
  const lit = props.lit ?? false;

  return (
    <div
      class="flex relative justify-between"
      style={{
        "background": bg,
        "width": size * 2 + "px",
        "height": size + "px",
        "margin-inline": size + "px",
        "opacity": lit ? "1" : UNLIT,
      }}
    >
      <div class="translate-x-[-75%]">
        <div class="overflow-hidden flex justify-center w-[150%]">
          <div
            style={{
              "background": bg,
              "width": size + "px",
              "height": size + "px",
            }}
            class="rotate-45"
          />
        </div>
      </div>
      <div class="translate-x-[50%]">
        <div class="overflow-hidden w-[200%]">
          <div
            style={{
              "background": bg,
              "width": size + "px",
              "height": size + "px",
            }}
            class="rotate-45"
          />
        </div>
      </div>
    </div>
  );
}

export function Vbar(props) {
  const bg = props.color ?? "#fc0";
  const size = props.size ?? 8;
  const lit = props.lit ?? false;

  return (
    <div
      class="flex flex-col"
      style={{
        "background": bg,
        "width": size + "px",
        "height": size * 2 + "px",
        "margin-block": size + "px",
        "opacity": lit ? "1" : UNLIT,
      }}
    >
      <div class="translate-y-[-75%]">
        <div class="overflow-hidden flex items-center h-[150%]">
          <div
            style={{
              "background": bg,
              "width": size + "px",
              "height": size + "px",
            }}
            class="rotate-45"
          />
        </div>
      </div>
      <div class="translate-y-[50%]">
        <div class="overflow-hidden h-[200%]">
          <div
            style={{
              "background": bg,
              "width": size + "px",
              "height": size + "px",
            }}
            class="rotate-45"
          />
        </div>
      </div>
    </div>
  );
}
