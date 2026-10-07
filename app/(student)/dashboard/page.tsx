import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await requireSession();
  const studentId = session.user.id;

  const [experiments, progress] = await Promise.all([
    prisma.experiment.findMany({ orderBy: { order: "asc" } }),
    prisma.progress.findMany({ where: { studentId } }),
  ]);

  const progressByExp = new Map(progress.map((p) => [p.experimentId, p]));
  const completedCount = progress.filter((p) => p.status === "COMPLETED").length;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-100">Welcome back, {session.user.name}</h1>
      <p className="mt-1 text-sm text-slate-400">
        {completedCount} of {experiments.length} experiments completed.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {experiments.map((exp) => {
          const p = progressByExp.get(exp.id);
          return (
            <Link
              key={exp.id}
              href={`/lab/${exp.slug}`}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-sky-700"
            >
              <div>
                <h2 className="font-medium text-slate-100">{exp.title}</h2>
                <p className="text-sm text-slate-400">{exp.description}</p>
              </div>
              <StatusBadge status={p?.status ?? "NOT_STARTED"} score={p?.bestScore ?? null} />
            </Link>
          );
        })}
      </div>
    </main>
  );
}

function StatusBadge({ status, score }: { status: string; score: number | null }) {
  const colors: Record<string, string> = {
    NOT_STARTED: "bg-slate-800 text-slate-400",
    IN_PROGRESS: "bg-amber-950 text-amber-300",
    COMPLETED: "bg-emerald-950 text-emerald-300",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs ${colors[status] ?? colors.NOT_STARTED}`}>
      {status.replace("_", " ").toLowerCase()}
      {score != null ? ` · ${score.toFixed(0)}%` : ""}
    </span>
  );
}
