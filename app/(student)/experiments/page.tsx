import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export default async function ExperimentsPage() {
  const session = await requireSession();
  const studentId = session.user.id;

  const [experiments, progress] = await Promise.all([
    prisma.experiment.findMany({ orderBy: { order: "asc" } }),
    prisma.progress.findMany({ where: { studentId } }),
  ]);
  const progressByExp = new Map(progress.map((p) => [p.experimentId, p]));

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-100">Experiment catalog</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {experiments.map((exp) => {
          const p = progressByExp.get(exp.id);
          return (
            <Link
              key={exp.id}
              href={`/lab/${exp.slug}`}
              className="flex flex-col gap-2 rounded-lg border border-slate-800 bg-slate-900 p-4 hover:border-sky-700"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-slate-100">{exp.title}</h2>
                <span className="text-xs text-amber-400" title={`Difficulty ${exp.difficulty}`}>
                  {"★".repeat(exp.difficulty)}
                </span>
              </div>
              <p className="text-sm text-slate-400">{exp.objective}</p>
              <span className="text-xs text-slate-500">
                {(p?.status ?? "NOT_STARTED").replace("_", " ").toLowerCase()}
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
