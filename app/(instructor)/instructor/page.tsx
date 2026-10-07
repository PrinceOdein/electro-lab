import Link from "next/link";
import { prisma } from "@/lib/db";

export default async function InstructorSubmissionsPage() {
  const submissions = await prisma.submission.findMany({
    orderBy: { submittedAt: "desc" },
    include: { student: true, experiment: true },
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold text-slate-100">Submissions</h1>
      <div className="mt-6 flex flex-col gap-2">
        {submissions.length === 0 && (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        )}
        {submissions.map((s) => (
          <Link
            key={s.id}
            href={`/instructor/submissions/${s.id}`}
            className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-sky-700"
          >
            <div>
              <h2 className="font-medium text-slate-100">{s.experiment.title}</h2>
              <p className="text-sm text-slate-400">
                {s.student.fullName} · {new Date(s.submittedAt).toLocaleString()}
              </p>
            </div>
            <StatusPill status={s.status} score={s.score} />
          </Link>
        ))}
      </div>
    </main>
  );
}

function StatusPill({ status, score }: { status: string; score: number | null }) {
  const colors: Record<string, string> = {
    SUBMITTED: "bg-amber-950 text-amber-300",
    GRADED: "bg-emerald-950 text-emerald-300",
    IN_PROGRESS: "bg-slate-800 text-slate-400",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${colors[status] ?? colors.IN_PROGRESS}`}>
      {status.toLowerCase()}
      {score != null ? ` · ${score.toFixed(0)}%` : ""}
    </span>
  );
}
