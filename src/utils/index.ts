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
