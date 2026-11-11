/** Resolve sourced case visuals without inventing logos or incident photos.
 * Real store/logo files live under /media/ via company-media + case-visual-assets.
 * Every catalogued case also has a generated OG cover under /og/ for list/hero identity.
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

/** Prefer verified store/brand photo, else editorial OG cover. Never treats OG as an incident photo. */
export function primaryImageForCase(caseId: string): {src: string; kind: 'photo' | 'cover'; source?: string | null; credit?: string | null} | null {
  const asset = byId.get(caseId);
  if (asset?.photo) {
    return {src: asset.photo, kind: 'photo', source: asset.photo_source, credit: asset.credit};
  }
  const cover = coverForCaseId(caseId);
  return cover ? {src: cover, kind: 'cover', credit: 'Arte editorial CasoAberto · tipografia e dados do dossiê'} : null;
}

export function logoForCase(caseId: string): {src: string; source?: string | null} | null {
  const asset = byId.get(caseId);
  return asset?.logo ? {src: asset.logo, source: asset.logo_source} : null;
}
