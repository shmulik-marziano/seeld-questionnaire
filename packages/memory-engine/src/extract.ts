import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { LearningSummary } from '@shmuel/shared-types';

const SYSTEM = `אתה מנתח שיחה ומחלץ עובדות שלמדת על המשתמש.
אל תחלץ דברים מובנים מאליהם או דברים זמניים.
חלץ רק עובדות יציבות שיכולות להיות שימושיות בשיחות עתידיות.
אם אין עובדות מספיק יציבות — החזר רשימה ריקה. עדיף ריק על המצאה.

בנוסף, נסח עד שלוש שאלות הבהרה לבחירה רב-ברירה (שלושה עד ארבעה אופציות),
שיעזרו להעמיק את ההיכרות. אם אין צורך בשאלות — החזר רשימה ריקה.

החזר תשובה כ-JSON תקני בפורמט:
{
  "facts": [
    {
      "fact_text": "...",
      "category": "profession|family|preference|goal|personality|other",
      "confidence": 0.0,
      "needs_clarification": null
    }
  ],
  "questions": [
    { "question": "...", "options": ["...", "..."] }
  ]
}`;

const factSchema = z.object({
  fact_text: z.string().min(2).max(300),
  category: z.string(),
  confidence: z.number().min(0).max(1),
  needs_clarification: z.string().nullable().optional(),
});

const questionSchema = z.object({
  question: z.string().min(2).max(300),
  options: z.array(z.string().min(1).max(120)).min(2).max(5),
});

const summarySchema = z.object({
  facts: z.array(factSchema).max(10),
  questions: z.array(questionSchema).max(5),
});

export interface ExtractInput {
  client: Anthropic;
  model: string;
  conversationText: string;
}

export async function extractFacts(input: ExtractInput): Promise<LearningSummary> {
  const { client, model, conversationText } = input;

  const result = await client.messages.create({
    model,
    max_tokens: 2048,
    system: SYSTEM,
    messages: [
      {
        role: 'user',
        content: `התוכן של השיחה:\n\n${conversationText}\n\nהחזר JSON בלבד, בלי טקסט מסביב.`,
      },
    ],
  });

  const text = result.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  const json = stripCodeFence(text);
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { facts: [], questions: [] };
  }

  const validated = summarySchema.safeParse(parsed);
  if (!validated.success) return { facts: [], questions: [] };
  return validated.data;
}

function stripCodeFence(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();
  return text;
}
