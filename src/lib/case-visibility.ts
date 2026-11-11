/**
 * Catalog-aware helpers around the pure visibility model.
 */
import type { CaseResearchEntry } from './case-catalog';
import { caseStudies, personalStories } from './case-catalog';
import { copy } from './copy';
import {
  formatVisibilityCount,
  visibilityFromInput,
  type VisibilityInput,
  type VisibilitySnapshot as ModelSnapshot,
} from './case-visibility-model';

export type { VisibilityInput } from './case-visibility-model';
export {
  dailyVisibilityTarget,
  formatVisibilityCount,
  saoPauloParts,
  visibilityDayProgress,
  visibilityFromInput,
} from './case-visibility-model';

export type VisibilitySnapshot = ModelSnapshot & {
  label: string;
  metricLabel: string;
};

export function visibilityInputFromEntry(
  entry: Pick<CaseResearchEntry, 'id' | 'kind' | 'featured' | 'categorySlug' | 'sourceCount' | 'storyCount' | 'date'>,
): VisibilityInput {
  return {
    id: entry.id,
    kind: entry.kind,
    featured: entry.featured,
    categorySlug: entry.categorySlug,
    sourceCount: entry.sourceCount,
    storyCount: entry.storyCount,
    date: entry.date,
  };
}

const byId = new Map<string, VisibilityInput>(
  [...caseStudies, ...personalStories].map((entry) => [entry.id, visibilityInputFromEntry(entry)]),
);

export function visibilityForCase(caseId: string, at: Date = new Date()): VisibilitySnapshot | null {
  const input = byId.get(caseId);
  if (!input) return null;
  const snap = visibilityFromInput(input, at);
  return {
    ...snap,
    label: copy.visibility.label,
    metricLabel: copy.visibility.metricLabel,
  };
}

export function visibilitySnapshotForInput(input: VisibilityInput, at: Date = new Date()): VisibilitySnapshot {
  const snap = visibilityFromInput(input, at);
  return {
    ...snap,
    label: copy.visibility.label,
    metricLabel: copy.visibility.metricLabel,
  };
}

export function formatTodayLabel(today: number): string {
  return `${formatVisibilityCount(today)} ${copy.visibility.metricLabel}`;
}
