#!/usr/bin/env node
/**
 * gen-asset-ver.js — Generate MD5 version hashes for all assets under public/assets/.
 * Output: public/assets/_ver.json  { "assets/path/file.ext": "md5hash", ... }
 *
 * Paths in the JSON use "assets/..." prefix (no leading "public/") so they match
 * the runtime paths used by globalAssets.loadTexture(), loadAudio(), etc.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PUBLIC_DIR = path.resolve('public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const OUTPUT_FILE = path.join(ASSETS_DIR, '_ver.json');

if (!fs.existsSync(ASSETS_DIR)) {
  console.log('gen-asset-ver: no public/assets/ directory — skipping');
  process.exit(0);
}

/** Recursively collect all files under a directory. */
function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else if (entry.isFile()) {
      results.push(fullPath);
    }
  }
  return results;
}

const versionMap = {};
const files = walkDir(ASSETS_DIR).filter(f => path.basename(f) !== '_ver.json');

for (const filePath of files) {
  const content = fs.readFileSync(filePath);
  const hash = crypto.createHash('md5').update(content).digest('hex').slice(0, 8);
  // Key: relative to public/ → "assets/sprites/player.svg"
  const relPath = path.relative(PUBLIC_DIR, filePath).replace(/\\/g, '/');
  versionMap[relPath] = hash;
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(versionMap, null, 2) + '\n');
console.log(`gen-asset-ver: ${Object.keys(versionMap).length} assets → public/assets/_ver.json`);
