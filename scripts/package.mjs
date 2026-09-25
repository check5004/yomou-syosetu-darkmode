import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { crc32, deflateRawSync } from 'node:zlib';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function packageFiles(manifest) {
  // Deliberate allowlist: local notes, test fixtures and editor files never ship.
  return [...new Set([
    'manifest.json', 'INSTALL.txt', 'popup.js', 'popup.css',
    manifest.action.default_popup,
    ...Object.values(manifest.icons),
    ...Object.values(manifest.action.default_icon),
    ...manifest.content_scripts.flatMap(({ css = [], js = [] }) => [...css, ...js]),
  ])].sort();
}

export function validateVersion(version) {
  assert.match(version, /^(0|[1-9]\d*)(\.(0|[1-9]\d*)){2}$/,
    'Use a three-part numeric version, for example 1.0.0');
  const parts = version.split('.').map(Number);
  assert.ok(parts.every((part) => part <= 65535) && parts.some(Boolean),
    'Version components must be 0–65535 and not all zero');
}

export function buildPackage({ root = projectRoot, output = resolve(root, 'dist') } = {}) {
  const extensionRoot = resolve(root, 'extension');
  const manifest = JSON.parse(readFileSync(resolve(extensionRoot, 'manifest.json'), 'utf8'));
  validateVersion(manifest.version);
  const packageInfo = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  assert.equal(packageInfo.version, manifest.version, 'package.json and manifest versions must match');

  const localEntries = [];
  const centralEntries = [];
  const files = packageFiles(manifest);
  let offset = 0;
  for (const name of files) {
    assert.match(name, /^(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_.-]+$/,
      `Unsupported archive path: ${name}`);
    assert.ok(!name.split('/').some((part) => part === '.' || part === '..'),
      `Unsafe archive path: ${name}`);
    let currentPath = extensionRoot;
    for (const part of name.split('/')) {
      currentPath = resolve(currentPath, part);
      assert.ok(!lstatSync(currentPath).isSymbolicLink(), `Symlinks are not packaged: ${name}`);
    }
    const bytes = readFileSync(currentPath);
    const compressed = deflateRawSync(bytes, { level: 9 });
    const filename = Buffer.from(name, 'utf8');
    assert.ok(bytes.length < 0xffffffff && offset < 0xffffffff, 'ZIP64 is not supported');

    // Classic ZIP headers; fixed 1980-01-01 timestamp makes repeat builds identical.
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 filenames.
    local.writeUInt16LE(8, 8); // DEFLATE.
    local.writeUInt16LE(33, 12); // DOS date: 1980-01-01.
    local.writeUInt32LE(crc32(bytes), 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(filename.length, 26);
    localEntries.push(local, filename, compressed);

    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(20, 4);
    local.copy(central, 6, 4, 30);
    central.writeUInt32LE(offset, 42);
    centralEntries.push(central, filename);
    offset += local.length + filename.length + compressed.length;
  }

  const directory = Buffer.concat(centralEntries);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(directory.length, 12);
  end.writeUInt32LE(offset, 16);
  const archive = Buffer.concat([...localEntries, directory, end]);

  mkdirSync(output, { recursive: true });
  const archivePath = resolve(output, `yomou-darkmode-${manifest.version}.zip`);
  const checksumPath = `${archivePath}.sha256`;
  writeFileSync(archivePath, archive);
  writeFileSync(checksumPath, `${createHash('sha256').update(archive).digest('hex')}  ${basename(archivePath)}\n`);
  return { archivePath, checksumPath, files };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { archivePath, checksumPath, files } = buildPackage();
  console.log(`Packaged ${files.length} extension files.\n${archivePath}\n${checksumPath}`);
}
