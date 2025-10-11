/**
 * Tests for useMultiProverbGameState hook - focusing on adaptive fixed words logic
 */

import { renderHook, act } from '@testing-library/react';
import { useMultiProverbGameState } from './useMultiProverbGameState';
import { PuzzleData } from '../types';

const createTestPuzzle = (proverbs: Array<{ solution: string; culture: string; meaning: string }>): PuzzleData => ({
  version: '1.0',
  language: 'en',
  proverbs: proverbs.map((p, i) => ({
    id: `test-${i}`,
    solution: p.solution,
    culture: p.culture,
    meaning: p.meaning,
  })),
});

describe('useMultiProverbGameState - Adaptive Fixed Words', () => {
  it('should place 1 fixed word for proverbs with < 5 words', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Short proverb here', culture: 'Test', meaning: 'Test meaning' }, // 3 words
      { solution: 'Another short one test', culture: 'Test', meaning: 'Test meaning' }, // 4 words
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const { gameState } = result.current;

    // Check each proverb has exactly 1 fixed word
    puzzle.proverbs.forEach((_, proverbIndex) => {
      const fixedWordsForProverb = gameState.allWords.filter(
        word => word.sourceProverbIndex === proverbIndex && word.isLocked
      );
      expect(fixedWordsForProverb).toHaveLength(1);
      
      // Verify the fixed word has isFixedByLength set to true
      expect(fixedWordsForProverb[0].isFixedByLength).toBe(true);
    });
  });

  it('should place 2 fixed words for proverbs with 5-9 words', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Five words in this proverb', culture: 'Test', meaning: 'Test meaning' }, // 5 words
      { solution: 'This is a longer proverb with seven words', culture: 'Test', meaning: 'Test meaning' }, // 8 words
      { solution: 'Another very long proverb with many words here', culture: 'Test', meaning: 'Test meaning' }, // 9 words
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const { gameState } = result.current;

    // Check each proverb has exactly 2 fixed words
    puzzle.proverbs.forEach((_, proverbIndex) => {
      const fixedWordsForProverb = gameState.allWords.filter(
        word => word.sourceProverbIndex === proverbIndex && word.isLocked
      );
      expect(fixedWordsForProverb).toHaveLength(2);
      
      // Verify all fixed words have isFixedByLength set to true
      fixedWordsForProverb.forEach(word => {
        expect(word.isFixedByLength).toBe(true);
      });
    });
  });

  it('should place 3 fixed words for proverbs with > 9 words', () => {
    const puzzle = createTestPuzzle([
      { solution: 'This is a very long proverb with many words that exceeds nine words', culture: 'Test', meaning: 'Test meaning' }, // 14 words
      { solution: 'Another extremely long proverb sentence with more than nine words in total here', culture: 'Test', meaning: 'Test meaning' }, // 13 words
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const { gameState } = result.current;

    // Check each proverb has exactly 3 fixed words
    puzzle.proverbs.forEach((_, proverbIndex) => {
      const fixedWordsForProverb = gameState.allWords.filter(
        word => word.sourceProverbIndex === proverbIndex && word.isLocked
      );
      expect(fixedWordsForProverb).toHaveLength(3);
      
      // Verify all fixed words have isFixedByLength set to true
      fixedWordsForProverb.forEach(word => {
        expect(word.isFixedByLength).toBe(true);
      });
    });
  });

  it('should handle mixed proverb lengths correctly', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Short one', culture: 'Test', meaning: 'Test meaning' }, // 2 words
      { solution: 'This beautiful wonderful amazing longer proverb contains many excellent words here', culture: 'Test', meaning: 'Test meaning' }, // 12 words with many good anchor candidates
      { solution: 'Medium length proverb here today', culture: 'Test', meaning: 'Test meaning' }, // 5 words
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const { gameState } = result.current;

    // First proverb (2 words) should have 1 fixed word (< 5 words)
    const proverb0Fixed = gameState.allWords.filter(
      word => word.sourceProverbIndex === 0 && word.isLocked
    );
    expect(proverb0Fixed).toHaveLength(1);

    // Second proverb (12 words) should have 3 fixed words (> 9 words)
    const proverb1Fixed = gameState.allWords.filter(
      word => word.sourceProverbIndex === 1 && word.isLocked
    );
    expect(proverb1Fixed).toHaveLength(3);

    // Third proverb (5 words) should have 2 fixed words (5-9 words)
    const proverb2Fixed = gameState.allWords.filter(
      word => word.sourceProverbIndex === 2 && word.isLocked
    );
    expect(proverb2Fixed).toHaveLength(2);
  });

  it('should place fixed words at their correct positions', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const { gameState } = result.current;

    const fixedWords = gameState.allWords.filter(word => word.isLocked);
    
    fixedWords.forEach(word => {
      // Fixed word should be placed at its original position
      expect(word.placement).not.toBeNull();
      expect(word.placement!.proverbIndex).toBe(word.sourceProverbIndex);
      expect(word.placement!.positionIndex).toBe(word.originalIndex);
    });
  });

  it('should prioritize meaningful words for fixed positions', () => {
    const puzzle = createTestPuzzle([
      { solution: 'The quick brown fox jumps over lazy dog', culture: 'Test', meaning: 'Test meaning' }, // 8 words
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const { gameState } = result.current;

    const fixedWords = gameState.allWords.filter(word => word.isLocked);
    
    // Should have 2 fixed words for this 8-word proverb (5-9 words = 2 fixed)
    expect(fixedWords).toHaveLength(2);
    
    // Fixed words should not be articles or short words
    const skipWords = ['the', 'a', 'an', 'is', 'to', 'of', 'in', 'on', 'at', 'it'];
    fixedWords.forEach(word => {
      expect(word.text.length).toBeGreaterThan(2);
      expect(skipWords).not.toContain(word.text.toLowerCase());
    });
  });
});

