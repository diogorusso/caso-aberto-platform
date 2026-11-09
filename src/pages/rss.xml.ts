import type { APIRoute } from 'astro';
import { cases, updates, siteOrigin, casePath } from '../lib/cases';

export const GET: APIRoute = () => {
  const items = [
    ...updates.map((u) => ({
      title: u.title,
      link: `${siteOrigin}${casePath(cases.find((c) => c.id === u.case_id) || cases[0])}atualizacoes/`,
      pubDate: u.date,
      description: u.summary,
    })),
    ...cases.map((c) => ({
      title: c.titulo,
      link: `${siteOrigin}${casePath(c)}`,
      pubDate: c.data_publicacao,
      description: c.resumo,
    })),
  ].sort((a, b) => b.pubDate.localeCompare(a.pubDate));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
<title>CasoAberto</title>
<link>${siteOrigin}/</link>
<description>Atualizações de dossiês públicos de accountability do consumidor</description>
<language>pt-BR</language>
${items.map((i) => `<item><title><![CDATA[${i.title}]]></title><link>${i.link}</link><guid>${i.link}</guid><pubDate>${new Date(i.pubDate + 'T12:00:00Z').toUTCString()}</pubDate><description><![CDATA[${i.description}]]></description></item>`).join('\n')}
</channel>
</rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
