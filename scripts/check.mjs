import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { packageFiles, validateVersion } from './package.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'extension');
const manifest = JSON.parse(readFileSync(resolve(root, 'manifest.json'), 'utf8'));
assert.equal(manifest.manifest_version, 3);
assert.deepEqual(manifest.permissions, ['storage']);
validateVersion(manifest.version);
const packageInfo = JSON.parse(readFileSync(resolve(root, '..', 'package.json'), 'utf8'));
assert.equal(packageInfo.version, manifest.version, 'package.json and manifest versions must match');
if (process.env.RELEASE_TAG) {
  assert.equal(process.env.RELEASE_TAG, `v${manifest.version}`, 'Release tag must match manifest version');
  const releaseNotes = readFileSync(resolve(root, '..', 'RELEASE_NOTES.md'), 'utf8');
  const notesTitle = releaseNotes.split(/\r?\n/, 1)[0];
  assert.ok(notesTitle.startsWith('# ') && notesTitle.endsWith(` v${manifest.version}`),
    'RELEASE_NOTES.md heading must end with the released version, for example # v1.0.0');
}
const files = new Set(packageFiles(manifest));
for (const file of files) {
  const path = resolve(root, file);
  assert.ok(existsSync(path), `Missing extension file: ${file}`);
  if (file.endsWith('.js')) execFileSync(process.execPath, ['--check', path]);
}
assert.deepEqual(manifest.content_scripts[0].matches, ['*://yomou.syosetu.com/*', '*://ncode.syosetu.com/*']);
assert.equal(manifest.content_scripts[0].run_at, 'document_start');
console.log(`Manifest and JavaScript OK (${files.size} files).`);
