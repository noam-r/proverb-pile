/**
 * Puzzle loading utilities for decoding and validating puzzle data from URLs
 */

import { PuzzleData } from '../types';

/**
 * Decodes a Base64-encoded puzzle string
 * Handles Unicode characters (Hebrew, etc.) by decoding from UTF-8
 * @param encodedPuzzle - Base64 encoded puzzle JSON string
 * @returns Decoded puzzle data object
 * @throws Error if decoding fails
 */
export const decodePuzzle = (encodedPuzzle: string): PuzzleData => {
  try {
    const binaryString = atob(encodedPuzzle);
    // Convert binary string to bytes
    const bytes = Uint8Array.from(binaryString, char => char.charCodeAt(0));
    // Use TextDecoder to handle Unicode characters properly
    const decodedString = new TextDecoder().decode(bytes);
    const puzzleData = JSON.parse(decodedString);
    return puzzleData;
  } catch (error) {
    throw new Error(
      `Failed to decode puzzle: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
};

/**
 * Encodes puzzle data to a Base64 string
 * Handles Unicode characters (Hebrew, etc.) by first encoding to UTF-8
 * @param puzzleData - Puzzle data object to encode
 * @returns Base64 encoded string
 */
export const encodePuzzle = (puzzleData: PuzzleData): string => {
  const jsonString = JSON.stringify(puzzleData);
  // Use TextEncoder to handle Unicode characters properly
  const utf8Bytes = new TextEncoder().encode(jsonString);
  // Convert bytes to binary string
  const binaryString = Array.from(utf8Bytes, byte => String.fromCharCode(byte)).join('');
  return btoa(binaryString);
};

/**
 * Validates puzzle data against the schema requirements
 * @param puzzleData - Puzzle data to validate
 * @returns Object with isValid boolean and optional error message
 */
export const validatePuzzle = (
  puzzleData: any
): { isValid: boolean; error?: string } => {
  // Check if puzzle data exists
  if (!puzzleData) {
    return { isValid: false, error: 'Puzzle data is null or undefined' };
  }

  // Check required top-level fields
  if (!puzzleData.version) {
    return { isValid: false, error: 'Missing required field: version' };
  }

  if (!puzzleData.language) {
    return { isValid: false, error: 'Missing required field: language' };
  }

  if (!puzzleData.proverbs || !Array.isArray(puzzleData.proverbs)) {
    return { isValid: false, error: 'Missing or invalid field: proverbs' };
  }

  // Validate language code
  const validLanguages = ['en', 'he'];
  if (!validLanguages.includes(puzzleData.language)) {
    return {
      isValid: false,
      error: `Invalid language code: ${puzzleData.language}. Must be one of: ${validLanguages.join(', ')}`,
    };
  }

  // Validate proverbs array length
  if (puzzleData.proverbs.length < 3 || puzzleData.proverbs.length > 4) {
    return {
      isValid: false,
      error: `Invalid number of proverbs: ${puzzleData.proverbs.length}. Must be between 3 and 4.`,
    };
  }

  // Auto-generate IDs and validate each proverb
  for (let i = 0; i < puzzleData.proverbs.length; i++) {
    const proverb = puzzleData.proverbs[i];

    if (!proverb.solution) {
      return { isValid: false, error: `Proverb ${i + 1}: Missing solution` };
    }

    // Auto-generate ID if not provided
    if (!proverb.id) {
      // Create a URL-safe slug from the solution
      proverb.id = proverb.solution
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove punctuation
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 50); // Limit length
    }

    // Validate word count from solution (words array is deprecated)
    const wordCount = proverb.solution.split(/\s+/).length;
    if (wordCount < 3 || wordCount > 10) {
      return {
        isValid: false,
        error: `Proverb ${i + 1}: Solution must contain 3-10 words, found ${wordCount}`,
      };
    }

    if (!proverb.culture) {
      return { isValid: false, error: `Proverb ${i + 1}: Missing culture` };
    }

    if (!proverb.meaning) {
      return { isValid: false, error: `Proverb ${i + 1}: Missing meaning` };
    }
  }

  return { isValid: true };
};

/**
 * Extracts puzzle parameter from URL
 * @param url - URL string or window.location object
 * @returns Encoded puzzle string or null if not found
 */
export const getPuzzleFromURL = (
  url: string | Location = window.location
): string | null => {
  const urlObj = typeof url === 'string' ? new URL(url) : url;
  const params = new URLSearchParams(urlObj.search);
  return params.get('puzzle');
};

/**
 * Loads and validates puzzle from URL parameter
 * @returns Object with puzzle data or error
 */
export const loadPuzzleFromURL = (): {
  puzzle: PuzzleData | null;
  error: string | null;
} => {
  try {
    const encodedPuzzle = getPuzzleFromURL();

    if (!encodedPuzzle) {
      return {
        puzzle: null,
        error: 'No puzzle found in URL. Add ?puzzle=<encoded-puzzle> to the URL.',
      };
    }

    const puzzle = decodePuzzle(encodedPuzzle);
    const validation = validatePuzzle(puzzle);

    if (!validation.isValid) {
      return {
        puzzle: null,
        error: `Invalid puzzle: ${validation.error}`,
      };
    }

    return { puzzle, error: null };
  } catch (error) {
    return {
      puzzle: null,
      error: `Failed to load puzzle: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
};
