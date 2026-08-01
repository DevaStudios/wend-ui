# Northstar AI CFO — Inbox design

## Purpose

Design exercise: "Design the inbox where financial work begins." Given six inbox items (a calendar-triggered meeting, a generated board-deliverable task, an alert, an approval, and two messages), take one **structured** item through a complete, believable workflow — what the user sees, edits, verifies, and completes — and show how the other five fit into the same system. Deliverable is a Figma mockup; this spec documents the concept and interaction model to build from.

Required item chosen: **`inbox_001` — "Prepare for sales forecast review"** (the meeting in 30 minutes), since it's the one with the richest linked context (agenda, facts, people, related account/forecast/deal records) and was already flagged as the candidate work area in the starting mock.

## Goals

- Define exactly what "prepared" means for a meeting-prep item, and design the panel that gets the user there.
- Use the schema's existing links (shared people/accounts across items) to make "how the other five fit in" a real structural connection, not just a shared list.
- Define one consistent lifecycle model that explains what happens to *any* inbox item after it's acted on, not just the one we're building in depth.
- Land the stretch goal (a completed action updates something outside the inbox) on a light, believable tie-in rather than inventing new data.

## Non-goals

- Full workflows for the other five items (only the required item gets full depth; the rest get list-level representation plus one lightweight reply interaction, per the brief).
- Designing the meeting itself (calendar, video call, live note-taking) — scope is pre-meeting prep only.
- A generic notification/automation rules engine — the one generation rule (meeting → follow-up item) is specified narrowly, not as a platform feature.
- Any use of `wend-ui`'s own component library/tokens — this is an independent product concept explored in this repo for brainstorming purposes only; nothing here implies wend-ui should ship Northstar-specific components.

## 1. Required workflow — the meeting-prep briefing

**Layout: scrolling document**, not a step-through wizard or split nav. All three agenda sections (Pipeline health, Evergreen renewal, Forecast gaps) are visible at once, each independently editable, with a single approval action at the bottom. Chosen over a step-through checklist (forces one-at-a-time confirmation, slower) and a split-nav workspace (more "tool"-like, better suited to a longer agenda than three items) because for a 30-minute-out prep task, skimmability beats ceremony — the user should be able to see the whole picture in one glance and only slow down where something looks off.

### Anatomy of a section

Each agenda item (`agenda[]` in the source event) becomes one card in the document:

