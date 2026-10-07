# ElectroLab

A browser-based virtual electronics laboratory for first-year EEE students
in Nigerian universities — built to reduce copied lab results where
physical lab access is limited.

## Status: MVP feature-complete

Every feature from the original spec exists and is wired end to end:
register → land on dashboard → pick an experiment → build a circuit on the
canvas → ask the assistant for a hint if stuck → submit → instructor sees
it, grades it → student's dashboard reflects the new score.

### Simulation engine — `lib/circuit/`
Pure TypeScript, no React/DB. Union-find wire collapsing → series/parallel
topology classification → closed-form Ohm's Law solvers. Shared verbatim
between the client (instant canvas preview) and `/api/simulate` +
`/api/submissions` (server-authoritative — never trusts client numbers).
**8 tests** in `circuit.test.ts`.

LEDs are modeled as ideal diodes with a fixed forward voltage drop (2.0V
default) rather than the real exponential I-V curve — intentionally
first-year-appropriate. An LED with no current-limiting resistor (in
series or in its own parallel branch) is rejected with an explanatory
error instead of silently computing unsafe current.

**Scope decision:** the engine only classifies pure-series and
pure-parallel topologies, not general nodal analysis. All four MVP
experiments only need one or the other; mixed series-parallel (bridge
networks) returns a clear "not supported" error, and the component palette
is small enough that students can't accidentally build one. A reduction
algorithm (combine parallel edges, series-collapse degree-2 nodes) is a
known extension if a future experiment needs it.

### Circuit builder — `components/canvas/`
Drag parts from the palette, drop onto the board, drag between terminal
dots to wire them, drag a placed component to reposition it (wires follow
automatically), click a component to edit its value, click a switch to
toggle it. Live readouts (topology, V, I, R, P) update on every change.
Try it without a database at `/demo`.

### Auth — `lib/auth.ts`, `middleware.ts`
NextAuth credentials provider, bcrypt password hashing, JWT session
carrying `id` and `role`. Middleware protects `/dashboard`, `/lab`, and
`/instructor` — the latter additionally requires the `INSTRUCTOR` role.

### Student pages
`/dashboard` (progress overview), `/experiments` (catalog), `/lab/[slug]`
(guide + canvas + practical questions + submit).

### Instructor pages
`/instructor` (submissions list), `/instructor/submissions/[id]`
(measurements + answers + grading form), `/instructor/students`
(aggregate progress table).

### Grading — `lib/grading.ts`
Auto-grades on submit by checking topology **and** component composition
against each experiment's `minComponentCounts` — not topology alone. (A
single resistor and a 9V battery simulate as `topology: "series"`, same as
a proper 2-resistor series circuit; without the composition check, Ohm's
Law and Series Circuits were indistinguishable to the grader.) Gives
partial credit with specific feedback. **6 tests**, including one pinning
that exact bug. An instructor's manual grade is always authoritative and
overwrites the auto-grade. `Progress.bestScore` is a real max across
attempts, not just the latest score.

**Known gap:** `minComponentCounts` is a floor, not a ceiling — a student
could over-build (e.g. 5 resistors) and still score 100%. Low-stakes, not
fixed.

### Landing page — `app/page.tsx`
Rebuilt around the product's actual subject matter rather than a generic
template: PCB-green background, copper/phosphor accents (phosphor green
used only for the literal live readout, not as decoration), an inline SVG
hero circuit that actually lights up, hairline-bordered experiment cards
instead of the rounded-card-plus-shadow default. Scoped to this one page —
the rest of the app keeps its existing slate/sky styling.

### AI assistant — `components/assistant/`, `lib/groq.ts`
A floating chat widget, visible to any logged-in student or lecturer,
backed by Groq's `openai/gpt-oss-20b` (fast, cheap, good enough for
first-year concept explanations). **Role-aware by design**: instructors
get full technical depth; students get concepts explained fully but the
assistant explicitly withholds final answers to practical questions in
favor of guiding questions — because handing over answers would undermine
the whole reason ElectroLab exists. See `lib/assistant-prompt.ts` (2
tests) for the exact prompt logic.

**Setup:** get a free key at console.groq.com/keys, add `GROQ_API_KEY` to
`.env`. Without it, the widget still renders but shows "assistant isn't
configured yet" rather than failing silently.

## Known gaps (beyond grading, above)

- No per-student attempt history — only the latest `Submission` per
  experiment is browsable; `Progress.attempts` counts but doesn't surface
  past attempts individually.
- No password reset / email verification — fine for an MVP demo, not a
  real rollout.
- The assistant has no conversation memory across page loads (resets on
  refresh) and no rate limiting beyond requiring login.

## Setup

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL, and GROQ_API_KEY if you want the assistant working
npm run db:migrate         # creates tables
npm run db:seed            # loads the 4 experiments
npm run test                 # runs all unit tests (16, across 3 files)
npm run dev                  # http://localhost:3000
```

Want to see the canvas without setting up Postgres at all? Visit
`http://localhost:3000/demo`.

## Directory structure

```
lib/
  circuit/             # pure TS simulation engine — shared by client & server
  grading.ts           # auto-grading logic (topology + component counts)
  groq.ts              # Groq API wrapper
  assistant-prompt.ts  # role-aware system prompt for the AI assistant
  auth.ts, session.ts, db.ts, canvas/types.ts
prisma/schema.prisma
seed/experiments.ts
components/
  canvas/              # the circuit builder
  landing/             # hero illustration + glyphs for the landing page
  assistant/           # the floating chat widget
  ui/NavBar.tsx
app/
  page.tsx                          # landing page
  (auth)/login, (auth)/register
  (student)/dashboard, (student)/experiments, (student)/lab/[slug]
  (instructor)/instructor, .../submissions/[id], .../students
  api/simulate, api/submissions, api/auth, api/assistant, api/instructor
  demo/                              # canvas demo, no DB required
```
