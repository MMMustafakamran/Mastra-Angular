/**
 * A2UI — enabled on the runtime, inert in the browser, and the recording says so.
 *
 * https://docs.copilotkit.ai/angular/mastra/guides/a2ui
 *
 * `a2ui: {}` in frontend/server.ts turns the middleware on and `/info` duly
 * reports `a2uiEnabled: true`, but supplying `a2ui.catalog` is what actually
 * registers the `render_a2ui` renderer — and the guide's catalog snippet is not
 * self-contained (it references `dynamicString`, `beautifulCatalog`,
 * `declarativeCatalog`, `fixedCatalog` and `productCatalog`, none of which the
 * guide defines). So the agent answers in prose and no declarative UI appears.
 *
 * The prompt is still sent: "asked for a card, got a paragraph" is the finding,
 * and it is only demonstrable by asking. The Notepad note then records what is
 * missing, while the prose answer is still on screen behind it.
 *
 * Before any of that, the take stops on the harness's own /a2ui notes route,
 * marks the reconstructed `a2uiConfigForFeature` block and writes down that the
 * guide never declares the catalogs it returns, so that code was written here.
 * See actions/catalog-code.ts.
 *
 * The legacy recorder made this a doc-only page and highlighted the missing
 * identifiers in the guide itself. This engine always drives the demo route, so
 * the finding moved onto the demo page — the substance is the same, and the doc
 * scroll at the head of the video still shows the snippets in question.
 */
import { type Page } from 'playwright';

import { sendPrompt, waitForAgentResponseCompletion } from '../core/actions';
import { humanGlide, sleep } from '../core/overlays/cursor';
import { type PageActionHandler, type PageRecordConfig } from '../core/types';

import {
  CATALOG_CODE_NOTE,
  returnToDemo,
  showReconstructedCatalogCode,
} from './catalog-code';
import { closeNotepadNote, openNotepadWindow, typeInNotepad } from './notepad';

/** Anything the A2UI renderer would have mounted. */
const A2UI_SURFACE =
  'copilot-a2ui, [class*="a2ui"], .a2ui-row, .a2ui-flight-card';

/**
 * Types the note beside the highlighted snippet.
 *
 * Parked hard right, above the taskbar, so the marked code stays visible to its
 * left: the claim and the code it is about share the frame.
 */
async function writeCatalogCodeNote(page: Page): Promise<void> {
  await openNotepadWindow(page, 'a2ui-catalogs.txt', {
    top: '150px',
    right: '48px',
    width: '560px',
    height: '380px',
  });
  await typeInNotepad(page, CATALOG_CODE_NOTE, 1600, 260);
  await sleep(3500);
  await closeNotepadNote(page);
}

export const runA2uiAction: PageActionHandler = async (
  page: Page,
  config: PageRecordConfig,
) => {
  // First, whose code the catalog snippet is. The demo below shows that no
  // catalog is registered; this shows why one could not be — and that the
  // block on the notes route was written here rather than lifted from a guide
  // that never declares it.
  if (await showReconstructedCatalogCode(page, config, writeCatalogCodeNote)) {
    await returnToDemo(page, config);
  }

  console.log(`   🎨 Asking for declarative UI: ${config.prompt}`);
  const msgCount = await sendPrompt(page, config.prompt);
  await waitForAgentResponseCompletion(page, config.waitAfterPromptMs ?? 4000, msgCount);

  const rendered = await page.locator(A2UI_SURFACE).count().catch(() => 0);
  console.log(
    rendered > 0
      ? `   ✅ ${rendered} A2UI element(s) rendered — a catalog is registered after all.`
      : `   · No A2UI elements rendered, as expected without a catalog.`,
  );

  await openNotepadWindow(page, 'a2ui-notes.txt', {
    right: '32px',
    top: '95px',
    width: '680px',
    height: '560px',
  });

  await typeInNotepad(
    page,
    rendered > 0
      ? [
          'a2ui — rendering',
          '',
          'declarative UI mounted; this note is stale, update pages.config.ts',
          'and drop the finding from the README known issues.',
        ]
      : [
          '',
          'a2ui is enabled but not actually working',
          '',
          'the runtime says a2ui is enabled',
          'but the agent still only responds with normal text',
          '',
          'the problem is that the required catalog is missing',
          'and the guide examples are incomplete and reference undefined pieces',
          '',
          'need: one complete catalog example that shows everything needed',
          'to make a component render end to end',
        ],
    1550,
    260,
  );

  console.log(`   📖 Holding on the note...`);
  await humanGlide(page, 1550, 360, 20);
  await sleep(5000);
  await closeNotepadNote(page);
  await sleep(1200);
};