- **AI-drafted summary** — one to two sentences, generated from the item's linked `facts` and `links`. Not a raw data dump; a CFO-toned read of what the number means (e.g. "Coverage dropped to 2.4x, down from 3.1x — below the threshold typically needed to hit target with confidence," not just "pipeline_coverage: 2.4").
- **Source trace (verify)** — an inline expandable affordance ("▸ view 3 deals") that opens *within the card* to show what the draft is built from, without navigating away. Chosen over a plain confirm/flag checkbox (too shallow — doesn't support real diligence) and over linking out to the Forecast/Account page (breaks flow, and the brief calls for one complete self-contained workflow).
- **Edit affordance** — a pencil/edit control per card. The draft is a starting point, not a final artifact; the user can rewrite the summary directly.

### Section content (from the data)

| Agenda item | Draft (example) | Trace source |
|---|---|---|
| Pipeline health | "Coverage dropped to 2.4x, down from 3.1x — below target threshold." | `facts[pipeline_coverage]` → the 3 deals composing it |
| Evergreen renewal | "Ben: procurement dragging, expects to close this month." | `inbox_005` (Ben Ortiz's message) — see cross-item connection below |
| Forecast gaps | "2 forecast changes since last meeting — ask Maya what shifted." | `links[forecast_q3_revenue]` |

### Cross-item connection

The Evergreen section doesn't originate new copy — it surfaces `inbox_005` (Ben Ortiz's message) directly, because that item shares both `sender.id` (`person_ben_ortiz`) and a linked account (`account_evergreen_health`) with the meeting's "Evergreen renewal" agenda point, and the meeting's `people[]` includes Ben Ortiz. This is the mechanism for "how the other five fit into the system": not a static sidebar list, but items surfacing inside each other wherever their `links`/`people`/`sender` overlap. Only one such connection exists in this dataset (Ben ↔ the meeting); it's the one the briefing uses.

### Completion

A "Mark ready for meeting" action at the bottom of the document. Disabled/de-emphasized until the user has interacted with the panel at least once (viewed or edited something) — pure default-acceptance without any engagement isn't "prepared." See §4 for what this action does to the item's state, and §5 for its downstream effect.

## 2. Required — reply interaction (Ben Ortiz's message)

Located on `inbox_005` rather than `inbox_006` (Jules's email) because it reinforces the same connected-context story the briefing panel tells, instead of introducing an unrelated third thread. When the user opens Ben's message, a quick-reply composer appears directly beneath it (inline, not a separate compose modal) with a send action. Depth is intentionally shallow per the brief ("at least one believable reply interaction," not a full messaging system) — no threading UI, read receipts, or attachment support; just enough that hitting send visibly posts a reply and the item's state updates (see §4 — 2-state items close on reply).

## 3. List hierarchy — ordering and visual treatment

**Ordering: blended risk score — impact × urgency, both weighted together.** Rather than pure chronology (soonest deadline wins) or pure stakes (biggest number wins), each item gets an **Impact** tier (financial magnitude: dollar amount, runway delta, or absence of a direct figure) and an **Urgency** tier (time to required action, where "already overdue/active" counts as maximally urgent, same as an imminent deadline). The two combine into one score, so a high-stakes item with no fixed deadline can still outrank a low-stakes item that happens to be due sooner, and vice versa.

| Item | Impact | Urgency | Score |
|---|---|---|---|
| Cash risk | High — $184k | Immediate — overdue now | 9 |
| Meeting prep | Medium — forecast signal, no direct figure | Immediate — 30 min | 6 |
| Hiring decision | High — runway −2.6mo | Today — due tomorrow | 6 |
| Board materials | Medium — admin deadline, no active risk figure | This week — 10 days | 2 |
| Ben's message | Low — no figure | None | 0 |
| Jules's email | None | None | 0 |

Resulting order: **Cash risk → Meeting prep → Hiring decision → Board materials → Ben's message → Jules's email.** Meeting and Hiring tie numerically (6 each); the tie resolves toward whichever has less slack — 30 minutes beats a full day, so the meeting stays just ahead. Ties elsewhere (Ben vs. Jules, both 0) fall back to time-urgency as the secondary sort, matching the earlier chronological model.

This was chosen over a pure-chronological sort (undersells real financial stakes — a $184k active risk with no calendar deadline would sort behind everything that merely has one) and over pure-stakes ordering (ignores the fact that a 30-minute meeting genuinely has less slack than a same-day decision, even if its own number is smaller). The visual chip system doesn't need to change to carry this — the dollar/runway figures already on each card make the "why" legible from the number itself, without adding a separate score badge.

**Visual treatment: typed icon + front-loaded signal chip**, one per `source.type`:

| Item | Icon | Chip |
|---|---|---|
| Meeting (`calendar`) | 📅 | countdown ("30 min") |
| Hiring decision (`approval`) | ✓ | runway delta ("−2.6mo") |
| Cash risk (`alert`) | ⚠ | dollar amount ("$184k") |
| Board materials (`generated_work`) | 📄 | due-in ("10 days") |
| Ben's message (`message`) | 💬 | none |
| Jules's email (`email`) | ✉ | none |

Chosen over a uniform, undecorated list (matches the starting mock, but leaves the "signal" implicit in wording only) because the chip surfaces the one number a CFO would want without opening the item — closer to how a real triage inbox should read at a glance.

## 4. Lifecycle model — Open → Prepared → Closed

Not every item needs all three states — it depends on whether there's a real-world event that has to land before the item is truly resolved, separate from the user's own action.

- **Open → Prepared → Closed** (3-state): the user's action isn't the end of the story: something in the world still has to happen. "Prepared" means the user has acted; "Closed" means the event landed.
- **Open → Closed** (2-state): the user's action *is* the resolution — nothing further to wait on.

| Item | Model | Prepared when | Closed when |
|---|---|---|---|
| Meeting prep | 3-state | briefing approved | meeting time passes |
| Board materials | 3-state | all sections complete | board due-date passes |
| Cash risk | 3-state | collection plan set | invoices paid |
| Hiring decision | 2-state | — | approved / declined |
| Ben's message | 2-state | — | replied |
| Jules's email | 2-state | — | replied / dismissed |

Prepared items stay in the OPEN list (their chip changes — e.g. the meeting's "30 min" countdown becomes a "Ready" checkmark) so the user can still reopen and revise before the real-world event lands. This matters for financial work: nothing should feel irreversibly filed away before it's actually happened. Closed items leave the 6-item OPEN queue entirely and route to the **"All activity"** button already present in the header — reusing an existing affordance rather than inventing a new "done" surface, and keeping the OPEN count an honest reflection of what still needs attention.

## 5. Stretch — downstream update

Approving the "Pipeline health" section of the briefing (i.e. the user has reviewed and accepted the coverage figure) stamps the linked `forecast_q3_revenue` record itself:

| Field | Before | After |
|---|---|---|
| Last reviewed | "8 days ago" | "Today" |
| Confidence | "Unconfirmed" | "Confirmed ahead of Sales forecast review" |
| Provenance | — | "Reviewed by Avery Chen · Jul 22, from inbox briefing" |

This was chosen over inventing a new metric (cash timing, a Reports figure) because it doesn't fabricate data the schema doesn't already model — `forecast_q3_revenue` is already linked from the meeting, so stamping it as reviewed is a direct, traceable consequence of the workflow the user just completed, not a new subsystem.

## 6. Generative loop — closing spawns new work

When the meeting closes (§4), Northstar creates a new OPEN item using the **same `generated_work` source type** the schema already uses for board materials — closing one loop opens another, which is the product's whole thesis ("where financial work begins," not ends).

- Title: "Log outcomes: Sales forecast review"
- Meta: "Pipeline, Evergreen, forecast gaps · from today's meeting"
- Icon: 🔁, with a "new" chip to distinguish it from items that were already in the queue
- Scores like any other item under the §3 blended model: no dollar/runway figure and no deadline at generation time, so Impact = Low and Urgency = None — it sorts near the bottom alongside the two messages until/unless a real figure or deadline gets attached to it

This rule is scoped narrowly to 3-state items whose "closed" transition is a real calendar/deadline event (the meeting) — it is **not** a general "every closed item spawns a follow-up" rule. Cash risk closing (invoices paid) and board materials closing (due-date passes) do not spawn anything in this spec; only the meeting does, because "log outcomes" only makes sense where something was actually discussed live. Extending the rule to other 3-state items is a reasonable future direction but is out of scope here (see Non-goals).

Depth: per the earlier scoping decision, this is specified as a rule plus one example list card — the follow-up item's own workflow panel is not designed in this pass.

## Schema note (beyond this exercise)

If this ranking model were implemented against a real backend, `impact_tier` / `urgency_tier` (and a short `reason` string) should live on each inbox item's payload — computed server-side when the item is created or updated — rather than re-derived by every client from raw `facts`/`due_at`. The §3 scoring already depends on judgment calls a client can't reliably infer from raw data alone (e.g. "a meeting with no attached dollar figure is Medium impact"); centralizing them avoids per-consumer drift and keeps the "why" reasoning authored once instead of reimplemented. Out of scope for this Figma-only exercise — noted here for whoever builds this against a real backend.

## Open questions for the Figma build

- Exact copy/tone for AI-drafted summaries beyond the three examples given here.
- Visual design of the source-trace expansion (inline accordion vs. popover) — functionally specified, not pixel-specified.
- Whether "Prepared" chip styling should differ from item to item or use one consistent treatment across all 3-state items.
