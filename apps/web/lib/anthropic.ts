import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey && process.env.NODE_ENV !== 'test') {
  console.warn('ANTHROPIC_API_KEY is not set');
}

export const anthropic = new Anthropic({
  apiKey: apiKey ?? 'placeholder',
  defaultHeaders: { 'anthropic-beta': 'prompt-caching-2024-07-31' },
});

export const MAIN_MODEL = process.env.ANTHROPIC_MAIN_MODEL ?? 'claude-opus-4-7';
export const MEMORY_MODEL = process.env.ANTHROPIC_MEMORY_MODEL ?? 'claude-haiku-4-5-20251001';
