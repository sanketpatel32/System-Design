interface ProgressRingProps {
  done: number;
  total: number;
  size?: number;
  stroke?: number;
  label?: string;
}

export function ProgressRing({
  done,
  total,
  size = 120,
  stroke = 8,
  label = "complete",
}: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? done / total : 0;
  const offset = c * (1 - pct);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--paper-3-rgb))"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgb(var(--accent-rgb))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset var(--dur-slow) var(--ease-out)",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold tracking-tight text-ink">
          {Math.round(pct * 100)}%
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-3">
          {label}
        </span>
      </div>
    </div>
  );
}
