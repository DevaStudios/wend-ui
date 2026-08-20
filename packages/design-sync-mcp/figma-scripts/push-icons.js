// Icon push script for use with design-sync-mcp's diff_icons output.
//
// This is a TEMPLATE, not paste-verbatim like the token scripts: fill in ICONS_TO_PUSH below
// with the actual batch for this run, then paste the whole file into a use_figma call's
// `code` parameter.
//
//   - New icons (diff_icons' onlyInProject): { name, svg, mode: 'create' }
//   - Changed icons (diff_icons' changed): { name, svg, mode: 'update', nodeId: figma.nodeId }
//     `nodeId` comes from the `changed` entry's `figma.nodeId` field -- this is what makes
//     the update preserve the existing component's identity instead of a delete+recreate,
//     which would break every instance of that icon elsewhere in the Figma file.
//
// const ICONS_TO_PUSH = [
//   { name: 'new-icon', svg: '<svg>...</svg>', mode: 'create' },
//   { name: 'existing-icon', svg: '<svg>...</svg>', mode: 'update', nodeId: '123:45' }
// ];
const ICONS_TO_PUSH = [];

let iconsPage = figma.root.children.find((page) => page.name.toLowerCase() === 'icons');
if (!iconsPage) {
  iconsPage = figma.createPage();
  iconsPage.name = 'Icons';
}
await iconsPage.loadAsync?.();

async function createIcon(name, svg) {
  const imported = figma.createNodeFromSvg(svg);
  const component = figma.createComponentFromNode(imported);
  component.name = `wend-icon-${name}`;
  iconsPage.appendChild(component);
  return component.id;
}

// Preserves the existing component's node ID (and therefore every instance of it elsewhere
// in the file) by editing its children in place, rather than deleting and recreating the
// component -- Figma's Plugin API has no direct "replace this node's vector data" call.
async function updateIcon(nodeId, svg) {
  const existing = await figma.getNodeByIdAsync(nodeId);
  if (!existing) {
    throw new Error(`No node found for id ${nodeId}`);
  }

  for (const child of [...existing.children]) {
    child.remove();
  }

  const imported = figma.createNodeFromSvg(svg);
  existing.resizeWithoutConstraints(imported.width, imported.height);
  for (const child of [...imported.children]) {
    existing.appendChild(child);
  }
  imported.remove();
}

const created = [];
const updated = [];
const errors = [];

for (const icon of ICONS_TO_PUSH) {
  try {
    if (icon.mode === 'create') {
      await createIcon(icon.name, icon.svg);
      created.push(icon.name);
    } else if (icon.mode === 'update') {
      await updateIcon(icon.nodeId, icon.svg);
      updated.push(icon.name);
    } else {
      throw new Error(`Unknown mode "${icon.mode}"`);
    }
  } catch (error) {
    errors.push({ name: icon.name, message: String(error && error.message ? error.message : error) });
  }
}

return { created, updated, errors };
