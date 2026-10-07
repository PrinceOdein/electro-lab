"use client";

import { PlacedComponent } from "@/lib/canvas/types";

interface Props {
  component: PlacedComponent | null;
  onChange: (id: string, props: PlacedComponent["props"]) => void;
  onDelete: (id: string) => void;
}

export function Inspector({ component, onChange, onDelete }: Props) {
  if (!component) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-500">
        Select a component to edit its value.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {component.type} — properties
      </h3>

      {component.type === "battery" && (
        <NumberField
          label="Voltage (V)"
          value={component.props.voltage ?? 9}
          onChange={(v) => onChange(component.id, { ...component.props, voltage: v })}
        />
      )}

      {component.type === "resistor" && (
        <NumberField
          label="Resistance (Ω)"
          value={component.props.resistance ?? 220}
          onChange={(v) => onChange(component.id, { ...component.props, resistance: v })}
        />
      )}

      {component.type === "led" && (
        <NumberField
          label="Forward voltage (V)"
          value={component.props.forwardVoltage ?? 2}
          onChange={(v) => onChange(component.id, { ...component.props, forwardVoltage: v })}
        />
      )}

      {component.type === "switch" && (
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={component.props.closed ?? true}
            onChange={(e) =>
              onChange(component.id, { ...component.props, closed: e.target.checked })
            }
          />
          Closed
        </label>
      )}

      <button
        onClick={() => onDelete(component.id)}
        className="mt-2 rounded-md border border-red-900 bg-red-950 px-2 py-1 text-xs text-red-300 hover:bg-red-900"
      >
        Delete component
      </button>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
      />
    </label>
  );
}
