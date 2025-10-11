/**
 * Game state hook for multi-proverb puzzle with cross-proverb word movement
 * This replaces the old architecture that restricted words to their source proverb
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { MultiProverbGameState, PuzzleData, GlobalWord } from '../types/puzzle';
import { countWordsInSolution } from '../utils/wordUtils';

/**
 * Choose anchor words that are meaningful (not articles/short words)
 */
const isGoodAnchorWord = (word: string): boolean => {
  const lowercased = word.toLowerCase();
  const skipWords = ['a', 'an', 'the', 'is', 'to', 'of', 'in', 'on', 'at', 'it'];
  return word.length > 2 && !skipWords.includes(lowercased);
};

/**
 * Cache for fixed word calculations to avoid recalculation
 */
const fixedWordCache = new Map<string, GlobalWord[]>();

/**
 * Generate a cache key for puzzle data to enable memoization
 */
const generatePuzzleCacheKey = (puzzleData: PuzzleData): string => {
  return puzzleData.proverbs.map(p => `${p.solution}|${p.culture}`).join('::');
};

/**
 * Initialize all words from all proverbs into a global pool
 * Derives words directly from solution (ignoring the words array if present)
 * Places adaptive number of anchor words per proverb based on word count
 * Uses caching to avoid recalculation for the same puzzle
 */
const initializeGlobalWords = (puzzleData: PuzzleData): GlobalWord[] => {
  const cacheKey = generatePuzzleCacheKey(puzzleData);
  
  // Check cache first
  if (fixedWordCache.has(cacheKey)) {
    return fixedWordCache.get(cacheKey)!;
  }

  const allWords: GlobalWord[] = [];

  puzzleData.proverbs.forEach((proverb, proverbIndex) => {
    // Split solution into words - this is the single source of truth
    const solutionWords = proverb.solution.split(/\s+/);
    const wordCount = countWordsInSolution(proverb.solution);

    // Find good anchor word candidates by position (optimized with filter + map)
    const goodPositions = solutionWords
      .map((word, position) => ({ word, position }))
      .filter(({ word }) => isGoodAnchorWord(word))
      .map(({ position }) => position);

    // Adaptive fixed word count based on proverb length
    // < 5 words = 1 fixed, 5-9 words = 2 fixed, > 9 words = 3 fixed
    const targetFixedCount = wordCount < 5 ? 1 : wordCount <= 9 ? 2 : 3;
    const numAnchors = Math.min(targetFixedCount, goodPositions.length);
    
    // Use Set for O(1) lookup performance
    const selectedAnchorPositions = new Set<number>();
    const tempGoodPositions = [...goodPositions];
    
    // Optimized selection loop
    for (let i = 0; i < numAnchors && tempGoodPositions.length > 0; i++) {
      const randomIdx = Math.floor(Math.random() * tempGoodPositions.length);
      selectedAnchorPositions.add(tempGoodPositions[randomIdx]);
      tempGoodPositions.splice(randomIdx, 1);
    }

    // Create word objects - one for each word in the solution
    solutionWords.forEach((word, wordIndex) => {
      const isAnchor = selectedAnchorPositions.has(wordIndex);

      allWords.push({
        id: `${proverbIndex}-${wordIndex}`,
        text: word,
        sourceProverbIndex: proverbIndex,
        originalIndex: wordIndex,
        placement: isAnchor ? {
          proverbIndex,
          positionIndex: wordIndex, // Anchor at its correct position
        } : null,
        isLocked: isAnchor,
        isFixedByLength: isAnchor, // All anchors are now based on length logic
      });
    });
  });

  // Cache the result
  fixedWordCache.set(cacheKey, allWords);
  
  // Limit cache size to prevent memory leaks
  if (fixedWordCache.size > 10) {
    const firstKey = fixedWordCache.keys().next().value;
    if (firstKey) {
      fixedWordCache.delete(firstKey);
    }
  }

  return allWords;
};

/**
 * Custom hook for managing multi-proverb game state
 */