describe('useMultiProverbGameState - Two-Level Hint System', () => {
  it('should reveal meaning on first hint use (level 1)', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Initially no hints used
    expect(result.current.gameState.usedHints.has(0)).toBe(false);
    expect(result.current.gameState.wordHintsUsed.get(0)).toBeUndefined();
    expect(result.current.gameState.totalHintsUsed).toBe(0);

    // Use first hint (level 1 - reveal meaning)
    act(() => {
      result.current.useHint(0);
    });

    expect(result.current.gameState.usedHints.has(0)).toBe(true);
    expect(result.current.gameState.wordHintsUsed.get(0)).toBeUndefined();
    expect(result.current.gameState.totalHintsUsed).toBe(1);
  });

  it('should place a word on second hint use (level 2)', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Use first hint (level 1)
    act(() => {
      result.current.useHint(0);
    });

    // Count available words before level 2 hint
    const availableWordsBefore = result.current.gameState.allWords.filter(
      word => word.sourceProverbIndex === 0 && word.placement === null && !word.isLocked
    ).length;

    // Use second hint (level 2 - place word)
    act(() => {
      result.current.useHint(0);
    });

    expect(result.current.gameState.wordHintsUsed.get(0)).toBe(1);
    expect(result.current.gameState.totalHintsUsed).toBe(2);

    // Should have placed a word (one less available word)
    const availableWordsAfter = result.current.gameState.allWords.filter(
      word => word.sourceProverbIndex === 0 && word.placement === null && !word.isLocked
    ).length;
    
    expect(availableWordsAfter).toBe(availableWordsBefore - 1);
  });

  it('should not provide level 2 hint if no words available', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Use first hint (level 1)
    act(() => {
      result.current.useHint(0);
    });

    // Manually place all available words for this proverb
    const availableWords = result.current.gameState.allWords.filter(
      word => word.sourceProverbIndex === 0 && word.placement === null && !word.isLocked
    );

    availableWords.forEach((word, index) => {
      act(() => {
        result.current.moveWord(word.id, 0, index + 1); // Place in positions after fixed words
      });
    });

    const totalHintsBefore = result.current.gameState.totalHintsUsed;

    // Try to use second hint - should not work since no words available
    act(() => {
      result.current.useHint(0);
    });

    expect(result.current.gameState.wordHintsUsed.get(0)).toBeUndefined();
    expect(result.current.gameState.totalHintsUsed).toBe(totalHintsBefore);
  });

  it('should not provide hints for already solved proverbs', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Manually mark proverb as solved
    act(() => {
      // This is a bit of a hack for testing - in real usage, validation sets this
      result.current.gameState.proverbValidation[0] = { isSolved: true, isValidated: true };
    });

    const totalHintsBefore = result.current.gameState.totalHintsUsed;

    // Try to use hint on solved proverb
    act(() => {
      result.current.useHint(0);
    });

    expect(result.current.gameState.usedHints.has(0)).toBe(false);
    expect(result.current.gameState.totalHintsUsed).toBe(totalHintsBefore);
  });

  it('should allow multiple word hints up to 80% of proverb', () => {
    const puzzle = createTestPuzzle([
      { solution: 'This is a longer proverb with many words here', culture: 'Test', meaning: 'Test meaning' }, // 9 words, 80% = 7 words
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Use first hint (level 1 - reveal meaning)
    act(() => {
      result.current.useHint(0);
    });

    expect(result.current.gameState.totalHintsUsed).toBe(1);

    // Use multiple word hints (level 2) - should allow up to 7 words (80% of 9)
    const maxWordHints = Math.floor(9 * 0.8); // Should be 7
    
    for (let i = 0; i < maxWordHints; i++) {
      act(() => {
        result.current.useHint(0);
      });
    }

    expect(result.current.gameState.wordHintsUsed.get(0)).toBe(maxWordHints);
    expect(result.current.gameState.totalHintsUsed).toBe(1 + maxWordHints);

    // Try to use one more hint - should not work as we've reached the limit
    const totalHintsBefore = result.current.gameState.totalHintsUsed;
    act(() => {
      result.current.useHint(0);
    });

    expect(result.current.gameState.totalHintsUsed).toBe(totalHintsBefore); // Should remain the same
  });

  it('should reset both hint levels on game reset', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Use both hint levels
    act(() => {
      result.current.useHint(0); // Level 1
      result.current.useHint(0); // Level 2
    });

    expect(result.current.gameState.usedHints.has(0)).toBe(true);
    expect(result.current.gameState.wordHintsUsed.get(0)).toBe(1);
    expect(result.current.gameState.totalHintsUsed).toBe(2);

    // Reset game
    act(() => {
      result.current.reset();
    });

    expect(result.current.gameState.usedHints.has(0)).toBe(false);
    expect(result.current.gameState.wordHintsUsed.get(0)).toBeUndefined();
    expect(result.current.gameState.totalHintsUsed).toBe(0);
  });
});

