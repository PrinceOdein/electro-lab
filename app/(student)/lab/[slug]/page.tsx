import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ComponentType } from "@/lib/circuit";
import { LabClient } from "./LabClient";

export default async function LabPage({ params }: { params: { slug: string } }) {
  const experiment = await prisma.experiment.findUnique({ where: { slug: params.slug } });
  if (!experiment) notFound();

  const allowedParts = (experiment.allowedParts as string[]).filter(
    (p): p is Exclude<ComponentType, "wire"> => p !== "wire"
  );

  return (
    <LabClient
      experiment={{
        id: experiment.id,
        slug: experiment.slug,
        title: experiment.title,
        description: experiment.description,
        objective: experiment.objective,
        allowedParts,
        guideSteps: experiment.guideSteps as string[],
        questions: experiment.questions as string[],
      }}
    />
  );
}
