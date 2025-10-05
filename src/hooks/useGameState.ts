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
 * Main game state hook
 */
export const useGameState = (fallbackPuzzle?: PuzzleData) => {
  const [gameState, setGameState] = useState<GameState>({
    puzzleData: null,
    currentProverbIndex: 0,
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
   * Moves a word to a target position
   */
  const handleMoveWord = useCallback(
    (wordIndex: number, targetIndex: number | null) => {
      setGameState(prev => {
        const currentState = prev.proverbStates[prev.currentProverbIndex];
        const newWordPositions = moveWord(
          currentState.wordPositions,
          wordIndex,
          targetIndex
        );

        const newProverbStates = [...prev.proverbStates];
        newProverbStates[prev.currentProverbIndex] = {
          ...currentState,
          wordPositions: newWordPositions,
          isValidated: false,
        };

        return {
          ...prev,
          proverbStates: newProverbStates,
        };
      });
    },
    []
  );

  /**
   * Validates current proverb solution
   */
  const handleValidate = useCallback(() => {
    setGameState(prev => {
      const currentState = prev.proverbStates[prev.currentProverbIndex];
      const isCorrect = validateSolution(
        currentState.wordPositions,
        currentState.proverb.solution
      );

      const newProverbStates = [...prev.proverbStates];
      newProverbStates[prev.currentProverbIndex] = {
        ...currentState,
        isSolved: isCorrect,
        isValidated: true,
      };

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
   * Moves to the next proverb
   */
  const handleNextProverb = useCallback(() => {
    setGameState(prev => {
      const nextIndex = prev.currentProverbIndex + 1;
      if (nextIndex < prev.proverbStates.length) {
        return {
          ...prev,
          currentProverbIndex: nextIndex,
        };
      }
      return prev;
    });
  }, []);

  /**
   * Moves to the previous proverb
   */
  const handlePreviousProverb = useCallback(() => {
    setGameState(prev => {
      const prevIndex = prev.currentProverbIndex - 1;
      if (prevIndex >= 0) {
        return {
          ...prev,
          currentProverbIndex: prevIndex,
        };
      }
      return prev;
    });
  }, []);

  /**
   * Resets the current proverb
   */
  const handleResetProverb = useCallback(() => {
    setGameState(prev => {
      const currentState = prev.proverbStates[prev.currentProverbIndex];
      const newWordPositions = resetWordPositions(currentState.wordPositions);

      const newProverbStates = [...prev.proverbStates];
      newProverbStates[prev.currentProverbIndex] = {
        ...currentState,
        wordPositions: newWordPositions,
        isSolved: false,
        isValidated: false,
      };

      return {
        ...prev,
        proverbStates: newProverbStates,
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

  // Get current proverb state
  const currentProverbState =
    gameState.proverbStates[gameState.currentProverbIndex] || null;

  return {
    gameState,
    currentProverbState,
    actions: {
      moveWord: handleMoveWord,
      validate: handleValidate,
      nextProverb: handleNextProverb,
      previousProverb: handlePreviousProverb,
      resetProverb: handleResetProverb,
      resetGame: handleResetGame,
    },
  };
};
