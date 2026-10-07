import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const schema = z.object({
  score: z.number().min(0).max(100),
  feedback: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Instructor access required." }, { status: 403 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid grading payload" }, { status: 400 });
  }
  const { score, feedback } = parsed.data;

  const submission = await prisma.submission.update({
    where: { id: params.id },
    data: { score, feedback, status: "GRADED", gradedAt: new Date() },
  });

  // an instructor's grade is authoritative — overwrite the auto-graded
  // bestScore rather than taking the max of the two
  await prisma.progress.updateMany({
    where: { studentId: submission.studentId, experimentId: submission.experimentId },
    data: { bestScore: score },
  });

  return NextResponse.json({ ok: true });
}
