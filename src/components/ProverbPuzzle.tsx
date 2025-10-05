/**
 * Main Proverb Puzzle component
 */

import React, { useState, useCallback } from 'react';
import { ProverbState } from '../types';
import { Word } from './Word';
import { DropZone } from './DropZone';
import { getAvailableWords } from '../utils';
import styles from './ProverbPuzzle.module.css';

interface ProverbPuzzleProps {
  proverbState: ProverbState;
  onMoveWord: (wordIndex: number, targetIndex: number | null) => void;
  onValidate: () => void;
  onReset: () => void;
  isRTL?: boolean;
}

export const ProverbPuzzle: React.FC<ProverbPuzzleProps> = ({
  proverbState,
  onMoveWord,
  onValidate,
  onReset,
  isRTL = false,
}) => {
  const [draggedWordIndex, setDraggedWordIndex] = useState<number | null>(null);

  const handleWordDragStart = useCallback((wordIndex: number) => {
    setDraggedWordIndex(wordIndex);
  }, []);

  const handleWordDragEnd = useCallback(() => {
    setDraggedWordIndex(null);
  }, []);

  const handleDrop = useCallback(
    (dropIndex: number) => {
      if (draggedWordIndex !== null) {
        onMoveWord(draggedWordIndex, dropIndex);
      }
    },
    [draggedWordIndex, onMoveWord]
  );

  const handleWordRemove = useCallback(
    (dropIndex: number) => {
      // Find which word is at this position
      const wordAtPosition = proverbState.wordPositions.find(
        wp => wp.currentIndex === dropIndex
      );
      if (wordAtPosition) {
        const wordIndex = proverbState.wordPositions.indexOf(wordAtPosition);
        onMoveWord(wordIndex, null);
      }
    },
    [proverbState.wordPositions, onMoveWord]
  );

  const handleAvailableWordClick = useCallback(
    (wordIndex: number) => {
      // Find first empty position
      const maxPosition = proverbState.proverb.words.length;
      for (let i = 0; i < maxPosition; i++) {
        const isOccupied = proverbState.wordPositions.some(
          wp => wp.currentIndex === i
        );
        if (!isOccupied) {
          onMoveWord(wordIndex, i);
          return;
        }
      }
    },
    [proverbState, onMoveWord]
  );

  const availableWords = getAvailableWords(proverbState.wordPositions);

  // Create array for drop zones
  const dropZones = Array.from(
    { length: proverbState.proverb.words.length },
    (_, index) => {
      const wordAtPosition = proverbState.wordPositions.find(
        wp => wp.currentIndex === index
      );
      return {
        index,
        word: wordAtPosition?.word || null,
        wordIndex: wordAtPosition
          ? proverbState.wordPositions.indexOf(wordAtPosition)
          : null,
      };
    }
  );

  const containerClassName = isRTL
    ? `${styles.container} ${styles.rtl}`
    : styles.container;

  return (
    <div className={containerClassName}>
      <div className={styles.puzzleArea}>
        {/* Status message */}
        {proverbState.isValidated && (
          <div
            className={`${styles.status} ${
              proverbState.isSolved ? styles.success : styles.error
            }`}
          >
            {proverbState.isSolved
              ? '✓ Correct! Well done!'
              : '✗ Not quite right. Try again!'}
          </div>
        )}

        {/* Solution area (drop zones) */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Build the proverb</div>
          <div className={styles.solutionContainer}>
            {dropZones.map(zone => (
              <DropZone
                key={zone.index}
                index={zone.index}
                word={zone.word}
                wordIndex={zone.wordIndex}
                isRTL={isRTL}
                isCorrect={proverbState.isSolved && proverbState.isValidated}
                isIncorrect={
                  !proverbState.isSolved && proverbState.isValidated
                }
                onDrop={handleDrop}
                onWordDragStart={handleWordDragStart}
                onWordDragEnd={handleWordDragEnd}
                onWordRemove={handleWordRemove}
              />
            ))}
          </div>
        </div>

        {/* Available words */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Available words</div>
          <div className={styles.wordsContainer}>
            {availableWords.length > 0 ? (
              availableWords.map((wp, idx) => {
                const wordIndex = proverbState.wordPositions.indexOf(wp);
                return (
                  <Word
                    key={`${wp.word}-${idx}`}
                    word={wp.word}
                    index={wordIndex}
                    isPlaced={false}
                    isRTL={isRTL}
                    onDragStart={handleWordDragStart}
                    onDragEnd={handleWordDragEnd}
                    onClick={() => handleAvailableWordClick(wordIndex)}
                  />
                );
              })
            ) : (
              <div className={styles.emptyState}>All words placed</div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={onValidate}
          disabled={availableWords.length > 0 || proverbState.isSolved}
        >
          Check Answer
        </button>
        <button className={styles.button} onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  );
};
