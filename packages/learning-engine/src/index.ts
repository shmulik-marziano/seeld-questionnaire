export type AdaptationDimension = 'response_length' | 'tone' | 'examples' | 'lists' | 'humor';

export interface AdaptationDelta {
  dimension: AdaptationDimension;
  previous: string;
  next: string;
  reason: string;
}

export interface AdaptationMessage {
  what_changed: string;
  previous_behavior: string;
  new_behavior: string;
  reason: string;
}

const DIMENSION_LABELS: Record<AdaptationDimension, string> = {
  response_length: 'אורך תשובה',
  tone: 'טון השיחה',
  examples: 'שימוש בדוגמאות',
  lists: 'שימוש ברשימות',
  humor: 'הומור',
};

export function formatAdaptation(delta: AdaptationDelta): AdaptationMessage {
  return {
    what_changed: DIMENSION_LABELS[delta.dimension],
    previous_behavior: delta.previous,
    new_behavior: delta.next,
    reason: delta.reason,
  };
}

// Compose the user-facing transparency message in Hebrew.
export function composeAdaptationMessage(msg: AdaptationMessage): string {
  return `אגב, רציתי להגיד לך משהו —
שינוי: ${msg.what_changed}.
עד עכשיו ${msg.previous_behavior}, מהיום ${msg.new_behavior}.
${msg.reason}
זה מתאים לך?`;
}

// Periodic recap every N conversations.
export const RECAP_FREQUENCY = 5;

export function shouldShowRecap(conversationsSinceLastRecap: number): boolean {
  return conversationsSinceLastRecap >= RECAP_FREQUENCY;
}
