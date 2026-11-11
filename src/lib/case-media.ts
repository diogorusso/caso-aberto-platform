/** Resolve sourced case visuals without inventing logos or incident photos.
 * Real exclusive photos live under /media/ via case-visual-assets — required for every
 * on-page card, hero and catalog tile. Generated /og/ PNGs are share/meta only.
 */
import media from '../data/company-media.json';
import visualAssets from '../data/case-visual-assets.json';
import {caseStudies, personalStories} from './case-catalog';

export type CaseVisualAsset = {
  case_id: string;
  company: string;
  cover?: string | null;
  photo?: string | null;
  logo?: string | null;
  photo_source?: string | null;
  logo_source?: string | null;
  credit?: string | null;
  is_incident_photo?: boolean;
};

const byId = new Map((visualAssets.assets as CaseVisualAsset[]).map((item) => [item.case_id, item]));

export function visualAssetForCase(caseId: string): CaseVisualAsset | undefined {
  return byId.get(caseId);
}

export function coverPathForSlug(slug: string, kind: 'caso' | 'historia' = 'caso'): string {
  return kind === 'historia' ? `/og/historias/${slug}.png` : `/og/casos/${slug}.png`;
}

export function coverForCaseId(caseId: string): string | null {
  const asset = byId.get(caseId);
  if (asset?.cover) return asset.cover;
  const entry = caseStudies.find((item) => item.id === caseId) || personalStories.find((item) => item.id === caseId);
  return entry ? coverPathForSlug(entry.slug, entry.kind) : null;
}

export function brandMediaForSlug(brandSlug: string) {
  return (media.brands as Record<string, any>)[brandSlug];
}

/** On-page visual: exclusive /media/ photo only. OG covers are never primary UI imagery. */
export function primaryImageForCase(caseId: string): {src: string; kind: 'photo' | 'cover'; source?: string | null; credit?: string | null} | null {
  const asset = byId.get(caseId);
  if (asset?.photo) {
    return {src: asset.photo, kind: 'photo', source: asset.photo_source, credit: asset.credit};
  }
  return null;
}

export function logoForCase(caseId: string): {src: string; source?: string | null} | null {
  const asset = byId.get(caseId);
  return asset?.logo ? {src: asset.logo, source: asset.logo_source} : null;
}
