# Version Watch — scenario and rationale

Implemented by `ci/check-versions.mjs` and `.github/workflows/version-watch.yml`.

## The scenario

This repo is a QA harness for **CopilotKit's Angular client** against a
**Mastra** agent, verifying that documented code snippets actually run. That
makes dependency versions part of the subject under test, not background
maintenance.

Four independently-released trains meet here:

| Layer | Package | Train |
|---|---|---|
| Angular client | `@copilotkit/angular` | `0.x` |
| JS core / runtime | `@copilotkit/core`, `@copilotkit/runtime` | `1.x` |
| Wire protocol | `@ag-ui/*` | `0.0.x` |
| Agent framework | `@mastra/*` | `1.x` |

They do not move together. As of 2026-08-31:

- `@copilotkit/angular@0.4.0` (latest) **exact-pins** `@copilotkit/core@1.69.3`,
  `@copilotkit/shared@1.69.3`, `@copilotkit/a2ui-renderer@1.69.3`,
  `@copilotkit/web-components@1.69.3` and `@copilotkit/web-inspector@1.69.3`,
  which is the line `@copilotkit/runtime` is on. The client caught up with core
  in this release.
- `@copilotkit/core` therefore appears **once** in the frontend tree, where it
  appeared twice through `0.3.1`. That release exact-pinned the `1.66.0` line
  while the `channels-*` packages reached through `@copilotkit/runtime` asked
  for a newer one; no single version satisfied both, so npm nested a private
  copy for each side and the Angular app and the Node runtime ran different
  cores. **Do not read the single copy as permanent** — it holds only while the
  two exact pins agree, and the next `@copilotkit/angular` that lags core
  splits the tree again. The split is the thing to watch for; its absence today
  is a data point, not a fix.
- `@ag-ui/client` and `@ag-ui/core` are declared here as **`0.0.x`** — a
  wildcard, not a caret. It floats to whatever `0.0.x` is newest, while
  `@copilotkit/*` **exact-pins** `0.0.57`. Every re-resolve that lands a newer
  patch therefore puts our direct copy on one version and CopilotKit's nested
  copy on another.
- The agent is pinned to exact `@mastra/*` versions in `backend/package.json`
  while the frontend carries carets on the same packages, so the two halves of
  one process can drift apart on their own.

So the daily question is not "am I up to date." It is:

> **Did the version skew between these projects change today?**

## What the nightly already did, and what was missing

`ci/automate.mjs` **drops the lockfiles and re-resolves** on every run
(`--use-lockfile` opts back out, off by default). Three npm workspaces here —
`backend/`, `frontend/`, `autorecorder/` — all re-resolved. So the recorders
already test the newest versions the declared ranges allow, but silently. The
resolution was discarded, so:

- a broken recording could be our code or a dependency bump, with no way to tell;
- a clean run never revealed what had moved;
- nothing could see **past** the range boundary, which is where every real
  question in this repo lives.

The watch adds the record and the out-of-reach view. It changes nothing about
what gets installed or recorded.

## Why versions can be behind — three causes

Only one is ours to act on, so the report **classifies** rather than lists.

| # | Cause | Actionable? | Detected by |
|---|---|---|---|
| 1 | Upstream **exact pin** (`"@copilotkit/core": "1.69.3"`) | No — report upstream | `npm view <pkg> dependencies` |
| 2 | **peerDependency** range (Angular 22 needs `typescript >=6.0 <6.1`) | No — correct as-is | dry-run peer/`ERESOLVE` |
| 3 | Our own range is behind | **Yes — bump by hand** | `npm outdated`, dry-run clean |

Treating `npm outdated`'s `Latest` column as a to-do list is the failure mode:
TypeScript reads as a full major behind (`~6.0.2` vs `7.0.2`), but bumping it
breaks the Angular build.

**npm decides the bucket, not a hardcoded list.** For anything past the range
boundary the script runs `npm install <pkg>@latest --dry-run
--package-lock-only`, which writes nothing. `ERESOLVE` means a peer range or an
exact pin forbids the upgrade — and the message names the blocker. Success means
it is simply a range we have not bumped.

### One trap inside that trap

Exit status alone is **not** enough to bucket a package. Angular declares
TypeScript as a `peerOptional`:

```
npm warn Could not resolve dependency:
npm warn peerOptional typescript@">=6.0 <6.1" from @angular/compiler-cli@22.1.3
```

An unmet *optional* peer does not fail resolution. npm warns and exits **0**, so
a naive reading of the dry run files TypeScript 7 under "ours to bump" — the
exact recommendation that breaks the build. `peerBlockerFor()` therefore scans
the output for both `peer` and `peerOptional` conflicts naming the package being
upgraded, whether or not the command succeeded.

## What the job does

1. **Snapshot + diff** — writes `ci/resolved-versions.json` across all three npm
   workspaces and reports what moved since the previous run.