describe('useMultiProverbGameState - Individual Proverb Validation', () => {
  it('should validate individual proverb and fix correct words', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Place all words correctly
    const solutionWords = ['Test', 'proverb', 'here'];
    const availableWords = result.current.gameState.allWords.filter(
      word => word.sourceProverbIndex === 0 && !word.isLocked
    );

    solutionWords.forEach((expectedWord, position) => {
      const wordToPlace = availableWords.find(word => word.text === expectedWord);
      if (wordToPlace) {
        act(() => {
          result.current.moveWord(wordToPlace.id, 0, position);
        });
      }
    });

    // Validate the individual proverb
    act(() => {
      result.current.validateProverb(0);
    });

    // Check that the proverb is marked as solved
    expect(result.current.gameState.proverbValidation[0].isSolved).toBe(true);
    expect(result.current.gameState.proverbValidation[0].isValidated).toBe(true);

    // Check that correct words are now locked
    const placedWords = result.current.gameState.allWords.filter(
      word => word.placement && word.placement.proverbIndex === 0
    );
    placedWords.forEach(word => {
      expect(word.isLocked).toBe(true);
    });
  });

  it('should return incorrect words to tray and fix correct ones', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Place words incorrectly (swap first two)
    const availableWords = result.current.gameState.allWords.filter(
      word => word.sourceProverbIndex === 0 && !word.isLocked
    );

    const testWord = availableWords.find(word => word.text === 'Test');
    const proverbWord = availableWords.find(word => word.text === 'proverb');
    const hereWord = availableWords.find(word => word.text === 'here');

    if (testWord && proverbWord && hereWord) {
      act(() => {
        result.current.moveWord(proverbWord.id, 0, 0); // Wrong: 'proverb' in position 0
        result.current.moveWord(testWord.id, 0, 1);    // Wrong: 'Test' in position 1
        result.current.moveWord(hereWord.id, 0, 2);    // Correct: 'here' in position 2
      });

      // Validate the individual proverb
      act(() => {
        result.current.validateProverb(0);
      });

      // Check that proverb is not solved (has incorrect words)
      expect(result.current.gameState.proverbValidation[0].isSolved).toBe(false);
      expect(result.current.gameState.proverbValidation[0].isValidated).toBe(true);

      // Check that incorrect words are returned to tray
      const updatedTestWord = result.current.gameState.allWords.find(w => w.id === testWord.id);
      const updatedProverbWord = result.current.gameState.allWords.find(w => w.id === proverbWord.id);
      const updatedHereWord = result.current.gameState.allWords.find(w => w.id === hereWord.id);

      expect(updatedTestWord?.placement).toBeNull(); // Returned to tray
      expect(updatedProverbWord?.placement).toBeNull(); // Returned to tray
      expect(updatedHereWord?.placement).not.toBeNull(); // Stays in place
      expect(updatedHereWord?.isLocked).toBe(true); // Fixed in place
    }
  });

  it('should not validate incomplete proverbs', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Place only one word
    const availableWords = result.current.gameState.allWords.filter(
      word => word.sourceProverbIndex === 0 && !word.isLocked
    );
    const testWord = availableWords.find(word => word.text === 'Test');

    if (testWord) {
      act(() => {
        result.current.moveWord(testWord.id, 0, 0);
      });

      // Try to validate incomplete proverb
      act(() => {
        result.current.validateProverb(0);
      });

      // Should not be validated
      expect(result.current.gameState.proverbValidation[0].isValidated).toBe(false);
    }
  });
});

