/**
 * Random puzzle loader utility
 * Dynamically imports and returns a random Hebrew puzzle
 */

import { PuzzleData } from '../types';

// Import all Hebrew puzzle files
const puzzleImports = {
  1: () => import('../data/he-puzzle-1.json'),
  2: () => import('../data/he-puzzle-2.json'),
  3: () => import('../data/he-puzzle-3.json'),
  4: () => import('../data/he-puzzle-4.json'),
  5: () => import('../data/he-puzzle-5.json'),
  6: () => import('../data/he-puzzle-6.json'),
  7: () => import('../data/he-puzzle-7.json'),
  8: () => import('../data/he-puzzle-8.json'),
  9: () => import('../data/he-puzzle-9.json'),
  10: () => import('../data/he-puzzle-10.json'),
};

/**
 * Loads a random Hebrew puzzle from the available puzzle files
 * @returns Promise<PuzzleData> - A randomly selected Hebrew puzzle
 */
export const loadRandomHebrewPuzzle = async (): Promise<PuzzleData> => {
  // Generate random number between 1 and 10
  const randomNumber = Math.floor(Math.random() * 10) + 1;
  
  try {
    // Dynamically import the selected puzzle
    const puzzleModule = await puzzleImports[randomNumber as keyof typeof puzzleImports]();
    return puzzleModule.default as PuzzleData;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load puzzle ${randomNumber}:`, error);
    
    // Fallback to puzzle 1 if there's an error
    try {
      const fallbackModule = await puzzleImports[1]();
      return fallbackModule.default as PuzzleData;
    } catch (fallbackError) {
      // eslint-disable-next-line no-console
      console.error('Failed to load fallback puzzle:', fallbackError);
      throw new Error('Unable to load any Hebrew puzzle');
    }
  }
};

/**
 * Gets a random puzzle number (1-10) for display purposes
 * @returns number - Random puzzle number
 */
export const getRandomPuzzleNumber = (): number => {
  return Math.floor(Math.random() * 10) + 1;
};