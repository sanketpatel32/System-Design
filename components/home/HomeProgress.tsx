"use client";

import { useProgress } from "@/lib/progress";
import { ProgressRing } from "@/components/ProgressRing";

export function HomeProgress({ total }: { total: number }) {
  const { state, hydrated } = useProgress();
  const done = hydrated
    ? Object.values(state.status).filter((s) => s === "done").length
    : 0;

  return (
    <div className="flex flex-col items-start justify-center gap-1 rounded-xl border border-rule bg-paper p-5 elev-xs">
      <div className="flex items-baseline gap-2">
        <ProgressRing done={done} total={total} size={64} stroke={6} />
        <div>
          <span className="block text-2xl font-bold tracking-tight text-ink">
            {done}
            <span className="text-ink-3">/{total}</span>
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-ink-3">
            complete
          </span>
        </div>
      </div>
    </div>
  );
}