describe('useMultiProverbGameState - Enhanced Selection System', () => {
  it('should initialize with empty selection state', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    expect(result.current.gameState.selectionState.selectedWordId).toBeNull();
    expect(result.current.gameState.selectionState.selectedPlaceholder).toBeNull();
    expect(result.current.gameState.selectionState.autoFocusTarget).toBeNull();
  });

  it('should select and deselect words', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const availableWord = result.current.availableWords[0];

    // Select a word
    act(() => {
      result.current.selectWord(availableWord.id);
    });

    expect(result.current.gameState.selectionState.selectedWordId).toBe(availableWord.id);

    // Deselect the word
    act(() => {
      result.current.selectWord(null);
    });

    expect(result.current.gameState.selectionState.selectedWordId).toBeNull();
  });

  it('should select placeholders', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Select a placeholder
    act(() => {
      result.current.selectPlaceholder(0, 1);
    });

    expect(result.current.gameState.selectionState.selectedPlaceholder).toEqual({
      proverbIndex: 0,
      positionIndex: 1,
    });
  });

  it('should clear word selection when selecting placeholder', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const availableWord = result.current.availableWords[0];

    // Select a word first
    act(() => {
      result.current.selectWord(availableWord.id);
    });

    expect(result.current.gameState.selectionState.selectedWordId).toBe(availableWord.id);

    // Select a placeholder - should clear word selection
    act(() => {
      result.current.selectPlaceholder(0, 1);
    });

    expect(result.current.gameState.selectionState.selectedWordId).toBeNull();
    expect(result.current.gameState.selectionState.selectedPlaceholder).toEqual({
      proverbIndex: 0,
      positionIndex: 1,
    });
  });

  it('should find next empty slot correctly', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Find all empty positions initially
    const initialEmptyPositions: number[] = [];
    for (let pos = 0; pos < 3; pos++) {
      const wordAtPosition = result.current.gameState.allWords.find(
        w => w.placement && w.placement.proverbIndex === 0 && w.placement.positionIndex === pos
      );
      if (!wordAtPosition) {
        initialEmptyPositions.push(pos);
      }
    }

    // Place a word in the first empty position
    const firstEmptyPos = initialEmptyPositions[0];
    const availableWord = result.current.availableWords[0];
    act(() => {
      result.current.moveWord(availableWord.id, 0, firstEmptyPos);
    });

    // Find next empty slot after the placed position
    const nextSlot = result.current.findNextEmptySlot(0, firstEmptyPos);
    
    // Should return the next empty position, or null if no more empty positions
    if (initialEmptyPositions.length > 1) {
      const expectedNextPos = initialEmptyPositions.find(pos => pos > firstEmptyPos);
      if (expectedNextPos !== undefined) {
        expect(nextSlot).toEqual({ proverbIndex: 0, positionIndex: expectedNextPos });
      } else {
        // No more empty positions in this proverb, should look at next proverb or return null
        expect(nextSlot).toBeNull();
      }
    } else {
      // Only one empty position, should return null after filling it
      expect(nextSlot).toBeNull();
    }
  });

  it('should find first empty slot when called with (-1, -1)', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Find first empty slot from beginning
    const firstSlot = result.current.findNextEmptySlot(-1, -1);
    
    // Should return the first empty position
    expect(firstSlot).not.toBeNull();
    expect(firstSlot?.proverbIndex).toBe(0);
    expect(typeof firstSlot?.positionIndex).toBe('number');
    expect(firstSlot?.positionIndex).toBeGreaterThanOrEqual(0);
  });

  it('should clear all selections', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));
    const availableWord = result.current.availableWords[0];

    // Set up some selections
    act(() => {
      result.current.selectWord(availableWord.id);
      result.current.updateAutoFocus({ proverbIndex: 0, positionIndex: 1 });
    });

    expect(result.current.gameState.selectionState.selectedWordId).toBe(availableWord.id);
    expect(result.current.gameState.selectionState.autoFocusTarget).toEqual({
      proverbIndex: 0,
      positionIndex: 1,
    });

    // Clear selections
    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.gameState.selectionState.selectedWordId).toBeNull();
    expect(result.current.gameState.selectionState.selectedPlaceholder).toBeNull();
    // Auto-focus should remain (as per the implementation)
    expect(result.current.gameState.selectionState.autoFocusTarget).toEqual({
      proverbIndex: 0,
      positionIndex: 1,
    });
  });
});

