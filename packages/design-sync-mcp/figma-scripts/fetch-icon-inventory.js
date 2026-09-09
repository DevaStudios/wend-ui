// Icon inventory fetcher for use with design-sync-mcp's diff_icons.
//
// Paste this verbatim into a use_figma call's `code` parameter (read-only). Finds a page
// named "Icons" (case-insensitive) and walks every COMPONENT/COMPONENT_SET node anywhere in
// its subtree, then exports each as SVG. Returns [{ name, svg, nodeId }], shaped exactly for
// diff_icons' figmaIcons input.
//
// As of 2026-09-09, icons are organized into per-category top-level FRAMEs (e.g. "arrows",
// "user interface", "layout & format") rather than sitting as flat top-level components on
// the page itself -- an earlier version of this script only scanned iconsPage.children
// directly and silently returned [] for the whole inventory once that reorganization
// happened. Using page.query(...) (recursive) instead of page.children.filter(...) (one
// level) covers both the old flat layout and the new categorized one, so it shouldn't need
// to change again if categories are renamed or added.
//
// If no "Icons" page exists yet, returns an empty array -- the first push run needs to
// create one (see the sync-icons-to-figma skill / push-icons.js).

const iconsPage = figma.root.children.find((page) => page.name.toLowerCase() === 'icons');

if (!iconsPage) {
  return [];
}

await iconsPage.loadAsync?.();

const iconNodes = iconsPage.query('COMPONENT, COMPONENT_SET').toArray();

const result = [];
for (const node of iconNodes) {
  const svg = await node.exportAsync({ format: 'SVG_STRING' });
  result.push({ name: node.name.replace(/^wend-icon-/, ''), svg, nodeId: node.id });
}

return result;
