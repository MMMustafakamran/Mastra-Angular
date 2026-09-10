# CopilotKit + Mastra — Angular test harness

A navigable harness for the [Angular + Mastra](https://docs.copilotkit.ai/angular/mastra)
section of the CopilotKit docs. Every guide in the sidebar is a route, and each
route *runs* the thing its doc page teaches rather than restating it.

The agent is a Mastra agent, bridged to CopilotKit through
[`@ag-ui/mastra`](https://www.npmjs.com/package/@ag-ui/mastra).

## Requirements

| | |
| --- | --- |
| Node | >= 22.13 (developed on v24) |
| npm | v12 |
| Model key | `OPENAI_API_KEY` — the agent uses an OpenAI model |

## Install

Dependencies are needed in **both** directories. The runtime imports the Mastra
instance from `../backend/src/mastra` as source, so the backend's own
dependencies (`@mastra/core` and friends) must be installed too.

```bash
cd backend  && npm install
cd ../frontend && npm install
```

## Set the model key

`OPENAI_API_KEY` must be present in the environment of the **runtime process**.

```bash
export OPENAI_API_KEY=sk-...
```

> Because the agent is loaded in-process, nothing reads `backend/.env` — that
> file is only consulted by `mastra dev`, which this harness does not run.
> Exporting the variable (or prefixing the command with it) is what works.

## Run

From `frontend/`:

```bash
npm run dev
```

That starts both processes together and opens on **http://localhost:4200**.

| | Command | Port |
| --- | --- | --- |
| Angular dev server | `npm run start` | 4200 |
| Copilot Runtime | `npm run runtime` | 8200 |

Run them in separate terminals with the individual commands if you prefer; `npm
run dev` is just `concurrently` over the two.

## How the pieces fit

Two processes, not three — the Mastra agent runs **inside** the runtime process
rather than behind its own server:

```
Browser (Angular 22, zoneless)
  |  @copilotkit/angular — provideCopilotKit, copilot-chat, signal APIs
  |  POST http://localhost:8200/api/copilotkit
  v
Copilot Runtime  ·  localhost:8200        <- Node, frontend/server.ts
  |  agents: { default, support } -> MastraAgent.getLocalAgent({ mastra, ... })
  |  in-process — no HTTP hop
  v
Mastra agent     ·  imported from backend/src/mastra
  v
OpenAI
```

Angular has no server route of its own, so the Copilot Runtime is a separate
Node process rather than living inside the app the way it does in the React /
Next quickstart. The model key only ever reaches the runtime process — the
browser never talks to the agent directly.

`default` and `support` are the same underlying agent under two ids, so doc
snippets written against `agentId="support"` (Chat UI, Threads) run verbatim.

## Verify it works

1. Open http://localhost:4200 — the Introduction route runs a live connection
   check on load.
2. `curl http://localhost:8200/api/copilotkit/info` should report the `default`
   and `support` agents. This is the check the quickstart's troubleshooting box
   prescribes.
3. Open `/quickstart/demo` and send *Can you tell me a joke?* — tokens should
   stream in one at a time and render as markdown.

## Routes

Each route holds the notes, pass/fail criteria, and the exact source that runs.
Routes with a live feature also expose `<route>/demo`, which is the same feature
with no page chrome so it can be screen-recorded on its own.

Docs last synced **2026-08-26**.

| Route | Status | Notes |
| --- | --- | --- |
| [/](https://docs.copilotkit.ai/angular/mastra) | Reference | Landing page — orientation and a live connection check |
| [/quickstart](https://docs.copilotkit.ai/angular/mastra/quickstart) | Working | |
| [/chat-ui](https://docs.copilotkit.ai/angular/mastra/guides/chat-ui) | Working | |
| [/frontend-tools-generative-ui](https://docs.copilotkit.ai/angular/mastra/guides/frontend-tools-generative-ui) | Partial | All three tool paths are live; the guide's "Let the agent display one of your components" snippet is wrong four ways — see Known issues |
| [/a2ui](https://docs.copilotkit.ai/angular/mastra/guides/a2ui) | Partial | Inert until a catalog is supplied — see Known issues |
| [/voice-multimodal](https://docs.copilotkit.ai/angular/mastra/guides/voice-multimodal) | Partial | Microphone records, but no transcription service is configured |
| [/human-in-the-loop](https://docs.copilotkit.ai/angular/mastra/guides/human-in-the-loop) | Working | Tool path is live; interrupt panel idles until the agent suspends a tool. The guide's `store().interruptController` section is unimplemented — that API is in no published build |
| [/shared-state](https://docs.copilotkit.ai/angular/mastra/guides/shared-state) | Working | |
| [/threads](https://docs.copilotkit.ai/angular/mastra/guides/threads-memory-attachments-headless) | Partial · premium | Thread endpoints need a CopilotKit Intelligence license |
| [/memory](https://docs.copilotkit.ai/angular/mastra/guides/threads-memory-attachments-headless) | Partial · premium | Runtime provides no memory routes, so `isAvailable()` is false |
| [/attachments](https://docs.copilotkit.ai/angular/mastra/guides/threads-memory-attachments-headless) | Working | |
| [/headless](https://docs.copilotkit.ai/angular/mastra/guides/threads-memory-attachments-headless) | Working | |

Route metadata lives in one place — [`src/app/lib/nav-config.ts`](src/app/lib/nav-config.ts).
The nav, route headers, and this table all describe a page exactly once.

## Known issues

**A2UI stays inert without a catalog.** `/api/copilotkit/info` reports
`a2uiEnabled: true`, but supplying `a2ui.catalog` is what actually registers the
`render_a2ui` renderer. The guide's catalog snippet is not self-contained, so
`app.config.ts` sets only `a2ui.recovery` and the A2UI route renders nothing.

**The guide's new `registerComponent` section runs, and its snippet is wrong
four ways.** The frontend-tools guide now opens with "Let the agent display one
of your components", which registers a standalone component as a display-only
tool — no `handler`, nothing on the agent side. The premise holds:
`show_incident` is declared by the browser, forwarded over AG-UI, and called by
the model with the Mastra agent definition untouched. Implemented verbatim at
`@copilotkit/angular` 0.5.1, the published snippet then fails four ways, all
reproduced against a live agent:

1. **Every call produces a second turn nobody asked for.** With no `handler`,
   core writes an empty tool result and the model is always handed another
   turn. What lands there is model-dependent: this repo's `gpt-5.4` emits
   filler ("Here it is.") under a card that already said everything, while the
   `gpt-4o-mini` sibling repos get a false apology contradicting the correct
   card above it. `followUp: false` removes the turn —
   `RegisterComponentConfig` carries the field and the guide never mentions it.
2. **The loading guard never fires.** It gates on `status === "in-progress"`;
   the observed status while arguments stream is `"executing"`, so the `@else`
   branch runs with empty args and paints a blank card before the values land.
3. **The status never reaches `"complete"`.** Sampled once a second for 25
   seconds: `"executing"` throughout. The `registerRenderToolCall` snippet
   higher up the same page gates its content on `"complete"`, so that
   documented pattern applied to a display-only tool loads forever.
4. **The card is not a card.** The snippet ships no CSS and pairs an inline
   `<strong>` with an inline `<span>`; Angular's default
   `preserveWhitespaces: false` strips the gap, so it renders as the unstyled
   run-together string `INC-4711sev1`.

Smaller gaps: the registration fence shows no imports, so `registerComponent`
and `z` are undefined identifiers as published; the section never says it must
run in an Angular injection context though the API reference requires one; and
the `description` you pass reaches the model behind a prepended preamble. Note
also that the two renderers on that one page disagree: the older "Render a tool
result" snippet imports `{ type AngularToolCall, type ToolRenderer }` and sets
no `standalone`, while the new one imports the same symbols as values and sets
`standalone: true` — which `frontend/AGENTS.md` forbids. Kept as published
either way, at
[`src/app/features/tools/incident-card.component.ts`](frontend/src/app/features/tools/incident-card.component.ts)
and in `tools-chat.component.ts`.

*Note, not a finding:* `registerComponent` does not exist in
`@copilotkit/angular` 0.4.0, which this repo declared until now, and `^0.4.0`
can never reach 0.5.x. The quickstart's unpinned install gives a new reader
0.5.1, so the frontend moved to `^0.5.1` (and `@copilotkit/runtime` to
`^1.70.1`, which 0.5.1 pins) to QA the section at all.

**`SandboxFunction` variance.** `openGenerativeUI.sandboxFunctions` is typed
`SandboxFunction[]`, i.e. `SandboxFunction<Record<string, unknown>>[]`, so the
`SandboxFunction<{ filter: string }>` is not assignable to it as
written. `app.config.ts` casts at the array site — the same idiom the docs use
for the equivalent `component` variance problem.

**Voice transcription fails by design.** The microphone control renders and
records, but no transcription service is configured on this runtime.

**The Inspector step says "on localhost"; the gate is dev mode.** The quickstart
closes with "On localhost, click the Inspector button in the corner of the app."
`@copilotkit/angular@0.4.0` mounts `cpk-web-inspector` for you, but only when
`shouldEnableInspector` sees `isBrowser && isDevelopment && enableInspector !==
false` — and `isDevelopment` is Angular's `isDevMode()`, not a hostname. Under
`ng serve` the button appears on `/quickstart/demo`; on the built bundle served
from `http://localhost` it appears nowhere, including on the same route. This
repo ships an SSR production server (`npm run serve:ssr:frontend`), so the step
is reproducibly wrong for anyone who follows it against a production build.

**Premium routes render locked states.** Threads and memory endpoints come from
the CopilotKit Intelligence Platform. Without a license key the list
stays empty and the drawer renders its locked state — that is the expected
result here, not a bug.

## Other commands

| Command | What it does |
| --- | --- |
| `npm run build` | Production build into `dist/frontend` |
| `npm run test` | Unit tests via [Vitest](https://vitest.dev/) |
| `npm run gen:sources` | Regenerate the source map the routes display |

Route pages show real code read off disk at build time, so what a page displays
is byte-identical to what runs. `gen:sources` produces that map and runs
automatically before `start` and `build`. Angular's esbuild pipeline has no
`?raw` import, which is why this is a prestep rather than an import.

## Changing the agent

The agent lives in [`../backend/src/mastra`](../backend/src/mastra). Edit
`agents/index.ts` to change the model, instructions, or tools; the runtime picks
up the change on restart.

If you rename the agent, update the `agentId` in
[`server.ts`](server.ts) to match the key it is registered under in
`backend/src/mastra/index.ts`.

## Doc drift detection

`/doc-sync` keeps this repo honest about the docs it mirrors. Press **Sync docs now** (on the landing page or on `/doc-sync`) and it fetches the markdown source behind all 9 tracked doc pages, diffs each against the copy stored in `doc-snapshot/`, replaces that copy, and reports what moved — ranked by whether the change can actually break an implementation.

Doc pages are fetched by appending `.md` to their URL, which returns the authored MDX rather than the rendered HTML. Every response is checked for `text/markdown` before it is allowed near the snapshot: a URL that misses the markdown handler still answers `200` with the HTML app shell, and writing that in would destroy the baseline. A run commits all pages or none.

**Severity is decided by where the edit landed**, not how big it was:

| Level | Trigger |
|---|---|
| **High** | a changed line inside a fenced code block, a changed fence count, or a page that now 404s and is gone from the sitemap |
| **Medium** | a changed heading, changed frontmatter `title`/`description`, or prose in the same section as changed code |
| **Low** | other prose |

**Sections checked** lists every tracked page in nav order with a mark — `✓` unchanged, `!` changed, `+` stored, `✗` 404, `~` unstable, `·` not checked. Expanding a row shows the comparison: for a changed page the diff (`−` existing snapshot, `+` newly fetched), and for an unchanged one the two matching hashes, which is the evidence the check ran.

**`doc-snapshot/CHANGELOG.md`** is the record that survives a re-sync. Because syncing replaces the copy it just compared against, the run *after* a change reports nothing — so the changelog is written at the moment of discovery and never rewritten later. Only changed pages are recorded; a clean run does not touch the file. It keeps the three most recent dated entries, counted rather than aged.

**One sync date.** `syncedAt` in `doc-snapshot/manifest.json`, rewritten on every run. There is no hand-maintained date to keep in step with it.

### How it is wired on Angular

Angular has no server-action equivalent, so the boundary is plain HTTP. Everything that fetches docs or touches the snapshot lives in `frontend/src/app/lib/doc-sync/` and is imported **only** from `frontend/src/server.ts`, which exposes two endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /api/doc-sync` | current manifest summary + the latest report |
| `POST /api/doc-sync/run` | runs the sync, returns the result |

They sit on the SSR server rather than the Copilot Runtime because that is the Angular app's own server: `ng serve` routes through it in development (`ssr.entry` in `angular.json`) and it ships in `dist/`, so the button works in both without a second process. The browser half is `DocSyncClient`, a root-provided service holding signals — nothing in the browser bundle imports `node:fs`, which the build verifies by never resolving those modules into `dist/browser`.

**To test it**, edit any `doc-snapshot/pages/*.md` file and press the button — a line inside a code fence for High, a `##` heading for Medium, a sentence for Low. The comparison reads the stored file itself, so nothing else needs changing. Both `/doc-sync` and the changelog label the result as a local snapshot edit rather than upstream drift.

Commit `doc-snapshot/` — `pages/`, `manifest.json` and `CHANGELOG.md` are the baseline every diff is taken against. `reports/` is gitignored.

---

## Automated Screen Recording Suite

Lives in [`autorecorder/`](autorecorder/) — a portable Playwright suite shared across CopilotKit framework repos and adapted to this one through `config/` and `actions/` only.
See [`autorecorder/README.md`](autorecorder/README.md) for the full contract.

### One command, from a cold repo

[`ci/`](ci/README.md) drives the whole thing — doc-drift check, preflight,
dependency install, both servers, recording and report — from a single Node
process, and is what the nightly GitHub Actions workflow runs:

```bash
npm run automate                              # everything, all pages
npm run automate -- --pages=quickstart,threads
npm run automate -- --limit=3 --ignore-doc-drift
```

It starts the servers itself. The commands below are the by-hand route, against
servers you started yourself.

### By hand

Once the runtime (`:8200`) and frontend dev server (`:4200`) are running:

```bash
cd autorecorder
npm install
npx playwright install chromium

npm run doctor            # validate the configuration (exits 1 on error)
npm run doctor:online     # also probe every doc/demo URL and the selectors
npm run record -- --list  # what will be recorded

# Record all pages in nav order
npm run record

# Record a specific page individually
npm run record -- --quickstart
npm run record -- --page=chat-ui
npm run record -- --filter=threads
```

Recordings are saved to `autorecorder/videos/`. That folder is gitignored as build output.

---

## Upgrading Packages

### Check first

```bash
node ci/check-versions.mjs
```

Read-only. It sorts what is outdated into the only three things it can be, and
just one of them is actionable here:

| Cause | Do |
|---|---|
| Our range is behind | Bump it — the steps below |
| An upstream package **exact-pins** an older version | Nothing. Report it upstream |
| A **peerDependency** forbids the newer one | Nothing. Bumping breaks the build |

`@copilotkit/angular` exact-pins `@copilotkit/core`, and Angular 22 requires
`typescript >=6.0 <6.1` — so TypeScript reads a full major behind and must stay
there. The nightly publishes this report on its own; see
[`ci/VERSION-WATCH.md`](ci/VERSION-WATCH.md).

### Then bump, on a branch

Each of the three workspaces is npm, and the ritual is the same for all of them
— `frontend`, `backend`, `autorecorder`:

```bash
git checkout -b chore/bump-<package>
npm --prefix <workspace> install <package>@<version>
git diff <workspace>/package-lock.json   # one bump can drag in dozens of transitives
npm --prefix frontend run build
```

Then record the affected pages before merging — verifying the docs still run is
what this repo is for. Revert with
`git checkout <workspace>/package-lock.json && npm ci`.

`frontend` and `backend` both resolve `@mastra/core`, and the runtime loads the
agent in-process, so bump them together or check that the version watch's
**Frontend / backend agreement** section still passes.

Two things not to do:

- **`npx npm-check-updates -u`** rewrites `package.json` to the newest release of
  everything, ignoring the ranges. It is the largest single source of CI failures
  in repos shaped like this one — it bumps all twelve `@angular/*` packages past
  Angular's exact inter-package peer requirements, leaving the tree
  unsatisfiable. Never schedule it. Dependabot is the safe alternative if
  PR-based automation is wanted.
- **`npm install --legacy-peer-deps`** does not fix a peer conflict, it hides
  one. The error it silences is the signal that the combination being installed
  was never meant to work together — precisely what this harness reports on.

