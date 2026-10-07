"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ComponentType, simulateCircuit } from "@/lib/circuit";
import {
  COMPONENT_BOX,
  PlacedComponent,
  PlacedWire,
  buildGraph,
  defaultPropsFor,
  genId,
  terminalId,
  terminalPosition,
} from "@/lib/canvas/types";
import { CircuitSymbol } from "./CircuitSymbol";
import { ComponentPalette } from "./ComponentPalette";
import { Inspector } from "./Inspector";

const CANVAS_W = 760;
const CANVAS_H = 420;
const SNAP = 10;

interface Props {
  allowedParts: Array<Exclude<ComponentType, "wire">>;
  /** called whenever the circuit changes, so a parent (e.g. a submission
   *  form) can capture the current circuitState + measurements */
  onStateChange?: (state: { components: PlacedComponent[]; wires: PlacedWire[] }, measurements: unknown) => void;
}

function snap(v: number) {
  return Math.round(v / SNAP) * SNAP;
}

export function CircuitCanvas({ allowedParts, onStateChange }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [components, setComponents] = useState<PlacedComponent[]>([]);
  const [wires, setWires] = useState<PlacedWire[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [movingId, setMovingId] = useState<string | null>(null);
  const moveOffset = useRef({ dx: 0, dy: 0 });
  const [wireDraft, setWireDraft] = useState<{ from: string; x: number; y: number } | null>(null);

  const graph = useMemo(() => buildGraph(components, wires), [components, wires]);
  const result = useMemo(() => simulateCircuit(graph), [graph]);

  useEffect(() => {
    onStateChange?.({ components, wires }, result);
    // onStateChange is expected to be a stable setter (e.g. setState), so it
    // is intentionally excluded from deps to avoid re-running on every parent render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [components, wires, result]);

  const relativePoint = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const type = e.dataTransfer.getData(
      "application/electrolab-part"
    ) as PlacedComponent["type"];
    if (!type) return;
    const { x, y } = relativePoint(e.clientX, e.clientY);
    const newComponent: PlacedComponent = {
      id: genId(type),
      type,
      x: Math.max(0, Math.min(CANVAS_W - COMPONENT_BOX.width, snap(x - COMPONENT_BOX.width / 2))),
      y: Math.max(0, Math.min(CANVAS_H - COMPONENT_BOX.height, snap(y - COMPONENT_BOX.height / 2))),
      props: defaultPropsFor(type),
    };
    setComponents((prev) => [...prev, newComponent]);
    setSelectedId(newComponent.id);
  }

  function startMoveComponent(e: React.PointerEvent, pc: PlacedComponent) {
    e.stopPropagation();
    setSelectedId(pc.id);
    const p = relativePoint(e.clientX, e.clientY);
    moveOffset.current = { dx: p.x - pc.x, dy: p.y - pc.y };
    setMovingId(pc.id);
  }

  function startWire(e: React.PointerEvent, fromTerminal: string) {
    e.stopPropagation();
    const p = relativePoint(e.clientX, e.clientY);
    setWireDraft({ from: fromTerminal, x: p.x, y: p.y });
  }

  function finishWire(e: React.PointerEvent, toTerminal: string) {
    e.stopPropagation();
    setWireDraft((draft) => {
      if (draft && draft.from !== toTerminal) {
        const sameComponent = draft.from.split(":")[0] === toTerminal.split(":")[0];
        const alreadyWired = wires.some(
          (w) =>
            (w.from === draft.from && w.to === toTerminal) ||
            (w.from === toTerminal && w.to === draft.from)
        );
        if (!sameComponent && !alreadyWired) {
          setWires((prev) => [...prev, { id: genId("wire"), from: draft.from, to: toTerminal }]);
        }
      }
      return null;
    });
  }

  function handleCanvasPointerMove(e: React.PointerEvent) {
    const p = relativePoint(e.clientX, e.clientY);
    if (movingId) {
      setComponents((prev) =>
        prev.map((c) =>
          c.id === movingId
            ? {
                ...c,
                x: Math.max(0, Math.min(CANVAS_W - COMPONENT_BOX.width, snap(p.x - moveOffset.current.dx))),
                y: Math.max(0, Math.min(CANVAS_H - COMPONENT_BOX.height, snap(p.y - moveOffset.current.dy))),
              }
            : c
        )
      );
    } else if (wireDraft) {
      setWireDraft((d) => (d ? { ...d, x: p.x, y: p.y } : d));
    }
  }

  function handleCanvasPointerUp() {
    setMovingId(null);
    setWireDraft(null);
  }

  function updateProps(id: string, props: PlacedComponent["props"]) {
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, props } : c)));
  }

  function deleteComponent(id: string) {
    setComponents((prev) => prev.filter((c) => c.id !== id));
    setWires((prev) => prev.filter((w) => !w.from.startsWith(`${id}:`) && !w.to.startsWith(`${id}:`)));
    setSelectedId(null);
  }

  function deleteWire(id: string) {
    setWires((prev) => prev.filter((w) => w.id !== id));
  }

  const selectedComponent = components.find((c) => c.id === selectedId) ?? null;

  const readingFor = (id: string) => result.readings?.find((r) => r.id === id);

  function terminalAbsPos(ref: string) {
    const [compId, t] = ref.split(":") as [string, "a" | "b"];
    const pc = components.find((c) => c.id === compId);
    return pc ? terminalPosition(pc, t) : { x: 0, y: 0 };
  }

  return (
    <div className="flex gap-4">
      <ComponentPalette allowed={allowedParts} />

      <div className="flex flex-col gap-2">
        <div
          ref={canvasRef}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerDown={() => setSelectedId(null)}
          style={{ width: CANVAS_W, height: CANVAS_H }}
          className="relative overflow-hidden rounded-lg border border-slate-800 bg-[radial-gradient(circle,_#1e293b_1px,_transparent_1px)] bg-[length:20px_20px] bg-slate-950"
        >
          {/* committed wires */}
          <svg width={CANVAS_W} height={CANVAS_H} className="pointer-events-none absolute inset-0">
            {wires.map((w) => {
              const from = terminalAbsPos(w.from);
              const to = terminalAbsPos(w.to);
              return (
                <line
                  key={w.id}
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#38bdf8"
                  strokeWidth={2}
                />
              );
            })}
            {wireDraft && (
              <line
                x1={terminalAbsPos(wireDraft.from).x}
                y1={terminalAbsPos(wireDraft.from).y}
                x2={wireDraft.x}
                y2={wireDraft.y}
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 3"
              />
            )}
          </svg>

          {/* wire delete hit-targets (small midpoint buttons) */}
          {wires.map((w) => {
            const from = terminalAbsPos(w.from);
            const to = terminalAbsPos(w.to);
            const mx = (from.x + to.x) / 2;
            const my = (from.y + to.y) / 2;
            return (
              <button
                key={w.id}
                title="Remove wire"
                onClick={() => deleteWire(w.id)}
                style={{ left: mx - 6, top: my - 6 }}
                className="absolute h-3 w-3 rounded-full border border-sky-400 bg-slate-950 hover:bg-red-600"
              />
            );
          })}

          {/* components */}
          {components.map((pc) => (
            <div
              key={pc.id}
              onPointerDown={(e) => startMoveComponent(e, pc)}
              style={{ left: pc.x, top: pc.y, width: COMPONENT_BOX.width, height: COMPONENT_BOX.height }}
              className={`absolute cursor-move select-none ${
                selectedId === pc.id ? "outline outline-2 outline-sky-500" : ""
              }`}
            >
              <CircuitSymbol
                type={pc.type}
                reading={readingFor(pc.id)}
                switchClosed={pc.props.closed}
                onToggleSwitch={
                  pc.type === "switch"
                    ? () => updateProps(pc.id, { ...pc.props, closed: !(pc.props.closed ?? true) })
                    : undefined
                }
              />
              {/* terminal dots */}
              {(["a", "b"] as const).map((t) => {
                const pos = terminalPosition(pc, t);
                return (
                  <button
                    key={t}
                    onPointerDown={(e) => startWire(e, terminalId(pc.id, t))}
                    onPointerUp={(e) => finishWire(e, terminalId(pc.id, t))}
                    style={{ left: pos.x - pc.x - 5, top: pos.y - pc.y - 5 }}
                    className="absolute h-2.5 w-2.5 rounded-full bg-sky-400 ring-2 ring-slate-950 hover:scale-125"
                    aria-label={`${pc.type} terminal ${t}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <ReadoutBar result={result} />
      </div>

      <Inspector component={selectedComponent} onChange={updateProps} onDelete={deleteComponent} />
    </div>
  );
}

function ReadoutBar({ result }: { result: ReturnType<typeof simulateCircuit> }) {
  if (!result.ok) {
    return (
      <div className="rounded-lg border border-amber-900 bg-amber-950/60 px-3 py-2 text-sm text-amber-300">
        {result.error}
      </div>
    );
  }
  return (
    <div className="flex gap-4 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300">
      <span>Topology: {result.topology}</span>
      <span>V = {result.totalVoltage?.toFixed(2)}V</span>
      <span>I = {result.totalCurrent?.toFixed(4)}A</span>
      <span>
        R = {Number.isFinite(result.totalResistance) ? result.totalResistance?.toFixed(1) : "∞"}Ω
      </span>
      <span>P = {result.totalPower?.toFixed(3)}W</span>
    </div>
  );
}
