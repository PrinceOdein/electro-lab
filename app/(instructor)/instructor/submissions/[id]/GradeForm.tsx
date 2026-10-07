"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  submissionId: string;
  initialScore: number | null;
  initialFeedback: string;
}

export function GradeForm({ submissionId, initialScore, initialFeedback }: Props) {
  const router = useRouter();
  const [score, setScore] = useState(initialScore ?? 0);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/instructor/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score, feedback }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to save grade.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
      <h2 className="text-sm font-semibold text-slate-300">Grade</h2>
      <label className="flex flex-col gap-1 text-xs text-slate-400">
        Score (%)
        <input
          type="number"
          min={0}
          max={100}
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          className="w-24 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-100"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-400">
        Feedback
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={3}
          className="rounded-md border border-slate-700 bg-slate-800 p-2 text-sm text-slate-100"
        />
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        onClick={save}
        disabled={saving}
        className="w-fit rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save grade"}
      </button>
    </section>
  );
}
