/**
 * Type definitions for Proverb Pile puzzle data structures
 * Based on puzzle_schema.json
 */

export type LanguageCode = 'en' | 'he';

export interface Proverb {
  /**
   * Unique identifier for the proverb (optional, auto-generated if not provided)
   * Will be generated as a URL-safe slug from the solution
   */
  id?: string;
  /**
   * @deprecated Scrambled words array (optional, derived from solution if not provided)
   * Kept for backward compatibility but no longer necessary
   */
  words?: string[];
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
 * Represents a word that can be placed in any proverb
 * Used in the new multi-proverb architecture
 */
export interface GlobalWord {
  /** Unique identifier for this word instance */
  id: string;
  /** The word text */
  text: string;
  /** Which proverb this word originally came from */
  sourceProverbIndex: number;
  /** Original index in the source proverb's word array */
  originalIndex: number;
  /** Current placement (null if in available pool) */
  placement: {
    /** Which proverb it's placed in */
    proverbIndex: number;
    /** Position within that proverb (0-based) */
    positionIndex: number;
  } | null;
  /** Whether this word is locked (cannot be moved) */
  isLocked: boolean;
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
 * New game state architecture that supports cross-proverb word movement
 */
export interface MultiProverbGameState {
  /** The loaded puzzle data */
  puzzleData: PuzzleData | null;
  /** All words from all proverbs in a global pool */
  allWords: GlobalWord[];
  /** Validation state for each proverb */
  proverbValidation: {
    isSolved: boolean;
    isValidated: boolean;
  }[];
  /** Whether all proverbs are completed */
  isCompleted: boolean;
  /** Error message if puzzle failed to load */
  error: string | null;
  /** Number of hints remaining (max 2) */
  hintsRemaining: number;
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
