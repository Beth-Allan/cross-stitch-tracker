const CIRCUMFERENCE = 2 * Math.PI * 6; // 37.699...

/**
 * 16x16 SVG donut ring showing the have/need ratio for a supply row.
 *
 * Three visual states:
 * - Empty (have=0): background ring only
 * - Partial (0 < have < need): background + warning-colored arc
 * - Complete (have >= need): background + primary-colored full ring
 *
 * Server-compatible: no "use client" needed (pure SVG, no hooks).
 */
export function StatusDonut({ have, need }: { have: number; need: number }) {
  const ratio = need > 0 ? Math.min(have / need, 1) : 0;
  const isComplete = have >= need && need > 0;
  const isEmpty = have === 0;

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="false" className="shrink-0">
      <title>{`${have} of ${need}`}</title>
      <circle cx="8" cy="8" r="6" fill="none" className="stroke-muted" strokeWidth="2" />
      {!isEmpty && (
        <circle
          cx="8"
          cy="8"
          r="6"
          fill="none"
          className={isComplete ? "stroke-primary" : "stroke-warning"}
          strokeWidth="2"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={isComplete ? 0 : CIRCUMFERENCE * (1 - ratio)}
          transform="rotate(-90 8 8)"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
