export function HeroCircuit() {
  return (
    <div>
      <svg
        viewBox="0 0 360 180"
        className="w-full max-w-md"
        role="img"
        aria-label="A battery, a resistor, and a glowing LED wired in series"
      >
        {/* wire loop */}
        <path
          d="M 40 90 H 86 M 174 90 H 220 M 292 90 H 320 V 150 H 40 Z"
          fill="none"
          stroke="#8E9A91"
          strokeWidth="2"
        />

        {/* battery */}
        <g transform="translate(40,66)">
          <line x1="0" y1="0" x2="0" y2="48" stroke="#B9793C" strokeWidth="4" />
          <line x1="16" y1="10" x2="16" y2="38" stroke="#8E9A91" strokeWidth="4" />
          <text x="-6" y="-6" fontSize="13" fill="#B9793C" fontFamily="var(--font-mono)">
            +
          </text>
          <text x="11" y="62" fontSize="13" fill="#8E9A91" fontFamily="var(--font-mono)">
            −
          </text>
        </g>

        {/* resistor */}
        <g transform="translate(86,90)">
          <polyline
            points="0,0 8,-11 16,11 24,-11 32,11 40,-11 48,11 56,0 88,0"
            fill="none"
            stroke="#EDEAE0"
            strokeWidth="2.5"
          />
        </g>

        {/* LED, glowing — one-shot power-on animation, skipped under reduced motion */}
        <g transform="translate(220,90)" className="origin-center motion-safe:animate-power-on">
          <polygon points="0,-13 0,13 26,0" fill="#ff3b3b" />
          <line x1="26" y1="-13" x2="26" y2="13" stroke="#ff3b3b" strokeWidth="4" />
          <line x1="33" y1="-20" x2="42" y2="-29" stroke="#ff9d9d" strokeWidth="2" />
          <line x1="42" y1="-15" x2="51" y2="-24" stroke="#ff9d9d" strokeWidth="2" />
        </g>
      </svg>
      <p className="mt-2 font-mono text-sm tracking-tight text-phosphor">9.0V · 0.015A · LED on</p>
    </div>
  );
}