describe('useMultiProverbGameState - Reset Functionality', () => {
  it('should reset validation attempts to 3', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Use some validation attempts
    act(() => {
      result.current.validate();
      result.current.validate();
    });

    expect(result.current.gameState.validationAttempts).toBe(1);
    expect(result.current.gameState.totalValidationAttempts).toBe(2);

    // Reset the game
    act(() => {
      result.current.reset();
    });

    expect(result.current.gameState.validationAttempts).toBe(3);
    expect(result.current.gameState.totalValidationAttempts).toBe(0);
  });

  it('should clear hasFailedGame flag', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Exhaust all validation attempts to trigger game failure
    act(() => {
      result.current.validate();
      result.current.validate();
      result.current.validate();
    });

    expect(result.current.gameState.hasFailedGame).toBe(true);

    // Reset the game
    act(() => {
      result.current.reset();
    });

    expect(result.current.gameState.hasFailedGame).toBe(false);
  });

  it('should reset hint usage tracking', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
      { solution: 'Another test proverb', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Use hints on both proverbs
    act(() => {
      result.current.useHint(0);
      result.current.useHint(1);
    });

    expect(result.current.gameState.usedHints.size).toBe(2);
    expect(result.current.gameState.totalHintsUsed).toBe(2);
    expect(result.current.gameState.usedHints.has(0)).toBe(true);
    expect(result.current.gameState.usedHints.has(1)).toBe(true);

    // Reset the game
    act(() => {
      result.current.reset();
    });

    expect(result.current.gameState.usedHints.size).toBe(0);
    expect(result.current.gameState.totalHintsUsed).toBe(0);
    expect(result.current.gameState.usedHints.has(0)).toBe(false);
    expect(result.current.gameState.usedHints.has(1)).toBe(false);
  });

  it('should reset statistics counters', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Use hints and validation attempts
    act(() => {
      result.current.useHint(0);
      result.current.validate();
      result.current.validate();
    });

    expect(result.current.gameState.totalHintsUsed).toBe(1);
    expect(result.current.gameState.totalValidationAttempts).toBe(2);

    // Reset the game
    act(() => {
      result.current.reset();
    });

    expect(result.current.gameState.totalHintsUsed).toBe(0);
    expect(result.current.gameState.totalValidationAttempts).toBe(0);
  });

  it('should keep locked words in place after reset', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Get initial locked words
    const initialLockedWords = result.current.gameState.allWords.filter(word => word.isLocked);
    expect(initialLockedWords.length).toBeGreaterThan(0);

    // Move some unlocked words
    const unlockedWord = result.current.gameState.allWords.find(word => !word.isLocked);
    if (unlockedWord) {
      act(() => {
        result.current.moveWord(unlockedWord.id, 0, 0);
      });
    }

    // Reset the game
    act(() => {
      result.current.reset();
    });

    // Locked words should still be in their original positions
    const afterResetLockedWords = result.current.gameState.allWords.filter(word => word.isLocked);
    expect(afterResetLockedWords).toHaveLength(initialLockedWords.length);
    
    afterResetLockedWords.forEach(word => {
      expect(word.placement).not.toBeNull();
      expect(word.placement!.proverbIndex).toBe(word.sourceProverbIndex);
      expect(word.placement!.positionIndex).toBe(word.originalIndex);
    });

    // Unlocked words should be removed from board
    const unlockedWords = result.current.gameState.allWords.filter(word => !word.isLocked);
    unlockedWords.forEach(word => {
      expect(word.placement).toBeNull();
    });
  });

  it('should reset validation state', () => {
    const puzzle = createTestPuzzle([
      { solution: 'Test proverb here', culture: 'Test', meaning: 'Test meaning' },
    ]);

    const { result } = renderHook(() => useMultiProverbGameState(puzzle));

    // Trigger validation
    act(() => {
      result.current.validate();
    });

    expect(result.current.gameState.proverbValidation[0].isValidated).toBe(true);
    expect(result.current.gameState.isCompleted).toBe(false);

    // Reset the game
    act(() => {
      result.current.reset();
    });

    expect(result.current.gameState.proverbValidation[0].isValidated).toBe(false);
    expect(result.current.gameState.proverbValidation[0].isSolved).toBe(false);
    expect(result.current.gameState.isCompleted).toBe(false);
  });
});