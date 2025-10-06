/**
 * Tests for word utility functions
 */

import {
  shuffleArray,
  initializeWordPositions,
  validateSolution,
  normalizeText,
  moveWord,
  getAvailableWords,
  getPlacedWords,
  resetWordPositions,
} from './wordUtils';
import { Proverb, WordPosition } from '../types';

const testProverb: Proverb = {
  id: 'test-proverb',
  words: ['the', 'quick', 'brown', 'fox', 'jumps'],
  solution: 'The quick brown fox jumps',
  culture: 'English',
  meaning: 'A test proverb',
};

describe('shuffleArray', () => {
  it('should return array with same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.length).toBe(arr.length);
  });

  it('should contain all original elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  it('should not modify original array', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    shuffleArray(arr);
    expect(arr).toEqual(original);
  });
});

describe('initializeWordPositions', () => {
  it('should create word positions for all words', () => {
    const positions = initializeWordPositions(testProverb);
    const wordCount = testProverb.solution.split(/\s+/).length;
    expect(positions.length).toBe(wordCount);
  });

  it('should set all currentIndex to null', () => {
    const positions = initializeWordPositions(testProverb);
    positions.forEach(pos => {
      expect(pos.currentIndex).toBeNull();
    });
  });

  it('should include all words from proverb', () => {
    const positions = initializeWordPositions(testProverb);
    const words = positions.map(p => p.word).sort();
    const originalWords = testProverb.solution.split(/\s+/).sort();
    expect(words).toEqual(originalWords);
  });
});

describe('normalizeText', () => {
  it('should convert to lowercase', () => {
    expect(normalizeText('HELLO WORLD')).toBe('hello world');
  });

  it('should preserve punctuation (for Unicode support)', () => {
    expect(normalizeText("Hello, World!")).toBe('hello, world!');
  });

  it('should normalize whitespace', () => {
    expect(normalizeText('hello    world')).toBe('hello world');
  });

  it('should trim leading and trailing spaces', () => {
    expect(normalizeText('  hello world  ')).toBe('hello world');
  });

  it('should handle mixed formatting', () => {
    expect(normalizeText('  Hello,   World!  ')).toBe('hello, world!');
  });
});

describe('validateSolution', () => {
  const wordPositions: WordPosition[] = [
    { word: 'the', originalIndex: 0, currentIndex: 0 },
    { word: 'quick', originalIndex: 1, currentIndex: 1 },
    { word: 'brown', originalIndex: 2, currentIndex: 2 },
    { word: 'fox', originalIndex: 3, currentIndex: 3 },
    { word: 'jumps', originalIndex: 4, currentIndex: 4 },
  ];

  it('should return true for correct solution', () => {
    const isValid = validateSolution(wordPositions, testProverb.solution);
    expect(isValid).toBe(true);
  });

  it('should be case insensitive', () => {
    const isValid = validateSolution(wordPositions, 'THE QUICK BROWN FOX JUMPS');
    expect(isValid).toBe(true);
  });

  it('should not ignore punctuation in solution (exact match required)', () => {
    const isValid = validateSolution(wordPositions, 'The quick, brown fox jumps!');
    expect(isValid).toBe(false); // punctuation makes it different
  });

  it('should return false if not all words placed', () => {
    const incomplete = wordPositions.map((wp, i) =>
      i === 0 ? { ...wp, currentIndex: null } : wp
    );
    const isValid = validateSolution(incomplete, testProverb.solution);
    expect(isValid).toBe(false);
  });

  it('should return false for incorrect order', () => {
    const incorrect: WordPosition[] = [
      { word: 'quick', originalIndex: 1, currentIndex: 0 },
      { word: 'the', originalIndex: 0, currentIndex: 1 },
      { word: 'brown', originalIndex: 2, currentIndex: 2 },
      { word: 'fox', originalIndex: 3, currentIndex: 3 },
      { word: 'jumps', originalIndex: 4, currentIndex: 4 },
    ];
    const isValid = validateSolution(incorrect, testProverb.solution);
    expect(isValid).toBe(false);
  });
});

describe('moveWord', () => {
  const wordPositions: WordPosition[] = [
    { word: 'the', originalIndex: 0, currentIndex: null },
    { word: 'quick', originalIndex: 1, currentIndex: null },
    { word: 'brown', originalIndex: 2, currentIndex: null },
  ];

  it('should move word to target position', () => {
    const result = moveWord(wordPositions, 0, 0);
    expect(result[0].currentIndex).toBe(0);
  });

  it('should clear occupied position', () => {
    let positions = moveWord(wordPositions, 0, 0);
    positions = moveWord(positions, 1, 0);
    expect(positions[0].currentIndex).toBeNull();
    expect(positions[1].currentIndex).toBe(0);
  });

  it('should allow removing from solution', () => {
    let positions = moveWord(wordPositions, 0, 0);
    positions = moveWord(positions, 0, null);
    expect(positions[0].currentIndex).toBeNull();
  });

  it('should not modify original array', () => {
    const original = [...wordPositions];
    moveWord(wordPositions, 0, 0);
    expect(wordPositions).toEqual(original);
  });
});

describe('getAvailableWords', () => {
  const wordPositions: WordPosition[] = [
    { word: 'the', originalIndex: 0, currentIndex: 0 },
    { word: 'quick', originalIndex: 1, currentIndex: null },
    { word: 'brown', originalIndex: 2, currentIndex: null },
  ];

  it('should return only unplaced words', () => {
    const available = getAvailableWords(wordPositions);
    expect(available.length).toBe(2);
    expect(available[0].word).toBe('quick');
    expect(available[1].word).toBe('brown');
  });
});

describe('getPlacedWords', () => {
  const wordPositions: WordPosition[] = [
    { word: 'brown', originalIndex: 2, currentIndex: 2 },
    { word: 'quick', originalIndex: 1, currentIndex: 1 },
    { word: 'the', originalIndex: 0, currentIndex: 0 },
    { word: 'fox', originalIndex: 3, currentIndex: null },
  ];

  it('should return only placed words', () => {
    const placed = getPlacedWords(wordPositions);
    expect(placed.length).toBe(3);
  });

  it('should return words in solution order', () => {
    const placed = getPlacedWords(wordPositions);
    expect(placed[0].word).toBe('the');
    expect(placed[1].word).toBe('quick');
    expect(placed[2].word).toBe('brown');
  });
});

describe('resetWordPositions', () => {
  const wordPositions: WordPosition[] = [
    { word: 'the', originalIndex: 0, currentIndex: 0 },
    { word: 'quick', originalIndex: 1, currentIndex: 1 },
    { word: 'brown', originalIndex: 2, currentIndex: null },
  ];

  it('should set all currentIndex to null', () => {
    const reset = resetWordPositions(wordPositions);
    reset.forEach(pos => {
      expect(pos.currentIndex).toBeNull();
    });
  });

  it('should preserve word and originalIndex', () => {
    const reset = resetWordPositions(wordPositions);
    expect(reset[0].word).toBe('the');
    expect(reset[0].originalIndex).toBe(0);
  });

  it('should not modify original array', () => {
    const original = [...wordPositions];
    resetWordPositions(wordPositions);
    expect(wordPositions).toEqual(original);
  });
});
