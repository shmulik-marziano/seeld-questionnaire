// SEELD NOA Questionnaire
// 58 Questions organized in 8 categories
// This file defines all questions with validation and conditional logic

export interface Question {
  id: number;
  category: string;
  text: string;
  type: 'text' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'tel' | 'email';
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  conditional?: {
    dependsOn: number; // Question ID
    showWhen: any; // Value that triggers display
  };
  dbField?: string; // Maps to database column
}

export const questionnaireConfig = {
  title: 'שאלון קליטת לקוח',
  subtitle: 'נשמח להכיר אותך! השאלון לוקח כ-5 דקות',
  categories: [
    { id: 1, name: 'פרטים אישיים', icon: '👤', questions: 10 },
    { id: 2, name: 'תעסוקה', icon: '💼', questions: 8 },
    { id: 3, name: 'מצב משפחתי', icon: '👨‍👩‍👧‍👦', questions: 6 },
    { id: 4, name: 'מצב כלכלי', icon: '💰', questions: 7 },
    { id: 5, name: 'ביטוחים קיימים', icon: '🛡️', questions: 8 },
    { id: 6, name: 'בריאות', icon: '❤️', questions: 10 },
    { id: 7, name: 'העדפות', icon: '⚙️', questions: 5 },
    { id: 8, name: 'הסכמות', icon: '✍️', questions: 4 }
  ]
};

