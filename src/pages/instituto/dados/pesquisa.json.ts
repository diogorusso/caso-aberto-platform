import type {APIRoute} from 'astro';
import {metrics,caseLedger} from '../../../lib/research-metrics';
import benchmarks from '../../../data/research-benchmarks.json';
export const GET:APIRoute=()=>new Response(JSON.stringify({
 schemaVersion:1,updatedAt:metrics.reviewedAt,
 definitions:{
 cases:'Um registro de investigação por ID, não pessoas únicas.',
 sourceUrls:'URLs HTTPS distintas nas fontes de casos, estudos políticos e plataformas.',
 timelineEvents:'Soma dos eventos das cronologias de cada estudo.',
 publicQuestions:'Perguntas e exigências dos estudos de caso.',
 stories:'Relatos pessoais vinculados à biblioteca; podem mencionar mais de um estudo.',
 complaints:'Registros de reclamações indexados ao dossiê Florense, sem somar histórias de outros casos.',
 precedents:'Precedentes do arquivo histórico próprio.',
 categories:'Categorias do índice de pesquisas.'
 },
 metrics,caseLedger,externalBenchmarks:benchmarks
},null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=600'}});
