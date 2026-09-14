/**
 * The nav, every route header, the demo links, and the README status table all
 * read from here, so a doc page and its implementation status are described
 * exactly once.
 *
 * Groups mirror the sidebar at https://docs.copilotkit.ai/angular/mastra as of
 * DOC_SYNC_DATE. The last doc page covers four topics at once; it is split into
 * four routes here, which all point back at the same `docPath`.
 */

/**
 * There is exactly one doc-sync date in this repo, and it is not here: it is
 * `syncedAt` in `doc-snapshot/manifest.json`, written every time the sync
 * button runs. A hand-maintained date alongside it only ever drifted out of
 * agreement with the machine one, so it was removed — `/doc-sync` is the
 * single place that answers "how current are these docs".
 */
export const DOCS_ROOT = 'https://docs.copilotkit.ai/angular/mastra';

/**
 * working   — implemented and exercisable against the local stack.
 * partial   — implemented, but something outside this repo limits it
 *             (a premium license, a runtime capability this repo does not run).
 * reference — intentionally not a live feature; notes surface only.
 * broken    — implemented but currently failing.
 */
export type RouteStatus =
  | 'working'
  | 'partial'
  | 'reference'
  | 'broken'
  | 'not-started';

export interface RouteMeta {
  /** App route path. */
  path: string;
  /** Nav label. */
  title: string;
  /** Doc page this route tests, relative to docs.copilotkit.ai. */
  docPath: string;
  /** One-line description in our own words. */
  summary: string;
  status: RouteStatus;
  /** Shown in the route header when the status is not plain "working". */
  statusNote?: string;
  /** Feature requires a CopilotKit Intelligence license. */
  premium?: boolean;
  /**
   * This route owns a live interactive surface, which lives at `<path>/demo`
   * rather than on the page itself. The doc route keeps the explanation and the
   * source; the demo route is chrome-free so it can be screen-recorded alone.
   */
  hasDemo?: boolean;
}

/** Where a route's interactive demo lives, if it has one. */
export function demoPath(route: RouteMeta): string | undefined {
  if (!route.hasDemo) return undefined;
  return route.path === '/' ? '/demo' : `${route.path}/demo`;
}

export interface NavGroup {
  title: string;
  routes: RouteMeta[];
}

