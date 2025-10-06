/**
 * Game state hook for multi-proverb puzzle with cross-proverb word movement
 * This replaces the old architecture that restricted words to their source proverb
 */

import { useState, useCallback, useMemo } from 'react';
import { MultiProverbGameState, PuzzleData, GlobalWord } from '../types';

/**
 * Choose anchor words that are meaningful (not articles/short words)
 */
const isGoodAnchorWord = (word: string): boolean => {
  const lowercased = word.toLowerCase();
  const skipWords = ['a', 'an', 'the', 'is', 'to', 'of', 'in', 'on', 'at', 'it'];
  return word.length > 2 && !skipWords.includes(lowercased);
};

/**
 * Initialize all words from all proverbs into a global pool
 * Derives words directly from solution (ignoring the words array if present)
 * Places 1-2 anchor words per proverb at the start
 */
const initializeGlobalWords = (puzzleData: PuzzleData): GlobalWord[] => {
  const allWords: GlobalWord[] = [];

  puzzleData.proverbs.forEach((proverb, proverbIndex) => {
    // Split solution into words - this is the single source of truth
    const solutionWords = proverb.solution.split(/\s+/);

    // Find good anchor word candidates by position
    const goodPositions: number[] = [];
    solutionWords.forEach((word, position) => {
      if (isGoodAnchorWord(word)) {
        goodPositions.push(position);
      }
    });

    // Select 1-2 random anchor positions
    const numAnchors = Math.min(
      Math.floor(Math.random() * 2) + 1, // 1 or 2
      goodPositions.length
    );
    const selectedAnchorPositions = new Set<number>();
    const tempGoodPositions = [...goodPositions];
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
      });
    });
  });

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
        error: 'No puzzle data provided',
        hintsRemaining: 2,
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
      hintsRemaining: 2,
    };
  });

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

      return {
        ...prev,
        proverbValidation: newValidation,
        isCompleted: allSolved,
      };
    });
  }, []);

  /**
   * Reset all unlocked words to unplaced state
   * Keeps locked words (anchors and hints) in place and preserves hints remaining
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

      return {
        ...prev,
        allWords: resetWords,
        proverbValidation: prev.puzzleData.proverbs.map(() => ({
          isSolved: false,
          isValidated: false,
        })),
        isCompleted: false,
        // Keep hintsRemaining unchanged - don't reset to 2
      };
    });
  }, []);

  /**
   * Use a hint: lock 1 random unplaced word in its correct position
   */
  const handleUseHint = useCallback(() => {
    setGameState(prev => {
      if (prev.hintsRemaining <= 0 || !prev.puzzleData) {
        return prev;
      }

      // Get all unplaced, unlocked words
      const unplacedWords = prev.allWords.filter(
        w => !w.placement && !w.isLocked
      );

      if (unplacedWords.length === 0) {
        return prev;
      }

      // Select 1 random word to place
      const randomIdx = Math.floor(Math.random() * unplacedWords.length);
      const selectedWord = unplacedWords[randomIdx];

      // Build position map for each proverb to handle duplicate words correctly
      const proverbPositionMaps = new Map<number, Map<string, number[]>>();
      prev.puzzleData.proverbs.forEach((proverb, proverbIndex) => {
        const solutionWords = proverb.solution.split(/\s+/);
        const positionMap = new Map<string, number[]>();
        solutionWords.forEach((solWord, idx) => {
          // Just lowercase for matching - don't strip Unicode characters
          const normalized = solWord.toLowerCase();
          if (!positionMap.has(normalized)) {
            positionMap.set(normalized, []);
          }
          positionMap.get(normalized)!.push(idx);
        });
        proverbPositionMaps.set(proverbIndex, positionMap);
      });

      // Track which positions are already used (by locked words or to be placed)
      const usedPositions = new Map<number, Set<number>>();
      prev.allWords.forEach(word => {
        if (word.placement && word.isLocked) {
          if (!usedPositions.has(word.sourceProverbIndex)) {
            usedPositions.set(word.sourceProverbIndex, new Set());
          }
          usedPositions.get(word.sourceProverbIndex)!.add(word.placement.positionIndex);
        }
      });

      // Find correct position for the selected word
      const positionMap = proverbPositionMaps.get(selectedWord.sourceProverbIndex);
      // Just lowercase for matching - don't strip Unicode characters
      const normalized = selectedWord.text.toLowerCase();
      const availablePositions = positionMap?.get(normalized) || [];

      // Find first unused position for this word
      const proverbUsed = usedPositions.get(selectedWord.sourceProverbIndex) || new Set();
      const correctPosition = availablePositions.find(pos => !proverbUsed.has(pos));

      if (correctPosition === undefined) {
        return prev; // Should never happen with valid data
      }

      // Place the word in its correct position
      const newWords = prev.allWords.map(word => {
        if (word.id === selectedWord.id) {
          return {
            ...word,
            placement: {
              proverbIndex: word.sourceProverbIndex,
              positionIndex: correctPosition,
            },
            isLocked: true,
          };
        }
        return word;
      });

      return {
        ...prev,
        allWords: newWords,
        hintsRemaining: prev.hintsRemaining - 1,
      };
    });
  }, []);

  /**
   * Get all available (unplaced) words
   */
  const availableWords = useMemo(() => {
    return gameState.allWords.filter(word => word.placement === null);
  }, [gameState.allWords]);

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

  return {
    gameState,
    availableWords,
    getWordsForProverb,
    moveWord: handleMoveWord,
    removeWord: handleRemoveWord,
    validate: handleValidate,
    reset: handleReset,
    useHint: handleUseHint,
  };
};
