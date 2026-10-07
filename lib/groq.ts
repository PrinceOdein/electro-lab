const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// openai/gpt-oss-20b: fast + inexpensive on Groq, enough reasoning quality
// for explaining first-year circuit concepts. Override via env if you want
// to try openai/gpt-oss-120b for better answers at higher latency/cost.
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-20b";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class GroqConfigError extends Error {}
export class GroqRequestError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function askGroq(messages: GroqMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new GroqConfigError("GROQ_API_KEY is not set. Add it to .env (see .env.example).");
  }

  const res = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.4,
      max_completion_tokens: 500,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GroqRequestError(`Groq API error (${res.status}): ${body.slice(0, 300)}`, res.status);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new GroqRequestError("Groq API returned an unexpected response shape.", 502);
  }
  return content;
}
