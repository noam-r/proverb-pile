/**
 * Translation utilities for multi-language support
 */

export type LanguageCode = 'en' | 'he';

interface Translations {
  // Header
  appName: string;
  subtitle: (count: number) => string;
  instructions: string;
  createPuzzle: string;

  // Game
  proverbs: string;
  proverb: string;
  availableWords: (count: number) => string;
  allWordsPlaced: string;

  // Buttons
  checkAnswer: string;
  hint: (remaining: number) => string;
  reset: string;

  // Validation
  correct: string;
  incorrect: string;
  allCorrect: string;
  partialCorrect: (solved: number, total: number) => string;
  noneCorrect: string;

  // Modal
  congratulations: string;
  close: string;
  origin: string;
  meaning: string;

  // Onboarding
  onboardingTitle: string;
  onboardingStep1: string;
  onboardingStep2: string;
  onboardingStep3: string;
  onboardingGotIt: string;
  help: string;

  // Loading/Error
  loading: string;
  errorLoading: string;
  errorMessage: string;
  addPuzzle: string;
  orCreate: string;

  // Puzzle Builder
  puzzleBuilder: string;
  builderDescription: string;
  languageLabel: string;
  english: string;
  hebrew: string;
  proverbsLabel: string;
  proverbNumber: (n: number) => string;
  remove: string;
  proverbText: string;
  wordsRequired: string;
  cultureOrigin: string;
  meaningLabel: string;
  generateURL: string;
  clearAll: string;
  puzzleGenerated: string;
  shareURL: string;
  copy: string;
  copied: string;
  addAnother: string;
  proverbPlaceholder: string;
  culturePlaceholder: string;
  meaningPlaceholder: string;
  errorAllSolutions: string;
  errorAllCultures: string;
  errorAllMeanings: string;
  errorMinWords: (n: number, count: number) => string;
  errorMaxWords: (n: number, count: number) => string;
  decodeLabel: string;
  decodeDescription: string;
  decodePlaceholder: string;
  decodeButton: string;
  errorDecoding: string;
}

