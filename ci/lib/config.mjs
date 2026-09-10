/**
 * Shared paths, ports and URLs for the CI/CD pipeline.
 *
 * Everything under ci/ imports from here rather than rebuilding paths, so a
 * moved folder or a changed port is a one-line edit.
 *
 * Two services, not three. Angular has no server route to host the Copilot
 * Runtime the way a Next app does, so the runtime is its own Node process
 * (frontend/server.ts, port 8200) alongside `ng serve` (4200) — but the Mastra
 * agent is not a third process: `frontend/server.ts` imports it as source from
 * `backend/src/mastra` and runs it in-process (`MastraAgent.getLocalAgent`).
 * If the runtime answers, the agent is loaded. `mastra dev` is never run here,
 * which is also why nothing reads `backend/.env`.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const CI_DIR = path.join(ROOT_DIR, 'ci');
/** Source of the in-process agent — installed, never started. */
export const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
export const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
export const RECORDER_DIR = path.join(ROOT_DIR, 'autorecorder');
export const VIDEOS_DIR = path.join(RECORDER_DIR, 'videos');
export const AUDIO_DIR = path.join(RECORDER_DIR, 'audio');
export const LOGS_DIR = path.join(VIDEOS_DIR, 'logs');

export const isWindows = process.platform === 'win32';

/**
 * Prefix for CI artifact names. Matches the recorded video filenames
 * (`MASTRA-angular-01-Quickstart.webm`, from `videoPrefix` in
 * `autorecorder/config/project.config.ts`) so a downloaded folder and the clips
 * inside it read as the same thing. Both halves of the integration are in the
 * name on purpose: an Angular clip and its React twin land in the same folder.
 */
export const PROJECT_SLUG = 'Mastra-angular';

// Env names match the ones the services themselves read, so moving a run off a
// busy port is one export rather than an edit here.
export const RUNTIME_PORT = Number(process.env.PORT || 8200);
export const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 4200);

/**
 * The runtime's health path — the check the quickstart's troubleshooting box
 * prescribes. It reports the registered `default` and `support` agents, so it
 * also proves the in-process Mastra agent constructed.
 */
export const RUNTIME_HEALTH_URL = `http://127.0.0.1:${RUNTIME_PORT}/api/copilotkit/info`;

// `localhost`, not 127.0.0.1, and not interchangeably. Angular 22 serves
// through Vite, which binds the name `localhost` — on the CI runner that
// resolves to ::1, so a poll at 127.0.0.1 is refused for the full timeout
// while the dev server sits there having already printed its URL. The
// recorder's frontendUrl uses the same name, so both reach the same server.
export const FRONTEND_URL = `http://localhost:${FRONTEND_PORT}`;

/**
 * Routes hit before recording starts.
 *
 * `ng serve` builds the whole app up front rather than per route, so this is
 * cheaper than the Next equivalent — but the first request still pays for the
 * initial bundle transfer and the lazy chunk of the route, which is enough to
 * blow the recorder's preflight timeout on a cold CI machine. Demo routes are
 * `<route>/demo` (frontend/src/app/app.routes.ts).
 */
export const WARMUP_ROUTES = ['/', '/quickstart/demo'];

/**
 * Hit once before the first prompt of a run.
 *
 * The browser posts across origins to the runtime on 8200, and the first
 * request there pays for constructing the Mastra agent and its memory store.
 * /info is a real GET endpoint that exercises exactly that path, so a run that
 * would have failed on a broken agent fails here instead of inside a recording.
 */
export const RUNTIME_WARM_URL = RUNTIME_HEALTH_URL;
