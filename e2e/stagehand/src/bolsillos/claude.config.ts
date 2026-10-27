import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { localBrowser, Stagehand } from '@browserbasehq/stagehand';

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, '../../.env') });
dotenv.config();

/**
 * Bolsillos y Depositar usan Claude (Anthropic) en vez del Model Routing con
 * Gemini de Créditos. Un solo modelo para act, observe y extract: el costo de
 * cada llamada queda en el reporte (tokens y tiempo de inferencia).
 */
export const MODEL_NAME = (process.env.STAGEHAND_MODEL ?? 'anthropic/claude-sonnet-5-5') as `anthropic/${string}`;
export const WEB_URL = process.env.BASE_URL ?? 'http://localhost:3000';
export const API_URL = (process.env.API_URL ?? 'http://localhost:3001/api/v1').replace(/\/$/, '');

export async function createClaudeSession() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Falta ANTHROPIC_API_KEY: cópiala en e2e/stagehand/.env (ver .env.example)');
  }

  const browser = await localBrowser.launch({
    headless: process.env.HEADLESS === 'true',
    viewport: { width: 1280, height: 800 },
  });
  const stagehand = await Stagehand.create({
    browser,
    model: { modelName: MODEL_NAME, apiKey },
    domSettleTimeoutMs: 2500,
  });
  const context = stagehand.browser.context;
  const page = (await context.pages())[0] ?? (await context.newPage());

  return { stagehand, browser, context, page };
}

export type ClaudeSession = Awaited<ReturnType<typeof createClaudeSession>>;
