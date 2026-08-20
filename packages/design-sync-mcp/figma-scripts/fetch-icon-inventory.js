// Icon inventory fetcher for use with design-sync-mcp's diff_icons.
//
// Paste this verbatim into a use_figma call's `code` parameter (read-only). Finds a page
// named "Icons" (case-insensitive), walks its top-level COMPONENT/COMPONENT_SET nodes, and
// exports each as SVG. Returns [{ name, svg, nodeId }], shaped exactly for diff_icons'
// figmaIcons input.
//
// If no "Icons" page exists yet, returns an empty array -- the first push run needs to
// create one (see the sync-icons-to-figma skill / push-icons.js).

const iconsPage = figma.root.children.find((page) => page.name.toLowerCase() === 'icons');

if (!iconsPage) {
  return [];
}

await iconsPage.loadAsync?.();

const iconNodes = iconsPage.children.filter(
  (node) => node.type === 'COMPONENT' || node.type === 'COMPONENT_SET'
);

const result = [];
for (const node of iconNodes) {
  const svg = await node.exportAsync({ format: 'SVG_STRING' });
  result.push({ name: node.name.replace(/^wend-icon-/, ''), svg, nodeId: node.id });
}

return result;
