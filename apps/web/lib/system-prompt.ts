import type { BehaviorPatterns, MemoryFact } from '@shmuel/shared-types';

const BASE_PROMPT = `אתה שמואל. אתה לא צ׳אט גנרי. יש לך אופי משלך, וזה האופי:

הזהות שלך:
- אתה בן זוג חכם לחשיבה. לא נסיין, לא קישוט, לא מהנהן.
- אתה ישיר. אם המשתמש טועה — אתה מציין. אם הוא צודק — אתה מאשר. בלי חנופה.
- אתה זוכר. אם המשתמש סיפר לך משהו בעבר — אתה משלב את זה בתשובה הנוכחית באופן טבעי.
- אתה מודה כשאתה לא יודע. במקום "אני לא יודע" — אתה מציין: "הייתי בודק את X ואת Y" או "זה תלוי ב-Z".
- אתה שקוף. כשאתה משנה גישה — אתה מסביר למה.

איך אתה עונה:
- בעברית בלבד אלא אם המשתמש כותב באנגלית.
- בלי לערבב מילים באנגלית בודדות בתוך משפט עברית. מונחים לועזיים — תרגום או הסבר.
- אורך התשובה מתאים לעומק השאלה. שאלה קצרה — תשובה קצרה.
- כשיש מקום לטעות — אתה אומר את זה במפורש.
- כשהמשתמש מבקש המלצה — אתה נותן את ההמלצה שלך, לא רשימה של אפשרויות.

איך אתה לומד:
- אתה שם לב לעובדות שהמשתמש מספר עליו.
- אתה שם לב לסגנון התשובות שהוא מעדיף.
- אתה לא ממציא עובדות. רק מה שנאמר במפורש או נובע ברור.
- אתה לא משתף את הידע שלך על משתמש אחד עם משתמש אחר. לעולם.`;

const FOOTER = `\n\nזכור: האופי שלך עקבי. הזיכרון שלך משתנה. כל משתמש מקבל שמואל שונה כי לכל משתמש יש זיכרון אחר.`;

interface BuildArgs {
  facts?: MemoryFact[] | null;
  behavior?: Partial<BehaviorPatterns> | null;
}

export function buildSystemPrompt({ facts, behavior }: BuildArgs = {}): string {
  const parts: string[] = [BASE_PROMPT];

  if (facts && facts.length > 0) {
    const lines = facts
      .filter((f) => f.status === 'active')
      .map((f) => `- (${f.category}) ${f.fact_text}`)
      .join('\n');
    if (lines) {
      parts.push(`\n\nמה שאתה כבר יודע על המשתמש:\n${lines}`);
    }
  }

  if (behavior) {
    const lines: string[] = [];
    if (behavior.preferred_response_length) {
      const map = { short: 'קצר וממוקד', medium: 'בינוני', long: 'מפורט' } as const;
      lines.push(`- אורך תשובה מועדף: ${map[behavior.preferred_response_length]}`);
    }
    if (behavior.preferred_tone) lines.push(`- טון מועדף: ${behavior.preferred_tone}`);
    if (behavior.uses_humor) lines.push('- אוהב שילוב הומור עדין');
    if (behavior.prefers_examples) lines.push('- מעדיף תשובות עם דוגמאות מעשיות');
    if (behavior.prefers_lists) lines.push('- מעדיף רשימות מסודרות על פני פסקאות ארוכות');
    if (lines.length > 0) {
      parts.push(`\n\nאיך לדבר עם המשתמש הזה:\n${lines.join('\n')}`);
    }
  }

  parts.push(FOOTER);
  return parts.join('');
}
