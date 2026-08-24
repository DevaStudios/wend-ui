import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { iconsIncomingDir, iconsSourceDir } from './paths.js';

export interface IconEntry {
  name: string;
  svg: string;
  hash: string;
}

/** Strips Figma's `#id:id` suffix from a name, same convention as components.ts's normalizeName. */
function normalizeName(name: string): string {
  return name.replace(/#.*$/, '').trim().toLowerCase();
}

/**
 * Fingerprints an SVG by its geometry alone (every path `d` / polygon `points` value,
 * whitespace-stripped and joined), not the raw markup. Figma's `exportAsync({format:
 * 'SVG_STRING'})` output and a hand-authored file will never byte-match even for identical
 * artwork -- attribute order, numeric precision, and formatting all differ -- so hashing the
 * raw string would flag every icon as "changed" on the first diff.
 */
function geometryHash(svg: string): string {
  const values = [...svg.matchAll(/\s(?:d|points)="([^"]*)"/g)].map((match) => match[1].replace(/\s+/g, ''));
  return createHash('sha256').update(values.join('|')).digest('hex');
}

function deriveName(filename: string): string {
  return filename.replace(/^wend-icon-/, '').replace(/\.svg$/, '');
}

/** Reads every icon straight from packages/icons/src/svg -- the curated source, not a build artifact. */
export function listIcons(): IconEntry[] {
  const files = readdirSync(iconsSourceDir).filter((file) => file.endsWith('.svg'));

  return files
    .map((file) => {
      const svg = readFileSync(path.join(iconsSourceDir, file), 'utf8');
      return { name: deriveName(file), svg, hash: geometryHash(svg) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface FigmaIconEntry {
  name: string;
  svg: string;
  nodeId?: string;
}

export interface IconDiff {
  onlyInProject: IconEntry[];
  onlyInFigma: FigmaIconEntry[];
  changed: Array<{ name: string; project: IconEntry; figma: FigmaIconEntry }>;
}

/**
 * Compares the project's icons against a caller-supplied snapshot of Figma's icon
 * components (typically fetched via `use_figma` + figma-scripts/fetch-icon-inventory.js).
 * Matching is name-based only (case-insensitive, Figma's #id:id suffix stripped).
 * "changed" compares geometryHash, not raw SVG markup -- see geometryHash's doc comment.
 */
export function diffIcons(figmaIcons: FigmaIconEntry[]): IconDiff {
  const projectIcons = listIcons();
  const projectByName = new Map(projectIcons.map((icon) => [normalizeName(icon.name), icon]));
  const figmaByName = new Map(figmaIcons.map((icon) => [normalizeName(icon.name), icon]));

  const onlyInProject = projectIcons.filter((icon) => !figmaByName.has(normalizeName(icon.name)));
  const onlyInFigma = figmaIcons.filter((icon) => !projectByName.has(normalizeName(icon.name)));

  const changed = projectIcons.flatMap((project) => {
    const figma = figmaByName.get(normalizeName(project.name));
    if (!figma || geometryHash(figma.svg) === project.hash) {
      return [];
    }
    return [{ name: project.name, project, figma }];
  });

  return { onlyInProject, onlyInFigma, changed };
}

interface StagedMeta {
  [filename: string]: { nodeId?: string; stagedAt: string };
}

const metaFile = () => path.join(iconsIncomingDir, '.staged-meta.json');

function readMeta(): StagedMeta {
  try {
    return JSON.parse(readFileSync(metaFile(), 'utf8')) as StagedMeta;
  } catch {
    return {};
  }
}

/**
 * Stages icons pulled from Figma under packages/icons/incoming/ for human review --
 * never writes to packages/icons/src/svg/ directly. @devastudios/icons is unpublished
 * pending confirmation the set is clear for public distribution (see its README), and a
 * prior icon already had to be dropped for embedded commercial-library attribution, so
 * nothing here should auto-join the shipped set.
 */
export function stageIcons(icons: FigmaIconEntry[]): { staged: string[] } {
  mkdirSync(iconsIncomingDir, { recursive: true });

  const stagedAt = new Date().toISOString();
  const meta = readMeta();

  const staged: string[] = [];
  for (const icon of icons) {
    const filename = `${icon.name}.svg`;
    writeFileSync(path.join(iconsIncomingDir, filename), icon.svg, 'utf8');
    meta[filename] = { nodeId: icon.nodeId, stagedAt };
    staged.push(filename);
  }

  writeFileSync(metaFile(), JSON.stringify(meta, null, 2) + '\n', 'utf8');
  writeReviewFile();
  return { staged };
}

/**
 * Regenerates REVIEW.md from whatever .svg files are currently in incoming/ (not just the
 * ones staged this call) -- so a file a human already reviewed and moved into src/svg/ drops
 * off the list automatically instead of lingering as a stale row.
 */
function writeReviewFile(): void {
  const meta = readMeta();
  const files = readdirSync(iconsIncomingDir).filter((file) => file.endsWith('.svg'));
  const rows = files
    .map((file) => {
      const entry = meta[file];
      return `| ${file.replace(/\.svg$/, '')} | ${entry?.nodeId ?? '(unknown)'} | ${entry?.stagedAt ?? '(unknown)'} |`;
    })
    .join('\n');

  const content = `# Icons staged for review

These SVGs were pulled from Figma and are **not** part of the shipped \`@devastudios/icons\` set yet.
Review each one before moving it into \`../src/svg/\` (renamed to the \`wend-icon-\` prefix) and
running \`npm run build -w packages/icons\`. See the "Figma sync" section of packages/icons/README.md
for the full curation checklist.

Checklist per icon:
- [ ] No brand or product names in the icon's name or visible art
- [ ] No commercial icon-library attribution/watermark embedded in the SVG
- [ ] Source and license confirmed as clear for distribution in this MIT-licensed package

| Name | Figma node ID | Staged at |
| --- | --- | --- |
${rows}
`;

  writeFileSync(path.join(iconsIncomingDir, 'REVIEW.md'), content, 'utf8');
}
