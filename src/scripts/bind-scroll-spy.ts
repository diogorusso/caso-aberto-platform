import { getActiveSectionId, smoothScrollToId, NAV_SCROLL_OFFSET, SECTION_RAIL_OFFSET } from '../lib/scrollSpy';

type SpyKind = 'rail' | 'toc';

function parseIds(root: HTMLElement): string[] {
  const raw = root.getAttribute('data-section-ids') || '';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function setActive(root: HTMLElement, activeId: string | null) {
  root.querySelectorAll<HTMLAnchorElement>('[data-spy-link]').forEach((link) => {
    const id = link.getAttribute('data-spy-link');
    const on = Boolean(activeId && id === activeId);
    link.classList.toggle('is-active', on);
    if (on) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });

  const indicator = root.querySelector<HTMLElement>('[data-spy-indicator]');
  if (!indicator || !activeId) return;
  const link = root.querySelector<HTMLAnchorElement>(`[data-spy-link="${CSS.escape(activeId)}"]`);
  const list = root.querySelector<HTMLElement>('[data-spy-list]');
  if (!link || !list) return;

  list.scrollTo({
    left: link.offsetLeft - list.offsetWidth / 2 + link.offsetWidth / 2,
    behavior: 'auto',
  });

  requestAnimationFrame(() => {
    const navLeft = root.getBoundingClientRect().left;
    const linkRect = link.getBoundingClientRect();
    indicator.style.transform = `translateX(${linkRect.left - navLeft}px)`;
    indicator.style.width = `${linkRect.width}px`;
  });
}

function bind(root: HTMLElement) {
  if (root.dataset.spyBound === '1') return;
  root.dataset.spyBound = '1';

  const ids = parseIds(root);
  if (ids.length < 2) return;

  const kind = (root.getAttribute('data-spy') || 'toc') as SpyKind;
  const offset = kind === 'rail' ? SECTION_RAIL_OFFSET : 0;

  const update = () => setActive(root, getActiveSectionId(ids, offset));
  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);

  root.querySelectorAll<HTMLAnchorElement>('[data-spy-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('data-spy-link');
      if (!id) return;
      event.preventDefault();
      history.replaceState(null, '', `#${id}`);
      smoothScrollToId(id);
      setActive(root, id);
    });
  });

  // Mark scroll targets so sticky rails don't cover headings.
  const margin = `${NAV_SCROLL_OFFSET + (kind === 'rail' ? SECTION_RAIL_OFFSET : 24)}px`;
  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.scrollMarginTop = margin;
  });
}

export function bindAllScrollSpies(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-spy]').forEach(bind);
}

bindAllScrollSpies();
document.addEventListener('astro:page-load', () => bindAllScrollSpies());
