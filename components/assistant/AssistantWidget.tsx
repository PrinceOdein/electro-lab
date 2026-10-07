"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export function AssistantWidget() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, loading]);

  // hooks must run unconditionally — bail out of rendering after they're called
  if (status !== "authenticated" || !session.user) return null;

  async function send() {
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const greeting =
    session.user.role === "INSTRUCTOR"
      ? "Ask me about circuit concepts, grading, or experiment design."
      : "Ask me about Ohm's Law, series/parallel circuits, LEDs, or anything you're stuck on — I'll help you think it through rather than just giving the answer.";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="flex h-96 w-80 flex-col overflow-hidden rounded-lg border border-slate-800 bg-slate-900 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
            <span className="text-sm font-semibold text-slate-200">ElectroLab Assistant</span>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-500 hover:text-slate-300"
              aria-label="Close assistant"
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 text-sm">
            {messages.length === 0 && <p className="text-slate-500">{greeting}</p>}
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-md px-3 py-1.5 ${
                    m.role === "user" ? "bg-sky-600 text-white" : "bg-slate-800 text-slate-200"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-slate-500">Thinking…</p>}
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex gap-2 border-t border-slate-800 p-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="flex-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-slate-100"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-600 text-xl text-white shadow-lg hover:bg-sky-500"
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}
