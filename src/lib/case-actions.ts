import records from '../data/case-action-channels.json';
import {caseStudies} from './case-catalog';
import {cases} from './cases';
export type CaseActionChannel={id:string;title:string;url:string;purpose:string;source_url:string;step:string;kind:string;note:string;stage:string};
export type CaseMessageTemplate={id:string;label:string;audience:string;description:string;body:string;channelIds:string[]};
export type CaseActionPlan={id:string;title:string;company:string;summary:string;href:string;region:string;isCivic:boolean;channels:CaseActionChannel[];templates:CaseMessageTemplate[];judicialNote:string};
type Channel=Omit<CaseActionChannel,'id'|'stage'>;
const channels:Record<string,Channel>=records.channels;
const related:Record<string,string[]>=records.related;
const regions:Record<string,string>=records.regional;
const issues:Record<string,string>=records.issues;
const paths:Record<string,string[]>=records.official_paths;
const stage=(s:string)=>s==='empresa'?'01 · Empresa':s==='ouvidoria'?'02 · Ouvidoria':s==='procon'||s==='reclamacao'?'03 · Reclamação':s==='regulador'?'04 · Regulador':s==='judicial'?'05 · Justiça':s==='compliance'?'Integridade / compliance':'Informação pública';
const tmpl=(id:string,label:string,audience:string,description:string,body:string,channelIds:string[]):CaseMessageTemplate=>({id,label,audience,description,body,channelIds});
const line=(parts:string[])=>parts.join('\n');
export function caseActionPlan(id:string):CaseActionPlan{
 const entry=caseStudies.find(item=>item.id===id);
 if(!entry)throw new Error('Case without action plan: '+id);
 const own=cases.find(item=>item.id===id);
 const isLegal=id==='EXT-016';
 const isCivic=id.startsWith('POL-')||id==='PLAT-2026-CASE'||isLegal;
 const region=regions[id]||'BR';
 const ids=isLegal?['tjrj-consulta-processual']:isCivic?['falabr']:[...(related[id]||[]),...(paths[region]||[]).filter(x=>!x.startsWith('jec-')&&!x.startsWith('def-')),...(paths.BR||[]),...(paths[region]||[]).filter(x=>x.startsWith('jec-')||x.startsWith('def-'))];
 const active=[...new Set(ids)].map(key=>({...channels[key],id:key,stage:stage(channels[key]?.step||'')})).filter(x=>x.url?.startsWith('https://')&&x.source_url?.startsWith('https://'));
 const subject=issues[id]||entry.title;
 const company=entry.company;
 const url='https://casoaberto.pages.dev'+entry.href;
 const fields=['Empresa/fornecedor: '+company,'Assunto: '+subject,'Data da contratação/ocorrência: [DATA]','Número do pedido/contrato: [INFORMAR EM CANAL PRIVADO]','Valor comprovado: [SE APLICÁVEL]'];
 const intro=['Em [DATA], contratei/utilizei [PRODUTO OU SERVIÇO], nas condições [OFERTA, PREÇO E PRAZO].','O problema que posso documentar foi: [FATO, DATA E PROVA].','Já tentei solucionar em [DATA] pelo canal [PROTOCOLO] e recebi [RESPOSTA OU AUSÊNCIA].'];
 const ask=['Peço que a empresa identifique o responsável e o protocolo desta demanda.','Solicito explicação específica, providência concreta e prazo de cumprimento documentado.','A solução que solicito para o meu contrato é: [ENTREGA / RESTITUIÇÃO / CORREÇÃO / ESCLARECIMENTO].','Anexos apresentados pelo canal de atendimento: [LISTA DE COMPROVANTES].'];
 const support=line([...fields,'',...intro,'',...ask]);
 const publicComplaint=line(['Empresa: '+company,'Produto ou serviço: [INFORMAR]','Oferta e prazo: [DATA E CONDIÇÕES]','Pagamento comprovado: [VALOR, SE FOR SEU CASO]','','O que ocorreu comigo: [RELATE APENAS SUA EXPERIÊNCIA E AS DATAS].','O que a empresa respondeu: [RESPOSTA COM DATA E PROTOCOLO].','O que exijo: [SOLUÇÃO CONCRETA COM PRAZO].','','Documentos: [LISTAR SEM DIVULGAR NÚMERO DE DOCUMENTOS PESSOAIS].','Solicito resposta verificável ao caso individual.']);
 const escalation=line(['À ouvidoria / ao atendimento de segunda instância de '+company,'','Protocolo inicial: [PROTOCOLO E DATA]','O problema permanece: [FATO NÃO RESOLVIDO].','Resposta do SAC: [RESPOSTA COMPROVADA].','Solicito reavaliação formal, identificação do responsável, prazo e confirmação do resultado.','Documentos correspondentes: [LISTA].']);
 const formal=line(['À pessoa jurídica contratante: [RAZÃO SOCIAL E CNPJ CONFORME CONTRATO]','Assunto: notificação sobre '+subject,'','Em [DATA], foi contratado [OBJETO E CONDIÇÕES], com pagamento de [VALOR COMPROVADO] e prazo [PRAZO].','Ocorreu [FATO E COMPROVANTE].','Comunicações anteriores: [DATAS, DESTINATÁRIOS E PROTOCOLOS].','','Solicito resposta escrita e adoção das providências [DESCREVER] no prazo que for indicado no instrumento revisado para este contrato.','Os documentos originais permanecem preservados para eventual orientação jurídica.','Identificação, assinatura e forma de envio: [COMPLETAR NO CANAL APROPRIADO].']);
 const judicial=line(['ORGANIZAÇÃO DE FATOS PARA ATENDIMENTO JURÍDICO — '+company,'','1. Partes e CNPJ contratual: [DADOS CONFERIDOS]','2. Data da contratação/ocorrência: [DATA]','3. Obrigação prometida e prazo: [OFERTA OU CONTRATO]','4. Pagamentos e documentos: [VALORES COMPROVADOS]','5. Descumprimento e provas: [CRONOLOGIA EXATA]','6. SAC, ouvidoria e Procon: [PROTOCOLOS E RESPOSTAS]','7. Situação atual: [SOLUÇÃO SE HOUVE OU PENDÊNCIA]','8. Pedido a avaliar: [EXECUÇÃO / RESTITUIÇÃO / OUTRO]','9. Valor da causa e competência: [DEFINIR COM APOIO JURÍDICO]','10. Anexos: [LISTA]','','Referência de pesquisa: '+url,'Não apresente a experiência de terceiro como sua.']);
 const publicShare=line([entry.title,'','A pesquisa CasoAberto apresenta cronologia, documentos e perguntas sobre '+company+'.','O que precisa ser respondido com prova?','',url]);
 const consumerTemplates=[
 tmpl('empresa','Exigir resposta escrita do fornecedor','SAC / atendimento','Peça prazo, documento e responsável.',support,active.filter(x=>x.step==='empresa').map(x=>x.id)),
 tmpl('procon','Abrir reclamação no Procon / Consumidor.gov','Órgão público','Relate seus próprios fatos e protocolo.',publicComplaint,active.filter(x=>['procon','reclamacao'].includes(x.step)).map(x=>x.id)),
 tmpl('reclameaqui','Publicar no Reclame Aqui','Reclame Aqui','Envie um relato individual com documentos protegidos.',publicComplaint,['reclame-aqui']),
 tmpl('ouvidoria','Escalar à ouvidoria e ao regulador','Segunda instância','Use os protocolos anteriores e exija reavaliação.',escalation,active.filter(x=>['ouvidoria','regulador'].includes(x.step)).map(x=>x.id)),
 tmpl('notificacao','Preparar notificação formal','Pessoa jurídica contratante','Uma linha do tempo e um pedido formal.',formal,active.filter(x=>x.step==='empresa').map(x=>x.id)),
 tmpl('justica','Preparar fatos para ajuizar ação','Advogado / Defensoria / Juizado','Organize documentos e defina a via competente.',judicial,active.filter(x=>x.step==='judicial').map(x=>x.id)),
 tmpl('social','Compartilhar a investigação','WhatsApp / redes','Divulgue a pesquisa completa, com o link e as fontes.',publicShare,[])
 ];
 const publicRequest=line(['Destinatário: [ÓRGÃO COMPETENTE]','Assunto: pedido de informação pública sobre '+entry.title,'Período e processo ou ato: [DELIMITAR]','','Solicito, conforme o canal de informação aplicável:','1. [ATO OU DOCUMENTO PÚBLICO ESPECÍFICO].','2. [METODOLOGIA OU CRITÉRIOS UTILIZADOS].','3. [CRONOGRAMA E RESULTADOS DOCUMENTADOS].','4. [RESPONSÁVEL PELA PUBLICAÇÃO / RESPOSTA].','','Pesquisa com referências: '+url,'Peço número de protocolo e resposta pelo canal oficial.']);
 const civicTemplates=[
 tmpl('informacao','Pedir documento e transparência','Acesso à informação','Formule perguntas verificáveis e encaminhe ao órgão competente.',publicRequest,['falabr']),
 tmpl('providencia','Pedir providência institucional','Ouvidoria pública','Solicite resposta sobre fato e serviço públicos.',publicRequest,['falabr']),
 tmpl('social','Compartilhar fatos e fontes','WhatsApp / redes','Convide a examinar os documentos e a resposta pública.',publicShare,[])
 ];
 const legalTemplates=[
  tmpl('autos','Conferir atos e decisões no TJRJ','Advogados / partes habilitadas',
   'Pesquisar os autos por número; conteúdo sigiloso apenas por acesso legitimado.',
   line(['MAPA DE CONFERÊNCIA PROCESSUAL — '+entry.title,'',
    'Ação cível: 3219694-04.2026.8.19.0001',
    'Agravo: 3035838-40.2026.8.19.0000',
    'Confirmar via criminal, vigência das decisões e intimações nos autos, sem presumir resultado.',
    'Consulta oficial: https://www.tjrj.jus.br/consultas/processos-jud/formas-dispo-consultas',
    'Nenhum dado pessoal ou peça sigilosa deve ser publicado.']),['tjrj-consulta-processual']),
  tmpl('perguntas','Preparar perguntas institucionais','Redação / representação jurídica',
   'Texto único para revisão e envio autorizado, sem campanhas repetitivas ou assédio.',
   line(['PERGUNTAS DOCUMENTAIS — ESCOLA SUÍÇO-BRASILEIRA','',
    'Qual a data de recebimento e a providência geral adotada quanto às mensagens denunciadas?',
    'Quais publicações e fundamentos específicos motivaram os pedidos judiciais divulgados pela imprensa?',
    'Quais providências institucionais gerais podem ser informadas sem expor empregados ou alunos?',
    'A escola tem registro de sua eventual participação na escolha do local de intimação? Se não, confirmar que desconhece.',
    'Solicitamos esclarecimento por escrito com indicação das fontes públicas e preservação de privacidade.']),[]),
  tmpl('fonte','Compartilhar o dossiê e as fontes','Leitores',
   'Convite a consultar informação pública, sem pressionar pessoas físicas ou a comunidade escolar.',
   line([entry.title,entry.summary,'',url,'Conferir reportagem original, posicionamento da escola e estágio judicial antes de compartilhar.']),[])
 ];
 return {id,title:entry.title,company,summary:entry.summary,href:entry.href,region,isCivic,channels:active,templates:isLegal?legalTemplates:isCivic?civicTemplates:consumerTemplates,
 judicialNote:own?.valor_brl&&own.valor_brl>50000?'Florense: o contrato informado é de R$ 190 mil. Consulte advogado ou Defensoria para identificar rito, competência, pedidos e valor da causa; não escolha renúncia de crédito por padrão.':records.guidance.court};
}
export const actionChannelRecords=channels;
export const actionCoverage=caseStudies.map(x=>({id:x.id,channels:caseActionPlan(x.id).channels.length,templates:caseActionPlan(x.id).templates.length}));
