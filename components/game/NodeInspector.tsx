"use client";

/**
 * NodeInspector — shows a revealed node's config + capacity + cost (spec §5.5).
 *
 * Renders the component's typed config fields in a readable form so the player
 * understands what they're modifying before applying an action.
 */

import { X } from "lucide-react";
import type { ArchitectureNode } from "@/lib/game/domain/types";

interface Props {
  node: ArchitectureNode;
  onClose: () => void;
}

export function NodeInspector({ node, onClose }: Props) {
  return (
    <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink">{node.label}</h3>
          <p className="text-xs font-mono text-ink-3">{node.type}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close inspector"
          className="rounded p-0.5 text-ink-3 hover:bg-paper-3 hover:text-ink"
        >
          <X size={14} />
        </button>
      </div>

      {node.description && (
        <p className="mt-2 text-xs text-ink-2">{node.description}</p>
      )}

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {renderConfigFields(node).map((f) => (
          <div key={f.label}>
            <dt className="text-ink-3">{f.label}</dt>
            <dd className="font-mono font-semibold text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function renderConfigFields(node: ArchitectureNode): { label: string; value: string }[] {
  const c = node.config;
  switch (c.kind) {
    case "client":
      return [
        { label: "manual retry", value: `${Math.round(c.manualRetryProbability * 100)}%` },
        { label: "stable id", value: c.generatesStableCheckoutId ? "yes" : "no" },
      ];
    case "api-gateway":
      return [
        { label: "timeout", value: `${c.timeoutMs}ms` },
        { label: "retries", value: String(c.retryCount) },
        { label: "retry methods", value: c.retryMethods.join(", ") },
        { label: "idem. required", value: c.requireIdempotencyKeyForUnsafeRetries ? "yes" : "no" },
      ];
    case "service":
      return [
        { label: "replicas", value: String(c.replicas) },
        { label: "capacity/rep", value: `${c.baseCapacityRpsPerReplica}/s` },
        { label: "idempotent", value: c.supportsIdempotency ? "yes" : "no" },
        { label: "key source", value: c.idempotencyKeySource ?? "none" },
      ];
    case "database":
      return [
        { label: "engine", value: c.engineLabel },
        { label: "write cap", value: `${c.writeCapacityRps}/s` },
        { label: "constraints", value: String(c.uniqueConstraints.filter((u) => u.enabled).length) },
        { label: "replicas", value: String(c.replicas) },
      ];
    case "queue":
      return [
        { label: "delivery", value: c.deliverySemantics },
        { label: "redelivery", value: `${Math.round(c.redeliveryProbability * 100)}%` },
      ];
    case "worker":
      return [
        { label: "dedup", value: c.deduplicationStrategy },
        { label: "dedup key", value: c.deduplicationKey ?? "—" },
      ];
    case "external-api":
      return [
        { label: "completes late", value: c.completesAfterTimeout ? "yes" : "no" },
        { label: "normal lat", value: `${c.normalLatencyRangeMs[0]}–${c.normalLatencyRangeMs[1]}ms` },
        { label: "peak lat", value: `${c.peakLatencyRangeMs[0]}–${c.peakLatencyRangeMs[1]}ms` },
      ];
    case "cache":
      return [{ label: "capacity", value: `${c.capacityRps}/s` }];
    case "idempotency-store":
      return [{ label: "ttl", value: `${c.ttlSeconds}s` }];
    case "load-balancer":
      return [{ label: "strategy", value: c.strategy }];
    case "generic":
      return [];
  }
}
