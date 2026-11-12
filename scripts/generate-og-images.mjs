/** Render static 1200×630 PNG share previews with exclusive /media/ photos.
 * Every case and story OG embeds its sourced photo from case-visual-assets.json.
 * /og/ is share/meta only — never a substitute for on-page photo heroes.
 */
import sharp from 'sharp';
import {readFile, mkdir, stat} from 'node:fs/promises';
import {join} from 'node:path';

const root = process.cwd();
const read = async (name) => JSON.parse(await readFile(join(root, 'src/data', name + '.json'), 'utf8'));
const [owned, atlas, politics, platforms, categories, visuals] = await Promise.all(
  ['casos', 'public-case-atlas', 'political-observatory', 'platform-observatory', 'case-categories', 'case-visual-assets'].map(read),
);

const category = new Map(categories.categories.flatMap((c) => c.case_ids.map((id) => [id, c.title])));
const visualById = new Map((visuals.assets || []).map((item) => [item.case_id, item]));
const directory = join(root, 'public', 'og');
await mkdir(join(directory, 'casos'), {recursive: true});
await mkdir(join(directory, 'historias'), {recursive: true});
const instagramDirectory = join(root, 'public', 'share', 'instagram');
await mkdir(instagramDirectory, {recursive: true});

const escape = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const split = (text, max = 28, lines = 4) => {
  const words = String(text || '')
    .trim()
    .split(/\s+/);
  const chunks = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > max && current) {
      chunks.push(current);
      current = word;
    } else current = current ? current + ' ' + word : word;
  }
  if (current) chunks.push(current);
  if (chunks.length > lines) {
    const last = chunks.slice(lines - 1).join(' ');
    chunks.splice(lines - 1, chunks.length - (lines - 1), last.slice(0, max - 1) + '…');
  }
  return chunks.slice(0, lines);
};

const text = (value, x, y, size, color = '#f1f1e7', weight = 700) =>
  '<text x="' +
  x +
  '" y="' +
  y +
  '" font-family="Arial, Liberation Sans, sans-serif" font-size="' +
  size +
  '" font-weight="' +
  weight +
  '" fill="' +
  color +
  '">' +
  escape(value) +
  '</text>';

async function available(webPath) {
  if (!webPath || !String(webPath).startsWith('/media/')) return null;
  const local = join(root, 'public', webPath);
  try {
    await stat(local);
    return local;
  } catch {
    return null;
  }
}

async function withVisual(item) {
  const asset = visualById.get(item.id);
  const image = await available(asset?.photo);
  const logo = await available(asset?.logo);
  if (!image) {
    throw new Error('OG requires exclusive /media/ photo for ' + item.id + ' (missing ' + (asset?.photo || 'photo') + ')');
  }
  return {...item, image, logo, caption: asset?.company || item.company, creditShort: asset?.is_incident_photo ? 'Foto do incidente' : 'Foto documentada'};
}

const sources = [
  ...owned.map((c) => ({
    id: c.id,
    slug: c.slug,
    company: c.empresa_resumo,
    title: c.chamada,
    category: category.get(c.id),
    date: c.status_data,
    group: c.id === categories.featured_case_id ? 'CASO EM DESTAQUE' : 'CASO DOCUMENTADO',
  })),
  ...atlas.cases.map((c) => ({
    id: c.id,
    slug: c.slug,
    company: c.company,
    title: c.headline,
    category: category.get(c.id),
    date: c.reviewed_at,
    group: 'CASO DOCUMENTADO',
  })),
  ...politics.cases.map((c) => ({
    id: c.id,
    slug: c.slug,
    company: c.topic || 'Poder público',
    title: c.title,
    category: category.get(c.id),
    date: c.reviewed_at,
    group: 'TRANSPARÊNCIA E PODER',
  })),
  {
    id: 'PLAT-2026-CASE',
    slug: 'meta-eleicoes-2026-governanca-plataformas',
    company: 'Meta · Facebook · Instagram',
    title: 'Quem responde pelos anúncios e pela moderação?',
    category: category.get('PLAT-2026-CASE'),
    date: platforms.reviewed_at,
    group: 'PLATAFORMAS E DADOS',
  },
];

