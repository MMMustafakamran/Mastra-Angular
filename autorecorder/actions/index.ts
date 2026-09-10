/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  ADAPT THIS DIRECTORY
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * What the recorder *does* on each demo page once it is open.
 *
 * The registry lives here rather than in `core/` on purpose: adding or removing
 * a page must never mean editing frozen code. A page with no entry falls back
 * to `runStandardAction` — type the prompt, submit, wait for the reply — which
 * is right for most pages. Write a handler only when a page needs more than
 * that: switching tabs, clicking an approval button, opening a panel.
 *
 * Handlers should build on the helpers in `core/actions.ts`:
 *
 *   sendPrompt(page, prompt, opts)          types and submits, returns the
 *                                           assistant-message count from before
 *                                           submitting
 *   waitForAgentResponseCompletion(...)     waits for the reply to finish, and
 *                                           throws if none ever arrives
 *   promptsFor(config)                      the page's prompts[] , or [prompt]
 *
 * Pass that returned count into waitForAgentResponseCompletion on multi-turn
 * pages, or the previous turn's reply is mistaken for this one's.
 *
 * The fourth argument, `ctx`, is how a handler reports what it saw:
 *
 *   ctx.warn('"Mark high priority" button not found')  -> [PASS*] with the note
 *   ctx.fail('approval card never rendered')           -> [FAIL], clip still saved
 *
 * A `console.warn` reaches nobody: the summary, videos/RECORD_RESULTS.json and
 * the CI report only see what goes through `ctx`.
 */

import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';
import { runStandardAction } from '../core/actions';
import { type Page } from 'playwright';

import { waitForPageReady } from './page-ready';

import { runA2uiAction } from './a2ui.action';
import { runAttachmentsAction } from './attachments.action';
import { runChatUiAction } from './chat-ui.action';
import { runHeadlessAction } from './headless.action';
import { runHitlAction } from './hitl.action';
import { runInspectorAction } from './inspector.action';
import { runMemoryAction } from './memory.action';
import { runSharedStateAction } from './shared-state.action';
import { runThreadsAction } from './threads.action';
import { runToolsAction } from './tools.action';
import { runVoiceAction } from './voice.action';

/** Keys are page ids from `config/pages.config.ts`. Doctor flags any orphans. */
export const ACTION_MAP: Record<string, PageActionHandler> = {
  // Quickstart, attachments-free and single-turn, is what runStandardAction is
  // for -- it is listed rather than omitted only to make that a decision.
  quickstart: runStandardAction,
  'chat-ui': runChatUiAction,
  'frontend-tools-generative-ui': runToolsAction,
  a2ui: runA2uiAction,
  'voice-multimodal': runVoiceAction,
  'human-in-the-loop': runHitlAction,
  'shared-state': runSharedStateAction,
  threads: runThreadsAction,
  memory: runMemoryAction,
  attachments: runAttachmentsAction,
  headless: runHeadlessAction,
  // The Inspector page's own subject is the panel, so the clip has to open
  // it. Falling through to runStandardAction here recorded a chat and
  // nothing else.
  inspector: runInspectorAction,
};

export async function executePageAction(
  page: Page,
  config: PageRecordConfig,
  rootPath: string,
  ctx: ActionContext,
): Promise<void> {
  // One gate for every page, including the ones that fall through to
  // runStandardAction. The engine waits for the route to respond and for
  // `chatReady` to be visible, but a dev server compiles client chunks lazily,
  // so markup can be on screen before anything is wired to it -- and a prompt
  // typed into an unhydrated input goes nowhere. Handlers that remount a chat
  // mid-run (tab switches) call waitForDomSettled again themselves.
  await waitForPageReady(page, { label: config.id });

  const handler = ACTION_MAP[config.id] ?? runStandardAction;
  await handler(page, config, rootPath, ctx);
}
