import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { simulateCircuit } from "@/lib/circuit";
import { buildGraph } from "@/lib/canvas/types";
import { autoGrade, TargetCircuit } from "@/lib/grading";

const bodySchema = z.object({
  experimentId: z.string(),
  circuitState: z.object({
    components: z.array(z.any()),
    wires: z.array(z.any()),
  }),
  answers: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be logged in to submit." }, { status: 401 });
  }
  const studentId = session.user.id;

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission payload" }, { status: 400 });
  }
  const { experimentId, circuitState, answers } = parsed.data;

  const experiment = await prisma.experiment.findUnique({ where: { id: experimentId } });
  if (!experiment) {
    return NextResponse.json({ error: "Experiment not found" }, { status: 404 });
  }

  // re-simulate server-side — never trust client-computed measurements
  const graph = buildGraph(circuitState.components, circuitState.wires);
  const measurements = simulateCircuit(graph);

  const grade = autoGrade(graph, measurements, experiment.targetCircuit as TargetCircuit | null);
  const score = grade?.score ?? null;

  const submission = await prisma.submission.create({
    data: {
      studentId,
      experimentId,
      circuitState,
      measurements: measurements as object,
      answers,
      score,
      feedback: grade?.feedback ?? null,
      status: "SUBMITTED",
    },
  });

  // "best" score means the max across attempts, not just the latest one —
  // read the existing record so a weaker retry doesn't overwrite a
  // genuinely better earlier attempt
  const existing = await prisma.progress.findUnique({
    where: { studentId_experimentId: { studentId, experimentId } },
  });
  const bestScore =
    score == null ? existing?.bestScore ?? null : Math.max(score, existing?.bestScore ?? -Infinity);

  await prisma.progress.upsert({
    where: { studentId_experimentId: { studentId, experimentId } },
    update: { status: "COMPLETED", attempts: { increment: 1 }, bestScore },
    create: { studentId, experimentId, status: "COMPLETED", attempts: 1, bestScore },
  });

  return NextResponse.json({ ok: true, submissionId: submission.id, score, feedback: grade?.feedback });
}
