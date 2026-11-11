/** Platform-level navigation: no single brand or political cause controls global messaging. */

export type NavLink = {
  label: string;
  href: string;
  description?: string;
};

export type NavItem = NavLink & {
  children?: NavLink[];
};

/**
 * Primary chrome: five destinations.
 * Secondary research, education and observatory routes live under hubs — not as flat top-level links.
 * Existing SEO URLs stay unchanged; only the discovery path changes.
 */
export const primaryNav: NavItem[] = [
  {
    label: 'Casos',
    href: '/casos/',
    description: 'Arquivo pesquisável de investigações documentadas.',
    children: [
      { label: 'Todos os casos', href: '/casos/', description: 'Busque por empresa, cidade, problema e categoria.' },
      { label: 'Histórias', href: '/historias/', description: 'Relatos públicos com fonte e data.' },
      { label: 'Empresas', href: '/empresas/', description: 'Perfis, CNPJ e avaliações editoriais.' },
      { label: 'Precedentes', href: '/precedentes/', description: 'Falências, recuperações e cronologias.' },
    ],
  },
  {
    label: 'Artigos',
    href: '/artigos/',
    description: 'Guias, insights e leituras para agir com método.',
    children: [
      { label: 'Todos os artigos', href: '/artigos/', description: 'Hub de leitura: consumo, autonomia e formação.' },
      { label: 'Guias ao consumidor', href: '/guias/casos-de-consumo/', description: 'Roteiros com fontes para documentar e cobrar.' },
      { label: 'Autonomia digital', href: '/autonomia-digital/guias/', description: 'Perguntas práticas sobre privacidade, IA e direitos.' },
      { label: 'Academia', href: '/academia/', description: 'Programas educativos em produção.' },
      { label: 'Escola aberta', href: '/autonomia-digital/', description: 'Trilhas, diagnóstico e ferramentas gratuitas.' },
    ],
  },
  {
    label: 'Organizar',
    href: '/organizar/',
    description: 'Do registro individual à cobrança pública verificável.',
  },
  {
    label: 'Instituto',
    href: '/instituto/',
    description: 'Método, dados e observatórios com fontes.',
    children: [
      { label: 'Instituto', href: '/instituto/', description: 'Pesquisa aplicada e infraestrutura pública.' },
      { label: 'Dados abertos', href: '/instituto/dados/', description: 'CSV e JSON revisáveis.' },
      { label: 'Órgãos oficiais', href: '/orgaos-oficiais/', description: 'Procon, Justiça, petições e consultas públicas.' },
      { label: 'Plataformas', href: '/observatorio/plataformas/', description: 'Moderação, IA e transparência documentadas.' },
      { label: 'Política e poder', href: '/observatorio/politica/', description: 'Dossiês institucionais com fontes e datas.' },
      { label: 'Metodologia', href: '/metodologia/', description: 'Critérios, denominadores e limites.' },
    ],
  },
  {
    label: 'Sobre',
    href: '/sobre/',
    description: 'Missão, critérios e direito de resposta.',
  },
];

export function pathMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href);
}

/** Prefer the longest matching child href so nested routes highlight once. */
export function bestMatchingHref(pathname: string, links: NavLink[]): string | undefined {
  return links
    .filter((link) => pathMatches(pathname, link.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

export function navItemIsActive(item: NavItem, pathname: string): boolean {
  if (pathMatches(pathname, item.href)) return true;
  return Boolean(item.children?.some((child) => child.href !== item.href && pathMatches(pathname, child.href)));
}

export function flattenNavLinks(items: NavItem[] = primaryNav): NavLink[] {
  return items.flatMap((item) => [item, ...(item.children ?? [])]);
}
