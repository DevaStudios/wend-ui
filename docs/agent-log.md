# Agent log

A running record of Claude Code subagents and MCP tools used on this project — what was
spawned, why, and what it touched. Complements `docs/superpowers/plans/`/`specs/` (which
capture *what was decided and why* for a given feature) by capturing *how the work got done*:
which subagent types were used, which MCP servers/tools did the heavy lifting, and any
workarounds that had to be improvised (e.g. the browser extension being unavailable).

Append a new entry per significant session — "significant" meaning it spawned a subagent,
used an MCP tool beyond routine file edits/builds, or hit a notable tooling workaround worth
remembering for next time. Routine single-file edits with no subagent/MCP involvement don't
need an entry.

This file is also published as a real page on the live wend-ui site at
`packages/web-components/src/agent-log.html` — the two are hand-kept in sync, not generated
from one another. See the `sync-agent-log` skill for the exact steps to update both together.

## Entry template

```md
## YYYY-MM-DD — <short task title>

**Task:** one-line summary of what was asked.
**Subagents:** none, or `<type>` — `<one-line purpose>` (repeat per subagent spawned).
**MCP tools/servers:** list of MCP servers/tools actually invoked (not just available),
e.g. `plugin:figma:figma` (`use_figma`, `get_metadata`), `wend-ui-design-sync`
(`get_tokens`, `diff_tokens`).
**Other tooling notes:** anything non-obvious — a workaround, a gotcha, a tool that didn't
work and what was used instead.
**Outcome:** what changed (files/packages), one or two lines.
```

## Subagent types

What each subagent type in this environment actually is, for anyone reading a log entry below
who hasn't used Claude Code's subagent tooling before. A subagent is a separate agent
invocation Claude Code can spawn mid-session — it does its own work (with its own tool calls)
and reports back, instead of the main session doing everything itself directly.

- **`fork`** — clones the *current* session's full conversation context into a background
  copy of itself, which then keeps working while the main session stays free to keep talking
  to the user. Used when a task needs a lot of exploratory tool output (file reads, tool
  results) that isn't worth keeping in the main conversation's context — the fork absorbs that
  noise and returns only its findings. Always runs on the same model as the session that
  forked it. This is the one used in this project so far (see the 2026-09-08 wend-select entry).
- **`general-purpose`** — a fresh agent with no memory of the calling session, given full tool
  access. For open-ended research or multi-step work where a clean, unbiased starting point
  matters more than inherited context — e.g. "search for and summarize how X is implemented
  across the codebase."
- **`Explore`** — a fast, read-only agent restricted to search/read tools (no edits). For
  narrowly locating code — "find where X is defined," "which files reference Y" — where
  broader analysis or judgment isn't needed.
- **`Plan`** — a read-only "software architect" agent for designing an implementation
  approach: trade-offs, critical files, step-by-step plan. Used from within Claude Code's own
  plan mode when a task is non-trivial enough to warrant explicit user sign-off before writing
  code.
- **`claude-code-guide`** — answers questions about Claude Code itself (the CLI, hooks, slash
  commands, MCP config), the Claude Agent SDK, or the Claude API. Not used for this project's
  own code — only for "how does Claude Code do X" questions.
- **`statusline-setup`** — narrowly configures the Claude Code terminal status line. Unrelated
  to project work.
- **`claude`** — the generic catch-all when no more specific type fits; equivalent to not
  specifying a type at all.

---

## 2026-09-08 — Figma MCP re-authentication

**Task:** MCP was authenticated as the wrong Figma account after a logout/login in the desktop app.
**Subagents:** none.
**MCP tools/servers:** `plugin:figma:figma` (`whoami`).
**Other tooling notes:** the Figma MCP connection has its own OAuth session, separate from
the desktop app's login — fixed via `claude mcp logout`/`claude mcp login`, which requires an
interactive terminal (doesn't work through the session's own non-interactive shell or the `!`
prefix; had to be run in a real terminal window).
**Outcome:** no code changes — auth only.

## 2026-09-08 — Token drift audits and Figma↔code syncs (multiple)

