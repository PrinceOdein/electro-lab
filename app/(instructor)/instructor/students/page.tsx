export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";

export default async function StudentsProgressPage() {
  const [students, totalExperiments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: { progress: true },
      orderBy: { fullName: "asc" },
    }),
    prisma.experiment.count(),
  ]);

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold text-slate-100">Student progress</h1>
      <table className="mt-6 w-full text-left text-sm text-slate-300">
        <thead>
          <tr className="border-b border-slate-800 text-slate-500">
            <th className="py-2 font-normal">Student</th>
            <th className="font-normal">Matric No.</th>
            <th className="font-normal">Completed</th>
            <th className="font-normal">Avg. score</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => {
            const completed = s.progress.filter((p) => p.status === "COMPLETED").length;
            const scores = s.progress
              .map((p) => p.bestScore)
              .filter((n): n is number => n != null);
            const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
            return (
              <tr key={s.id} className="border-b border-slate-900">
                <td className="py-2">{s.fullName}</td>
                <td>{s.matricNumber ?? "—"}</td>
                <td>
                  {completed}/{totalExperiments}
                </td>
                <td>{avg != null ? `${avg.toFixed(0)}%` : "—"}</td>
              </tr>
            );
          })}
          {students.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-slate-500">
                No students registered yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
