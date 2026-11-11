#!/usr/bin/env node
/**
 * Validates institution-seals.json: unique IDs, HTTPS official links,
 * and that every logo file exists under public/.
 */
import { access, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(await readFile(join(root, 'src/data/institution-seals.json'), 'utf8'));
const errors = [];
const ids = new Set();

function add(channel, scope) {
  if (!channel?.id) errors.push(`${scope}: missing id`);
  else if (ids.has(channel.id)) errors.push(`duplicate id: ${channel.id}`);
  else ids.add(channel.id);
  if (!channel?.name || !channel?.short) errors.push(`${channel?.id || scope}: missing name/short`);
  if (!channel?.href?.startsWith('https://')) errors.push(`${channel?.id || scope}: href must be https`);
  if (!channel?.logo?.startsWith('/media/')) errors.push(`${channel?.id || scope}: logo must be under /media/`);
  if (!channel?.alt) errors.push(`${channel?.id || scope}: missing alt`);
}

for (const c of data.federal || []) add(c, 'federal');
for (const c of data.participation || []) add(c, 'participation');
for (const state of data.states || []) {
  if (!state.uf || !state.name) errors.push(`state missing uf/name`);
  if (!Array.isArray(state.channels) || !state.channels.length) errors.push(`${state.uf}: no channels`);
  for (const c of state.channels || []) add(c, state.uf);
}

if ((data.states || []).length !== 27) {
  errors.push(`expected 27 states/DF, got ${(data.states || []).length}`);
}

const bannerIds = data.banner_ids || [];
if (!Array.isArray(bannerIds) || bannerIds.length < 8) {
  errors.push('banner_ids must list the key federal seals for the footer grid');
}
const federalIds = new Set((data.federal || []).map((c) => c.id));
for (const id of bannerIds) {
  if (!federalIds.has(id)) errors.push(`banner_id missing from federal: ${id}`);
}
if (data.banner_cta_href && !String(data.banner_cta_href).startsWith('/')) {
  errors.push('banner_cta_href must be an internal path');
}

for (const id of ids) {
  // resolve logo path from collected channels
}
const channels = [
  ...(data.federal || []),
  ...(data.participation || []),
  ...(data.states || []).flatMap((s) => s.channels || []),
];
for (const c of channels) {
  const path = join(root, 'public', c.logo.replace(/^\//, ''));
  try {
    await access(path);
  } catch {
    errors.push(`missing logo file: ${c.logo} (${c.id})`);
  }
}

if (errors.length) {
  console.error('validate-institution-seals failed:');
  for (const e of errors) console.error(' -', e);
  process.exit(1);
}

console.log(
  `institution-seals ok: ${channels.length} channels, ${(data.states || []).length} UFs, ${(data.participation || []).length} participation portals`
);
