import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config();

import { Stagehand, localBrowser } from '@browserbasehq/stagehand';
import { createGeminiRouterClient } from './modelRouter.js';

export interface StagehandContext {
  stagehand: Stagehand;
  browser: any;
  page: any;
  baseUrl: string;
}

export async function createStagehandSession(): Promise<StagehandContext> {
  const isHeadless = process.env.HEADLESS === 'true';
  const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

  console.log(`\n\x1b[35m=== Iniciando Sesión de Stagehand (Headless: ${isHeadless}) ===\x1b[0m`);
  console.log(`URL Base FuBanking: \x1b[34m${baseUrl}\x1b[0m`);

  const browser = await localBrowser.launch({
    headless: isHeadless,
    viewport: { width: 1280, height: 720 },
  });

  const stagehand = await Stagehand.create({
    browser,
    model: createGeminiRouterClient(),
    domSettleTimeoutMs: 2500,
  });

  const pages = await stagehand.browser.context.pages();
  const page = pages[0] || (await stagehand.browser.context.newPage());

  return { stagehand, browser, page, baseUrl };
}