**Task:** several rounds of "diff tokens against Figma" and "sync the change I just made in
Figma", plus one explicit push from code to Figma.
**Subagents:** none.
**MCP tools/servers:** `wend-ui-design-sync` (`get_tokens`, `diff_tokens`), `plugin:figma:figma`
(`use_figma` — read-only variable dumps, and later a write to rebind three semantic variables
and update one literal RGBA value).
**Other tooling notes:** `use_figma` read-only script output truncates around ~20KB — large
variable dumps (the full global+semantic collections) had to be split into two calls (one per
collection) to avoid silent truncation partway through.
**Outcome:** amber→yellow global color ramp replacement, dark-mode `action.*` token overrides,
button text-color fix, border-color light-step sync, `color/ui/background/warning` pushed to
Figma. See `packages/tokens/README.md` and `packages/design-sync-mcp/figma-sync-state.json`
for the detailed rationale on each.

## 2026-09-08 — Light/dark mode toggle (doc site + Storybook)

**Task:** add a light/dark toggle to the web-components doc site, then to Storybook.
**Subagents:** none.
**MCP tools/servers:** none — plain file edits/builds.
**Other tooling notes:** `mcp__claude-in-chrome` (browser extension) was connected for the doc
site work but dropped and never reconnected for the rest of the session — every subsequent
"look at it in a real browser" need was done via headless Chrome instead (see next entries).
**Outcome:** `data-theme` toggle wired into `packages/web-components/src/*.html` (inline script
+ `localStorage`), `@storybook/addon-themes` added and configured in `.storybook/`.

## 2026-09-08 — wend-select / wend-option (new component from Figma)

**Task:** build a single-select dropdown from three new Figma components (Option, Selection
Panel, Select), using Floating UI for panel positioning.
**Subagents:** 1 `fork` — "Survey existing component-adding conventions" (file layout,
keyboard/interaction precedent, third-party dependency convention, schema shape, docs-site
pattern) — used to front-load research without filling the main session's context with file
listings before planning.
**MCP tools/servers:** `plugin:figma:figma` (`use_figma` extensively — component-set/variant
discovery, resolving bound variables to hex, `get_metadata` for node structure), `wend-ui-design-sync`
(`get_tokens`, `diff_tokens`).
**Other tooling notes:** used `EnterPlanMode`/`ExitPlanMode` given the size of the change (new
component + new runtime dependency); used `AskUserQuestion` mid-plan for two scope decisions
(disabled-state styling, approval to add `@floating-ui/dom`). For live verification, the
browser extension was still unavailable, so interactivity (clicks, keyboard nav, Floating UI
positioning, dark mode, viewport-edge flip behavior) was verified with a small hand-written
Chrome DevTools Protocol script (`ws` npm package, already present transitively — headless
Chrome launched with `--remote-debugging-port`, driven over the CDP WebSocket). This caught a
real coordinate-math bug (double-counted panel padding in the "cap at 5 options" logic) that a
static screenshot alone wouldn't have.
**Outcome:** `wend-select`/`wend-option` Stencil components, tokens (`selection` role-based
category, `component/option.json`, `component/select.json`), schemas, stories (both packages),
docs-site section, `@floating-ui/dom` dependency.

## 2026-09-08 — Storybook Docs view clipping the open Select panel

**Task:** the Select's option panel was cut off in Storybook's Docs view.
**Subagents:** none.
**MCP tools/servers:** none.
**Other tooling notes:** two separate bugs, found only by walking the live DOM via the same
CDP approach (not visible from a screenshot alone): (1) `wend-select`/`wend-option` were never
registered via `defineCustomElement` in `.storybook/preview.ts`, so they silently rendered as
unstyled text; (2) even after fixing that, the panel — `position: fixed` specifically to avoid
ancestor clipping — was still clipped, because CSS `overflow` on an ancestor clips
`position: fixed` descendants regardless (fixed only escapes the *positioning* containing
block, not paint-clipping). Two nested Storybook wrappers had `overflow: auto`/`hidden`
(`.docs-story` and its parent `.sbdocs-preview`) — the first fix attempt only caught the inner
one; walking the *entire* ancestor chain to `<html>` was what confirmed both, and confirmed
there wasn't a third.
**Outcome:** `.storybook/preview.ts` (missing `defineCustomElement` calls),
`.storybook/preview-head.html` (`overflow: visible !important` on both wrapper classes).
