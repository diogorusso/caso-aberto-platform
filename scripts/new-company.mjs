#!/usr/bin/env node
/**
 * Prepare a non-public draft company profile from CLI flags; no network, no fabricated ratings.
 * Usage: npm run new:company -- --slug empresa-exemplo --name "Empresa Exemplo" --segment "Serviços" --location "Brasil"
 */
import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('../src/data/brands.json',import.meta.url);
const args=process.argv.slice(2);
const opt=(name)=>{const i=args.indexOf('--'+name);return i>=0?args[i+1]:undefined;};
const slug=opt('slug'),name=opt('name'),segment=opt('segment'),location=opt('location');
if(!slug||!name||!segment||!location||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)){
 console.error('Usage: npm run new:company -- --slug empresa-exemplo --name "Empresa Exemplo" --segment "Serviços" --location "Brasil"');process.exit(2);
}
const data=JSON.parse(readFileSync(file,'utf8'));
if(data.brands.some(b=>b.slug===slug)){console.error('Company slug already exists:',slug);process.exit(2);}
const now=new Date().toISOString().slice(0,10);
data.brands.push({
 slug,name,segment,location,
 summary:'PENDENTE — inserir descrição factual da empresa com fontes verificáveis.',
 published:false,last_reviewed:now,first_published:null,
 primary_company_profile_ids:[],related_company_profile_ids:[],case_ids:[],units:[],
 verdict:{
  status:'cautela',scope:'Rascunho interno — avaliação não publicada.',
  headline:'Aguardando análise documental.',lead:'A avaliação será publicada após revisão das fontes.',
  question:'Quais casos e registros públicos estão documentados?',
  context:'Sem fontes suficientes: rascunho não é indexado nem publicado.',
  basis:[],review_triggers:['Reunir fontes, casos e resposta institucional.'],
  source_urls:[],valid_as_of:now
 },faq:[]
});
data.updated_at=now;
writeFileSync(file,JSON.stringify(data,null,2)+'\n','utf8');
console.log('Draft added:',slug,'(published=false). The company has NO public route until reviewed and published.');
