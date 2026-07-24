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

import { useCallback, useEffect, useRef, useState } from "react";
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

  // Refs for keyboard-focus shortcuts (spec §16): E/A/O focus each panel.
  const evidenceRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const opsRef = useRef<HTMLDivElement>(null);

  const focusPanel = useCallback(
    (id: PanelId) => {
      const el =
        id === "evidence"
          ? evidenceRef.current
          : id === "map"
          ? mapRef.current
          : opsRef.current;
      el?.focus();
      // On mobile/tablet, also switch the visible panel.
      setMobilePanel(id);
      if (id === "evidence" || id === "ops") {
        setTabletTab(id === "evidence" ? "evidence" : "ops");
      }
    },
    []
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't hijack typing into form fields.
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      )
        return;
      const k = e.key.toLowerCase();
      if (k === "e") {
        e.preventDefault();
        focusPanel("evidence");
      } else if (k === "a") {
        e.preventDefault();
        focusPanel("map");
      } else if (k === "o") {
        e.preventDefault();
        focusPanel("ops");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusPanel]);

  return (
    <div className="mx-auto max-w-[1400px] px-3 sm:px-6">
      {/* --- Desktop: three-column grid --- */}
      <div className="hidden gap-3 py-4 lg:grid lg:grid-cols-[24fr_50fr_26fr]">
        <PanelCard title="Evidence Locker" icon={<Archive size={14} aria-hidden />} panelRef={evidenceRef}>
          {renderEvidence()}
        </PanelCard>
        <PanelCard title="Architecture Map" icon={<Network size={14} aria-hidden />} panelRef={mapRef}>
          {renderMap()}
        </PanelCard>
        <PanelCard title="Ops Console" icon={<Activity size={14} aria-hidden />} panelRef={opsRef}>
          {renderOps()}
        </PanelCard>
      </div>

      {/* --- Tablet: map main + tabbed side drawer --- */}
      <div className="hidden gap-3 py-4 md:grid md:grid-cols-[1fr_360px] lg:hidden">
        <PanelCard title="Architecture Map" icon={<Network size={14} aria-hidden />} panelRef={mapRef}>
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

      {/* Keyboard shortcut hint (desktop only) */}
      <div className="hidden border-t border-rule/60 py-2 text-center text-[10px] text-ink-3 lg:block">
        Shortcuts:{" "}
        <kbd className="rounded border border-rule bg-paper-2 px-1 font-mono">E</kbd> evidence ·{" "}
        <kbd className="rounded border border-rule bg-paper-2 px-1 font-mono">A</kbd> map ·{" "}
        <kbd className="rounded border border-rule bg-paper-2 px-1 font-mono">O</kbd> ops
      </div>
    </div>
  );
}

function PanelCard({
  title,
  icon,
  children,
  panelRef,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  panelRef?: React.RefObject<HTMLDivElement>;
}) {
  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      className="flex max-h-[calc(100dvh-9rem)] flex-col overflow-hidden rounded-xl border border-rule bg-paper-2/40 elev-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
    >
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
