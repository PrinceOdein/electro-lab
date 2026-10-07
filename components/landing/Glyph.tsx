type GlyphType = "battery" | "resistor" | "switch";

export function Glyph({ type }: { type: GlyphType }) {
  return (
    <svg viewBox="0 0 40 24" className="h-6 w-10" aria-hidden>
      {type === "battery" && (
        <>
          <line x1="8" y1="2" x2="8" y2="22" stroke="#B9793C" strokeWidth="3" />
          <line x1="18" y1="6" x2="18" y2="18" stroke="#8E9A91" strokeWidth="3" />
          <line x1="0" y1="12" x2="8" y2="12" stroke="#8E9A91" strokeWidth="2" />
          <line x1="18" y1="12" x2="26" y2="12" stroke="#8E9A91" strokeWidth="2" />
        </>
      )}
      {type === "resistor" && (
        <polyline
          points="0,12 6,3 12,21 18,3 24,21 30,3 34,12 40,12"
          fill="none"
          stroke="#B9793C"
          strokeWidth="2"
        />
      )}
      {type === "switch" && (
        <>
          <circle cx="6" cy="12" r="2.5" fill="#8E9A91" />
          <circle cx="34" cy="12" r="2.5" fill="#8E9A91" />
          <line x1="6" y1="12" x2="28" y2="4" stroke="#B9793C" strokeWidth="2" />
        </>
      )}
    </svg>
  );
}