const translations: Record<LanguageCode, Translations> = {
  en: {
    // Header
    appName: 'Proverb Pile',
    subtitle: (count: number) => `Separate the mixed words into ${count} proverbs`,
    instructions: `Separate the mixed words into proverbs. Tap a word to select it, then tap an empty slot to place it.`,
    createPuzzle: 'Create Puzzle',

    // Game
    proverbs: 'Proverbs',
    proverb: 'Proverb',
    availableWords: (count: number) => `Available words (${count} remaining)`,
    allWordsPlaced: 'All words placed - click Check Answer!',

    // Buttons
    checkAnswer: 'Check Answer',
    hint: (remaining: number) => `Hint (${remaining} remaining)`,
    reset: 'Reset',

    // Validation
    correct: '✓ Correct',
    incorrect: '✗ Incorrect',
    allCorrect: '🎉 Perfect! All proverbs are correct!',
    partialCorrect: (solved: number, total: number) => `${solved} out of ${total} correct. Keep trying!`,
    noneCorrect: '✗ None are correct yet. Try rearranging the words!',

    // Modal
    congratulations: 'Congratulations!',
    close: 'Close',
    origin: 'Origin',
    meaning: 'Meaning',

    // Onboarding
    onboardingTitle: 'How to Play',
    onboardingStep1: 'Tap a word from the word tray at the bottom (it will turn black)',
    onboardingStep2: 'Tap an empty slot in the proverb area above to place the selected word',
    onboardingStep3: 'When all words are placed, tap Check Answer',
    onboardingGotIt: 'Got it!',
    help: 'Help',

    // Loading/Error
    loading: 'Loading puzzle...',
    errorLoading: 'Error Loading Puzzle',
    errorMessage: 'Add a puzzle parameter to the URL or check the puzzle format.',
    addPuzzle: 'Add a puzzle parameter to the URL or check the puzzle format.',
    orCreate: 'create your own puzzle',

    // Puzzle Builder
    puzzleBuilder: 'Puzzle Builder',
    builderDescription: 'Create your own Proverb Pile puzzle by entering 3-4 proverbs. Words will be automatically shuffled and encoded into a shareable URL.',
    languageLabel: 'Language',
    english: 'English',
    hebrew: 'Hebrew (עברית)',
    proverbsLabel: 'Proverbs',
    proverbNumber: (n: number) => `Proverb ${n}`,
    remove: 'Remove',
    proverbText: 'Proverb Text',
    wordsRequired: '3-10 words required',
    cultureOrigin: 'Culture/Origin',
    meaningLabel: 'Meaning',
    generateURL: 'Generate Puzzle URL',
    clearAll: 'Clear All',
    puzzleGenerated: '✓ Puzzle Generated!',
    shareURL: 'Share this URL to let others play your puzzle:',
    copy: 'Copy',
    copied: 'Copied!',
    addAnother: '+ Add Another Proverb (Optional)',
    proverbPlaceholder: "e.g., Don't bite the hand that feeds you",
    culturePlaceholder: 'e.g., English, Chinese, Indian',
    meaningPlaceholder: 'Explain what the proverb means...',
    errorAllSolutions: 'All proverbs must have a solution text',
    errorAllCultures: 'All proverbs must have a culture/origin',
    errorAllMeanings: 'All proverbs must have a meaning',
    errorMinWords: (n: number, count: number) => `Proverb ${n} must have at least 3 words (currently has ${count})`,
    errorMaxWords: (n: number, count: number) => `Proverb ${n} must have at most 10 words (currently has ${count})`,
    decodeLabel: 'Load Existing Puzzle',
    decodeDescription: 'Paste an encoded puzzle or URL to edit it',
    decodePlaceholder: 'Paste encoded puzzle string or full URL here...',
    decodeButton: 'Load Puzzle',
    errorDecoding: 'Failed to decode puzzle. Please check the input.',
  },
  he: {
    // Header
    appName: 'ערימת פתגמים',
    subtitle: (count: number) => `הפרד את המילים המעורבבות ל-${count} פתגמים`,
    instructions: `הפרד את המילים המעורבבות לפתגמים. לחץ על מילה לבחירתה, ואז לחץ על משבצת ריקה למיקומה.`,
    createPuzzle: 'צור חידה',

    // Game
    proverbs: 'פתגמים',
    proverb: 'פתגם',
    availableWords: (count: number) => `מילים זמינות (${count} נותרו)`,
    allWordsPlaced: 'כל המילים ממוקמות - לחץ בדוק תשובה!',

    // Buttons
    checkAnswer: 'בדוק תשובה',
    hint: (remaining: number) => `רמז (${remaining} נותרו)`,
    reset: 'אתחל',

    // Validation
    correct: '✓ נכון',
    incorrect: '✗ לא נכון',
    allCorrect: '🎉 מושלם! כל הפתגמים נכונים!',
    partialCorrect: (solved: number, total: number) => `${solved} מתוך ${total} נכונים. המשך לנסות!`,
    noneCorrect: '✗ אף אחד לא נכון עדיין. נסה לסדר מחדש את המילים!',

    // Modal
    congratulations: 'כל הכבוד!',
    close: 'סגור',
    origin: 'מקור',
    meaning: 'משמעות',

    // Onboarding
    onboardingTitle: 'איך משחקים',
    onboardingStep1: 'לחץ על מילה ממגש המילים בתחתית (היא תהפוך לשחורה)',
    onboardingStep2: 'לחץ על משבצת ריקה באזור הפתגמים למעלה כדי למקם את המילה',
    onboardingStep3: 'כשכל המילים ממוקמות, לחץ על בדוק תשובה',
    onboardingGotIt: 'הבנתי!',
    help: 'עזרה',

    // Loading/Error
    loading: 'טוען חידה...',
    errorLoading: 'שגיאה בטעינת החידה',
    errorMessage: 'הוסף פרמטר חידה לכתובת או בדוק את פורמט החידה.',
    addPuzzle: 'הוסף פרמטר חידה לכתובת או בדוק את פורמט החידה.',
    orCreate: 'צור חידה משלך',

    // Puzzle Builder
    puzzleBuilder: 'בונה חידות',
    builderDescription: 'צור חידת ערימת פתגמים משלך על ידי הזנת 3-4 פתגמים. המילים יעורבבו אוטומטית ויקודדו לכתובת URL ניתנת לשיתוף.',
    languageLabel: 'שפה',
    english: 'אנגלית',
    hebrew: 'עברית',
    proverbsLabel: 'פתגמים',
    proverbNumber: (n: number) => `פתגם ${n}`,
    remove: 'הסר',
    proverbText: 'טקסט הפתגם',
    wordsRequired: '3-10 מילים נדרשות',
    cultureOrigin: 'תרבות/מקור',
    meaningLabel: 'משמעות',
    generateURL: 'צור קישור לחידה',
    clearAll: 'נקה הכל',
    puzzleGenerated: '✓ החידה נוצרה!',
    shareURL: 'שתף קישור זה כדי לאפשר לאחרים לשחק בחידה שלך:',
    copy: 'העתק',
    copied: 'הועתק!',
    addAnother: '+ הוסף פתגם נוסף (אופציונלי)',
    proverbPlaceholder: 'לדוגמה: יד רוחצת יד',
    culturePlaceholder: 'לדוגמה: עברית, ערבית, הודית',
    meaningPlaceholder: 'הסבר מה הפתגם אומר...',
    errorAllSolutions: 'כל הפתגמים חייבים להכיל טקסט פתרון',
    errorAllCultures: 'כל הפתגמים חייבים להכיל תרבות/מקור',
    errorAllMeanings: 'כל הפתגמים חייבים להכיל משמעות',
    errorMinWords: (n: number, count: number) => `פתגם ${n} חייב להכיל לפחות 3 מילים (כרגע יש ${count})`,
    errorMaxWords: (n: number, count: number) => `פתגם ${n} חייב להכיל לכל היותר 10 מילים (כרגע יש ${count})`,
    decodeLabel: 'טען חידה קיימת',
    decodeDescription: 'הדבק חידה מקודדת או קישור לעריכה',
    decodePlaceholder: 'הדבק כאן מחרוזת מקודדת או קישור מלא...',
    decodeButton: 'טען חידה',
    errorDecoding: 'פענוח החידה נכשל. אנא בדוק את הקלט.',
  },
};

export const getTranslations = (language: LanguageCode): Translations => {
  return translations[language] || translations.en;
};
