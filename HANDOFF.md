# Phase 1 Handoff

המסמך הזה מסכם מה נבנה בשלב הראשון, מה אני (קלוד) לא יכולתי לעשות מהסביבה שלי, ומה דרוש ממך כדי להפעיל את שמואל באוויר.

---

## מה נבנה ומה עובד

### מבנה
- מונורפו `pnpm` עם `apps/web`, `apps/desktop`, `packages/shared-types`, `packages/memory-engine`, `packages/learning-engine`, `packages/ui`.
- TypeScript מחמיר, Biome כליינטר ופורמטר.
- כל הקוד באנגלית. הערות באנגלית. כל מה שמוצג למשתמש — בעברית RTL.

### אתר (`apps/web`)
- Next.js 14 App Router, React 18, Tailwind, shadcn/ui, פונט Assistant.
- אתר שיווקי: `/`, `/pricing`, `/download`, `/privacy`, `/terms`.
- הזדהות בקישור קסם דרך Supabase Auth: `/signin`, `/signup`, `/auth/callback`, `/auth/signout`.
- middleware מגן על `/chat`, `/memory`, `/settings`, `/billing`.
- צ׳אט (`/chat`, `/chat/[id]`):
  - סטרימינג מלא ב-SSE עם הודעות `meta`/`delta`/`done`/`error`.
  - מארקדאון, הדגשת תחביר, כפתור העתקה על קוד והודעות, יצירה מחדש, עריכה ושליחה מחדש, עצירה באמצע.
  - סרגל צד עם רשימת שיחות (שינוי שם, מחיקה).
  - תפריט משתמש בפינה — מצב כהה/בהיר/מערכת, ניווט, התנתקות.
- כפתור “סיכום למידה” (פעיל מהודעה 10 בשיחה) פותח חלון מודאלי, קורא ל-Haiku, מציג עובדות מוצעות + שאלות הבהרה. אישור → נכנס למאגר.
- מנגנון שקיפות: בעלייה לשיחה — נטען באנר עליון אם יש adaptation שלא הוצג. אישור / דחיה / התעלמות (30 שניות) נשמרים.
- עמוד `/memory` — כל העובדות הפעילות והדחויות, מחיקה.
- עמוד `/billing` — תוכנית פעילה, שימוש יומי, כפתור שדרוג / פורטל סטרייפ.
- עמוד `/settings` — שם להצגה.

### בסיס נתונים (Supabase)
- שלוש מיגרציות מלאות תחת `supabase/migrations/`:
  1. `20260425000001_init_chat.sql` — `profiles`, `conversations`, `messages` + טריגרים (touch_updated_at, bump_conversation, handle_new_user).
  2. `20260425000002_init_memory.sql` — `memory_facts` (כולל עמודת embedding שעוד לא בשימוש), `behavior_patterns`, `learning_sessions`, `adaptation_log`.
  3. `20260425000003_init_billing.sql` — `subscriptions`, `usage_daily`, פונקציית `bump_usage`, חיבור ה-trigger ל-`auth.users`.
- RLS מופעל בכל הטבלאות. Service-role בלבד יכול לעקוף (לשרת).

### מנוע זיכרון (`packages/memory-engine`)
- `extractFacts` — קריאה לקלוד הייקו עם פרומפט ומחזירה `{ facts, questions }` עם ולידציה ב-Zod.
- `loadRelevantFacts` — בוחר עובדות לפי חפיפת אסימונים + ביטוי קטגוריות (`profession`/`personality` בייסטר), מקסימום 25 עובדות לשיחה.
- `loadBehavior` — טוען `behavior_patterns`.
- `confirmFact`, `rejectFact`, `deprecateFact`, `findContradictions` (היוריסטי על קטגוריה + חפיפת מילים).

### מנוע חיוב (Stripe)
- `/api/stripe/checkout` — יוצר לקוח אם חסר, פותח Checkout Session עם 7 ימי ניסיון.
- `/api/stripe/portal` — Billing Portal של Stripe.
- `/api/stripe/webhook` — מטפל ב-`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- מגבלות לפי תוכנית מ-`@shmuel/shared-types/PLAN_LIMITS`. `/api/chat` מחזיר 402 כשעוברים את המגבלה היומית.

### אפליקציה למחשב (`apps/desktop`)
- Tauri 2 שטוען `https://shmuel.ai` בחלון 1400×900.
- מזהה: `ai.shmuel.app`. שם מוצג: שמואל.
- יעדים: dmg, app, nsis, msi.
- עדכון אוטומטי דרך `/api/updater` (כעת מחזיר 204 — אין עדכון).

### תצורה
- `vercel.json` ב-root מצביע על build pnpm filter @shmuel/web.
- `apps/web/.env.local.example` עם כל המשתנים שדרושים.
- `apps/web/sentry.client.config.ts` + `sentry.server.config.ts` (פעיל רק ב-production).

---

## מה לא נבנה בכוונה (לפי המסמך)

- אין מסלול מקצועי. רק חינם + בסיסי.
- אין אחסון אצל המשתמש (iCloud/Drive/OneDrive). הזיכרון רק בענן שלנו.
- אין אפליקציה לטלפון.
- מודלים מתקדמים יותר לפי תוכנית — לא הוגדרו עדיין (כל המשתמשים על Opus 4.7).
- אין ממשק ניהול מנויים מלא — רק כפתור “נהל ב-Stripe”.

---

## מה דרוש ממך לפני שזה רץ באוויר

### 1. הרצת המיגרציות ב-Supabase
המאגר הנוכחי: `lvifatyksqizwcutfbqp`. שתי דרכים:

**א. Supabase CLI (מומלץ):**
```bash
pnpm dlx supabase login
pnpm dlx supabase link --project-ref lvifatyksqizwcutfbqp
pnpm dlx supabase db push
```

