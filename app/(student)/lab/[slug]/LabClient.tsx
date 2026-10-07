"use client";

import { useState } from "react";
import { ComponentType } from "@/lib/circuit";
import { PlacedComponent, PlacedWire, buildGraph } from "@/lib/canvas/types";
import { CircuitCanvas } from "@/components/canvas/CircuitCanvas";

interface ExperimentForClient {
  id: string;
  slug: string;
  title: string;
  description: string;
  objective: string;
  allowedParts: Array<Exclude<ComponentType, "wire">>;
  guideSteps: string[];
  questions: string[];
}

export function LabClient({ experiment }: { experiment: ExperimentForClient }) {
  const [answers, setAnswers] = useState<string[]>(experiment.questions.map(() => ""));
  const [circuitSnapshot, setCircuitSnapshot] = useState<{
    components: PlacedComponent[];
    wires: PlacedWire[];
  }>({ components: [], wires: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<string | null>(null);

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitResult(null);
    try {
      const graph = buildGraph(circuitSnapshot.components, circuitSnapshot.wires);
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          experimentId: experiment.id,
          circuitState: circuitSnapshot,
          answers,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const scoreText = data.score != null ? ` Auto-graded: ${data.score}%.` : "";
        setSubmitResult(`Submitted!${scoreText} ${data.feedback ?? ""} Your instructor can still review it.`);
      } else {
        setSubmitResult(data.error ?? "Submission failed.");
      }
      void graph; // graph is recomputed server-side from circuitState for grading
    } catch {
      setSubmitResult("Network error — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-6 p-6">
      <aside className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100">{experiment.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{experiment.objective}</p>
        </div>

        <ol className="flex flex-col gap-2 text-sm text-slate-300">
          {experiment.guideSteps.map((step, i) => (
            <li key={i} className="rounded-md border border-slate-800 bg-slate-900 p-2">
              <span className="text-slate-500">{i + 1}.</span> {step}
            </li>
          ))}
        </ol>
      </aside>

      <div className="flex flex-col gap-6">
        <CircuitCanvas
          allowedParts={experiment.allowedParts}
          onStateChange={(state) => setCircuitSnapshot(state)}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4"
        >
          <h2 className="text-sm font-semibold text-slate-300">Practical questions</h2>
          {experiment.questions.map((q, i) => (
            <label key={i} className="flex flex-col gap-1 text-sm text-slate-400">
              {q}
              <textarea
                value={answers[i]}
                onChange={(e) =>
                  setAnswers((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))
                }
                rows={2}
                className="rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-slate-100"
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit report"}
          </button>
          {submitResult && <p className="text-sm text-slate-400">{submitResult}</p>}
        </form>
      </div>
    </div>
  );
}
