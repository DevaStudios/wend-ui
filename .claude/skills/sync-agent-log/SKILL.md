---
name: sync-agent-log
description: Use when a session used a subagent or a notable MCP tool worth logging, or when either docs/agent-log.md or packages/web-components/src/agent-log.html is being added to or edited — the two files carry the same content (a plain-markdown source and a published HTML page) and drift silently if only one is updated.
---

# Sync Agent Log

## Overview

`docs/agent-log.md` and `packages/web-components/src/agent-log.html` are two copies of the
same content — a glossary of subagent types plus a chronological session log of subagent/MCP
tool usage on this project. The markdown file is the plain-text source (easy to read/diff in
the repo); the HTML file is that same content published as a real page on the live wend-ui
site, hand-mirrored into the site's own markup conventions (`.wend-page`/`.wend-section`
divs, a `.wend-props-table` for the glossary, `<h3>`+`<p><strong>` blocks per log entry).
Nothing generates one from the other, so an edit to just one silently leaves the other stale —
exactly the kind of drift `sync-tokens-to-figma`/`update-component-schema` guard against for
their own pairs of files.

## When to use

- A session just spawned a subagent (`fork`, `general-purpose`, `Explore`, `Plan`, etc.) or
  used an MCP tool beyond routine file edits/builds — per `docs/agent-log.md`'s own "append a
  new entry" rule, this needs a new dated entry in **both** files.
- A new subagent type becomes available, or an existing type's description needs correcting —
  update the glossary in **both** files.
- Either file was just hand-edited directly (e.g. fixing a typo in one) — check whether the
  edit needs mirroring into the other.

## Steps

1. **Write the change once, in prose.** Draft the new log entry (Task/Subagents/MCP tools/Other
   tooling notes/Outcome) or glossary edit as plain text first — this is the content both files
   need, just formatted two different ways.

2. **`docs/agent-log.md`.** Append a new `## YYYY-MM-DD — <title>` entry at the **bottom** of
   the file (entries are in chronological order, oldest first) using the `**Field:**` template
   already at the top of the file. For a glossary edit, update the bullet list under
   `## Subagent types`.

3. **`packages/web-components/src/agent-log.html`.** Mirror the exact same content into the
   "Session log" `.wend-section`, as a new `<div>` block (with an `<h3>` heading) appended at
   the **bottom** — same chronological order as the markdown file. Translate markdown → this
   file's conventions, not verbatim:
   - `**Field:**` → `<p style="margin: 0 0 var(--spacing-50)"><strong>Field:</strong> ...</p>`
     (the *last* field in an entry uses `margin: 0` instead, matching the existing entries —
     copy an existing `<div>` block as the template rather than writing one from scratch).
   - `` `code span` `` → `<code>code span</code>`.
   - Escape any literal `<`, `>`, `&` that appear in prose (e.g. a code snippet mentioned
     inline) — the markdown file doesn't need this, the HTML file does.
   For a glossary edit, update the matching `<tr>` in the `<table class="wend-props-table">`
   under "Subagent types" — same rows, same order, as the markdown bullet list.

4. **Rebuild.** `npm run build -w packages/web-components` — Stencil's `copy: [{ src: '*.html' }]`
   config picks up the edited file automatically (no entry to add anywhere), and this is what
   actually updates the served page. Never hand-edit `packages/web-components/www/agent-log.html`
   directly — it's gitignored generated output that gets silently overwritten on the next build
   (see `update-component-schema`'s own note on this exact gotcha for `src/docs/components/*.html`).

5. **Verify.** Load `agent-log.html` (dev server or the `www/` build output) and check the new
   entry/row actually rendered — a stray unescaped `<`/`&` or an unclosed tag will silently
   break the rest of the page's layout rather than throwing a build error, since this is hand-
   authored HTML with no template engine validating it.

## Common mistakes

- Adding a new dated entry to only one file. Nothing fails the build if you do this — it's
  purely a discipline thing, same as `update-component-schema`'s step 9
  (`src/docs/components/*.html`) having no automated check either.
- Editing `packages/web-components/www/agent-log.html` instead of `src/agent-log.html`. `www/`
  is gitignored build output; an edit there is invisible in git and gets clobbered by the next
  `npm run build -w packages/web-components`.
- Forgetting to reorder: both files list entries oldest-first, newest at the bottom. Inserting
  a new entry anywhere but the end (or in a different position between the two files) makes
  them read out of sync with each other even when the content itself matches.
- Copying `**Field:**` markdown syntax verbatim into the HTML file instead of translating it —
  it'll render as literal asterisks, not bold text, since there's no markdown processor on this
  page.
