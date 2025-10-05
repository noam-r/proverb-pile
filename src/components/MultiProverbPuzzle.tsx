/**
 * Multi-Proverb Puzzle component - All proverbs in one stage
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ProverbState } from '../types';
import { Word } from './Word';
import { DropZone } from './DropZone';
import { getAvailableWords } from '../utils';
import styles from './MultiProverbPuzzle.module.css';

interface MultiProverbPuzzleProps {
  proverbStates: ProverbState[];
  onMoveWord: (
    proverbIndex: number,
    wordIndex: number,
    targetIndex: number | null
  ) => void;
  onValidate: () => void;
  onReset: () => void;
  isRTL?: boolean;
}

export const MultiProverbPuzzle: React.FC<MultiProverbPuzzleProps> = ({
  proverbStates,
  onMoveWord,
  onValidate,
  onReset,
  isRTL = false,
}) => {
  const [draggedWord, setDraggedWord] = useState<{
    proverbIndex: number;
    wordIndex: number;
  } | null>(null);

  // Collect all available words from all proverbs
  const availableWordsUnsorted = useMemo(() => {
    const words: Array<{
      word: string;
      proverbIndex: number;
      wordIndex: number;
      uniqueKey: string;
    }> = [];

    proverbStates.forEach((state, proverbIndex) => {
      const available = getAvailableWords(state.wordPositions);
      available.forEach(wp => {
        const wordIndex = state.wordPositions.indexOf(wp);
        words.push({
          word: wp.word,
          proverbIndex,
          wordIndex,
          uniqueKey: `${proverbIndex}-${wordIndex}`, // Unique identifier
        });
      });
    });

    return words;
  }, [proverbStates]);

  // Shuffle all words together on initial load
  const allAvailableWords = useMemo(() => {
    const shuffled = [...availableWordsUnsorted];

    // Fisher-Yates shuffle
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
    // Only re-shuffle when the list of available words changes (not their order)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableWordsUnsorted.map(w => w.uniqueKey).sort().join(',')]);

  const handleWordDragStart = useCallback(
    (proverbIndex: number, wordIndex: number) => {
      setDraggedWord({ proverbIndex, wordIndex });
    },
    []
  );

  const handleWordDragEnd = useCallback(() => {
    setDraggedWord(null);
  }, []);

  const handleDrop = useCallback(
    (proverbIndex: number, dropIndex: number) => {
      if (draggedWord) {
        onMoveWord(draggedWord.proverbIndex, draggedWord.wordIndex, dropIndex);
      }
    },
    [draggedWord, onMoveWord]
  );

  const handleWordRemove = useCallback(
    (proverbIndex: number, dropIndex: number) => {
      const wordAtPosition = proverbStates[proverbIndex].wordPositions.find(
        wp => wp.currentIndex === dropIndex
      );
      if (wordAtPosition) {
        const wordIndex =
          proverbStates[proverbIndex].wordPositions.indexOf(wordAtPosition);
        onMoveWord(proverbIndex, wordIndex, null);
      }
    },
    [proverbStates, onMoveWord]
  );

  const handleAvailableWordClick = useCallback(
    (proverbIndex: number, wordIndex: number) => {
      // Find first empty position in the proverb
      const state = proverbStates[proverbIndex];
      const maxPosition = state.proverb.words.length;
      for (let i = 0; i < maxPosition; i++) {
        const isOccupied = state.wordPositions.some(
          wp => wp.currentIndex === i
        );
        if (!isOccupied) {
          onMoveWord(proverbIndex, wordIndex, i);
          return;
        }
      }
    },
    [proverbStates, onMoveWord]
  );

  // Check validation status
  const allValidated = proverbStates.every(state => state.isValidated);
  const allSolved = proverbStates.every(state => state.isSolved);
  const someSolved = proverbStates.some(state => state.isSolved);
  const canValidate = allAvailableWords.length === 0;

  const containerClassName = isRTL
    ? `${styles.container} ${styles.rtl}`
    : styles.container;

  return (
    <div className={containerClassName}>
      <div className={styles.puzzleArea}>
        {/* Global status message */}
        {allValidated && (
          <div
            className={`${styles.status} ${
              allSolved
                ? styles.success
                : someSolved
                ? styles.partial
                : styles.error
            }`}
          >
            {allSolved
              ? '🎉 Perfect! All proverbs are correct!'
              : someSolved
              ? `${
                  proverbStates.filter(s => s.isSolved).length
                } out of ${proverbStates.length} correct. Keep trying!`
              : '✗ None are correct yet. Try rearranging the words!'}
          </div>
        )}

        {/* Instruction */}
        <div className={styles.instruction}>
          Separate the mixed words into {proverbStates.length} proverbs. Drag
          words from the available pool to each proverb's answer area.
        </div>

        {/* All proverbs */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Proverbs</div>
          <div className={styles.proverbsContainer}>
            {proverbStates.map((state, proverbIndex) => {
              const dropZones = Array.from(
                { length: state.proverb.words.length },
                (_, index) => {
                  const wordAtPosition = state.wordPositions.find(
                    wp => wp.currentIndex === index
                  );
                  return {
                    index,
                    word: wordAtPosition?.word || null,
                    wordIndex: wordAtPosition
                      ? state.wordPositions.indexOf(wordAtPosition)
                      : null,
                  };
                }
              );

              const itemClassName = [
                styles.proverbItem,
                state.isValidated && state.isSolved
                  ? styles.solved
                  : state.isValidated && !state.isSolved
                  ? styles.incorrect
                  : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={proverbIndex} className={itemClassName}>
                  <div className={styles.proverbHeader}>
                    <span className={styles.proverbNumber}>
                      Proverb {proverbIndex + 1}
                    </span>
                    {state.isValidated && (
                      <span
                        className={`${styles.proverbStatus} ${
                          state.isSolved ? styles.correct : styles.wrong
                        }`}
                      >
                        {state.isSolved ? '✓ Correct' : '✗ Incorrect'}
                      </span>
                    )}
                  </div>

                  <div className={styles.solutionContainer}>
                    {dropZones.map(zone => (
                      <DropZone
                        key={zone.index}
                        index={zone.index}
                        word={zone.word}
                        wordIndex={zone.wordIndex}
                        isRTL={isRTL}
                        isCorrect={state.isSolved && state.isValidated}
                        isIncorrect={!state.isSolved && state.isValidated}
                        onDrop={dropIndex => handleDrop(proverbIndex, dropIndex)}
                        onWordDragStart={wordIndex =>
                          handleWordDragStart(proverbIndex, wordIndex)
                        }
                        onWordDragEnd={handleWordDragEnd}
                        onWordRemove={dropIndex =>
                          handleWordRemove(proverbIndex, dropIndex)
                        }
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Available words (mixed from all proverbs) */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            Available words ({allAvailableWords.length} remaining)
          </div>
          <div className={styles.wordsContainer}>
            {allAvailableWords.length > 0 ? (
              allAvailableWords.map((item, idx) => (
                <Word
                  key={`${item.proverbIndex}-${item.wordIndex}-${idx}`}
                  word={item.word}
                  index={item.wordIndex}
                  isPlaced={false}
                  isRTL={isRTL}
                  onDragStart={() =>
                    handleWordDragStart(item.proverbIndex, item.wordIndex)
                  }
                  onDragEnd={handleWordDragEnd}
                  onClick={() =>
                    handleAvailableWordClick(item.proverbIndex, item.wordIndex)
                  }
                />
              ))
            ) : (
              <div className={styles.emptyState}>
                All words placed - click Check Answer!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={onValidate}
          disabled={!canValidate || allSolved}
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