export const NAV: NavGroup[] = [
  {
    title: 'Getting Started',
    routes: [
      {
        path: '/',
        title: 'Introduction',
        docPath: '/angular/mastra',
        summary:
          'What this harness covers and how the three processes fit together.',
        status: 'reference',
        statusNote: 'Landing page — orientation and a live connection check.',
      },
      {
        path: '/quickstart',
        hasDemo: true,
        title: 'Quickstart',
        docPath: '/angular/mastra/quickstart',
        summary:
          'The smallest end-to-end path: a MastraAgent bound to the Mastra backend in Copilot Runtime, provideCopilotKit, and one copilot-chat.',
        status: 'working',
      },
      {
        path: '/inspector',
        hasDemo: true,
        title: 'Inspector',
        docPath: '/angular/mastra/inspector',
        summary:
          'The Inspector @copilotkit/angular mounts for you as of 0.4.0 — nothing to install, nothing to mount, and nothing to retract here.',
        status: 'working',
      },
    ],
  },
  {
    title: 'Guides',
    routes: [
      {
        path: '/chat-ui',
        hasDemo: true,
        title: 'Chat UI and customization',
        docPath: '/angular/mastra/guides/chat-ui',
        summary:
          'The four chat surfaces, a replaced assistant-message component, and scoped chat CSS.',
        status: 'working',
      },
      {
        path: '/frontend-tools-generative-ui',
        hasDemo: true,
        title: 'Frontend tools and generative UI',
        docPath: '/angular/mastra/guides/frontend-tools-generative-ui',
        summary:
          'A server-side tool call rendered by an Angular component, plus the sandboxed Open Generative UI path.',
        status: 'partial',
        statusNote:
          'All three of the guide’s generative-UI paths are live, including registerComponent, which declares show_incident from the browser with no change to the Mastra agent definition. The new first section runs, and its published snippet is wrong in four ways. It carries no handler, so core writes an empty tool result and the model is always handed a second turn nobody asked for — filler here on gpt-5.4, a false apology on the gpt-4o-mini sibling repos. followUp: false removes it and the guide never mentions followUp. It guards on status "in-progress" while the real status is "executing", so the guard never fires and the card paints empty first. The status never reaches "complete" at all, so the gate-on-complete pattern taught higher up the same page would load forever here. And it ships no CSS, so with Angular’s default preserveWhitespaces the card renders as the run-together string INC-4711sev1. Everything is kept verbatim — see Known issues.',
      },
      {
        path: '/a2ui',
        hasDemo: true,
        title: 'A2UI schemas, styling, and recovery',
        docPath: '/angular/mastra/guides/a2ui',
        summary:
          'Declarative generative UI driven by the runtime A2UI middleware, with the guide’s recovery thresholds and catalog CSS.',
        status: 'partial',
        statusNote:
          'Inert until a catalog is supplied. /info reports a2uiEnabled: true, but supplying a2ui.catalog is what actually registers the render_a2ui renderer — and the guide’s catalog snippet is not self-contained. See Known issues.',
      },
      {
        path: '/voice-multimodal',
        hasDemo: true,
        title: 'Voice and multimodal input',
        docPath: '/angular/mastra/guides/voice-multimodal',
        summary:
          'The built-in microphone control, an attachments config, and a programmatically constructed multimodal message.',
        status: 'partial',
        statusNote:
          'The microphone renders and records, but this repo’s runtime has no transcription service configured, so transcription fails by design.',
      },
      {
        path: '/human-in-the-loop',
        hasDemo: true,
        title: 'Human-in-the-loop and interrupts',
        docPath: '/angular/mastra/guides/human-in-the-loop',
        summary:
          'A decision tool that pauses the run until the user answers, plus a headless interrupt controller.',
        status: 'working',
        statusNote:
          'The tool path is live. The interrupt panel is mounted but stays idle unless the agent emits an AG-UI interrupt. The guide’s newer store().interruptController section is not implemented: that member ships in no published @copilotkit/angular build — see Known issues.',
      },
      {
        path: '/shared-state',
        hasDemo: true,
        title: 'Shared state and agent context',
        docPath: '/angular/mastra/guides/shared-state',
        summary:
          'Reading and writing agent state through injectAgentStore, and publishing read-only app context two ways.',
        status: 'working',
      },
    ],
  },
  {
    title: 'Threads, memory, attachments, headless',
    routes: [
      {
        path: '/threads',
        hasDemo: true,
        title: 'Threads',
        docPath: '/angular/mastra/guides/threads-memory-attachments-headless',
        summary:
          'A hand-built thread list on injectThreads, and the drop-in CopilotThreadsDrawer beside a chat.',
        status: 'partial',
        premium: true,
        statusNote:
          'Thread endpoints come from the CopilotKit Intelligence Platform. Unlicensed, the list stays empty and the drawer renders its locked state — which is the expected result here.',
      },
      {
        path: '/memory',
        hasDemo: true,
        title: 'Memory',
        docPath: '/angular/mastra/guides/threads-memory-attachments-headless',
        summary:
          'injectMemories with the isAvailable() gate the guide requires before showing memory controls.',
        status: 'partial',
        premium: true,
        statusNote:
          'This runtime does not provide the memory routes, so isAvailable() is false and the guide’s fallback message is what renders.',
      },
      {
        path: '/attachments',
        hasDemo: true,
        title: 'Attachments',
        docPath: '/angular/mastra/guides/threads-memory-attachments-headless',
        summary:
          'An AttachmentsConfig bound to copilot-chat, with the file picker, drag-and-drop, and paste.',
        status: 'working',
      },
      {
        path: '/headless',
        hasDemo: true,
        title: 'Headless UI',
        docPath: '/angular/mastra/guides/threads-memory-attachments-headless',
        summary:
          'A transcript and composer built from scratch on injectAgentStore and CopilotKitCore.runAgent.',
        status: 'working',
      },
    ],
  },
  {
    title: 'Doc Sync',
    routes: [
      {
        path: '/doc-sync',
        title: 'Doc drift',
        docPath: '/angular/mastra',
        summary:
          'Re-fetches the markdown behind every tracked doc page and diffs it against the stored snapshot, flagging changes inside code blocks.',
        status: 'reference',
      },
    ],
  },
];

export const ALL_ROUTES: RouteMeta[] = NAV.flatMap((g) => g.routes);

export function findRoute(path: string): RouteMeta | undefined {
  return ALL_ROUTES.find((r) => r.path === path);
}

export function docUrl(route: RouteMeta): string {
  return `https://docs.copilotkit.ai${route.docPath}`;
}

export const STATUS_LABEL: Record<RouteStatus, string> = {
  working: 'Working',
  partial: 'Partial',
  reference: 'Reference',
  broken: 'Broken',
  'not-started': 'Not started',
};