export const useMultiProverbGameState = (puzzleData: PuzzleData | null) => {
  const [gameState, setGameState] = useState<MultiProverbGameState>(() => {
    if (!puzzleData) {
      return {
        puzzleData: null,
        allWords: [],
        proverbValidation: [],
        isCompleted: false,
        error: null, // Don't set error initially - wait for puzzle to load
        usedHints: new Set<number>(),
        wordHintsUsed: new Map<number, number>(),
        totalHintsUsed: 0,
        validationAttempts: 3,
        hasFailedGame: false,
        totalValidationAttempts: 0,
        selectionState: {
          selectedWordId: null,
          selectedPlaceholder: null,
          autoFocusTarget: null,
        },
      };
    }

    return {
      puzzleData,
      allWords: initializeGlobalWords(puzzleData),
      proverbValidation: puzzleData.proverbs.map(() => ({
        isSolved: false,
        isValidated: false,
      })),
      isCompleted: false,
      error: null,
      usedHints: new Set<number>(),
      wordHintsUsed: new Map<number, number>(),
      totalHintsUsed: 0,
      validationAttempts: 3,
      hasFailedGame: false,
      totalValidationAttempts: 0,
      selectionState: {
        selectedWordId: null,
        selectedPlaceholder: null,
        autoFocusTarget: null,
      },
    };
  });

  // Update game state when puzzle data changes
  useEffect(() => {
    if (puzzleData && (!gameState.puzzleData || gameState.puzzleData !== puzzleData)) {
      const initialWords = initializeGlobalWords(puzzleData);
      
      // Find the first empty slot for auto-focus
      let initialAutoFocus = null;
      for (let proverbIdx = 0; proverbIdx < puzzleData.proverbs.length; proverbIdx++) {
        const proverb = puzzleData.proverbs[proverbIdx];
        const wordCount = proverb.solution.split(/\s+/).length;
        
        for (let pos = 0; pos < wordCount; pos++) {
          const wordAtPosition = initialWords.find(
            w => w.placement && w.placement.proverbIndex === proverbIdx && w.placement.positionIndex === pos
          );
          if (!wordAtPosition) {
            initialAutoFocus = { proverbIndex: proverbIdx, positionIndex: pos };
            break;
          }
        }
        if (initialAutoFocus) break;
      }
      
      setGameState({
        puzzleData,
        allWords: initialWords,
        proverbValidation: puzzleData.proverbs.map(() => ({
          isSolved: false,
          isValidated: false,
        })),
        isCompleted: false,
        error: null,
        usedHints: new Set<number>(),
        wordHintsUsed: new Map<number, number>(),
        totalHintsUsed: 0,
        validationAttempts: 3,
        hasFailedGame: false,
        totalValidationAttempts: 0,
        selectionState: {
          selectedWordId: null,
          selectedPlaceholder: null,
          autoFocusTarget: initialAutoFocus,
        },
      });
    }
  }, [puzzleData, gameState.puzzleData]);

  /**
   * Move a word to a specific proverb position
   * @param wordId - Unique ID of the word to move
   * @param targetProverbIndex - Which proverb to place it in
   * @param targetPosition - Position within that proverb (0-based)
   */
  const handleMoveWord = useCallback(
    (wordId: string, targetProverbIndex: number, targetPosition: number) => {
      setGameState(prev => {
        // Check if the word being moved is locked
        const wordToMove = prev.allWords.find(w => w.id === wordId);
        if (wordToMove?.isLocked) {
          return prev; // Don't allow moving locked words
        }

        const newWords = prev.allWords.map(word => {
          if (word.id === wordId) {
            // Moving this word
            return {
              ...word,
              placement: {
                proverbIndex: targetProverbIndex,
                positionIndex: targetPosition,
              },
            };
          }

          // Check if another word is already at this position
          if (
            word.placement &&
            word.placement.proverbIndex === targetProverbIndex &&
            word.placement.positionIndex === targetPosition
          ) {
            // Don't displace locked words
            if (word.isLocked) {
              return word;
            }
            return {
              ...word,
              placement: null, // Remove from position
            };
          }

          return word;
        });

        // Reset validation when words are moved
        const resetValidation = prev.proverbValidation.map(() => ({
          isSolved: false,
          isValidated: false,
        }));

        return {
          ...prev,
          allWords: newWords,
          proverbValidation: resetValidation,
        };
      });
    },
    []
  );

  /**
   * Remove a word from its current position
   */
  const handleRemoveWord = useCallback((wordId: string) => {
    setGameState(prev => {
      // Don't allow removing locked words
      const word = prev.allWords.find(w => w.id === wordId);
      if (word?.isLocked) {
        return prev;
      }

      const newWords = prev.allWords.map(word =>
        word.id === wordId ? { ...word, placement: null } : word
      );

      return {
        ...prev,
        allWords: newWords,
      };
    });
  }, []);

  /**
   * Validate all proverb solutions
   */
  const handleValidate = useCallback(() => {
    setGameState(prev => {
      if (!prev.puzzleData) return prev;
      
      // Prevent validation when game is over
      if (prev.hasFailedGame) return prev;
      
      // Prevent validation when no attempts remaining
      if (prev.validationAttempts <= 0) return prev;

      const newValidation = prev.puzzleData.proverbs.map((proverb, proverbIndex) => {
        // Get all words placed in this proverb, sorted by position
        const placedWords = prev.allWords
          .filter(
            word =>
              word.placement && word.placement.proverbIndex === proverbIndex
          )
          .sort(
            (a, b) =>
              a.placement!.positionIndex - b.placement!.positionIndex
          )
          .map(word => word.text);

        // Check if all positions are filled
        const expectedWordCount = proverb.solution.split(/\s+/).length;
        if (placedWords.length !== expectedWordCount) {
          return { isSolved: false, isValidated: true };
        }

        // Join and compare with solution (normalized)
        const currentSolution = placedWords.join(' ');
        // Normalize: lowercase, trim, collapse whitespace
        // Don't strip non-ASCII characters (Hebrew, etc.)
        const normalizedCurrent = currentSolution
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ');
        const normalizedSolution = proverb.solution
          .toLowerCase()
          .trim()
          .replace(/\s+/g, ' ');

        return {
          isSolved: normalizedCurrent === normalizedSolution,
          isValidated: true,
        };
      });

      const allSolved = newValidation.every(v => v.isSolved);
      
      // Decrement validation attempts and track total attempts used
      const newValidationAttempts = prev.validationAttempts - 1;
      const newTotalValidationAttempts = prev.totalValidationAttempts + 1;
      
      // Determine if game has failed (no attempts left and not all solved)
      const hasFailedGame = !allSolved && newValidationAttempts <= 0;

      return {
        ...prev,
        proverbValidation: newValidation,
        isCompleted: allSolved,
        validationAttempts: newValidationAttempts,
        totalValidationAttempts: newTotalValidationAttempts,
        hasFailedGame,
      };
    });
  }, []);

  /**
   * Reset all unlocked words to unplaced state
   * Resets all game state including hints, validation attempts, and statistics
   */
  const handleReset = useCallback(() => {
    setGameState(prev => {
      if (!prev.puzzleData) return prev;

      // Reset only unlocked words - keep locked words in place
      const resetWords = prev.allWords.map(word => {
        if (word.isLocked) {
          return word; // Keep locked words as-is
        }
        return {
          ...word,
          placement: null, // Remove unlocked words from board
        };
      });

      // Find the first empty slot for auto-focus after reset
      let resetAutoFocus = null;
      for (let proverbIdx = 0; proverbIdx < prev.puzzleData.proverbs.length; proverbIdx++) {
        const proverb = prev.puzzleData.proverbs[proverbIdx];
        const wordCount = proverb.solution.split(/\s+/).length;
        
        for (let pos = 0; pos < wordCount; pos++) {
          const wordAtPosition = resetWords.find(
            w => w.placement && w.placement.proverbIndex === proverbIdx && w.placement.positionIndex === pos
          );
          if (!wordAtPosition) {
            resetAutoFocus = { proverbIndex: proverbIdx, positionIndex: pos };
            break;
          }
        }
        if (resetAutoFocus) break;
      }

      return {
        ...prev,
        allWords: resetWords,
        proverbValidation: prev.puzzleData.proverbs.map(() => ({
          isSolved: false,
          isValidated: false,
        })),
        isCompleted: false,
        // Reset validation attempts and game failure state
        validationAttempts: 3,
        hasFailedGame: false,
        totalValidationAttempts: 0,
        // Reset hint usage tracking and statistics
        usedHints: new Set<number>(),
        wordHintsUsed: new Map<number, number>(),
        totalHintsUsed: 0,
        // Reset selection state with new auto-focus
        selectionState: {
          selectedWordId: null,
          selectedPlaceholder: null,
          autoFocusTarget: resetAutoFocus,
        },
      };
    });
  }, []);

  /**
   * Use a hint: enhanced two-level hint system with multiple word placements
   * Level 1: Reveal the meaning of a specific proverb
   * Level 2: Place words in correct positions (up to 80% of the proverb)
   * @param proverbIndex - Index of the proverb to provide hint for
   */
  const handleUseHint = useCallback((proverbIndex: number) => {
    setGameState(prev => {
      if (!prev.puzzleData) {
        return prev;
      }

      // Don't provide hints for already solved proverbs
      if (prev.proverbValidation[proverbIndex]?.isSolved) {
        return prev;
      }

      const proverb = prev.puzzleData.proverbs[proverbIndex];
      const solutionWords = proverb.solution.split(/\s+/);
      const totalWords = solutionWords.length;
      
      // Level 1: Reveal meaning (if not already revealed)
      if (!prev.usedHints.has(proverbIndex)) {
        const newUsedHints = new Set(prev.usedHints);
        newUsedHints.add(proverbIndex);

        return {
          ...prev,
          usedHints: newUsedHints,
          totalHintsUsed: prev.totalHintsUsed + 1,
        };
      }
      
      // Level 2: Place a word (if meaning already revealed)
      if (prev.usedHints.has(proverbIndex)) {
        // Calculate how many words can be placed via hints (80% of total, rounded down)
        const maxHintWords = Math.floor(totalWords * 0.8);
        const currentHintWords = prev.wordHintsUsed.get(proverbIndex) || 0;
        
        // Check if we've reached the hint limit
        if (currentHintWords >= maxHintWords) {
          return prev;
        }
        
        // Find available words that belong to this proverb
        const availableWordsForProverb = prev.allWords.filter(
          word => word.sourceProverbIndex === proverbIndex && word.placement === null && !word.isLocked
        );
        
        // If no words available, don't proceed
        if (availableWordsForProverb.length === 0) {
          return prev;
        }
        
        // Find the first empty position in this proverb
        let targetPosition = -1;
        
        for (let pos = 0; pos < solutionWords.length; pos++) {
          const wordAtPosition = prev.allWords.find(
            w => w.placement && w.placement.proverbIndex === proverbIndex && w.placement.positionIndex === pos
          );
          if (!wordAtPosition) {
            targetPosition = pos;
            break;
          }
        }
        
        // If no empty position found, don't proceed
        if (targetPosition === -1) {
          return prev;
        }
        
        // Find the correct word for this position
        const correctWord = availableWordsForProverb.find(
          word => word.originalIndex === targetPosition
        );
        
        // If correct word not available, pick the first available word from this proverb
        const wordToPlace = correctWord || availableWordsForProverb[0];
        
        // Place the word
        const newWords = prev.allWords.map(word => {
          if (word.id === wordToPlace.id) {
            return {
              ...word,
              placement: {
                proverbIndex,
                positionIndex: targetPosition,
              },
            };
          }
          
          // Check if another word is already at this position (shouldn't happen but safety check)
          if (
            word.placement &&
            word.placement.proverbIndex === proverbIndex &&
            word.placement.positionIndex === targetPosition
          ) {
            if (!word.isLocked) {
              return {
                ...word,
                placement: null,
              };
            }
          }
          
          return word;
        });
        
        // Update word hints used count
        const newWordHintsUsed = new Map(prev.wordHintsUsed);
        newWordHintsUsed.set(proverbIndex, currentHintWords + 1);
        
        // Reset validation when words are moved
        const resetValidation = prev.proverbValidation.map(() => ({
          isSolved: false,
          isValidated: false,
        }));

        return {
          ...prev,
          allWords: newWords,
          wordHintsUsed: newWordHintsUsed,
          totalHintsUsed: prev.totalHintsUsed + 1,
          proverbValidation: resetValidation,
        };
      }
      
      return prev;
    });
  }, []);

  /**
   * Get all available (unplaced) words
   */
  const availableWords = useMemo(() => {
    return gameState.allWords.filter(word => word.placement === null);
  }, [gameState.allWords]);

  /**
   * Validate a single proverb: fix correct words, return incorrect words to tray
   * @param proverbIndex - Index of the proverb to validate
   */
  const handleValidateProverb = useCallback((proverbIndex: number) => {
    setGameState(prev => {
      if (!prev.puzzleData) return prev;
      
      // Don't validate if already solved or game is over
      if (prev.proverbValidation[proverbIndex]?.isSolved || prev.hasFailedGame) {
        return prev;
      }

      const proverb = prev.puzzleData.proverbs[proverbIndex];
      const solutionWords = proverb.solution.split(/\s+/);
      
      // Get all words placed in this proverb, sorted by position
      const placedWords = prev.allWords
        .filter(word => word.placement && word.placement.proverbIndex === proverbIndex)
        .sort((a, b) => a.placement!.positionIndex - b.placement!.positionIndex);

      // Check if all positions are filled
      if (placedWords.length !== solutionWords.length) {
        return prev; // Don't validate incomplete proverbs
      }

      // Determine which words are correct/incorrect
      const correctWordIds = new Set<string>();
      const incorrectWordIds = new Set<string>();
      
      placedWords.forEach((word, index) => {
        const expectedWord = solutionWords[index];
        if (word.text.toLowerCase() === expectedWord.toLowerCase()) {
          correctWordIds.add(word.id);
        } else {
          incorrectWordIds.add(word.id);
        }
      });

      // Update words: fix correct ones, remove incorrect ones
      const newWords = prev.allWords.map(word => {
        if (correctWordIds.has(word.id)) {
          // Make correct words fixed (locked)
          return {
            ...word,
            isLocked: true,
          };
        } else if (incorrectWordIds.has(word.id)) {
          // Remove incorrect words from their positions
          return {
            ...word,
            placement: null,
          };
        }
        return word;
      });

      // Update validation state for this proverb
      const newValidation = [...prev.proverbValidation];
      const isProverbSolved = incorrectWordIds.size === 0;
      newValidation[proverbIndex] = {
        isSolved: isProverbSolved,
        isValidated: true,
      };

      // Check if all proverbs are now completed
      const allSolved = newValidation.every(v => v.isSolved);

      return {
        ...prev,
        allWords: newWords,
        proverbValidation: newValidation,
        isCompleted: allSolved,
      };
    });
  }, []);

  /**
   * Get words placed in a specific proverb
   */
  const getWordsForProverb = useCallback(
    (proverbIndex: number) => {
      return gameState.allWords.filter(
        word =>
          word.placement && word.placement.proverbIndex === proverbIndex
      );
    },
    [gameState.allWords]
  );

  /**
   * Select a word from the word tray
   */
  const handleSelectWord = useCallback((wordId: string | null) => {
    setGameState(prev => ({
      ...prev,
      selectionState: {
        ...prev.selectionState,
        selectedWordId: wordId,
        // Clear placeholder selection when selecting a word
        selectedPlaceholder: wordId ? null : prev.selectionState.selectedPlaceholder,
      },
    }));
  }, []);

  /**
   * Select a placeholder position
   */
  const handleSelectPlaceholder = useCallback((proverbIndex: number, positionIndex: number) => {
    setGameState(prev => ({
      ...prev,
      selectionState: {
        ...prev.selectionState,
        selectedPlaceholder: { proverbIndex, positionIndex },
        // Clear word selection when selecting a placeholder
        selectedWordId: null,
      },
    }));
  }, []);

  /**
   * Clear all selections
   */
  const handleClearSelection = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectionState: {
        selectedWordId: null,
        selectedPlaceholder: null,
        autoFocusTarget: prev.selectionState.autoFocusTarget, // Keep auto-focus
      },
    }));
  }, []);

  /**
   * Find the next empty slot for auto-focus progression
   */
  const findNextEmptySlot = useCallback((currentProverbIndex: number, currentPosition: number) => {
    if (!gameState.puzzleData) return null;

    // Handle special case for finding first empty slot (when called with -1, -1)
    if (currentProverbIndex === -1) {
      // Search from the beginning of all proverbs
      for (let proverbIdx = 0; proverbIdx < gameState.puzzleData.proverbs.length; proverbIdx++) {
        const proverb = gameState.puzzleData.proverbs[proverbIdx];
        const wordCount = proverb.solution.split(/\s+/).length;
        
        for (let pos = 0; pos < wordCount; pos++) {
          const wordAtPosition = gameState.allWords.find(
            w => w.placement && w.placement.proverbIndex === proverbIdx && w.placement.positionIndex === pos
          );
          if (!wordAtPosition) {
            return { proverbIndex: proverbIdx, positionIndex: pos };
          }
        }
      }
      return null; // No empty slots found
    }

    // First, try to find next empty slot in the same proverb
    const currentProverb = gameState.puzzleData.proverbs[currentProverbIndex];
    const currentProverbWordCount = currentProverb.solution.split(/\s+/).length;
    
    for (let pos = currentPosition + 1; pos < currentProverbWordCount; pos++) {
      const wordAtPosition = gameState.allWords.find(
        w => w.placement && w.placement.proverbIndex === currentProverbIndex && w.placement.positionIndex === pos
      );
      if (!wordAtPosition) {
        return { proverbIndex: currentProverbIndex, positionIndex: pos };
      }
    }

    // If no empty slot in current proverb, try next proverbs
    for (let proverbIdx = currentProverbIndex + 1; proverbIdx < gameState.puzzleData.proverbs.length; proverbIdx++) {
      const proverb = gameState.puzzleData.proverbs[proverbIdx];
      const wordCount = proverb.solution.split(/\s+/).length;
      
      for (let pos = 0; pos < wordCount; pos++) {
        const wordAtPosition = gameState.allWords.find(
          w => w.placement && w.placement.proverbIndex === proverbIdx && w.placement.positionIndex === pos
        );
        if (!wordAtPosition) {
          return { proverbIndex: proverbIdx, positionIndex: pos };
        }
      }
    }

    // If no empty slot found after current position, try from the beginning
    for (let proverbIdx = 0; proverbIdx <= currentProverbIndex; proverbIdx++) {
      const proverb = gameState.puzzleData.proverbs[proverbIdx];
      const wordCount = proverb.solution.split(/\s+/).length;
      const maxPos = proverbIdx === currentProverbIndex ? currentPosition : wordCount;
      
      for (let pos = 0; pos < maxPos; pos++) {
        const wordAtPosition = gameState.allWords.find(
          w => w.placement && w.placement.proverbIndex === proverbIdx && w.placement.positionIndex === pos
        );
        if (!wordAtPosition) {
          return { proverbIndex: proverbIdx, positionIndex: pos };
        }
      }
    }

    return null; // No empty slots found
  }, [gameState.allWords, gameState.puzzleData]);

  /**
   * Update auto-focus target
   */
  const handleUpdateAutoFocus = useCallback((target: { proverbIndex: number; positionIndex: number } | null) => {
    setGameState(prev => ({
      ...prev,
      selectionState: {
        ...prev.selectionState,
        autoFocusTarget: target,
      },
    }));
  }, []);

  return {
    gameState,
    availableWords,
    getWordsForProverb,
    moveWord: handleMoveWord,
    removeWord: handleRemoveWord,
    validate: handleValidate,
    validateProverb: handleValidateProverb,
    reset: handleReset,
    useHint: handleUseHint,
    // Selection management functions
    selectWord: handleSelectWord,
    selectPlaceholder: handleSelectPlaceholder,
    clearSelection: handleClearSelection,
    findNextEmptySlot,
    updateAutoFocus: handleUpdateAutoFocus,
  };
};
