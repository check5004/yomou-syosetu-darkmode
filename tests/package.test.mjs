import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { buildPackage, validateVersion } from '../scripts/package.mjs';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectVersion = JSON.parse(readFileSync(resolve(projectRoot, 'package.json'), 'utf8')).version;

function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), 'yomou-package-test-'));
  t.after(() => {
    assert.ok(root.startsWith(resolve(tmpdir(), 'yomou-package-test-')));
    rmSync(root, { recursive: true, force: true });
  });
  cpSync(resolve(projectRoot, 'extension'), resolve(root, 'extension'), { recursive: true });
  cpSync(resolve(projectRoot, 'package.json'), resolve(root, 'package.json'));
  return root;
}

test('build produces a versioned ZIP and independently verifiable SHA-256 file', (t) => {
  const root = fixture(t);
  const result = buildPackage({ root });
  const zip = readFileSync(result.archivePath);
  const expected = createHash('sha256').update(zip).digest('hex');
  assert.equal(basename(result.archivePath), `yomou-darkmode-${projectVersion}.zip`);
  assert.equal(readFileSync(result.checksumPath, 'utf8'), `${expected}  ${basename(result.archivePath)}\n`);
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.equal(zip.readUInt32LE(zip.length - 22), 0x06054b50);
  assert.ok(result.files.includes('manifest.json'));
  assert.ok(result.files.includes('INSTALL.txt'));
  assert.ok(result.files.every((name) => !name.startsWith('extension/')));
});

test('unexpected files in the extension directory are excluded', (t) => {
  const root = fixture(t);
  writeFileSync(resolve(root, 'extension', '.env'), 'SECRET_MUST_NEVER_SHIP=1');
  writeFileSync(resolve(root, 'extension', 'debug.log'), 'PRIVATE_LOG_MUST_NEVER_SHIP');
  const result = buildPackage({ root });
  assert.ok(!result.files.includes('.env'));
  assert.ok(!result.files.includes('debug.log'));
  const zip = readFileSync(result.archivePath);
  assert.ok(!zip.includes(Buffer.from('.env')));
  assert.ok(!zip.includes(Buffer.from('debug.log')));
});

test('rebuilding unchanged extension bytes produces the same ZIP', (t) => {
  const root = fixture(t);
  const first = readFileSync(buildPackage({ root }).archivePath);
  const second = readFileSync(buildPackage({ root }).archivePath);
  assert.deepEqual(first, second);
});

test('packaging refuses mismatched manifest and package versions', (t) => {
  const root = fixture(t);
  const info = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  info.version = info.version === '2.0.0' ? '3.0.0' : '2.0.0';
  writeFileSync(resolve(root, 'package.json'), JSON.stringify(info));
  assert.throws(() => buildPackage({ root }), /versions must match/);
});

test('release versions fit Chrome numeric component constraints', () => {
  for (const valid of ['1.0.0', '0.1.0', '65535.65535.65535']) validateVersion(valid);
  for (const invalid of ['0.0.0', 'v1.0.0', '1.0.0-beta', '01.0.0', '1.0', '65536.0.0']) {
    assert.throws(() => validateVersion(invalid));
  }
});
