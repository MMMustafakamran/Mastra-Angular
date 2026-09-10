# Doc drift changelog

What the CopilotKit docs changed under this repo, written by the sync on
`/doc-sync`. Only pages that actually moved are recorded — a sync that finds
everything unchanged writes nothing here at all.

Holds the 3 most recent dated entries. When a change lands on a fourth
date, the oldest entry is dropped. Entries are counted, not aged, so a gap of
weeks between changes does not expire anything.

## 2026-08-30

### 13:43 UTC — 2 pages, highest severity low

**Low — Introduction**

`/angular/mastra` · routes `/`, `/doc-sync` · under “Open Inspector and confirm setup”

2 prose lines changed.

````diff
- Angular does not mount Inspector by default. First follow [Inspector for Angular](/angular/mastra/inspector). Then, on localhost, click the Inspector button.
+ On localhost, click the Inspector button in the corner of the app.
````

**Low — Quickstart**

`/angular/mastra/quickstart` · route `/quickstart` · under “Open Inspector and confirm setup”

2 prose lines changed.

````diff
- Angular does not mount Inspector by default. First follow [Inspector for Angular](/angular/mastra/inspector). Then, on localhost, click the Inspector button.
+ On localhost, click the Inspector button in the corner of the app.
````

---

## 2026-08-26

### 19:51 UTC — 3 pages, highest severity low

**Low — Introduction**

`/angular/mastra` · routes `/`, `/doc-sync` · under “Angular”

8 prose lines changed.

````diff
- body="Add durable threads, inspection, and managed or self-hosted Enterprise Intelligence without changing the Angular frontend APIs in this guide."
+ body="Add durable threads, inspection, and managed or self-hosted CopilotKit Intelligence without changing the Angular frontend APIs in this guide."
- - Angular 20, 21, or 22
+ - Angular 22
- If you don't have one already, pin the CLI to one of the supported majors. This example uses Angular 22:
+ If you don't have one already, pin the CLI to the supported major:
- - [Enterprise Intelligence](premium/overview): add durable threads, inspection, and cloud-hosted or self-hosted operations.
+ - [CopilotKit Intelligence](premium/overview): add durable threads, inspection, and cloud-hosted or self-hosted operations.
````

**Low — A2UI schemas, styling, and recovery**

`/angular/mastra/guides/a2ui` · route `/a2ui` · under “Angular support boundaries”

2 prose lines changed.

````diff
- - **Hashbrown is unsupported.** The stable Hashbrown Angular package does not support the complete Angular 20 through 22 policy.
+ - **Hashbrown is unsupported.** The stable Hashbrown Angular package does not support the Angular 22 policy.
````

**Low — Quickstart**

`/angular/mastra/quickstart` · route `/quickstart` · under “Angular”

8 prose lines changed.

````diff
- body="Add durable threads, inspection, and managed or self-hosted Enterprise Intelligence without changing the Angular frontend APIs in this guide."
+ body="Add durable threads, inspection, and managed or self-hosted CopilotKit Intelligence without changing the Angular frontend APIs in this guide."
- - Angular 20, 21, or 22
+ - Angular 22
- If you don't have one already, pin the CLI to one of the supported majors. This example uses Angular 22:
+ If you don't have one already, pin the CLI to the supported major:
- - [Enterprise Intelligence](premium/overview): add durable threads, inspection, and cloud-hosted or self-hosted operations.
+ - [CopilotKit Intelligence](premium/overview): add durable threads, inspection, and cloud-hosted or self-hosted operations.
````

---

---

## 2026-08-21

### 10:36 UTC — 3 pages, highest severity high

**High — Human-in-the-loop and interrupts**

`/angular/mastra/guides/human-in-the-loop` · route `/human-in-the-loop` · under “Human-in-the-loop and interrupts”

26 code lines, 3 headings, 26 prose lines changed. The number of fenced code blocks changed.

````diff
- | Interrupt | The backend agent emits an AG-UI interrupt | `injectInterrupt` |
+ | Interrupt | The backend agent emits an AG-UI interrupt | `AgentStore.interruptController`, `injectInterrupt` |
- ## Handle an interrupt
+ ## Handle an interrupt from the store
+ An interrupt is a state of one conversation: this agent, this thread, this run
+ is waiting for a decision. The store that already exposes that conversation's
+ messages and state exposes its pending interrupt too, so a component that holds
+ a store needs nothing else:
````

**Medium — Introduction**

`/angular/mastra` · routes `/`, `/doc-sync` · under “Run the backend, runtime, and Angular app”

1 heading, 11 prose lines changed.

````diff
+ <Step>
+ ### Open Inspector and confirm setup
+ 
+ Angular does not mount Inspector by default. First follow [Inspector for Angular](/angular/mastra/inspector). Then, on localhost, click the Inspector button.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
+ 3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
````

**Medium — Quickstart**

`/angular/mastra/quickstart` · route `/quickstart` · under “Run the backend, runtime, and Angular app”

1 heading, 11 prose lines changed.

````diff
+ <Step>
+ ### Open Inspector and confirm setup
+ 
+ Angular does not mount Inspector by default. First follow [Inspector for Angular](/angular/mastra/inspector). Then, on localhost, click the Inspector button.
+ 
+ 1. Open **Agents**, then **Agent**. Your agent is listed.
+ 2. Send a chat message. Open **Agents**, then **AG-UI Events**. Events are moving.
+ 3. Open **Threads**. The list is unlocked (Intelligence is on), or locked with Enable Intelligence (Intelligence is off).
````

---

---