2. **Classified `npm outdated`**, for the frontend **and** the backend — the
   agent is a Node project here, not a Python one, so `npm outdated` reaches it.
   Packages where `wanted === latest` are folded away, since the next re-resolve
   picks those up unprompted; only what sits past the boundary gets a dry-run.
3. **Upstream pin probe** — what the newest `@copilotkit/angular`,
   `@copilotkit/runtime` and `@ag-ui/mastra` force on consumers, dependencies
   and peerDependencies both. `npm outdated` cannot see these: they are
   transitive, so they never appear as something we asked for.
4. **Fragmentation** — multiple copies of `@ag-ui/client`, `@ag-ui/core` or
   `@copilotkit/core` in one tree, and who pulled each.
5. **Frontend / backend agreement** — `@mastra/core`, `@mastra/client-js` and
   `zod` compared across the two lockfiles. The runtime imports the agent as
   source and runs it in-process, so a mismatch here is the same class of fault
   as two `@ag-ui` copies in one tree — but split across two lockfiles, where
   the per-tree fragmentation scan cannot see it.

### Design decisions

- **Snapshot committed, not stored as an artifact.** Artifacts expire and are
  not diffable across runs. Committed, `git log -p ci/resolved-versions.json`
  *is* the timeline, and each recording is tied to the versions that produced it.
- **A separate workflow, not folded into the recorder.** It is sharded 3x, so an
  inline check would run three times — and three independent re-resolves can
  disagree about what "today's versions" are. One job, one resolve, one answer.
- **Not in the recorder's `needs:`.** A moved pin is news, not a build failure;
  demos must still record.
- **`contents: write`, scoped by the commit step** to `ci/resolved-versions.json`
  alone. `package.json` and the lockfiles are never touched. This is a real
  concession — a pure read-only job would be safer — accepted because git history
  is what makes the timeline worth having.
- **Commits only on `schedule`.** Manual runs report without writing history.
- **A rejected push warns, it does not fail.** If `main` is protected the push
  is refused; that is a repo-settings answer, not a broken run, and the report
  is already published by then. The summary says so and the job stays green.
- **A failed probe reports loudly.** If `npm outdated` returns nothing
  parseable, or a registry read comes back empty, the report says *unknown*,
  never *clean*. Silence that reads as an all-clear is the one lie this job
  cannot tell.
- **No `ncu -u` on a schedule.** It rewrites `package.json` to `Latest`
  wholesale, ignoring declared ranges — exactly the cause-2 breakage above.
  Dependabot is the safe alternative if PR-based automation is wanted later.

### Three implementation notes worth keeping

- **npm runs through a shell.** On Windows `npm` is a `.cmd` shim and, since the
  CVE-2024-27980 mitigation, Node refuses to `execFile` one (`EINVAL`) — which
  fails quietly enough to look like an all-clear.
- **`npm view <pkg> <field> --json` has two shapes.** It may return the object,
  or that object wrapped in a single-element array. Read naively the array form
  renders as *no pins declared* — a clean-looking report of nothing. `viewObject()`
  normalises it.
- **`^` narrows as the major approaches zero:**

  | Range | Allows |
  |---|---|
  | `^1.69.0` | `>=1.69.0 <2.0.0` |
  | `^0.3.1` | `>=0.3.1 <0.4.0` |
  | `^0.0.58` | **only `0.0.58`** |
  | `0.0.x` | **any `0.0.*`** — what this repo declares |

  Note the last row: unlike its sibling repos, this one uses a wildcard rather
  than a caret for `@ag-ui/client` and `@ag-ui/core`, so those two *do* float —
  straight past the version `@copilotkit/*` exact-pins. Floating is what
  produces the split, not what prevents it.

## The limit that cannot be engineered away

Re-resolving only ever reaches the range boundary. It never produced
`@copilotkit/core@1.69.3` in the Angular client while `^0.3.1` was declared —
not because core was out of reach, but because the client that pins it was:
`^0.3.1` stops at `<0.4.0`, and `0.4.0` is the release that moved the pin.
Nor should it ever produce TypeScript 7 (Angular forbids it). Crossing the
boundary is a human edit:

```bash
git checkout -b chore/bump-<pkg>
npm --prefix frontend install <pkg>@<version>
git diff frontend/package-lock.json   # one bump can drag in dozens of transitives
npm --prefix frontend run build
# then run the harness — that is what this repo is for
```

Revert is always `git checkout frontend/package-lock.json && npm ci`.

## Running it locally

```bash
node ci/check-versions.mjs             # report only, writes nothing
node ci/check-versions.mjs --snapshot  # also rewrite ci/resolved-versions.json
```

The dry-run classification makes one network round trip per out-of-range
package, so a cold local run takes a few minutes.

**The first snapshot must be established in CI, not locally.** A baseline
resolved on a dev machine diffs against a Linux runner as hundreds of phantom
changes — platform binaries and optional deps that were never really there. Run
the workflow once with **Commit the resolved-version snapshot** ticked to
establish it; the first diff after that is the first real one.
