/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS FILE — 3 of 3
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * One entry per doc page, in the order the doc nav lists them.
 *
 * Entries are deliberately short. `docUrl`, `demoUrl` and the output filename
 * are derived from `project.config.ts` plus the fields below, so no entry can
 * point at the wrong framework's docs and filenames stay in nav order without
 * anyone numbering them by hand.
 *
 * Adapting means: delete the pages this framework does not document, add the
 * ones it does, and fix the line ranges. `npm run doctor` then tells you which
 * ranges no longer point at real code.
 *
 * ── Scope, for this repo ───────────────────────────────────────────────────
 * `route` + `demoSuffix` is the only demo URL a page can have, and the doctor
 * errors on any that is not 200. Exactly the eleven routes carrying
 * `hasDemo: true` in nav-config are registered below. The Introduction landing
 * page (`/`) and the `/doc-sync` drift report have no `/demo` of their own and
 * are deliberately absent rather than registered and broken.
 *
 * Everything here mirrors `frontend/src/app/lib/nav-config.ts`, the app's single
 * source of truth for route -> doc-page mapping. `docPath` is that file's
 * `docPath` minus its leading `/angular/mastra`. Four routes (threads, memory,
 * attachments, headless) repeat one `docPath` because the Angular docs cover all
 * four topics on a single page — that is the doc's shape, not a copy/paste slip.
 *
 * ── The line ranges ────────────────────────────────────────────────────────
 * `startLine`/`endLine` are what the simulated IDE highlights. They are
 * hardcoded, so they drift the moment someone edits a demo component. Doctor
 * guards ranges where a file carries `[!code highlight]` or `#region` markers —
 * this frontend carries none, so every range below is unguarded: `npm run
 * doctor` proves each range is in-bounds, not that it still frames the code the
 * page is about. Adding `#region` markers to the demo components would restore
 * the guard.
 */

import { definePages } from '../core/types';

