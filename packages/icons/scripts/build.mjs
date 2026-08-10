#!/usr/bin/env node
import { readdirSync, mkdirSync, existsSync, rmSync, copyFileSync, writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildIconManifest } from '../src/build-manifest.mjs';
import { buildSvgStrings } from '../src/build-svg-strings.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '..');
const srcSvgDir = path.join(packageDir, 'src/svg');
const distDir = path.join(packageDir, 'dist');
const distSvgDir = path.join(distDir, 'svg');

if (existsSync(distDir)) {
  rmSync(distDir, { recursive: true });
}
mkdirSync(distSvgDir, { recursive: true });

const svgFiles = readdirSync(srcSvgDir).filter((file) => file.endsWith('.svg'));

const entries = svgFiles.map((file) => {
  const content = readFileSync(path.join(srcSvgDir, file), 'utf8');
  copyFileSync(path.join(srcSvgDir, file), path.join(distSvgDir, file));
  return { filename: file, content };
});

const manifest = buildIconManifest(svgFiles);
writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const svgStrings = buildSvgStrings(entries);
writeFileSync(path.join(distDir, 'svg-strings.json'), JSON.stringify(svgStrings, null, 2) + '\n');

console.log(`Wrote packages/icons/dist (${svgFiles.length} icons, manifest.json + svg-strings.json)`);
