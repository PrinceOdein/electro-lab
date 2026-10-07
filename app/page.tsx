import Link from "next/link";
import { HeroCircuit } from "@/components/landing/HeroCircuit";
import { Glyph } from "@/components/landing/Glyph";

const EXPERIMENTS = [
  {
    title: "Ohm's Law",
    blurb: "One battery, one resistor. Confirm V = IR with your own numbers.",
    difficulty: 1,
  },
  {
    title: "Series Circuits",
    blurb: "Chain two resistors and watch the voltage split between them.",
    difficulty: 1,
  },
  {
    title: "Parallel Circuits",
    blurb: "Branch two resistors and see why the smaller one pulls more current.",
    difficulty: 2,
  },
  {
    title: "Basic LED Circuit",
    blurb: "Size a current-limiting resistor correctly — or watch the warning fire.",
    difficulty: 2,
  },
];

export default function LandingPage() {
  return (
    <div className="font-body">
      {/* hero */}
      <section className="border-b border-silkscreen/15 bg-pcb bg-[radial-gradient(circle,_#1c2e22_1px,_transparent_1px)] bg-[length:22px_22px]">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <h1 className="font-display text-4xl font-medium leading-tight text-paper sm:text-5xl">
              A circuit lab your students can open at 2am.
            </h1>
            <p className="mt-5 max-w-prose text-lg leading-relaxed text-silkscreen">
              ElectroLab is a browser-based electronics lab for first-year EEE students, built
              for universities where lab time is scarce and class sizes are large. Students wire
              real circuits, take real measurements, and submit real reports — no shared
              equipment, no copied results.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-sm bg-copper px-5 py-2.5 text-sm font-medium text-pcb transition hover:bg-copper/90"
              >
                Create an account
              </Link>
              <Link
                href="/login"
                className="rounded-sm border border-silkscreen/40 px-5 py-2.5 text-sm font-medium text-paper transition hover:border-silkscreen"
              >
                Log in
              </Link>
            </div>
          </div>
          <HeroCircuit />
        </div>
      </section>

      {/* the problem */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium text-paper">
          Built around a real constraint
        </h2>
        <p className="mt-4 leading-relaxed text-silkscreen">
          Most first-year EEE classes in Nigerian universities are large, and lab equipment is
          shared across far more students than it was built for. When a practical session is
          short and oversubscribed, it's common for a student to copy a bench-mate's readings
          instead of taking the measurement themselves. ElectroLab gives every student their own
          lab bench — open whenever they are, graded whenever an instructor is.
        </p>
      </section>

      {/* experiments */}
      <section className="border-y border-silkscreen/15 bg-pcb-raised py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="font-display text-2xl font-medium text-paper">
            Four guided experiments
          </h2>
          <p className="mt-2 max-w-prose text-silkscreen">
            Each one pairs a short guide with a live circuit board: build it, measure it, answer
            the practical questions, submit.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXPERIMENTS.map((exp) => (
              <div key={exp.title} className="rounded-sm border border-copper/30 bg-pcb p-4">
                <h3 className="font-display text-base font-medium text-paper">{exp.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-silkscreen">{exp.blurb}</p>
                <span className="mt-3 block text-sm text-copper">
                  {"★".repeat(exp.difficulty)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* audience */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-2xl font-medium text-paper">
          Built for how labs actually work
        </h2>
        <div className="mt-8 grid gap-10 sm:grid-cols-3">
          <AudienceItem
            type="battery"
            title="Students"
            body="Guided steps, live readouts, and a chat assistant that nudges you toward the answer instead of handing it over."
          />
          <AudienceItem
            type="resistor"
            title="Lecturers"
            body="Review every submission's circuit, measurements, and answers in one place, and grade it with a click."
          />
          <AudienceItem
            type="switch"
            title="Departments"
            body="Scale practical sessions beyond what the physical lab can hold, without buying more equipment."
          />
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-silkscreen/15 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 text-sm text-silkscreen sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display text-paper">ElectroLab</span>
          <span>Built as a capstone project at Claretian University of Nigeria, Nekede.</span>
        </div>
      </footer>
    </div>
  );
}

function AudienceItem({
  type,
  title,
  body,
}: {
  type: "battery" | "resistor" | "switch";
  title: string;
  body: string;
}) {
  return (
    <div>
      <Glyph type={type} />
      <h3 className="mt-3 font-display text-base font-medium text-paper">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-silkscreen">{body}</p>
    </div>
  );
}
