import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));

// dist/server.js -> packages/design-sync-mcp/dist -> packages/design-sync-mcp -> packages -> repo root
export const repoRoot = path.resolve(here, '../../..');
export const tokensPackageDir = path.join(repoRoot, 'packages/tokens');
export const tokensSourceDir = path.join(tokensPackageDir, 'tokens');
export const tokensBuildFile = path.join(tokensPackageDir, 'build/figma/tokens.json');
export const componentsDocsFile = path.join(repoRoot, 'packages/web-components/dist/docs.json');
export const iconsPackageDir = path.join(repoRoot, 'packages/icons');
export const iconsSourceDir = path.join(iconsPackageDir, 'src/svg');
export const iconsIncomingDir = path.join(iconsPackageDir, 'incoming');
