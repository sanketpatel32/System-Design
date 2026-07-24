"use client";

/**
 * GameShell — the three-panel workspace layout (spec §5.1).
 *
 * Desktop: Evidence Locker (24%) | Architecture Map (50%) | Ops Console (26%).
 * Tablet:  Map takes the main area; Evidence + Ops switch via tabs.
 * Mobile:  A stepper — only one panel visible at a time.
 *
 * The shell is phase-aware: during BRIEFING it defers to the BriefingPanel,
 * during DEBRIEF to the DebriefPanel. The middle phases use the workspace.
 *
 * Panel contents are passed as render props so this file owns only layout +
 * responsive behavior, never business logic (spec §15.1).
 */

import { useState } from "react";
import { Archive, Network, Activity } from "lucide-react";

type PanelId = "evidence" | "map" | "ops";

interface Props {
  renderEvidence: () => React.ReactNode;
  renderMap: () => React.ReactNode;
  renderOps: () => React.ReactNode;
}

export function GameShell({
  renderEvidence,
  renderMap,
  renderOps,
}: Props) {
  const [mobilePanel, setMobilePanel] = useState<PanelId>("map");
  const [tabletTab, setTabletTab] = useState<"evidence" | "ops">("evidence");

  return (
    <div className="mx-auto max-w-[1400px] px-3 sm:px-6">
      {/* --- Desktop: three-column grid --- */}
      <div className="hidden gap-3 py-4 lg:grid lg:grid-cols-[24fr_50fr_26fr]">
        <PanelCard title="Evidence Locker" icon={<Archive size={14} aria-hidden />}>
          {renderEvidence()}
        </PanelCard>
        <PanelCard title="Architecture Map" icon={<Network size={14} aria-hidden />}>
          {renderMap()}
        </PanelCard>
        <PanelCard title="Ops Console" icon={<Activity size={14} aria-hidden />}>
          {renderOps()}
        </PanelCard>
      </div>

      {/* --- Tablet: map main + tabbed side drawer --- */}
      <div className="hidden gap-3 py-4 md:grid md:grid-cols-[1fr_360px] lg:hidden">
        <PanelCard title="Architecture Map" icon={<Network size={14} aria-hidden />}>
          {renderMap()}
        </PanelCard>
        <div>
          <div className="mb-2 flex gap-1 rounded-lg bg-paper-3 p-1">
            <TabButton
              active={tabletTab === "evidence"}
              onClick={() => setTabletTab("evidence")}
            >
              Evidence
            </TabButton>
            <TabButton
              active={tabletTab === "ops"}
              onClick={() => setTabletTab("ops")}
            >
              Ops
            </TabButton>
          </div>
          {tabletTab === "evidence" ? renderEvidence() : renderOps()}
        </div>
      </div>

      {/* --- Mobile: stepper (one panel at a time) --- */}
      <div className="py-4 md:hidden">
        <div className="mb-3 grid grid-cols-3 gap-1 rounded-lg bg-paper-3 p-1">
          <TabButton active={mobilePanel === "evidence"} onClick={() => setMobilePanel("evidence")}>
            Evidence
          </TabButton>
          <TabButton active={mobilePanel === "map"} onClick={() => setMobilePanel("map")}>
            Map
          </TabButton>
          <TabButton active={mobilePanel === "ops"} onClick={() => setMobilePanel("ops")}>
            Ops
          </TabButton>
        </div>
        {mobilePanel === "evidence" && renderEvidence()}
        {mobilePanel === "map" && renderMap()}
        {mobilePanel === "ops" && renderOps()}
      </div>
    </div>
  );
}

function PanelCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex max-h-[calc(100dvh-9rem)] flex-col overflow-hidden rounded-xl border border-rule bg-paper-2/40 elev-sm">
      <header className="flex items-center gap-1.5 border-b border-rule bg-paper-3/40 px-3 py-2">
        <span className="text-ink-3" aria-hidden>{icon}</span>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-ink-2">
          {title}
        </h2>
      </header>
      <div className="flex-1 overflow-y-auto p-3">{children}</div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors data-[on=true]:bg-paper data-[on=true]:text-ink data-[on=true]:elev-xs text-ink-2"
      data-on={active}
    >
      {children}
    </button>
  );
}
