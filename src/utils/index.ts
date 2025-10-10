/**
 * Central export point for utility functions
 */

export {
  decodePuzzle,
  encodePuzzle,
  validatePuzzle,
  getPuzzleFromURL,
  loadPuzzleFromURL,
} from './puzzleLoader';

export {
  shuffleArray,
  initializeWordPositions,
  validateSolution,
  normalizeText,
  moveWord,
  getAvailableWords,
  getPlacedWords,
  resetWordPositions,
} from './wordUtils';

export { getTranslations } from './translations';
export type { LanguageCode } from './translations';

export { loadRandomHebrewPuzzle, getRandomPuzzleNumber } from './randomPuzzleLoader';
export { generateRandomPuzzleFromCSV, hasMorePuzzles, getProverbCount } from './csvPuzzleLoader';

/**
 * Generate URL with language parameter
 */
export const generateLanguageURL = (language: 'en' | 'he', baseURL?: string): string => {
  const url = new URL(baseURL || window.location.href);
  url.searchParams.set('lang', language);
  return url.toString();
};

/**
 * Get current language from URL parameters, localStorage, or default
 */
export const getCurrentLanguagePreference = (): 'en' | 'he' => {
  // Check URL parameters first
  const params = new URLSearchParams(window.location.search);
  const urlLanguage = params.get('lang') || params.get('language');
  if (urlLanguage === 'en' || urlLanguage === 'he') {
    return urlLanguage;
  }

  // Check localStorage
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage === 'en' || savedLanguage === 'he') {
    return savedLanguage;
  }

  // Default to English
  return 'en';
};
