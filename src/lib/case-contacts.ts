import directory from '../data/case-contact-directory.json';
import {caseStudies} from './case-catalog';

export type CasePublicContact={
  id:string; case_ids:string[]; organization:string; medium:'whatsapp'|'email'|'instagram'|'phone'|'portal';
  value:string; source_url:string; verified_at:string; role:string; note:string;
};
export type CaseContactPack={
  id:string; contacts:CasePublicContact[]; caption:string; publicMessage:string; privateRequest:string;
  posterHref:string; caseUrl:string; subject:string; reviewStatus:string; gap:string;
};
const records=directory.contacts as CasePublicContact[];
/** One official institutional destination can be associated with multiple documented cases. */
export function caseContactPack(id:string):CaseContactPack{
 const entry=caseStudies.find(item=>item.id===id);
 if(!entry)throw new Error('Missing case contact entry: '+id);
 const coverage=directory.case_coverage[id as keyof typeof directory.case_coverage];
 if(!coverage)throw new Error('No contact audit row for '+id);
 const caseUrl='https://casoaberto.pages.dev'+entry.href;
 const status=entry.status.replace(/\s+/g,' ').trim();
 const publicMessage=[
   entry.title,
   'O CasoAberto reúne documentos, fontes e a situação publicada em '+entry.date+'.',
   'Situação registrada: '+status+'.',
   'Que resposta documentada existe? Consulte o dossiê e confira as fontes:',
   caseUrl,
 ].join('\n');
 const caption=[
  entry.title,
  '',
  'O que está documentado? O que ainda precisa ser respondido?',
  'Situação na revisão de '+entry.date+': '+status+'.',
  '',
  'Fontes, cronologia e documentos: '+caseUrl,
  '#CasoAberto #Transparencia',
 ].join('\n');
 const privateRequest=[
  'Assunto: solicitação de esclarecimento — '+entry.title,
  '',
  'Sou [CLIENTE / TITULAR / INTERESSADO] e solicito resposta individual sobre [DESCREVER O FATO PROPRIO].',
  'Data do fato ou contratação: [DATA]. Protocolo prévio: [SE HOUVER].',
  'Peço a identificação do canal responsável, providência verificável e resposta escrita com prazo.',
  'Anexos e dados pessoais serão enviados apenas pelo canal privado apropriado.',
  '',
  'Pesquisa documental de referência: '+caseUrl,
 ].join('\n');
 const contacts=records.filter(c=>(coverage.contact_ids as string[]).includes(c.id));
 return {id,contacts,caption,publicMessage,privateRequest,
   posterHref:'/share/instagram/'+entry.slug+'.png',caseUrl,
   subject:'Solicitação de esclarecimento — '+entry.title,
   reviewStatus:coverage.status,gap:coverage.note};
}
export function caseContactCoverage(){
 return caseStudies.map(entry=>({id:entry.id,count:caseContactPack(entry.id).contacts.length}));
}
