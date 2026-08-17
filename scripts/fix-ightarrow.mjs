/** Fix remaining eaten-escape fragments: bare "ightarrow" -> "→", \quad/\implies. */
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const files = [
  "240_design_ride_matching_system.md",
  "270_design_cassandra.md",
  "271_design_bigtable.md",
  "290_design_vending_machine.md",
  "291_design_atm.md",
  "294_design_movie_ticket_booking_system.md",
  "299_design_lru_cache.md",
];

for (const f of files) {
  const p = fileURLToPath(new URL(`../topics/${f}`, import.meta.url));
  const s = fs.readFileSync(p, "utf8");
  const n = s.split("ightarrow").length - 1;
  fs.writeFileSync(p, s.split("ightarrow").join("→"), "utf8");
  console.log(`${f}: ${n} replaced`);
}

const p9 = fileURLToPath(new URL("../topics/009_throughput.md", import.meta.url));
let s9 = fs.readFileSync(p9, "utf8");
s9 = s9.replace(
  "N = L × W \\quad \\implies \\quad Throughput (L) = (Concurrency (N)) / (Latency (W))",
  "N = L × W ⇒ Throughput (L) = (Concurrency (N)) / (Latency (W))",
);
fs.writeFileSync(p9, s9, "utf8");
console.log("009_throughput.md: quad/implies fixed:", !s9.includes("\\quad"));
