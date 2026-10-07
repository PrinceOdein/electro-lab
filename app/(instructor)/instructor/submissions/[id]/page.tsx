import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { GradeForm } from "./GradeForm";

interface MeasurementSummary {
  ok: boolean;
  topology?: string;
  totalVoltage?: number;
  totalCurrent?: number;
  totalResistance?: number;
  totalPower?: number;
  error?: string;
}

export default async function SubmissionDetailPage({ params }: { params: { id: string } }) {
  const submission = await prisma.submission.findUnique({
    where: { id: params.id },
    include: { student: true, experiment: true },
  });
  if (!submission) notFound();

  const measurements = submission.measurements as unknown as MeasurementSummary;
  const answers = submission.answers as string[];
  const questions = submission.experiment.questions as string[];

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-xl font-bold text-slate-100">{submission.experiment.title}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {submission.student.fullName} · submitted{" "}
        {new Date(submission.submittedAt).toLocaleString()}
      </p>

      <section className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-300">Measurements</h2>
        {measurements.ok ? (
          <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-300">
            <dt className="text-slate-500">Topology</dt>
            <dd>{measurements.topology}</dd>
            <dt className="text-slate-500">Voltage</dt>
            <dd>{measurements.totalVoltage?.toFixed(2)}V</dd>
            <dt className="text-slate-500">Current</dt>
            <dd>{measurements.totalCurrent?.toFixed(4)}A</dd>
            <dt className="text-slate-500">Resistance</dt>
            <dd>
              {measurements.totalResistance != null && Number.isFinite(measurements.totalResistance)
                ? `${measurements.totalResistance.toFixed(1)}Ω`
                : "∞"}
            </dd>
            <dt className="text-slate-500">Power</dt>
            <dd>{measurements.totalPower?.toFixed(3)}W</dd>
          </dl>
        ) : (
          <p className="mt-2 text-sm text-amber-400">{measurements.error}</p>
        )}
      </section>

      <section className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-800 bg-slate-900 p-4">
        <h2 className="text-sm font-semibold text-slate-300">Answers</h2>
        {questions.map((q, i) => (
          <div key={i}>
            <p className="text-sm text-slate-400">{q}</p>
            <p className="mt-1 text-sm text-slate-200">{answers[i] || "—"}</p>
          </div>
        ))}
      </section>

      <GradeForm
        submissionId={submission.id}
        initialScore={submission.score}
        initialFeedback={submission.feedback ?? ""}
      />
    </main>
  );
}
