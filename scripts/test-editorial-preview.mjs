import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {escapeHtml,linkForPreview,renderEditorialPreview} from './editorial-preview-core.mjs';
const packs=JSON.parse(readFileSync(new URL('../src/data/education-content-packs.json',import.meta.url),'utf8')).packs;
test('workbench builds self-contained noindex local preview from 12 curated briefs',()=>{
 const html=renderEditorialPreview(packs);
 assert.equal((html.match(/class="pack" data-search=/g)||[]).length,packs.length);
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/56 capítulos permanece privado/);
 assert.doesNotMatch(html,/<iframe|src="https?:/);
 assert.doesNotMatch(html,/wiki\/playbooks|full_chapter_text/);
});
test('untrusted content is escaped before browser display',()=>{
 const injection='"><img src=x onerror=alert(1)>';
 assert.equal(escapeHtml(injection),'&quot;&gt;&lt;img src=x onerror=alert(1)&gt;');
 const html=renderEditorialPreview([{...packs[0],caption:injection,short_video_script:'<script>alert(1)</script>'}]);
 assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
 assert.doesNotMatch(html,/<img src=x onerror=|<script>alert\(1\)<\/script>/);
});
test('links only allow HTTPS and known internal educational routes',()=>{
 assert.equal(linkForPreview('javascript:alert(1)'),'#');
 assert.equal(linkForPreview('//bad.test'),'#');
 assert.equal(linkForPreview('http://bad.test'),'#');
 assert.equal(linkForPreview('https://user:pass@bad.test'),'#');
 assert.equal(linkForPreview('/academia/pegadas-digitais/'),'https://casoaberto.pages.dev/academia/pegadas-digitais/');
});
test('only unpublished, human-review drafts can be previewed',()=>{
 assert.throws(()=>renderEditorialPreview([]));
 assert.throws(()=>renderEditorialPreview([{...packs[0],review_status:'published'}]));
 assert.throws(()=>renderEditorialPreview([{...packs[0],publication_url:'https://site.test/published'}]));
});
