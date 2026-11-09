import { useEffect, useState } from 'react';
import { getActiveSectionId, NAV_SCROLL_OFFSET, SECTION_RAIL_OFFSET } from '@/lib/scrollSpy';

export function useSectionScrollSpy(sectionIds: string[], extraOffset = 0) {
  const [activeId, setActiveId] = useState<string | null>(sectionIds[0] ?? null);

  useEffect(() => {
    if (sectionIds.length < 2) return;
    const update = () => setActiveId(getActiveSectionId(sectionIds, extraOffset));
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sectionIds.join(','), extraOffset]);

  useEffect(() => {
    const margin = `${NAV_SCROLL_OFFSET + extraOffset + 24}px`;
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.style.scrollMarginTop = margin;
    });
  }, [sectionIds.join(','), extraOffset]);

  return activeId;
}

export { SECTION_RAIL_OFFSET };
