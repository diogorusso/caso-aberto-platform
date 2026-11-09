import raw from '../data/brands.json';
import type {Case} from './cases';
export type Brand = (typeof raw.brands)[number];
export type BrandUnit = Brand['units'][number];
export type Verdict = Brand['verdict'];
export type VerdictStatus = 'recomendamos'|'cautela'|'nao_recomendamos';
export const brands:Brand[] = raw.brands.filter(x=>x.published);
export const ratingDefinitions = raw.ratings;
export const brandPath=(brand:Pick<Brand,'slug'>)=>'/empresas/'+brand.slug+'/';
export const unitPath=(brand:Brand,unit:BrandUnit)=>brandPath(brand)+unit.slug+'/';
export const findBrand=(slug:string)=>brands.find(b=>b.slug===slug);
export const forCase=(item:Case)=>brands.find(b=>b.slug===item.empresa_slug);
export const verdictForCase=(item:Case):Verdict|undefined=>{
 const brand=forCase(item);
 return brand?.units.find(u=>u.slug===item.unidade_slug)?.verdict||brand?.verdict;
};
export const statusLabel=(status:string)=>
 ratingDefinitions.find(r=>r.code===status)?.label||'Sem avaliação publicada';
export const statusRank=(status:string)=>ratingDefinitions.find(r=>r.code===status)?.sort??0;
export const publishedUnit=(brand:Brand,slug:string)=>brand.units.find(u=>u.slug===slug&&u.published);
