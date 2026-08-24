import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadTokens, diffTokens } from './tokens.js';
import { listComponents, diffComponent } from './components.js';
import { listIcons, diffIcons, stageIcons } from './icons.js';

const server = new McpServer({
  name: 'wend-ui-design-sync',
  version: '0.1.0'
});

function jsonResult(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

server.registerTool(
  'get_tokens',
  {
    title: 'Get wend-ui design tokens',
    description:
      'Returns the wend-ui design tokens as a flat list of { name, type, values: { light, dark } }, always freshly rebuilt from packages/tokens/tokens/**/*.json if the source has changed since the last build. Tokens with no dark-mode override have identical light and dark values.'
  },
  () => jsonResult(loadTokens())
);

server.registerTool(
  'diff_tokens',
  {
    title: 'Diff wend-ui tokens against Figma variables',
    description:
      "Compares wend-ui's current tokens against a caller-supplied snapshot of Figma's variables (same { name, type, values: { light, dark } } shape — for each variable, read its value for both the Light and Dark mode IDs in the collection; normalize colors to hex and dimensions to plain numbers). Typically the caller fetches Figma's current variables via Figma's own MCP server first. Light and dark are diffed independently, so a token wrong in only one mode is reported for just that mode. Returns { onlyInProject, onlyInFigma, changed }, where each `changed` entry has a `mode: 'light' | 'dark'` field.",
    inputSchema: {
      figmaVariables: z
        .array(
          z.object({
            name: z.string(),
            type: z.enum(['COLOR', 'FLOAT', 'STRING', 'BOOLEAN']),
            values: z.object({
              light: z.union([z.string(), z.number(), z.boolean()]),
              dark: z.union([z.string(), z.number(), z.boolean()])
            })
          })
        )
        .describe("Figma's current variables, normalized to wend-ui's flat token shape with both mode values")
    }
  },
  ({ figmaVariables }) => jsonResult(diffTokens(figmaVariables))
);

server.registerTool(
  'list_components',
  {
    title: 'List wend-ui web components',
    description:
      "Returns wend-ui's web components (tag, description, props, slots) from packages/web-components' generated docs. Requires `npm run build -w packages/web-components` to have been run at least once. There is no automated push to Figma for components — use this for grounding when building or updating matching Figma components by hand."
  },
  () => jsonResult(listComponents())
);

server.registerTool(
  'diff_component',
  {
    title: 'Diff a wend-ui component against its Figma component',
    description:
      "Compares one wend-ui web component's props/slots (from packages/web-components' generated docs) against a caller-supplied snapshot of its Figma component's properties (typically read via the Figma MCP server's get_metadata/use_figma, e.g. componentPropertyDefinitions on a COMPONENT_SET). Matching is name-based only (case-insensitive, Figma's #id:id suffix stripped) — it will NOT guess that e.g. a code `disabled` prop corresponds to a Figma `State` variant axis; differently-named things surface as unmatched on both sides so the caller can judge the mapping. Returns { onlyInCode, onlyInFigma, matched }, where matched entries include an optionsMatch flag when both sides look enum-like.",
    inputSchema: {
      tag: z.string().describe('The web component tag, e.g. "wend-button"'),
      figmaProperties: z
        .array(
          z.object({
            name: z.string(),
            type: z.enum(['VARIANT', 'BOOLEAN', 'TEXT', 'INSTANCE_SWAP']),
            variantOptions: z.array(z.string()).optional(),
            defaultValue: z.union([z.string(), z.boolean()]).optional()
          })
        )
        .describe(
          "The Figma component's componentPropertyDefinitions, normalized to {name, type, variantOptions?, defaultValue?}"
        )
    }
  },
  ({ tag, figmaProperties }) => jsonResult(diffComponent(tag, figmaProperties))
);

const figmaIconEntrySchema = z.object({
  name: z.string(),
  svg: z.string(),
  nodeId: z.string().optional()
});

server.registerTool(
  'get_icons',
  {
    title: 'Get wend-ui icons',
    description:
      "Returns every icon in packages/icons/src/svg as { name, svg, hash }, read directly from the curated source (not a build artifact). `hash` fingerprints the SVG's geometry only (path/polygon data), not its raw markup, so it survives Figma's export formatting differences -- use it, not string equality, to compare against Figma."
  },
  () => jsonResult(listIcons())
);

server.registerTool(
  'diff_icons',
  {
    title: 'Diff wend-ui icons against a Figma icon inventory',
    description:
      "Compares wend-ui's current icons against a caller-supplied snapshot of Figma's icon components (typically fetched via `use_figma` running figma-scripts/fetch-icon-inventory.js). Matching is name-based (case-insensitive, Figma's #id:id suffix stripped). Returns { onlyInProject, onlyInFigma, changed } -- onlyInProject are push candidates, onlyInFigma are pull candidates, changed compares geometry (not raw SVG markup, which never byte-matches Figma's export even for identical art).",
    inputSchema: {
      figmaIcons: z
        .array(figmaIconEntrySchema)
        .describe("Figma's current icon components, normalized to { name, svg, nodeId? }")
    }
  },
  ({ figmaIcons }) => jsonResult(diffIcons(figmaIcons))
);

server.registerTool(
  'stage_pulled_icons',
  {
    title: 'Stage icons pulled from Figma for human review',
    description:
      "Writes icons (typically diff_icons' onlyInFigma set, exported via use_figma) to packages/icons/incoming/ plus a regenerated REVIEW.md checklist -- NEVER to packages/icons/src/svg/. This is a filesystem-mutating tool. @devastudios/icons is unpublished pending confirmation the set is clear for public distribution, and a prior icon already had to be dropped for embedded commercial-library attribution, so pulled icons always require a human to move them into src/svg/ by hand after review -- nothing calls this and then auto-joins the shipped set.",
    inputSchema: {
      icons: z.array(figmaIconEntrySchema).describe('Icons exported from Figma to stage for review')
    }
  },
  ({ icons }) => jsonResult(stageIcons(icons))
);

const transport = new StdioServerTransport();
await server.connect(transport);
