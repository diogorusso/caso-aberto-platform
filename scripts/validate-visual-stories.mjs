/** Offline structural checks for evidence-first visual case stories.
 * Factual correctness still depends on the linked primary record and editorial review.
 */
import {readFileSync,existsSync} from 'node:fs';
const file=name=>new URL('../src/data/'+name+'.json',import.meta.url);
const read=name=>JSON.parse(readFileSync(file(name),'utf8'));
const stories=read('impact-stories'),owned=read('casos'),external=read('public-case-atlas'),political=read('political-observatory'),platform=read('platform-observatory');
const impact=read('impact-models');
const legal=read('cacofonias-escola-suico-brasileira');
const errors=[];
const check=(bool,msg)=>{if(!bool)errors.push(msg);};
const expected=[...owned.map(x=>x.id),...external.cases.map(x=>x.id),...political.cases.map(x=>x.id),'PLAT-2026-CASE',legal.id];
const known=new Set(expected),seen=new Set();
check(stories.version===1,'Unexpected impact-stories schema');
check(/^\d{4}-\d{2}-\d{2}$/.test(stories.updated_at)&&stories.updated_at<=new Date().toISOString().slice(0,10),'Risk-story review date is invalid or future');
check(stories.cases.length===known.size,'Every case needs a unique impact story');
for(const narrative of stories.cases){
 const {id}=narrative;
 check(known.has(id),'Unknown visual case '+id);
 check(!seen.has(id),'Duplicate visual case '+id);
 seen.add(id);
 for(const key of ['audience','exposure','headline','worst_case','threshold','resolution','action']){
  check(typeof narrative[key]==='string'&&narrative[key].trim().length>=35,'Weak or missing '+key+' on '+id);
 }
 check(/^(Se |Persistindo |Se a )/i.test(narrative.worst_case),'Conditional severity must not present a prediction as observed fact '+id);
 check(!/\b(?:chance de|probabilidade de)\s*\d+%/i.test(narrative.worst_case),'Unverified probability '+id);
 check(!/\b(?:bilhões|milhões) de (?:visualizações|impressões)\b/i.test(narrative.worst_case),'Unsupported audience projection '+id);
}
for(const id of known)check(seen.has(id),'Missing visual story '+id);
for(const key of Object.keys(impact.case_models)){
 check(!impact.case_models[key].scenario_defaults,'Deprecated sliders/model levers still present '+key);
}
const required={
 'src/components/CaseVisualStory.astro':'IMPACTO DOCUMENTADO',
 'src/components/CaseEvidenceChart.astro':'role="img"',
 'src/components/islands/EvidenceChart.tsx':'recharts',
 'src/components/islands/ImpactStoryDrawer.tsx':'Se a situação continuar',
 'src/components/CaseImpactDrawer.astro':'ImpactStoryDrawer',
 'src/components/CaseVisibilityBadge.astro':'data-visibility-metric',
 'src/components/CaseIntro.astro':'CaseVisibilityBadge',
 'src/components/CaseCard.astro':'CaseVisibilityBadge',
 'src/components/islands/CaseVisibilityCounter.tsx':'visibilityFromInput',
 'src/lib/case-visibility-model.ts':'visibilityDayProgress',
 'src/lib/case-visibility.ts':'visibilityInputFromEntry',
 'src/lib/copy.ts':'Já viram o risco. A empresa ainda cala.',
 'src/components/ui/chart.tsx':'ChartContainer',
 'src/pages/casos/[slug]/index.astro':'<CaseVisualStory caseId={item.id}/>',
 'src/pages/casos/arquivo-publico/[slug]/index.astro':'CaseVisibilityBadge',
 'src/pages/observatorio/politica/[slug]/index.astro':'primaryImageForCase',
 'src/pages/observatorio/plataformas/index.astro':'primaryImageForCase',
 'src/pages/historias/[slug]/index.astro':'CaseVisibilityBadge',
 'src/pages/casos/imprimir/[slug].astro':'getStaticPaths',
 'src/components/ImpactBody.astro':'<CaseVisualStory caseId={linkedCase.id} compact />',
 'src/components/islands/CaseResearchExplorer.tsx':'CaseVisibilityCounter',
};
for(const [path,needle] of Object.entries(required)){
 const target=new URL('../'+path,import.meta.url);
 check(existsSync(target),'Missing visual route '+path);
 if(existsSync(target))check(readFileSync(target,'utf8').includes(needle),'Missing visual integration '+path);
}
const simulator=new URL('../src/components/ImpactSimulator.tsx',import.meta.url);
check(!existsSync(simulator),'Deprecated calculator/sliders still shipped');
for(const article of external.cases)check(article.timeline.length>=2&&article.sources.length>=2,'External case lacks chart provenance '+article.id);
for(const article of political.cases)check(article.timeline.length>=2&&article.source_ids.length>=2,'Political case lacks chart provenance '+article.id);
check(platform.records.length>=2,'Platform observatory lacks time series source');
// Visibility projection model: deterministic day curve must keep rising.
{
 const model=readFileSync(new URL('../src/lib/case-visibility-model.ts',import.meta.url),'utf8');
 check(model.includes('America/Sao_Paulo'),'Visibility model missing Sao Paulo day clock');
 check(model.includes('visibilityDayProgress'),'Visibility day progress missing');
 check(copyHasVisibility(),'Visibility confrontational copy missing from copy.ts');
}
function copyHasVisibility(){
 const copy=readFileSync(new URL('../src/lib/copy.ts',import.meta.url),'utf8');
 return copy.includes('olhos hoje')&&copy.includes('Já viram o risco. A empresa ainda cala.');
}
if(errors.length){for(const error of errors)console.error('[visual-stories]',error);process.exit(1);}
console.log('Visual story validation: '+known.size+' cases, universal print route, source-backed charts, visibility projections, no numeric sliders.');
