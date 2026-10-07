import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const experiments = [
  {
    slug: "ohms-law",
    title: "Ohm's Law",
    description: "Verify the relationship V = IR using a single resistor circuit.",
    objective: "Measure voltage, current and resistance, and confirm V = I × R.",
    allowedParts: ["battery", "resistor", "wire"],
    guideSteps: [
      "Drag a battery onto the canvas.",
      "Drag a resistor onto the canvas.",
      "Wire the battery's positive terminal to one end of the resistor.",
      "Wire the resistor's other end back to the battery's negative terminal.",
      "Read the current and power in the live readout panel.",
      "Change the resistor value and observe how current changes.",
    ],
    questions: [
      "What happens to current as resistance increases, with voltage held constant?",
      "Calculate I = V/R by hand for your circuit and compare it to the simulated value.",
    ],
    targetCircuit: { topology: "series", tolerancePct: 5, minComponentCounts: { resistor: 1 } },
    difficulty: 1,
    order: 1,
  },
  {
    slug: "series-circuits",
    title: "Series Circuits",
    description: "Build a series circuit with two resistors and observe voltage division.",
    objective: "Show that current is equal through every component in series, and voltages add up to the source voltage.",
    allowedParts: ["battery", "resistor", "wire"],
    guideSteps: [
      "Place a battery and two resistors of different values.",
      "Wire them in a single loop: battery -> R1 -> R2 -> back to battery.",
      "Record the current — it should be the same at every point in the loop.",
      "Record the voltage drop across each resistor.",
    ],
    questions: [
      "Do the two voltage drops add up to the battery voltage? Why?",
      "If you added a third resistor in series, what would happen to total current?",
    ],
    targetCircuit: { topology: "series", tolerancePct: 5, minComponentCounts: { resistor: 2 } },
    difficulty: 1,
    order: 2,
  },
  {
    slug: "parallel-circuits",
    title: "Parallel Circuits",
    description: "Build a parallel circuit with two resistor branches and observe current division.",
    objective: "Show that voltage is equal across every branch in parallel, and branch currents sum to the total current.",
    allowedParts: ["battery", "resistor", "wire"],
    guideSteps: [
      "Place a battery and two resistors of different values.",
      "Wire both resistors directly between the same two nodes (the battery terminals).",
      "Record the voltage across each branch — it should equal the battery voltage.",
      "Record the current through each branch, and the total current from the battery.",
    ],
    questions: [
      "Which branch carries more current — the higher or lower resistance one? Why?",
      "Calculate the equivalent resistance and compare it to the simulated total resistance.",
    ],
    targetCircuit: { topology: "parallel", tolerancePct: 5, minComponentCounts: { resistor: 2 } },
    difficulty: 2,
    order: 3,
  },
  {
    slug: "basic-led-circuit",
    title: "Basic LED Circuit",
    description: "Build a current-limited LED circuit and understand why the resistor is necessary.",
    objective: "Correctly size a current-limiting resistor for an LED and observe its on/off behavior.",
    allowedParts: ["battery", "resistor", "led", "switch", "wire"],
    guideSteps: [
      "Place a battery, a resistor, an LED and a switch.",
      "Wire them in series: battery -> switch -> resistor -> LED -> back to battery.",
      "Close the switch and observe the LED turn on.",
      "Try removing the resistor and see what warning ElectroLab gives.",
      "Open the switch and observe the LED turn off.",
    ],
    questions: [
      "Why does the LED need a series resistor instead of connecting directly to the battery?",
      "If the LED's forward voltage is 2V and the battery is 9V, what resistor value gives 15mA of current?",
    ],
    targetCircuit: {
      topology: "series",
      tolerancePct: 5,
      minComponentCounts: { led: 1, resistor: 1 },
    },
    difficulty: 2,
    order: 4,
  },
];

async function main() {
  for (const exp of experiments) {
    await prisma.experiment.upsert({
      where: { slug: exp.slug },
      update: exp,
      create: exp,
    });
  }
  console.log(`Seeded ${experiments.length} experiments.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
