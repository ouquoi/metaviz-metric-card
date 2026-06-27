/* global Buffer, console */
// Packages metabase-plugin.json + dist/ into <name>-<version>.tgz at the
// project root, ready to upload via Admin → Custom visualizations → Add.
//
// Produces a minimal POSIX ustar archive (no PAX headers, no GNU extensions)
// to avoid Java tar parser counting hidden header blocks as entries.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const MAX_COMPRESSED_BYTES = 5 * 1024 * 1024;
const MAX_UNCOMPRESSED_BYTES = 25 * 1024 * 1024;

const projectRoot = dirname(fileURLToPath(import.meta.url));

const manifestPath = resolve(projectRoot, "metabase-plugin.json");
if (!existsSync(manifestPath)) throw new Error("metabase-plugin.json not found.");
const manifest = JSON.parse(readFileSync(manifestPath, "utf-8"));
const name = manifest.name?.trim();
if (!name) throw new Error('metabase-plugin.json is missing a "name" field.');

const bundlePath = resolve(projectRoot, "dist/index.js");
if (!existsSync(bundlePath)) throw new Error('dist/index.js not found. Run "npm run build" first.');

const pkg = JSON.parse(readFileSync(resolve(projectRoot, "package.json"), "utf-8"));
const version = pkg.version?.trim();
if (!version) throw new Error('package.json is missing a "version" field.');

const assetNames = Array.from(new Set([
  ...(manifest.icon ? [manifest.icon] : []),
  ...(manifest.assets ?? []),
]));

// Build a minimal ustar tar archive manually — no PAX headers, no dir entries.
// Each entry = 512-byte header + data padded to 512-byte boundary.
// Archive ends with two 512-byte zero blocks.
function makeTarHeader(filePath, size) {
  const buf = Buffer.alloc(512, 0);

  // name (100 bytes)
  buf.write(filePath.slice(0, 100), 0, "utf8");
  // mode (8 bytes)
  buf.write("0000644\0", 100, "ascii");
  // uid / gid (8 bytes each)
  buf.write("0000000\0", 108, "ascii");
  buf.write("0000000\0", 116, "ascii");
  // size (12 bytes, octal)
  buf.write(size.toString(8).padStart(11, "0") + "\0", 124, "ascii");
  // mtime (12 bytes, octal) — fixed epoch to keep builds deterministic
  buf.write("00000000000\0", 136, "ascii");
  // typeflag: '0' = regular file
  buf[156] = 0x30;
  // ustar magic + version
  buf.write("ustar\0", 257, "ascii");
  buf.write("00", 263, "ascii");

  // checksum: sum of all bytes with checksum field treated as spaces (0x20)
  buf.fill(0x20, 148, 156);
  let sum = 0;
  for (let i = 0; i < 512; i++) sum += buf[i];
  buf.write(sum.toString(8).padStart(6, "0") + "\0\x20", 148, "ascii");

  return buf;
}

function pad512(data) {
  const rem = data.length % 512;
  if (rem === 0) return data;
  return Buffer.concat([data, Buffer.alloc(512 - rem, 0)]);
}

function addEntry(filePath, content) {
  const data = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return [makeTarHeader(filePath, data.length), pad512(data)];
}

const chunks = [];
const push = (...bufs) => bufs.forEach(b => chunks.push(b));

push(...addEntry("metabase-plugin.json", readFileSync(manifestPath)));
push(...addEntry("dist/index.js", readFileSync(bundlePath)));
for (const assetName of assetNames) {
  const assetPath = resolve(projectRoot, "dist/assets", assetName);
  if (!existsSync(assetPath)) {
    throw new Error(`Asset "${assetName}" declared in metabase-plugin.json but missing from dist/assets/.`);
  }
  push(...addEntry(`dist/assets/${assetName}`, readFileSync(assetPath)));
}
// End-of-archive: two 512-byte zero blocks
push(Buffer.alloc(1024, 0));

const tarBuffer = Buffer.concat(chunks);
const tgz = gzipSync(tarBuffer);

const formatMiB = (b) => `${(b / 1024 / 1024).toFixed(2)} MiB`;
if (tarBuffer.length > MAX_UNCOMPRESSED_BYTES)
  throw new Error(`Uncompressed bundle ${formatMiB(tarBuffer.length)} exceeds limit ${formatMiB(MAX_UNCOMPRESSED_BYTES)}.`);
if (tgz.length > MAX_COMPRESSED_BYTES)
  throw new Error(`Compressed bundle ${formatMiB(tgz.length)} exceeds limit ${formatMiB(MAX_COMPRESSED_BYTES)}.`);

const outPath = resolve(projectRoot, `${name}-${version}.tgz`);
writeFileSync(outPath, tgz);
console.log(`Packed ${outPath} (${(tgz.length / 1024).toFixed(1)} KiB)`);
