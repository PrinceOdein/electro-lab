import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { askGroq, GroqConfigError, GroqRequestError } from "@/lib/groq";
import { buildSystemPrompt } from "@/lib/assistant-prompt";

const MAX_TURNS = 12;
const MAX_MESSAGE_LENGTH = 1500;

const bodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(MAX_MESSAGE_LENGTH),
      })
    )
    .min(1)
    .max(MAX_TURNS),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "You must be logged in to use the assistant." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid message payload." }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(session.user.role, session.user.name ?? "there");

  try {
    const reply = await askGroq([
      { role: "system", content: systemPrompt },
      ...parsed.data.messages,
    ]);
    return NextResponse.json({ reply });
  } catch (err) {
    if (err instanceof GroqConfigError) {
      return NextResponse.json(
        { error: "The assistant isn't configured yet (missing GROQ_API_KEY)." },
        { status: 503 }
      );
    }
    if (err instanceof GroqRequestError) {
      return NextResponse.json(
        { error: "The assistant is temporarily unavailable. Try again shortly." },
        { status: 502 }
      );
    }
    return NextResponse.json({ error: "Something went wrong talking to the assistant." }, { status: 500 });
  }
}
