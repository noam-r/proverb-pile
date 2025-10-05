/**
 * Type definitions for Proverb Pile puzzle data structures
 * Based on puzzle_schema.json
 */

export type LanguageCode = 'en' | 'he';

export interface Proverb {
  /** Unique identifier for the proverb */
  id: string;
  /** Scrambled words for the proverb */
  words: string[];
  /** Correct proverb text */
  solution: string;
  /** Country or cultural origin of the proverb */
  culture: string;
  /** Explanation of the proverb's meaning */
  meaning: string;
}

export interface PuzzleData {
  /** Puzzle schema version */
  version: string;
  /** Puzzle language code */
  language: LanguageCode;
  /** Array of proverbs (3-4 per puzzle) */
  proverbs: Proverb[];
}

/**
 * Represents a word's position in the game
 */
export interface WordPosition {
  /** The word text */
  word: string;
  /** Original index in the scrambled array */
  originalIndex: number;
  /** Current position in the solution (null if not placed) */
  currentIndex: number | null;
}

/**
 * Game state for a single proverb
 */
export interface ProverbState {
  /** The proverb data */
  proverb: Proverb;
  /** Current word positions */
  wordPositions: WordPosition[];
  /** Whether the proverb is correctly solved */
  isSolved: boolean;
  /** Whether validation has been attempted */
  isValidated: boolean;
}

/**
 * Overall game state
 */
export interface GameState {
  /** The loaded puzzle data */
  puzzleData: PuzzleData | null;
  /** Current proverb index being solved */
  currentProverbIndex: number;
  /** State for each proverb */
  proverbStates: ProverbState[];
  /** Whether all proverbs are completed */
  isCompleted: boolean;
  /** Error message if puzzle failed to load */
  error: string | null;
}

/**
 * Drag and drop event data
 */
export interface DragData {
  /** The word being dragged */
  word: string;
  /** Original index of the word */
  originalIndex: number;
  /** Source type (available or solution) */
  sourceType: 'available' | 'solution';
  /** Source index in the array */
  sourceIndex: number | null;
}