const casesBySlug = new Map(sources.map((c) => [c.slug, c]));
const stories = atlas.stories.map((p) => {
  const first = casesBySlug.get(p.case_slugs[0]);
  return {
    id: p.id,
    slug: p.slug,
    company: p.display_name,
    title: p.headline,
    category: p.category,
    date: p.source_published_at,
    group: 'HISTÓRIA DOCUMENTADA',
    human: true,
    related: first?.company || '',
  };
});

function layout(item) {
  const titleLines = split(item.title, 30, 4);
  const titleSize = titleLines.some((line) => line.length > 28) ? 44 : 50;
  const titleSvg = titleLines.map((v, i) => text(v, 64, 200 + i * (titleSize + 10), titleSize, '#f1f1e7', 800)).join('');
  const idText = item.id ? item.id + ' · ' : '';
  const date = item.date?.split('-').reverse().join('/') || '';
  return Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">' +
      '<rect width="1200" height="630" fill="#121b18"/>' +
      '<rect x="790" width="410" height="630" fill="#233c34"/>' +
      '<rect x="64" y="45" width="34" height="38" rx="4" fill="#ec776b"/>' +
      text('C', 72, 75, 24, '#121b18', 800) +
      text('CASO', 112, 75, 27, '#f1f1e7', 900) +
      text('ABERTO', 198, 75, 27, '#ec776b', 900) +
      text(item.group, 64, 137, 16, '#ec8a80', 800) +
      '<rect x="64" y="527" width="665" height="1" fill="#53645b"/>' +
      titleSvg +
      text(item.category || 'Pesquisa documentada', 64, 572, 19, '#bfcfc4', 600) +
      text(idText + date, 64, 603, 17, '#91a69a', 500) +
      '</svg>',
  );
}

function shortCaption(raw) {
  let value = String(raw || '')
    .replace(/\s*[·|].*$/, '')
    .replace(/\s*\(.*$/, '')
    .trim();
  if (value.length > 34) value = value.slice(0, 33) + '…';
  return value;
}

function captionOverlay(item, hasLogo) {
  // With a logo badge, keep the panel to credit only — avoid duplicating the brand name.
  if (hasLogo) {
    return Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">' +
        '<rect x="790" y="470" width="410" height="160" fill="#121b18" fill-opacity=".92"/>' +
        text(item.creditShort || 'Foto documentada', 820, 560, 15, '#d0dbd4', 500) +
        '</svg>',
    );
  }
  const label = shortCaption(item.caption || item.company).toUpperCase();
  const brandLines = split(label, 22, 2);
  const brandSvg = brandLines.map((v, i) => text(v, 820, 520 + i * 28, brandLines.length > 1 ? 18 : 22, '#ffffff', 800)).join('');
  const creditY = 520 + brandLines.length * 28 + 16;
  return Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">' +
      '<rect x="790" y="470" width="410" height="160" fill="#121b18" fill-opacity=".92"/>' +
      brandSvg +
      text(item.creditShort || 'Foto documentada', 820, Math.min(creditY, 612), 14, '#d0dbd4', 500) +
      '</svg>',
  );
}

async function render(item, file) {
  const picture = await sharp(item.image).resize(410, 630, {fit: 'cover', position: 'centre'}).png().toBuffer();
  const layers = [
    {input: picture, left: 790, top: 0},
    {input: captionOverlay(item, Boolean(item.logo)), left: 0, top: 0},
  ];
  if (item.logo) {
    const badge = await sharp(item.logo)
      .ensureAlpha()
      .resize({width: 168, height: 40, fit: 'inside'})
      .png()
      .toBuffer();
    const meta = await sharp(badge).metadata();
    const padX = 10;
    const padY = 8;
    const plateW = (meta.width || 168) + padX * 2;
    const plateH = (meta.height || 40) + padY * 2;
    const plate = await sharp({
      create: {width: plateW, height: plateH, channels: 4, background: {r: 255, g: 255, b: 255, alpha: 1}},
    })
      .composite([{input: badge, left: padX, top: padY}])
      .png()
      .toBuffer();
    layers.push({input: plate, left: 820, top: 486});
  }
  await sharp(layout(item)).composite(layers).png({compressionLevel: 8, palette: true, effort: 7}).toFile(file);
}

