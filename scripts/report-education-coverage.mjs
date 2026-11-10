import {readFileSync} from 'node:fs';
const manifest=JSON.parse(readFileSync(new URL('../docs/education-coverage.json',import.meta.url),'utf8'));
const groups=Object.groupBy(manifest.chapters,c=>c.primary_product);
console.log('Currículo privado: '+manifest.chapters.length+' fontes. Apenas metadados neste repositório público.');
for(const [name,chapters] of Object.entries(groups)){
 const covered=chapters.filter(x=>x.snippet_urls.length).length;
 console.log(name+': '+covered+' com insight público / '+chapters.length+' fontes privadas. Pendentes: '+chapters.filter(x=>!x.snippet_urls.length).map(x=>x.id).join(', '));
}
console.log('A produção editorial deve gerar insights originais, nunca copiar capítulos privados.');
