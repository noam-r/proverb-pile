/**
 * Custom hook for managing game state
 */

import { useState, useEffect, useCallback } from 'react';
import { GameState, PuzzleData, ProverbState } from '../types';
import { loadPuzzleFromURL } from '../utils/puzzleLoader';
import {
  initializeWordPositions,
  validateSolution,
  moveWord,
  resetWordPositions,
} from '../utils/wordUtils';

/**
 * Initializes proverb states from puzzle data
 */
const initializeProverbStates = (puzzleData: PuzzleData): ProverbState[] => {
  return puzzleData.proverbs.map(proverb => ({
    proverb,
    wordPositions: initializeWordPositions(proverb),
    isSolved: false,
    isValidated: false,
  }));
};

/**
 * Main game state hook - All proverbs are solved in a single stage
 */
export const useGameState = (fallbackPuzzle?: PuzzleData) => {
  const [gameState, setGameState] = useState<GameState>({
    puzzleData: null,
    currentProverbIndex: 0, // Keep for compatibility but always 0
    proverbStates: [],
    isCompleted: false,
    error: null,
  });

  // Load puzzle on mount
  useEffect(() => {
    const { puzzle, error } = loadPuzzleFromURL();

    if (puzzle) {
      setGameState({
        puzzleData: puzzle,
        currentProverbIndex: 0,
        proverbStates: initializeProverbStates(puzzle),
        isCompleted: false,
        error: null,
      });
    } else if (fallbackPuzzle) {
      // Use fallback puzzle if provided (for development)
      setGameState({
        puzzleData: fallbackPuzzle,
        currentProverbIndex: 0,
        proverbStates: initializeProverbStates(fallbackPuzzle),
        isCompleted: false,
        error: null,
      });
    } else {
      setGameState(prev => ({
        ...prev,
        error,
      }));
    }
  }, [fallbackPuzzle]);

  /**
   * Moves a word to a target position in a specific proverb
   */
  const handleMoveWord = useCallback(
    (
      proverbIndex: number,
      wordIndex: number,
      targetIndex: number | null
    ) => {
      setGameState(prev => {
        const currentState = prev.proverbStates[proverbIndex];
        const newWordPositions = moveWord(
          currentState.wordPositions,
          wordIndex,
          targetIndex
        );

        const newProverbStates = [...prev.proverbStates];
        newProverbStates[proverbIndex] = {
          ...currentState,
          wordPositions: newWordPositions,
          isValidated: false,
        };

        // Reset validation for all proverbs when any word moves
        const resetValidation = newProverbStates.map(state => ({
          ...state,
          isValidated: false,
        }));

        return {
          ...prev,
          proverbStates: resetValidation,
        };
      });
    },
    []
  );

  /**
   * Validates ALL proverb solutions at once
   */
  const handleValidate = useCallback(() => {
    setGameState(prev => {
      // Validate each proverb
      const newProverbStates = prev.proverbStates.map(state => {
        const isCorrect = validateSolution(
          state.wordPositions,
          state.proverb.solution
        );

        return {
          ...state,
          isSolved: isCorrect,
          isValidated: true,
        };
      });

      // Check if all proverbs are solved
      const allSolved = newProverbStates.every(state => state.isSolved);

      return {
        ...prev,
        proverbStates: newProverbStates,
        isCompleted: allSolved,
      };
    });
  }, []);

  /**
   * Resets all proverbs
   */
  const handleReset = useCallback(() => {
    setGameState(prev => {
      const newProverbStates = prev.proverbStates.map(state => ({
        ...state,
        wordPositions: resetWordPositions(state.wordPositions),
        isSolved: false,
        isValidated: false,
      }));

      return {
        ...prev,
        proverbStates: newProverbStates,
        isCompleted: false,
      };
    });
  }, []);

  /**
   * Resets the entire game
   */
  const handleResetGame = useCallback(() => {
    setGameState(prev => {
      if (!prev.puzzleData) return prev;

      return {
        puzzleData: prev.puzzleData,
        currentProverbIndex: 0,
        proverbStates: initializeProverbStates(prev.puzzleData),
        isCompleted: false,
        error: null,
      };
    });
  }, []);

  return {
    gameState,
    actions: {
      moveWord: handleMoveWord,
      validate: handleValidate,
      reset: handleReset,
      resetGame: handleResetGame,
    },
  };
};
