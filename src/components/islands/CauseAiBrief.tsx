import {useState} from 'react';
import type {Cause} from '@/lib/civic-workspace';

interface Props {cause:Cause}
function promptFor(c: Cause): string {
 const sources=c.evidence.filter(e=>e.url.startsWith('https://')||e.url.startsWith('http://')).slice(0,12);
 const links=sources.map((e,i)=>String(i+1)+'. '+e.title+' — '+e.url).join('\n')||'Nenhuma fonte ainda cadastrada.';
 return [
  'TAREFA: elaborar um roteiro de pesquisa documental e organização cidadã, sem enviar mensagens nem publicar nada.',
  'CAUSA: '+c.title,
  'DOMÍNIO: '+c.domain+' | JURISDIÇÃO: '+(c.jurisdiction||'não definida'),
  'RESULTADO VERIFICÁVEL DESEJADO: '+c.objective,
  '',
  'FONTES QUE DEVEM SER VERIFICADAS DE FORMA INDEPENDENTE:',
  links,
  '',
  'REGRAS DA ANÁLISE:',
  '1. Separe fatos documentados, alegações, respostas institucionais, interpretações e lacunas. Não trate uma fonte como verificada apenas porque foi fornecida.',
  '2. Produza mapa de evidências, hipóteses falsificáveis, dúvidas, prazo de revisão e roteiro de solicitações à instituição competente.',
  '3. Não invente números, testemunhos, processos, normas, responsabilidades ou intenções.',
  '4. Distingua estatística de amostra, correlação de causalidade, cenário de resultado confirmado.',
  '5. Proponha somente ações cívicas voluntárias e legais, sem assédio, perfis políticos individualizados, bots ou divulgação de dados pessoais.',
  '6. Não execute ferramentas, publicações, contatos, mensagens, inscrições ou coletas sem autorização específica e revisão humana.',
  '7. Se não conseguir acessar uma fonte, marque o registro como não verificado e sugira uma forma de checá-lo.',
  '8. Entregue uma tabela de afirmação, evidência, limite, pergunta pública, responsável institucional e próximo passo.',
  '',
  'SAÍDA: plano revisável, com fontes identificáveis, limitações e decisões humanas pendentes.'
 ].join('\n');
}
export default function CauseAiBrief({cause}:Props){
 const [text,setText] = useState('');
 const [status,setStatus] = useState('');
 const generate=()=>{setText(promptFor(cause));setStatus('Rascunho local criado. Revise o texto antes de copiá-lo a qualquer serviço.');};
 const copy=async()=>{
  if(!text.trim()){setStatus('Crie ou edite o rascunho antes de copiar.');return;}
  try{await navigator.clipboard.writeText(text);setStatus('Texto copiado. Verifique o destino antes de colar.');}
  catch{setStatus('O navegador não permitiu copiar; selecione o texto manualmente.');}
 };
 return <section className="space-y-5" aria-labelledby="ai-title">
   <h3 id="ai-title" className="m-0 text-xl">Brief de pesquisa para IA</h3>
   <p className="max-w-3xl text-sm text-muted-foreground">A ferramenta prepara instruções para um assistente de sua escolha, mas <strong>não executa IA, não acessa APIs e não transmite informações</strong>. Pode incluir textos e URLs que você escreveu: remova nomes, identificadores, segredos e detalhes pessoais antes de compartilhar externamente.</p>
   <div className="flex flex-wrap gap-3"><button type="button" onClick={generate} className="cursor-pointer border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-forest">Criar brief a partir da causa</button><button type="button" disabled={!text.trim()} onClick={copy} className="cursor-pointer border border-border bg-card px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40">Copiar brief revisado</button></div>
   <label className="block text-sm font-semibold" htmlFor="civic-ai-brief">Revise e edite antes de copiar</label><textarea id="civic-ai-brief" rows={18} maxLength={12000} value={text} onChange={e=>setText(e.target.value)} placeholder="Clique em criar brief para montar uma proposta baseada em sua causa. Nenhum dado é enviado." className="block w-full border border-input bg-card p-4 font-mono text-xs leading-relaxed focus-visible:outline-2 focus-visible:outline-brand-strong"/>
   <p role="status" aria-live="polite" className="text-sm text-muted-foreground">{status}</p>
   <p className="border-l-4 border-brand bg-muted p-4 text-xs">Um assistente pode errar, alucinar fontes, misturar pessoas e executar instruções maliciosas se estiver conectado a ferramentas. Considere o brief um ponto de partida para pesquisa, nunca aprovação automática de acusações ou ações.</p>
 </section>;
}
