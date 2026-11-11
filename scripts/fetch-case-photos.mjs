/**
 * Re-download sourced public photos and crop to 1600x900 case-card covers.
 * Run: node scripts/fetch-case-photos.mjs
 *
 * Prefer Commons API (thumb URLs) + Agência Brasil CDN. Always keep credit
 * and photo_source in src/data/case-visual-assets.json in sync.
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'CasoAbertoBot/1.0 (civic research; media archival; contact via GitHub issues)';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function commonsThumb(title, width = 2000) {
  const q = new URL('https://commons.wikimedia.org/w/api.php');
  q.searchParams.set('action', 'query');
  q.searchParams.set('titles', 'File:' + title);
  q.searchParams.set('prop', 'imageinfo');
  q.searchParams.set('iiprop', 'url');
  q.searchParams.set('iiurlwidth', String(width));
  q.searchParams.set('format', 'json');
  const res = await fetch(q, {headers: {'User-Agent': UA}});
  if (!res.ok) throw new Error(`api ${res.status}`);
  const data = await res.json();
  const page = Object.values(data.query.pages)[0];
  const info = page.imageinfo?.[0];
  if (!info) throw new Error('missing file ' + title);
  return info.thumburl || info.url;
}

const jobs = [
  {out: 'public/media/hurb/hurb-photo.jpg', commons: 'Departure lounge of Terminal 3 of Sao Paulo Guarulhos International Airport in 2025.jpg'},
  {
    out: 'public/media/123milhas/123milhas-photo.jpg',
    url: 'https://imagens.ebc.com.br/IHOVjsTAiXhMz9LiqjHVygmG6Wc=/1600x800/https://agenciabrasil.ebc.com.br/sites/default/files/thumbnails/image/img_4088.jpg',
  },
  {out: 'public/media/yeesco/yeesco-photo.jpg', commons: 'Damaged fragile parcel delivered to doorstep.jpg'},
  {out: 'public/media/enel/enel-photo.jpg', commons: 'Apagão em São Paulo - Vila Madalena.jpg'},
  {out: 'public/media/grao-de-gente/grao-de-gente-photo.jpg', commons: 'Baby Crib (49935766018).jpg'},
  {out: 'public/media/lado-rosa/lado-rosa-photo.jpg', commons: 'Brier Living Room.jpg'},
  {out: 'public/media/novo-mundo/novo-mundo-photo.jpg', commons: 'Quirindi Furniture Shop 001.JPG'},
  {out: 'public/media/casas-bahia/casas-bahia-photo.jpg', commons: 'Casas Bahia - Caxias Shopping.jpg'},
  {out: 'public/media/tokstok/tokstok-photo.jpg', commons: 'Cozy living room with a gray sofa.jpg'},
  {out: 'public/media/corsan/corsan-photo.jpg', commons: 'ETA Gramame-Mamuaba, Conde (PB).jpg'},
  {out: 'public/media/amazon-prime/amazon-prime-photo.jpg', commons: 'Christmas tree and television.jpg'},
  {out: 'public/media/viagogo/resale-photo.jpg', commons: 'Rock in Rio 2013 - Entrada (10949998455).jpg'},
  {out: 'public/media/flamengo/flamengo-photo.jpg', commons: 'Estádio do Maracanã em dia de jogo do Flamengo.jpg'},
  {out: 'public/media/live-nation/live-nation-photo.jpg', commons: 'Show em Rock in Rio.jpg'},
  {out: 'public/media/ticketmaster/ticketmaster-photo.jpg', commons: "Guns N' Roses at Rock in Rio.jpg"},
  {out: 'public/media/meta/meta-photo.jpg', commons: 'Facebook Headquarters 1 Hacker Way Menlo Park.jpg'},
  {out: 'public/media/institutions/indigenous-rights-photo.jpg', commons: 'Acampamento Luta pela Vida (51753544124).jpg'},
  {out: 'public/media/novo-mundo/neusa-microondas-photo.jpg', commons: 'Open microwave oven.jpg'},
  {out: 'public/media/novo-mundo/felipe-cama-photo.jpg', commons: 'Bedroom big bed.jpg'},
];

async function fetchBuffer(url) {
  const res = await fetch(url, {headers: {'User-Agent': UA, Accept: 'image/*,*/*'}, redirect: 'follow'});
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const manifest = [];
  for (const job of jobs) {
    const dest = resolve(root, job.out);
    mkdirSync(dirname(dest), {recursive: true});
    process.stdout.write(`fetch ${job.out} ... `);
    try {
      const url = job.url || (await commonsThumb(job.commons));
      await sleep(1200);
      const raw = await fetchBuffer(url);
      await sharp(raw)
        .rotate()
        .resize(1600, 900, {fit: 'cover', position: 'centre'})
        .jpeg({quality: 82, progressive: true, mozjpeg: true})
        .toFile(dest);
      console.log('ok');
      manifest.push({path: job.out, url, bytes: raw.length});
    } catch (err) {
      console.log('FAIL');
      console.error(' ', err.message);
      manifest.push({path: job.out, error: String(err.message)});
    }
  }
  mkdirSync(resolve(root, 'build'), {recursive: true});
  writeFileSync(resolve(root, 'build/case-photo-fetch-manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Wrote build/case-photo-fetch-manifest.json');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