**ב. ידני:** העתק כל אחת משלוש המיגרציות ב-`supabase/migrations/` ל-SQL Editor של Supabase, בסדר. שים לב לסדר — הראשונה יוצרת את ה-trigger function שהשלישית מחברת ל-`auth.users`.

### 2. הפעלת `vector` ו-`pgcrypto`
המיגרציות מנסות להפעיל את התוספים בעצמן (`create extension if not exists`). אם Supabase שלך חוסם — היכנס ל-`Database → Extensions` והפעל ידנית את `pgcrypto` ו-`vector`.

### 3. יצירת חלוקת טיפוסים מעודכנת
לאחר הרצת המיגרציות:
```bash
SUPABASE_PROJECT_ID=lvifatyksqizwcutfbqp pnpm --filter @shmuel/web supabase:types
```
זה יחליף את ה-types שכתבתי ידנית ב-types שמיוצרים אוטומטית מהסכמה האמיתית.

### 4. יצירת מוצרים ב-Stripe (מצב בדיקה)
ב-Stripe Dashboard → Products:
1. צור מוצר בשם “שמואל בסיסי”.
2. הוסף לו price חודשי של ₪80.00, חוזר.
3. העתק את ה-`price_id` (מתחיל ב-`price_`) למשתנה `NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY`.
4. ב-Developers → Webhooks: צור endpoint שמצביע על `https://shmuel.ai/api/stripe/webhook` עם האירועים `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. העתק את ה-`whsec_…` ל-`STRIPE_WEBHOOK_SECRET`.

### 5. מילוי משתני סביבה ב-Vercel
היכנס ל-Vercel → Settings → Environment Variables ומלא את כל המפתחות מ-`apps/web/.env.local.example`. צריך לפחות:
- `NEXT_PUBLIC_APP_URL` = `https://shmuel.ai`
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY`

ה-`UPSTASH_REDIS_*` ו-`SENTRY_*` אופציונליים בשלב הזה — אם חסרים, הקוד פשוט מדלג.

### 6. חיבור הדומיין
ב-Vercel → Domains: חבר `shmuel.ai` (אם רכשת) או `shmuel-ai.com` (גיבוי). עדכן את `NEXT_PUBLIC_APP_URL` בהתאם. ב-Supabase → Authentication → URL Configuration, הוסף את הדומיין ל-redirect URLs.

### 7. אפליקציה למחשב — אייקונים וחתימות
- שים את חמשת קבצי האייקונים ב-`apps/desktop/src-tauri/icons/` (32x32.png, 128x128.png, 128x128@2x.png, icon.icns, icon.ico).
- macOS: אישור Developer ID של Apple + הגדרת notarization.
- Windows: אישור Authenticode מ-CA כמו DigiCert/Sectigo.
- בנייה: `pnpm --filter @shmuel/desktop tauri build`. הקבצים המתקבלים הם ב-`apps/desktop/src-tauri/target/release/bundle/`.
- העלה אותם לאיפה שבחרת (Cloudflare R2 / GitHub Releases) ועדכן את ה-`/api/updater` שיחזיר את הקישור והגירסה.

### 8. אישור עסק ב-Stripe (לפעיל)
לאחר שהמוצר תקין, ב-Stripe → Settings → Account: השלם את אימות העסק. רק אז מעבירים את כל המפתחות מ-test ל-live.

### 9. החלפת טקסטי הפרטיות והתנאים
`/privacy` ו-`/terms` הם טיוטות. תכתוב טקסטים סופיים ותחליף את התוכן ב-`apps/web/app/(marketing)/privacy/page.tsx` ו-`terms/page.tsx`.

---

## בדיקת תהליך מקצה לקצה

לאחר הצעדים למעלה, נסה:
1. הרשמה דרך `/signup` עם כתובת אימייל אמיתית.
2. בדוק שהגיע מייל קישור — לחץ.
3. שיחה ראשונה — שלח 12 הודעות.
4. לחץ “סיכום למידה” — אשר עובדות, ענה על שאלות, שמור.
5. לך ל-`/memory` — וודא שהעובדות נשמרו.
6. שלח עוד הודעה — וודא ששמואל מתייחס לעובדה (זה אינדיקציה שמנוע הזיכרון פועל).
7. ב-`/billing` — לחץ על שדרוג, השלם רכישה עם כרטיס בדיקה (4242 4242 4242 4242).
8. וודא שב-Supabase, טבלת `subscriptions` עודכנה לתוכנית `basic`.
9. ב-`/billing` עכשיו אמור להיות כפתור “נהל מנוי דרך Stripe”.

---

## מבנה ענפים וקומיטים

- ענף הפיתוח: `claude/samuel-phase-1-mvp-GiGjW`.
- כל הקוד החדש על הענף הזה. ה-NOA הישן עדיין ב-`main` להסטוריה.
- כעת PR טיוטה פתוח. אחרי שתבדוק → merge → התחלת שלב 2.

---

## שאלות פתוחות לפני שלב 2

1. שלושת המסלולים בפרטי (חינם / 80 / 150 ש"ח) — ה-150 ש"ח מקבל מה? מודלים מתקדמים יותר? יותר זיכרון? תוסיף לקובץ הזה כשיש החלטה.
2. שלושת המסלולים המקצועיים (300 / 1000+) — אותה שאלה.
3. מי “משתמש מקצועי” — זיהוי לפי מקצוע מהזיכרון, לפי תוכנית, או לפי מתג ידני?
4. סכמת ייצוא נתונים (GDPR / כל משתמש שרוצה לקחת את הזיכרון שלו) — לבנות בשלב 2 או 3?