export const questions: Question[] = [
  // ============================================
  // Category 1: Personal Info (1-10)
  // ============================================
  {
    id: 1,
    category: 'personal',
    text: 'מה השם הפרטי שלך?',
    type: 'text',
    required: true,
    placeholder: 'דוד',
    validation: {
      min: 2,
      max: 30,
      message: 'שם חייב להיות בין 2-30 תווים'
    },
    dbField: 'first_name'
  },
  {
    id: 2,
    category: 'personal',
    text: 'מה שם המשפחה?',
    type: 'text',
    required: true,
    placeholder: 'כהן',
    validation: {
      min: 2,
      max: 30,
      message: 'שם משפחה חייב להיות בין 2-30 תווים'
    },
    dbField: 'last_name'
  },
  {
    id: 3,
    category: 'personal',
    text: 'מה מספר תעודת הזהות שלך?',
    type: 'text',
    required: true,
    placeholder: '123456789',
    helpText: '9 ספרות ללא מקפים',
    validation: {
      pattern: '^[0-9]{9}$',
      message: 'תעודת זהות חייבת להיות 9 ספרות'
    },
    dbField: 'id_number'
  },
  {
    id: 4,
    category: 'personal',
    text: 'מה תאריך הלידה שלך?',
    type: 'date',
    required: true,
    helpText: 'יש להיות מעל גיל 18',
    dbField: 'birth_date'
  },
  {
    id: 5,
    category: 'personal',
    text: 'מה המגדר שלך?',
    type: 'select',
    required: true,
    options: ['זכר', 'נקבה', 'אחר'],
    dbField: 'gender'
  },
  {
    id: 6,
    category: 'personal',
    text: 'מה מספר הטלפון הנייד שלך?',
    type: 'tel',
    required: true,
    placeholder: '050-1234567',
    validation: {
      pattern: '^05[0-9]-?[0-9]{7}$',
      message: 'מספר טלפון לא תקין'
    },
    dbField: 'phone'
  },
  {
    id: 7,
    category: 'personal',
    text: 'מה כתובת האימייל שלך?',
    type: 'email',
    required: true,
    placeholder: 'david@example.com',
    dbField: 'email'
  },
  {
    id: 8,
    category: 'personal',
    text: 'מה הכתובת למשלוח דואר?',
    type: 'text',
    required: true,
    placeholder: 'רחוב הרצל 1, תל אביב',
    helpText: 'רחוב, מספר בית, עיר',
    dbField: 'address_street'
  },
  {
    id: 9,
    category: 'personal',
    text: 'מה המצב המשפחתי שלך?',
    type: 'select',
    required: true,
    options: ['רווק/ה', 'נשוי/אה', 'גרוש/ה', 'אלמן/ה'],
    dbField: 'marital_status'
  },
  {
    id: 10,
    category: 'personal',
    text: 'כמה ילדים יש לך?',
    type: 'number',
    required: true,
    placeholder: '0',
    validation: {
      min: 0,
      max: 20,
      message: 'מספר לא תקין'
    },
    dbField: 'children_count'
  },

  // ============================================
  // Category 2: Employment (11-18)
  // ============================================
  {
    id: 11,
    category: 'employment',
    text: 'מה הסטטוס התעסוקתי שלך?',
    type: 'select',
    required: true,
    options: ['שכיר', 'עצמאי', 'שכיר ועצמאי', 'לא עובד/ת'],
    dbField: 'employment_status'
  },
  {
    id: 12,
    category: 'employment',
    text: 'מה שם המעסיק?',
    type: 'text',
    required: false,
    placeholder: 'שם החברה',
    conditional: {
      dependsOn: 11,
      showWhen: ['שכיר', 'שכיר ועצמאי']
    },
    dbField: 'employer_name'
  },
  {
    id: 13,
    category: 'employment',
    text: 'מה התפקיד שלך?',
    type: 'text',
    required: false,
    placeholder: 'מהנדס תוכנה',
    conditional: {
      dependsOn: 11,
      showWhen: ['שכיר', 'עצמאי', 'שכיר ועצמאי']
    },
    dbField: 'job_title'
  },
  {
    id: 14,
    category: 'employment',
    text: 'מה השכר ברוטו החודשי? (בשקלים)',
    type: 'number',
    required: false,
    placeholder: '15000',
    helpText: 'לפני ניכויים',
    conditional: {
      dependsOn: 11,
      showWhen: ['שכיר', 'שכיר ועצמאי']
    },
    validation: {
      min: 0,
      max: 999999
    },
    dbField: 'salary_gross'
  },
  {
    id: 15,
    category: 'employment',
    text: 'מה ההכנסה החודשית הממוצעת? (בשקלים)',
    type: 'number',
    required: false,
    placeholder: '20000',
    conditional: {
      dependsOn: 11,
      showWhen: ['עצמאי', 'שכיר ועצמאי']
    },
    validation: {
      min: 0,
      max: 999999
    },
    dbField: 'self_employed_income'
  },
  {
    id: 16,
    category: 'employment',
    text: 'כמה שנים אתה עובד במקום הנוכחי?',
    type: 'number',
    required: false,
    placeholder: '5',
    validation: {
      min: 0,
      max: 50,
      message: 'מספר לא תקין'
    },
    dbField: 'years_at_job'
  },
  {
    id: 17,
    category: 'employment',
    text: 'מה מספר ח.פ. או עוסק מורשה?',
    type: 'text',
    required: false,
    placeholder: '512345678',
    conditional: {
      dependsOn: 11,
      showWhen: ['עצמאי', 'שכיר ועצמאי']
    },
    dbField: 'business_id'
  },
  {
    id: 18,
    category: 'employment',
    text: 'האם יש לך הכנסות נוספות?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_additional_income'
  },

  // ============================================
  // Category 3: Family (19-24)
  // ============================================
  {
    id: 19,
    category: 'family',
    text: 'מה שם בן/בת הזוג?',
    type: 'text',
    required: false,
    placeholder: 'שרה כהן',
    conditional: {
      dependsOn: 9,
      showWhen: 'נשוי/אה'
    },
    dbField: 'spouse_name'
  },
  {
    id: 20,
    category: 'family',
    text: 'מה תעודת זהות של בן/בת הזוג?',
    type: 'text',
    required: false,
    placeholder: '987654321',
    conditional: {
      dependsOn: 9,
      showWhen: 'נשוי/אה'
    },
    validation: {
      pattern: '^[0-9]{9}$',
      message: 'תעודת זהות חייבת להיות 9 ספרות'
    },
    dbField: 'spouse_id_number'
  },
  {
    id: 21,
    category: 'family',
    text: 'האם בן/בת הזוג עובד/ת?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    conditional: {
      dependsOn: 9,
      showWhen: 'נשוי/אה'
    },
    dbField: 'spouse_employed'
  },
  {
    id: 22,
    category: 'family',
    text: 'פרטי ילדים (שם, ת.ז., תאריך לידה)',
    type: 'text',
    required: false,
    helpText: 'ניתן לרשום בשורות נפרדות',
    placeholder: 'יוסי כהן, 123456789, 01/01/2015',
    conditional: {
      dependsOn: 10,
      showWhen: (value: number) => value > 0
    },
    dbField: 'children_details'
  },
  {
    id: 23,
    category: 'family',
    text: 'האם יש תלויים נוספים? (הורים וכו\')',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_other_dependents'
  },
  {
    id: 24,
    category: 'family',
    text: 'מי המוטבים בפוליסה? (שמות ואחוזים)',
    type: 'text',
    required: false,
    placeholder: 'בן/בת זוג 50%, ילדים 50%',
    helpText: 'ניתן לשנות בהמשך',
    dbField: 'beneficiaries'
  },

  // ============================================
  // Category 4: Financial (25-31)
  // ============================================
  {
    id: 25,
    category: 'financial',
    text: 'מה סך ההכנסה המשפחתית החודשית?',
    type: 'select',
    required: false,
    options: [
      'עד 5,000 ₪',
      '5,000-10,000 ₪',
      '10,000-15,000 ₪',
      '15,000-20,000 ₪',
      '20,000-30,000 ₪',
      '30,000-50,000 ₪',
      'מעל 50,000 ₪'
    ],
    dbField: 'household_income_range'
  },
  {
    id: 26,
    category: 'financial',
    text: 'מה סך ההוצאות החודשיות (בערך)?',
    type: 'select',
    required: false,
    options: [
      'עד 5,000 ₪',
      '5,000-10,000 ₪',
      '10,000-15,000 ₪',
      '15,000-20,000 ₪',
      '20,000-30,000 ₪',
      'מעל 30,000 ₪'
    ],
    dbField: 'monthly_expenses_range'
  },
  {
    id: 27,
    category: 'financial',
    text: 'האם יש לך משכנתא?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_mortgage'
  },
  {
    id: 28,
    category: 'financial',
    text: 'מה גובה ההחזר החודשי של המשכנתא?',
    type: 'number',
    required: false,
    placeholder: '5000',
    conditional: {
      dependsOn: 27,
      showWhen: 'כן'
    },
    dbField: 'mortgage_payment'
  },
  {
    id: 29,
    category: 'financial',
    text: 'האם יש הלוואות אחרות?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_other_loans'
  },
  {
    id: 30,
    category: 'financial',
    text: 'מה סך ההחזרים החודשיים?',
    type: 'number',
    required: false,
    placeholder: '2000',
    conditional: {
      dependsOn: 29,
      showWhen: 'כן'
    },
    dbField: 'total_loan_payments'
  },
  {
    id: 31,
    category: 'financial',
    text: 'האם יש חסכונות/השקעות?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_savings'
  },

  // ============================================
  // Category 5: Existing Insurance (32-39)
  // ============================================
  {
    id: 32,
    category: 'insurance',
    text: 'האם יש לך קרן פנסיה?',
    type: 'radio',
    required: true,
    options: ['כן', 'לא'],
    dbField: 'has_pension'
  },
  {
    id: 33,
    category: 'insurance',
    text: 'באיזו חברה?',
    type: 'select',
    required: false,
    options: [
      'מנורה מבטחים',
      'הראל',
      'מגדל',
      'הפניקס',
      'כלל',
      'איילון',
      'מיטב דש',
      'אחר'
    ],
    conditional: {
      dependsOn: 32,
      showWhen: 'כן'
    },
    dbField: 'pension_company'
  },
  {
    id: 34,
    category: 'insurance',
    text: 'האם יש לך ביטוח מנהלים?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא', 'לא יודע'],
    dbField: 'has_managers_insurance'
  },
  {
    id: 35,
    category: 'insurance',
    text: 'האם יש לך קרן השתלמות?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא', 'לא יודע'],
    dbField: 'has_study_fund'
  },
  {
    id: 36,
    category: 'insurance',
    text: 'האם יש לך ביטוח חיים?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא', 'לא יודע'],
    dbField: 'has_life_insurance'
  },
  {
    id: 37,
    category: 'insurance',
    text: 'האם יש לך ביטוח בריאות פרטי?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_health_insurance'
  },
  {
    id: 38,
    category: 'insurance',
    text: 'האם יש לך ביטוח אובדן כושר עבודה?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא', 'לא יודע'],
    dbField: 'has_disability_insurance'
  },
  {
    id: 39,
    category: 'insurance',
    text: 'האם יש לך ביטוח סיעודי?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא', 'לא יודע'],
    dbField: 'has_nursing_insurance'
  },

  // ============================================
  // Category 6: Health (40-49)
  // ============================================
  {
    id: 40,
    category: 'health',
    text: 'מה הגובה שלך? (בס"מ)',
    type: 'number',
    required: false,
    placeholder: '175',
    validation: {
      min: 100,
      max: 250
    },
    dbField: 'height_cm'
  },
  {
    id: 41,
    category: 'health',
    text: 'מה המשקל שלך? (בק"ג)',
    type: 'number',
    required: false,
    placeholder: '75',
    validation: {
      min: 30,
      max: 300
    },
    dbField: 'weight_kg'
  },
  {
    id: 42,
    category: 'health',
    text: 'האם אתה מעשן?',
    type: 'select',
    required: false,
    options: ['כן', 'לא', 'הפסקתי'],
    dbField: 'smoking_status'
  },
  {
    id: 43,
    category: 'health',
    text: 'האם יש מחלות רקע?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_medical_conditions'
  },
  {
    id: 44,
    category: 'health',
    text: 'אנא פרט את המחלות',
    type: 'text',
    required: false,
    placeholder: 'סוכרת, לחץ דם גבוה...',
    conditional: {
      dependsOn: 43,
      showWhen: 'כן'
    },
    dbField: 'medical_conditions'
  },
  {
    id: 45,
    category: 'health',
    text: 'האם אתה נוטל תרופות באופן קבוע?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'takes_medications'
  },
  {
    id: 46,
    category: 'health',
    text: 'אנא פרט את התרופות',
    type: 'text',
    required: false,
    placeholder: 'מטפורמין, לוסרטן...',
    conditional: {
      dependsOn: 45,
      showWhen: 'כן'
    },
    dbField: 'medications'
  },
  {
    id: 47,
    category: 'health',
    text: 'האם היו אשפוזים ב-5 שנים אחרונות?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'recent_hospitalizations'
  },
  {
    id: 48,
    category: 'health',
    text: 'האם יש מגבלות תפקודיות?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'has_limitations'
  },
  {
    id: 49,
    category: 'health',
    text: 'האם יש היסטוריה משפחתית של מחלות קשות?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    helpText: 'סרטן, מחלות לב וכו\'',
    dbField: 'family_medical_history'
  },

  // ============================================
  // Category 7: Preferences (50-54)
  // ============================================
  {
    id: 50,
    category: 'preferences',
    text: 'מה רמת הסיכון המועדפת עליך?',
    type: 'select',
    required: false,
    options: [
      '1 - שמרני מאוד',
      '2 - שמרני',
      '3 - מאוזן',
      '4 - אגרסיבי',
      '5 - אגרסיבי מאוד'
    ],
    helpText: '1 = בטחון, 5 = תשואה',
    dbField: 'risk_level'
  },
  {
    id: 51,
    category: 'preferences',
    text: 'מה חשוב לך יותר?',
    type: 'select',
    required: false,
    options: ['תשואה גבוהה', 'איזון', 'בטחון מקסימלי'],
    dbField: 'preference_return_vs_safety'
  },
  {
    id: 52,
    category: 'preferences',
    text: 'האם מעוניין בהרחבות לילדים?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא'],
    dbField: 'wants_children_coverage'
  },
  {
    id: 53,
    category: 'preferences',
    text: 'האם מעוניין במסלול פטור ממס?',
    type: 'radio',
    required: false,
    options: ['כן', 'לא', 'לא יודע'],
    dbField: 'wants_tax_exempt'
  },
  {
    id: 54,
    category: 'preferences',
    text: 'מה התקציב החודשי שאתה יכול להקצות לביטוח?',
    type: 'select',
    required: false,
    options: [
      'עד 500 ₪',
      '500-1,000 ₪',
      '1,000-2,000 ₪',
      '2,000-3,000 ₪',
      'מעל 3,000 ₪'
    ],
    dbField: 'monthly_budget_range'
  },

  // ============================================
  // Category 8: Consents (55-58)
  // ============================================
  {
    id: 55,
    category: 'consents',
    text: 'אני מאשר/ת קבלת מידע שיווקי',
    type: 'checkbox',
    required: false,
    dbField: 'consent_marketing'
  },
  {
    id: 56,
    category: 'consents',
    text: 'אני מאשר/ת את תנאי השימוש',
    type: 'checkbox',
    required: true,
    helpText: 'חובה לאשר',
    dbField: 'consent_terms'
  },
  {
    id: 57,
    category: 'consents',
    text: 'אני מאשר/ת את מדיניות הפרטיות',
    type: 'checkbox',
    required: true,
    helpText: 'חובה לאשר',
    dbField: 'consent_privacy'
  },
  {
    id: 58,
    category: 'consents',
    text: 'אני מאשר/ת מתן ייפוי כוח לצורך שליפת מידע',
    type: 'checkbox',
    required: true,
    helpText: 'נדרש לשליפת מידע מהמסלקה והר הביטוח',
    dbField: 'consent_poa'
  }
];

// Helper function to get questions by category
export const getQuestionsByCategory = (category: string) => {
  return questions.filter(q => q.category === category);
};

// Helper function to check if question should be displayed
export const shouldShowQuestion = (
  question: Question,
  answers: Record<number, any>
): boolean => {
  if (!question.conditional) return true;
  
  const { dependsOn, showWhen } = question.conditional;
  const dependentAnswer = answers[dependsOn];
  
  if (typeof showWhen === 'function') {
    return showWhen(dependentAnswer);
  }
  
  if (Array.isArray(showWhen)) {
    return showWhen.includes(dependentAnswer);
  }
  
  return dependentAnswer === showWhen;
};

// Calculate progress percentage
export const calculateProgress = (answers: Record<number, any>): number => {
  const answeredRequired = questions.filter(q => 
    q.required && answers[q.id] !== undefined && answers[q.id] !== ''
  ).length;
  
  const totalRequired = questions.filter(q => q.required).length;
  
  return Math.round((answeredRequired / totalRequired) * 100);
};
