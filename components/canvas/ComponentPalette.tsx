"use client";

import { ComponentType } from "@/lib/circuit";

const LABELS: Record<Exclude<ComponentType, "wire">, string> = {
  battery: "Battery",
  resistor: "Resistor",
  led: "LED",
  switch: "Switch",
};

const ICONS: Record<Exclude<ComponentType, "wire">, string> = {
  battery: "🔋",
  resistor: "🟫",
  led: "💡",
  switch: "🔀",
};

interface Props {
  allowed: Array<Exclude<ComponentType, "wire">>;
}

export function ComponentPalette({ allowed }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Parts</h3>
      {allowed.map((type) => (
        <div
          key={type}
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData("application/electrolab-part", type);
            e.dataTransfer.effectAllowed = "copy";
          }}
          className="flex cursor-grab items-center gap-2 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 active:cursor-grabbing"
        >
          <span aria-hidden>{ICONS[type]}</span>
          {LABELS[type]}
        </div>
      ))}
      <p className="mt-2 text-[11px] leading-snug text-slate-500">
        Drag a part onto the board. Drag between two dots to wire them together.
      </p>
    </div>
  );
}
