import type { TopicStatus } from "@/lib/progress";

const MAP: Record<TopicStatus | "none", { label: string; cls: string }> = {
  none: {
    label: "New",
    cls: "text-ink-3 bg-paper-3",
  },
  new: {
    label: "New",
    cls: "text-ink-3 bg-paper-3",
  },
  doing: {
    label: "In progress",
    cls: "text-warn bg-warn/10",
  },
  done: {
    label: "Done",
    cls: "text-ok bg-ok/10",
  },
};

export function StatusBadge({ status }: { status: TopicStatus | "none" }) {
  const s = MAP[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${s.cls}`}
    >
      {s.label}
    </span>
  );
}