/** Portrait 4:5 publication card for voluntary Instagram uploads. Documentary cover photo is a context image, not a depiction of alleged events. */
async function renderInstagram(item, file) {
  const titleLines = split(item.title, 27, 5);
  const size = titleLines.some(line => line.length > 25) ? 47 : 53;
  const heading = titleLines.map((line,i) => text(line, 64, 784 + i * 70, size, '#f1f1e7', 800)).join('');
  const date = item.date?.split('-').reverse().join('/') || '';
  const base = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350">' +
    '<rect width="1080" height="1350" fill="#121b18"/>' +
    '<rect x="64" y="48" width="30" height="34" rx="3" fill="#ec776b"/>' +
    text('C', 72, 72, 20, '#121b18', 900) +
    text('CASO', 112, 76, 28, '#f1f1e7', 900) +
    text('ABERTO', 208, 76, 28, '#ec776b', 900) +
    '<rect y="118" width="1080" height="550" fill="#233c34"/>' +
    '<rect y="668" width="1080" height="682" fill="#121b18"/>' +
    text(item.group, 64, 728, 19, '#ec8a80', 800) +
    heading +
    '<rect x="64" y="1195" width="952" height="2" fill="#53645b"/>' +
    text(item.category || 'Pesquisa documental', 64, 1245, 24, '#bfcfc4', 600) +
    text(item.id + ' · revisão ' + date, 64, 1284, 20, '#91a69a', 500) +
    text('Fontes e cronologia: casoaberto.pages.dev', 64, 1320, 18, '#f1f1e7', 600) +
    '<rect x="62" y="626" width="350" height="35" fill="#121b18" fill-opacity=".92"/>' +
    text('IMAGEM DE CONTEXTO', 76, 651, 16, '#f1f1e7', 700) +
    '</svg>'
  );
  const image = await sharp(item.image).resize(1080, 550, {fit: 'cover', position:'centre'}).png().toBuffer();
  // Base SVG is layered on top of photo only where text/labels appear.
  const background = await sharp({create:{width:1080,height:1350,channels:4,background:'#121b18'}})
    .composite([{input:image,left:0,top:118},{input:base,left:0,top:0,blend:'over'}]).png().toBuffer();
  // The opaque base SVG deliberately masks the image region: recompose the photo over the
  // headerless image zone and overlay the context tag to keep the visual grounded.
  const label=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350"><rect x="62" y="626" width="350" height="35" fill="#121b18" fill-opacity=".92"/>'+text('IMAGEM DE CONTEXTO',76,651,16,'#f1f1e7',700)+'</svg>');
  await sharp(background).composite([{input:image,left:0,top:118},{input:label,left:0,top:0}])
    .png({compressionLevel:8,palette:true,effort:7}).toFile(file);
}

async function renderDefault(file) {
  const svg = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">' +
      '<rect width="1200" height="630" fill="#121b18"/>' +
      '<rect x="64" y="45" width="34" height="38" rx="4" fill="#ec776b"/>' +
      text('C', 72, 75, 24, '#121b18', 800) +
      text('CASO', 112, 75, 27, '#f1f1e7', 900) +
      text('ABERTO', 198, 75, 27, '#ec776b', 900) +
      text('INSTITUTO · PESQUISA · AÇÃO', 64, 180, 16, '#ec8a80', 800) +
      text('A empresa prometeu.', 64, 280, 54, '#f1f1e7', 800) +
      text('Quem responde?', 64, 350, 54, '#f1f1e7', 800) +
      text('Pesquisa, dados e ação cidadã', 64, 560, 22, '#bfcfc4', 600) +
      text('casoaberto.pages.dev', 64, 600, 18, '#91a69a', 500) +
      '</svg>',
  );
  await sharp(svg).png({compressionLevel: 8, palette: true, effort: 7}).toFile(file);
}

let n = 0;
const caseItems = await Promise.all(sources.map(withVisual));
const storyItems = await Promise.all(stories.map(withVisual));
for (const item of caseItems) {
  await render(item, join(directory, 'casos', item.slug + '.png'));
  await renderInstagram(item, join(instagramDirectory, item.slug + '.png'));
  n++;
}
for (const item of storyItems) {
  await render(item, join(directory, 'historias', item.slug + '.png'));
  n++;
}
await renderDefault(join(directory, 'default.png'));
console.log(
  'OG artwork generated: ' +
    n +
    ' case and story previews, 24 vertical Instagram cards + branded default; all from sourced /media/ photos.',
);
