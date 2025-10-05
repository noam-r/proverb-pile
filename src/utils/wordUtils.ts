/**
 * Utility functions for word manipulation and validation
 */

import { Proverb, WordPosition } from '../types';

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array (does not modify original)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Initializes word positions for a proverb
 * Words are shuffled and marked as not placed
 * @param proverb - Proverb data
 * @returns Array of word positions
 */
export const initializeWordPositions = (proverb: Proverb): WordPosition[] => {
  const shuffledWords = shuffleArray(proverb.words);
  return shuffledWords.map((word, index) => ({
    word,
    originalIndex: index,
    currentIndex: null,
  }));
};

/**
 * Validates if the current word arrangement matches the solution
 * @param wordPositions - Current word positions
 * @param solution - Correct proverb solution
 * @returns true if the arrangement is correct
 */
export const validateSolution = (
  wordPositions: WordPosition[],
  solution: string
): boolean => {
  // Get all placed words in order
  const placedWords = wordPositions
    .filter(wp => wp.currentIndex !== null)
    .sort((a, b) => (a.currentIndex as number) - (b.currentIndex as number))
    .map(wp => wp.word);

  // Check if all words are placed
  if (placedWords.length !== wordPositions.length) {
    return false;
  }

  // Join words and compare (case-insensitive, normalized)
  const currentSolution = placedWords.join(' ');
  const normalizedCurrent = normalizeText(currentSolution);
  const normalizedSolution = normalizeText(solution);

  return normalizedCurrent === normalizedSolution;
};

/**
 * Normalizes text for comparison (removes extra spaces, punctuation, case)
 * @param text - Text to normalize
 * @returns Normalized text
 */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' '); // Normalize whitespace
};

/**
 * Moves a word to a new position
 * @param wordPositions - Current word positions
 * @param wordIndex - Index of the word to move
 * @param targetIndex - Target position index (null to remove from solution)
 * @returns New word positions array
 */
export const moveWord = (
  wordPositions: WordPosition[],
  wordIndex: number,
  targetIndex: number | null
): WordPosition[] => {
  const newPositions = [...wordPositions];

  // If target position is occupied, swap or clear it
  if (targetIndex !== null) {
    const occupyingWord = newPositions.find(
      wp => wp.currentIndex === targetIndex
    );
    if (occupyingWord) {
      occupyingWord.currentIndex = null;
    }
  }

  // Move the word
  newPositions[wordIndex] = {
    ...newPositions[wordIndex],
    currentIndex: targetIndex,
  };

  return newPositions;
};

/**
 * Gets available (not placed) words
 * @param wordPositions - Current word positions
 * @returns Array of words that haven't been placed
 */
export const getAvailableWords = (
  wordPositions: WordPosition[]
): WordPosition[] => {
  return wordPositions.filter(wp => wp.currentIndex === null);
};

/**
 * Gets placed words in solution order
 * @param wordPositions - Current word positions
 * @returns Array of placed words sorted by position
 */
export const getPlacedWords = (
  wordPositions: WordPosition[]
): WordPosition[] => {
  return wordPositions
    .filter(wp => wp.currentIndex !== null)
    .sort((a, b) => (a.currentIndex as number) - (b.currentIndex as number));
};

/**
 * Resets all word positions (removes them from solution)
 * @param wordPositions - Current word positions
 * @returns New word positions with all currentIndex set to null
 */
export const resetWordPositions = (
  wordPositions: WordPosition[]
): WordPosition[] => {
  return wordPositions.map(wp => ({
    ...wp,
    currentIndex: null,
  }));
};
