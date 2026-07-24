/**
 * Case workspace route (server entry). Generates static params for every case
 * slug so the static export includes a page per case, then renders the client
 * workspace that owns session state + interaction.
 */

import { getCaseBySlug, getCaseSlugs } from "@/lib/game/infrastructure/static-case-repository";
import { CaseWorkspace } from "@/components/game/CaseWorkspace";

export function generateStaticParams() {
  return getCaseSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const caseDef = getCaseBySlug(params.slug);
  if (!caseDef) return { title: "Case not found — Atlas" };
  return {
    title: `${caseDef.title} — Incident Lab`,
    description: caseDef.subtitle ?? caseDef.briefing.narrative.slice(0, 160),
  };
}

export default function CasePage({ params }: { params: { slug: string } }) {
  const caseDef = getCaseBySlug(params.slug);
  if (!caseDef) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 text-center">
        <h1 className="mb-2 text-xl font-bold text-ink">Case not found</h1>
        <p className="text-ink-2">No case with slug “{params.slug}”.</p>
      </div>
    );
  }
  return <CaseWorkspace caseDef={caseDef} />;
}
