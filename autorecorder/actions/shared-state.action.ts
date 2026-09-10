/**
 * Shared state — recorded as a documented finding, not as a working demo.
 *
 * https://docs.copilotkit.ai/angular/mastra/guides/shared-state
 *
 * Two browser-side writes happen before the prompt, and both are what make the
 * answer evidence rather than a plausible sentence:
 *
 * - "Mark high priority" writes agent *state*, so "high" can only come back if
 *   the write reached the agent.
 * - "Use London time" changes a signal the read-only *context* accessor reads,
 *   so "Europe/London" can only come back if the context re-registered.
 *
 * Both values leave the browser correctly and neither reaches the model, so the
 * agent answers that it has no access to them while the panel beside it shows
 * "Priority: high". That contradiction is the finding, and it is only
 * demonstrable by asking — so the prompt is still sent, the wrong answer is left
 * on screen, and the Notepad note explains it with the panel still visible
 * behind. Verified against @copilotkit/runtime 1.67.1, @ag-ui/mastra 1.1.1,
 * @mastra/core 1.58.0 by replaying one captured payload against a patched agent.
 *
 * The prompt deliberately does not ask about `notes`: that array is always empty
 * in this demo, so it gave the agent nothing to be right or wrong about.
 */
import { type Page } from 'playwright';

import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { SELECTORS } from '../config/selectors.config';
import { humanClick, humanGlide, sleep } from '../core/overlays/cursor';
import { type ActionContext, type PageActionHandler, type PageRecordConfig } from '../core/types';

import { closeNotepadNote, openNotepadWindow, typeInNotepad } from './notepad';

/** Clicks one of the demo's write buttons, if it is on screen. */
async function clickWrite(ctx: ActionContext, page: Page, selector: string, label: string): Promise<void> {
  const button = page.locator(selector).first();
  const box = await button.boundingBox().catch(() => null);
  if (!box) {
    ctx.warn(`"${label}" not found -- the agent read the default value instead of a written one.`);
    return;
  }
  await humanGlide(page, box.x + box.width / 2, box.y + box.height / 2, 20);
  await sleep(400);
  await humanClick(page);
  await sleep(1000);
}

export const runSharedStateAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
  _rootPath,
  ctx,
) => {
  console.log(`   🔄 Writing state from the browser first...`);
  await clickWrite(ctx, page,
    'app-workspace button:has-text("Mark high priority")',
    'Mark high priority',
  );

  // Second write: a signal the context accessor reads, so the re-registration
  // would be observable in the same answer.
  console.log(`   🌍 Switching the account timezone to Europe/London...`);
  await clickWrite(ctx, page,
    'app-account-context button:has-text("Use London time")',
    'Use London time',
  );

  const msgCount = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  // Did either half actually arrive? Read the answer rather than assume it.
  const answer = (
    await page
      .locator(SELECTORS.assistantMessage)
      .last()
      .innerText()
      .catch(() => '')
  ).toLowerCase();

  // Word boundaries, not substrings: the refusal this page exists to document
  // says "profile metadata", and "metadata" contains "ada", which scored a
  // denial as a delivered context.
  const sawState = /\bhigh\b/.test(answer);
  const sawContext = /\bada\b/.test(answer) || /\blondon\b/.test(answer);
  console.log(
    `   · Answer carries state: ${sawState ? 'yes' : 'NO'}, context: ${sawContext ? 'yes' : 'NO'}`,
  );

  // Put the written state and the answer that denies it in one frame, so the
  // contradiction is on screen before the note explains it.
  const workspace = page.locator('app-workspace').first();
  const wsBox = await workspace.boundingBox().catch(() => null);
  if (wsBox) {
    console.log(`   🎯 Resting on the panel the answer contradicts.`);
    await humanGlide(page, wsBox.x + wsBox.width / 2, wsBox.y + wsBox.height / 2, 22);
    await sleep(2500);
  }

  // Sized to the note, not to the page: five scribbled lines in a 600px-tall
  // window reads as an empty document someone forgot to finish.
  await openNotepadWindow(page, 'shared-state-notes.txt', {
    right: '32px',
    top: '110px',
    width: '660px',
    height: '250px',
  });

  await typeInNotepad(
    page,
    sawState && sawContext
      ? [
          'ok it answers with both now',
          'state and context are landing so this note is stale drop it',
        ]
      : [
          'panel says high the agent says it cant see anything',
          'both halves are on the wire though i checked',
          'context just sits in requestContext nothing puts it in the prompt',
          'state wants memory on the agent and theres none so it gets dropped',
          'guide doesnt mention either of them',
        ],
    1550,
    260,
  );

  console.log(`   📖 Holding on the note...`);
  await humanGlide(page, 1550, 300, 20);
  await sleep(4500);
  await closeNotepadNote(page);
  await sleep(1200);
};
