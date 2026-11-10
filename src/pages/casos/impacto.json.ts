import type {APIRoute} from 'astro';
import {caseStudies} from '../../lib/case-catalog';
import {caseStory} from '../../lib/visual-impact';
import stories from '../../data/impact-stories.json';

export const GET:APIRoute=()=>{
 const items=caseStudies.map(entry=>{
  const story=caseStory(entry.id);
  return {
   id:entry.id,slug:entry.slug,category:entry.category,case_url:entry.href,reviewed_at:story.date,
   headline:story.headline,affected_public:story.audience,impact_now:story.exposure,
   conditional_consequence:story.worst_case,change_trigger:story.threshold,
   resolution_evidence:story.resolution,public_action:story.action,
   indicators:story.metrics,documentary_milestones:story.points,
   evidence_graph:{title:story.graphTitle,description:story.graphDescription,source_url:story.graphSource||null,bars:story.bars||[]},
   source_urls:story.sources.map(source=>source.url),
   print_url:'/casos/imprimir/'+entry.slug+'/'
  };
 });
 return new Response(JSON.stringify({
  version:1,
  reviewed_at:stories.updated_at,
  description:'Indicadores e caminhos documentais dos casos públicos. Cada contagem acompanha seu recorte e fonte; cenários condicionais não são previsões numéricas.',
  count:items.length,
  cases:items,
 },null,2),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'public, max-age=3600','X-Content-Type-Options':'nosniff'}});
};
