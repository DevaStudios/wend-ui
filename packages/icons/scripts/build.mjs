#!/usr/bin/env node
import { readdirSync, mkdirSync, existsSync, rmSync, copyFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { buildIconManifest } from '../src/build-manifest.mjs';

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

for (const file of svgFiles) {
  copyFileSync(path.join(srcSvgDir, file), path.join(distSvgDir, file));
}

const manifest = buildIconManifest(svgFiles);
writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

console.log(`Wrote packages/icons/dist (${svgFiles.length} icons)`);
