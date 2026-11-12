/**
 * Ready-to-send WhatsApp / share copy in CasoAberto confrontational voice (§3a).
 * URL always ends alone on its last line so WhatsApp can attach the OG preview.
 */
import roma from '../data/roma.json';
import { cases, casePath, siteOrigin } from './cases';
import { caseStudies, personalStories } from './case-catalog';

export type ShareKind = 'case' | 'story' | 'platform' | 'archive';

export type SharePayload = {
  kind: ShareKind;
  title: string;
  message: string;
  url: string;
  whatsappHref: string;
  caseId?: string;
};

export function absoluteShareUrl(pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl, siteOrigin).href;
  } catch {
    return pathOrUrl.startsWith('http') ? pathOrUrl : `${siteOrigin}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
  }
}

export function whatsappHref(message: string): string {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

function withOgUrl(lines: string[], url: string): string {
  const body = lines.map((line) => line.trim()).filter(Boolean);
  return [...body, 'Saiba mais em', url].join('\n');
}

/** Authorized Florense / Roma campaign register (legal skill §3a). */
function florenseCampaignMessage(url: string): string {
  return withOgUrl(
    [
      roma.campaign_line,
      'A Florense não entregou o meu.',
      'Será que está falindo como ocorreu há dois anos com a Roma Imobili?',
      'Melhor não correr o risco. Busque outro fornecedor.',
    ],
    url,
  );
}

function isCivicId(caseId?: string): boolean {
  return Boolean(caseId && /^(POL-|PLAT-)/.test(caseId));
}

function genericCaseMessage(input: {
  title: string;
  company?: string;
  summary?: string;
  url: string;
  caseId?: string;
}): string {
  const company = (input.company || '').trim();
  const summary = (input.summary || '').replace(/\s+/g, ' ').trim().slice(0, 200);
  const civic = isCivicId(input.caseId);
  const question = input.title.includes('?')
    ? input.title.trim()
    : civic
      ? `Quem responde por isso? ${company || 'Abra o dossiê.'}`
      : company
        ? `Antes de pagar: você conferiu o que aconteceu com ${company}?`
        : 'Antes de pagar: você conferiu este caso?';
  const fact = summary
    ? summary
    : company
      ? `${company}: fatos, fontes e perguntas sem resposta estão publicados.`
      : 'Fatos, fontes e perguntas sem resposta estão publicados.';

  if (civic) {
    return withOgUrl(
      [
        question,
        fact,
        'Documentos, datas e perguntas públicas estão no dossiê.',
        'Espalhe. Cobrança sem fonte vira boato.',
      ],
      input.url,
    );
  }

  return withOgUrl(
    [
      question,
      fact,
      'Antes de assinar ou continuar pagando, veja as fontes.',
      'Melhor não correr o risco. Busque outro fornecedor.',
    ],
    input.url,
  );
}

export function platformSharePayload(): SharePayload {
  const url = absoluteShareUrl('/');
  const message = withOgUrl(
    [
      'Antes de pagar, descubra quem responde.',
      'O CasoAberto publica dossiês com fontes, CNPJ, cronologia e o que a empresa ainda não esclareceu.',
      'Espalhe. Cada pessoa avisada é um consumidor a menos no escuro.',
    ],
    url,
  );
  return {
    kind: 'platform',
    title: 'CasoAberto',
    message,
    url,
    whatsappHref: whatsappHref(message),
  };
}

export function archiveSharePayload(): SharePayload {
  const url = absoluteShareUrl('/casos/');
  const message = withOgUrl(
    [
      'Pagou. Não recebeu. Cadê a resposta?',
      'Pesquise todos os casos documentados do CasoAberto: empresas, instituições, fontes e cronologia.',
      'Antes de assinar, abra o dossiê.',
    ],
    url,
  );
  return {
    kind: 'archive',
    title: 'Arquivo de casos · CasoAberto',
    message,
    url,
    whatsappHref: whatsappHref(message),
  };
}

export function buildSharePayload(input: {
  title: string;
  href: string;
  summary?: string;
  company?: string;
  caseId?: string;
  kind?: ShareKind;
}): SharePayload {
  const url = absoluteShareUrl(input.href);
  const caseId = input.caseId;
  const message =
    caseId === 'CA-001'
      ? florenseCampaignMessage(url)
      : genericCaseMessage({
          title: input.title,
          company: input.company,
          summary: input.summary,
          url,
          caseId,
        });

  return {
    kind: input.kind || 'case',
    title: input.title,
    message,
    url,
    whatsappHref: whatsappHref(message),
    caseId,
  };
}

/** Resolve a catalog / first-party case into a ready WhatsApp payload. */
export function sharePayloadForCaseId(caseId: string): SharePayload | null {
  const firstParty = cases.find((item) => item.id === caseId);
  if (firstParty) {
    return buildSharePayload({
      caseId,
      title: firstParty.chamada || firstParty.titulo,
      href: casePath(firstParty),
      summary: firstParty.resumo,
      company: firstParty.empresa_resumo,
      kind: 'case',
    });
  }

  const study = caseStudies.find((item) => item.id === caseId);
  if (study) {
    return buildSharePayload({
      caseId,
      title: study.title,
      href: study.href,
      summary: study.summary,
      company: study.company,
      kind: 'case',
    });
  }

  const story = personalStories.find((item) => item.id === caseId);
  if (story) {
    return buildSharePayload({
      caseId,
      title: story.title,
      href: story.href,
      summary: story.summary,
      company: story.company,
      kind: 'story',
    });
  }

  return null;
}
