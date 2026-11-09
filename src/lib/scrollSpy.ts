/** Fixed site header height — keep in sync with `.site-header` / `.navline`. */
export const NAV_SCROLL_OFFSET = 79;

/** Sticky section rail height allowance for scroll-margin pairing. */
export const SECTION_RAIL_OFFSET = 48;

function sectionTop(el: HTMLElement) {
  return el.getBoundingClientRect().top + window.scrollY;
}

export function getActiveSectionId(sectionIds: string[], extraOffset = 0): string | null {
  if (!sectionIds.length || typeof window === 'undefined') return null;
  const scrollPos = window.scrollY + NAV_SCROLL_OFFSET + extraOffset + 1;
  let active = sectionIds[0];
  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el && sectionTop(el) <= scrollPos) active = id;
  }
  return active;
}

export function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
}
