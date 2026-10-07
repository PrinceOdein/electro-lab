"use client";

import { ComponentReading } from "@/lib/circuit";
import { COMPONENT_BOX } from "@/lib/canvas/types";

interface Props {
  type: "battery" | "resistor" | "led" | "switch";
  reading?: ComponentReading;
  /** switch only — its own open/closed state, independent of whether the
   *  simulation currently has a reading for it (an open switch never
   *  appears in the simulation's `readings` array at all) */
  switchClosed?: boolean;
  onToggleSwitch?: () => void;
}

const { width: W, height: H } = COMPONENT_BOX;
const MID = H / 2;

export function CircuitSymbol({ type, reading, switchClosed, onToggleSwitch }: Props) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
      {/* leads, common to every type */}
      <line x1={4} y1={MID} x2={W - 4} y2={MID} stroke="#94a3b8" strokeWidth={2} />

      {type === "resistor" && <ResistorBody reading={reading} />}
      {type === "battery" && <BatteryBody />}
      {type === "led" && <LedBody reading={reading} />}
      {type === "switch" && (
        <SwitchBody closed={switchClosed ?? true} reading={reading} onToggle={onToggleSwitch} />
      )}
    </svg>
  );
}

function ResistorBody({ reading }: { reading?: ComponentReading }) {
  const points = [
    [30, MID],
    [37, MID - 10],
    [44, MID + 10],
    [51, MID - 10],
    [58, MID + 10],
    [65, MID - 10],
    [70, MID],
  ]
    .map((p) => p.join(","))
    .join(" ");
  return (
    <>
      <rect x={28} y={MID - 12} width={44} height={24} fill="#0f172a" />
      <polyline points={points} fill="none" stroke="#e2e8f0" strokeWidth={2} />
      {reading && (
        <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
          {reading.current.toFixed(3)}A / {reading.voltage.toFixed(2)}V
        </text>
      )}
    </>
  );
}

function BatteryBody() {
  return (
    <>
      <rect x={30} y={MID - 16} width={40} height={32} fill="#0f172a" />
      {/* long plate (+) */}
      <line x1={40} y1={MID - 14} x2={40} y2={MID + 14} stroke="#facc15" strokeWidth={3} />
      {/* short plate (-) */}
      <line x1={58} y1={MID - 7} x2={58} y2={MID + 7} stroke="#94a3b8" strokeWidth={3} />
      <text x={38} y={MID - 18} fontSize="10" fill="#facc15">
        +
      </text>
      <text x={56} y={MID - 18} fontSize="10" fill="#94a3b8">
        −
      </text>
    </>
  );
}

function LedBody({ reading }: { reading?: ComponentReading }) {
  const isOn = reading?.state === "on";
  const bodyColor = isOn ? "#ff3b3b" : "#4a1414";
  return (
    <>
      <rect x={28} y={MID - 14} width={44} height={28} fill="#0f172a" />
      <polygon points={`${40},${MID - 10} ${40},${MID + 10} ${58},${MID}`} fill={bodyColor} />
      <line x1={58} y1={MID - 10} x2={58} y2={MID + 10} stroke={bodyColor} strokeWidth={3} />
      {isOn && (
        <>
          <line x1={48} y1={MID - 16} x2={53} y2={MID - 22} stroke="#ff9d9d" strokeWidth={1.5} />
          <line x1={54} y1={MID - 14} x2={59} y2={MID - 20} stroke="#ff9d9d" strokeWidth={1.5} />
        </>
      )}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
        {isOn ? `on · ${reading!.current.toFixed(3)}A` : "off"}
      </text>
    </>
  );
}

function SwitchBody({
  closed,
  reading,
  onToggle,
}: {
  closed: boolean;
  reading?: ComponentReading;
  onToggle?: () => void;
}) {
  void reading; // reserved for showing current-through-switch when closed and conducting
  return (
    <g onClick={onToggle} className="cursor-pointer" role="button" aria-label="Toggle switch">
      <circle cx={35} cy={MID} r={3} fill="#e2e8f0" />
      <circle cx={65} cy={MID} r={3} fill="#e2e8f0" />
      <line
        x1={35}
        y1={MID}
        x2={closed ? 65 : 55}
        y2={closed ? MID : MID - 14}
        stroke="#e2e8f0"
        strokeWidth={2}
      />
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">
        {closed ? "closed" : "open"} (click)
      </text>
    </g>
  );
}