export const PAGES = definePages([
  {
    id: 'quickstart',
    name: 'Quickstart',
    videoName: 'Quickstart',
    docPath: 'quickstart',
    route: 'quickstart',
    // Dependency manifest first, always: a demo means nothing without the
    // versions it ran against, and @copilotkit/angular is a 0.x package that
    // moves faster than its docs do.
    // Leads with the versions, not the manifest. package.json declares
    // RANGES, so this clip used to show a floor while the run it
    // documented had installed something newer. VERSIONS.md is generated
    // after install (ci/write-versions.mjs) and names what resolved.
    // package.json stays as the first tab: the range is still what a
    // reader would write in their own project.
    ideFile: 'frontend/VERSIONS.md',
    startLine: 6,
    endLine: 20,
    // Then the path itself: the chat component, the Node process hosting the
    // runtime (Angular has no server route to host it in), and the Mastra agent
    // that runtime imports as source and runs in its own process.
    extraTabs: [
      {
        filePath: 'frontend/package.json',
        startLine: 19,
        endLine: 40,
      },
      {
        filePath: 'frontend/src/app/features/quickstart/quickstart-chat.ts',
        startLine: 8,
        endLine: 20,
      },
      { filePath: 'frontend/server.ts', startLine: 23, endLine: 43 },
      {
        filePath: 'backend/src/mastra/agents/index.ts',
        startLine: 6,
        endLine: 27,
      },
    ],
    prompt: 'Hey, are you connected? Tell me a quick fun fact about kites.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'chat-ui',
    name: 'Guides - Chat UI and customization',
    videoName: 'ChatUi',
    docPath: 'guides/chat-ui',
    route: 'chat-ui',
    ideFile: 'frontend/src/app/features/chat-ui/chat-ui-demo.component.ts',
    startLine: 28,
    endLine: 56,
    // The replaced assistant message is the guide's actual lesson; the wrapper
    // above only chooses which surface is mounted.
    extraTabs: [
      {
        filePath:
          'frontend/src/app/features/chat-ui/custom-assistant-message.component.ts',
        startLine: 13,
        endLine: 25,
      },
    ],
    // Four surfaces, driven in order by the handler: inline, custom assistant
    // message, popup, sidebar. Only the first two take a prompt.
    prompt: 'In two sentences, what does CopilotKit do?',
    prompts: [
      'In two sentences, what does CopilotKit do?',
      'Nice layout. What is different about how you are rendered here?',
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: 'frontend-tools-generative-ui',
    name: 'Guides - Frontend tools and generative UI',
    videoName: 'FrontendToolsGenerativeUi',
    docPath: 'guides/frontend-tools-generative-ui',
    route: 'frontend-tools-generative-ui',
    ideFile: 'frontend/src/app/features/tools/tools-chat.component.ts',
    // The class declaration through its closing brace: all three of the
    // guide's paths in one frame, now that registerComponent is a live call
    // rather than a commented-out stand-in. Re-counted after that swap.
    startLine: 55,
    endLine: 77,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/tools/weather-card.component.ts',
        startLine: 10,
        endLine: 27,
      },
      // The guide's "Let the agent display one of your components" renderer,
      // verbatim. Its `@if (call.status === "in-progress")` guard is the second
      // finding on camera: the real status is "executing", so the guard never
      // fires and the @else branch paints an empty card until the args land.
      {
        filePath: 'frontend/src/app/features/tools/incident-card.component.ts',
        startLine: 10,
        endLine: 27,
      },
    ],
    // Three turns: a server-side tool the browser only renders, a frontend tool
    // whose result is the page itself repainting, and the new display-only
    // registration — which draws the right card and then makes the agent
    // apologise for it.
    prompt: 'Check the weather in Tokyo for me.',
    prompts: [
      'Check the weather in Tokyo for me.',
      'Could you change the background to violet?',
      'Pull up incident INC-4711 for me. It is a sev1.',
    ],
    waitAfterPromptMs: 4000,
  },
  {
    id: 'a2ui',
    name: 'Guides - A2UI schemas, styling, and recovery',
    videoName: 'A2ui',
    docPath: 'guides/a2ui',
    route: 'a2ui',
    ideFile: 'frontend/src/app/features/a2ui/a2ui-chat.component.ts',
    startLine: 1,
    endLine: 22,
    // `a2ui: {}` on the CopilotRuntime is the whole server-side story.
    extraTabs: [{ filePath: 'frontend/server.ts', startLine: 29, endLine: 43 }],
    // Recorded as a documented finding rather than a working demo: the renderer
    // only registers once `a2ui.catalog` is supplied, and the guide's catalog
    // snippet is not self-contained. The handler reads the doc and writes the
    // gaps up in Notepad instead of prompting — see actions/a2ui.action.ts.
    // The prompt is kept so the entry stays valid and so re-enabling the chat
    // turn is a one-line change once a catalog exists.
    prompt: 'Could you show me a card that compares two flight options?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'voice-multimodal',
    name: 'Guides - Voice and multimodal input',
    videoName: 'VoiceMultimodal',
    docPath: 'guides/voice-multimodal',
    route: 'voice-multimodal',
    ideFile: 'frontend/src/app/features/media/voice-chat.component.ts',
    startLine: 10,
    endLine: 27,
    // The guide's walkthrough is attach-then-microphone, so the clip does both.
    // The prompt asks for values that exist only inside the attached chart, so
    // the reply is evidence the file reached the model rather than something
    // answerable from the system prompt. The microphone then records, and this
    // runtime configures no transcription service, so transcription fails by
    // design — the handler shows that and says so.
    prompt: 'Have a look at the chart I attached. What is it titled, and what does Q4 come to?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'human-in-the-loop',
    name: 'Guides - Human-in-the-loop and interrupts',
    videoName: 'HumanInTheLoop',
    docPath: 'guides/human-in-the-loop',
    route: 'human-in-the-loop',
    // The registration is the lesson; the card is what the viewer clicks.
    ideFile: 'frontend/src/app/features/hitl/approval-tools.service.ts',
    startLine: 13,
    endLine: 26,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/hitl/approval-card.component.ts',
        startLine: 16,
        endLine: 39,
      },
    ],
    prompt: 'Please delete my account. Check with me before you actually do it.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'shared-state',
    name: 'Guides - Shared state and agent context',
    videoName: 'SharedState',
    docPath: 'guides/shared-state',
    route: 'shared-state',
    ideFile: 'frontend/src/app/features/shared-state/workspace.component.ts',
    startLine: 19,
    endLine: 48,
    extraTabs: [
      {
        filePath:
          'frontend/src/app/features/shared-state/account-context.component.ts',
        startLine: 9,
        endLine: 31,
      },
    ],
    // Both halves of the guide in one question: `priority` is agent *state*,
    // written from the browser; `userName`/`timezone` are read-only *context*.
    // The earlier "what notes do I have?" was unanswerable -- the notes array is
    // always empty here, so the agent had nothing to be right about.
    prompt:
      'Remind me: what is my username, my timezone, and my workspace priority?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'threads',
    name: 'Threads',
    videoName: 'Threads',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'threads',
    ideFile: 'frontend/src/app/features/threads/thread-list.component.ts',
    startLine: 8,
    endLine: 40,
    extraTabs: [
      {
        filePath: 'frontend/src/app/features/threads/threads-demo.component.ts',
        startLine: 10,
        endLine: 35,
      },
    ],
    // Thread endpoints are licensed. Unlicensed, the hand-built list stays empty
    // and the drawer renders its locked state — which is the expected result,
    // and what this recording documents. The chat beside it answers normally.
    prompt: 'In one line, what are threads for?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'memory',
    name: 'Memory',
    videoName: 'Memory',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'memory',
    ideFile: 'frontend/src/app/features/memory/memory-list.component.ts',
    startLine: 9,
    endLine: 30,
    // isAvailable() is false against this runtime, so the guide's fallback is
    // what renders. The handler rests on it before prompting the chat beside it.
    prompt: 'Just so you know for later: I am working on an Angular 22 project.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'attachments',
    name: 'Attachments',
    videoName: 'Attachments',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'attachments',
    ideFile: 'frontend/src/app/features/attachments/media-chat.component.ts',
    startLine: 9,
    endLine: 23,
    // Asks for two values that exist only inside the attached image, so a
    // correct answer is proof the file reached the model. The old
    // "what types of attachments are supported?" could be answered from the
    // system prompt alone, which is why a broken upload looked fine on video.
    prompt:
      'I attached a chart. What is its title, and what is the Q4 number?',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'headless',
    name: 'Headless UI',
    videoName: 'HeadlessUi',
    docPath: 'guides/threads-memory-attachments-headless',
    route: 'headless',
    ideFile: 'frontend/src/app/features/headless/headless-chat.component.ts',
    startLine: 10,
    endLine: 60,
    prompt: 'Tell me a short joke about Angular developers.',
    waitAfterPromptMs: 4000,
  },
  {
    id: 'inspector',
    name: 'Inspector',
    videoName: 'Inspector',
    docPath: 'inspector',
    route: 'inspector',
    // Appended rather than placed in nav order: the clip index is the position
    // in this array, so inserting Inspector after Quickstart would renumber
    // every later clip in this repo and desync the numbering from the sibling
    // repos that document the same guides in the same order. See the reserved
    // clip numbers above -- same concern, opposite direction.
    // The chat is the whole demo component, and its emptiness is the evidence:
    // it mounts no Inspector, yet the launcher is there.
    ideFile: 'frontend/src/app/features/inspector/inspector-chat.component.ts',
    startLine: 18,
    endLine: 29,
    extraTabs: [
      // The mount check the clip reads on screen -- it counts the elements in
      // the document and names which of the guide's three cases it found.
      {
        filePath:
          'frontend/src/app/features/inspector/inspector-probe.component.ts',
        startLine: 143,
        endLine: 151,
      },
      // enableInspector is the only switch the page documents, and this
      // provider block deliberately does not set it -- the default-on
      // development behaviour is the state the guide describes.
      {
        filePath: 'frontend/src/app/app.config.ts',
        startLine: 51,
        endLine: 64,
      },
    ],
    // The quickstart's Inspector step is not satisfied by a static panel: it
    // asks the reader to send a message and watch AG-UI events move, so the
    // run has to happen before the panel is opened.
    prompt: 'Quick check: what is 17 times 23?',
    waitAfterPromptMs: 4000,
  },
]);
