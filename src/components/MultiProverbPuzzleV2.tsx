/**
 * Multi-Proverb Puzzle component - V2 with cross-proverb word movement
 * This version uses the new architecture that allows words to be placed in any proverb
 */

import React, { useState, useCallback, useMemo } from 'react';
import { PuzzleData, GlobalWord } from '../types';
import { Word } from './Word';
import { DropZone } from './DropZone';
import { shuffleArray, getTranslations } from '../utils';
import styles from './MultiProverbPuzzle.module.css';

interface MultiProverbPuzzleV2Props {
  puzzleData: PuzzleData;
  allWords: GlobalWord[];
  availableWords: GlobalWord[];
  proverbValidation: { isSolved: boolean; isValidated: boolean }[];
  isCompleted: boolean;
  hintsRemaining: number;
  onMoveWord: (wordId: string, proverbIndex: number, position: number) => void;
  onRemoveWord: (wordId: string) => void;
  onValidate: () => void;
  onReset: () => void;
  onUseHint: () => void;
  isRTL?: boolean;
  translations: ReturnType<typeof getTranslations>;
}

export const MultiProverbPuzzleV2: React.FC<MultiProverbPuzzleV2Props> = ({
  puzzleData,
  allWords,
  availableWords,
  proverbValidation,
  isCompleted,
  hintsRemaining,
  onMoveWord,
  onRemoveWord,
  onValidate,
  onReset,
  onUseHint,
  isRTL = false,
  translations: t,
}) => {
  const [draggedWordId, setDraggedWordId] = useState<string | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);

  // Shuffle available words once (only when the list of word IDs changes)
  const shuffledAvailableWords = useMemo(() => {
    const shuffled = shuffleArray([...availableWords]);
    return shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableWords.map(w => w.id).sort().join(',')]);

  const handleWordDragStart = useCallback((wordId: string) => {
    setDraggedWordId(wordId);
  }, []);

  const handleWordDragEnd = useCallback(() => {
    setDraggedWordId(null);
  }, []);

  const handleDrop = useCallback(
    (proverbIndex: number, position: number) => {
      const wordId = draggedWordId || selectedWordId;
      if (wordId) {
        onMoveWord(wordId, proverbIndex, position);
        setSelectedWordId(null); // Clear selection after placing
      }
    },
    [draggedWordId, selectedWordId, onMoveWord]
  );

  const handleWordRemove = useCallback(
    (wordId: string) => {
      onRemoveWord(wordId);
    },
    [onRemoveWord]
  );

  const handleAvailableWordClick = useCallback(
    (wordId: string) => {
      // Toggle selection: if already selected, deselect; otherwise select
      setSelectedWordId(prev => prev === wordId ? null : wordId);
    },
    []
  );

  // Check if all words are placed
  const allWordsPlaced = availableWords.length === 0;

  // Check validation status
  const allValidated = proverbValidation.every(v => v.isValidated);
  const allSolved = proverbValidation.every(v => v.isSolved);
  const someSolved = proverbValidation.some(v => v.isSolved);

  const containerClassName = isRTL
    ? `${styles.container} ${styles.rtl}`
    : styles.container;

  return (
    <>
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
              ? t.allCorrect
              : someSolved
              ? t.partialCorrect(
                  proverbValidation.filter(v => v.isSolved).length,
                  puzzleData.proverbs.length
                )
              : t.noneCorrect}
          </div>
        )}

        {/* Instruction */}
        <div className={styles.instruction}>
          {t.instructions}
        </div>

        {/* All proverbs */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t.proverbs}</div>
          <div className={styles.proverbsContainer}>
            {puzzleData.proverbs.map((proverb, proverbIndex) => {
              // Build drop zones for this proverb
              const wordCount = proverb.solution.split(/\s+/).length;
              const dropZones = Array.from(
                { length: wordCount },
                (_, position) => {
                  // Find the word at this position
                  const wordAtPosition = allWords.find(
                    w =>
                      w.placement &&
                      w.placement.proverbIndex === proverbIndex &&
                      w.placement.positionIndex === position
                  );

                  return {
                    position,
                    word: wordAtPosition?.text || null,
                    wordId: wordAtPosition?.id || null,
                    isLocked: wordAtPosition?.isLocked || false,
                  };
                }
              );

              const validation = proverbValidation[proverbIndex];
              const itemClassName = [
                styles.proverbItem,
                validation.isValidated && validation.isSolved
                  ? styles.solved
                  : validation.isValidated && !validation.isSolved
                  ? styles.incorrect
                  : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <div key={proverbIndex} className={itemClassName}>
                  <div className={styles.proverbHeader}>
                    <span className={styles.proverbNumber}>
                      {t.proverb} {proverbIndex + 1} ({proverb.culture})
                    </span>
                    {validation.isValidated && (
                      <span
                        className={`${styles.proverbStatus} ${
                          validation.isSolved ? styles.correct : styles.wrong
                        }`}
                      >
                        {validation.isSolved ? t.correct : t.incorrect}
                      </span>
                    )}
                  </div>

                  <div className={styles.solutionContainer}>
                    {dropZones.map(zone => (
                      <DropZone
                        key={zone.position}
                        index={zone.position}
                        word={zone.word}
                        wordIndex={zone.wordId ? 0 : null} // Not used in V2
                        isLocked={zone.isLocked}
                        isRTL={isRTL}
                        isCorrect={validation.isSolved && validation.isValidated}
                        isIncorrect={!validation.isSolved && validation.isValidated}
                        onDrop={position => handleDrop(proverbIndex, position)}
                        onWordDragStart={() =>
                          zone.wordId && handleWordDragStart(zone.wordId)
                        }
                        onWordDragEnd={handleWordDragEnd}
                        onWordRemove={() =>
                          zone.wordId && handleWordRemove(zone.wordId)
                        }
                        data-testid={`drop-zone-${proverbIndex}-${zone.position}`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

        {/* Controls */}
        <div className={styles.controls}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={onValidate}
            disabled={!allWordsPlaced || isCompleted}
          >
            {t.checkAnswer}
          </button>
          <button
            className={styles.button}
            onClick={onUseHint}
            disabled={hintsRemaining === 0 || isCompleted}
          >
            {t.hint(hintsRemaining)}
          </button>
          <button className={styles.button} onClick={onReset}>
            {t.reset}
          </button>
        </div>
      </div>

      {/* Available words (shuffled from all proverbs) - FIXED TO BOTTOM */}
      <div className={`${styles.section} ${styles.availableWordsSection}`}>
        <div className={styles.sectionTitle}>
          {t.availableWords(shuffledAvailableWords.length)}
        </div>
        <div className={styles.wordsContainer}>
          {shuffledAvailableWords.length > 0 ? (
            shuffledAvailableWords.map((word, idx) => (
              <Word
                key={`${word.id}-${idx}`}
                word={word.text}
                index={0} // Not used in V2
                isPlaced={false}
                isRTL={isRTL}
                onDragStart={() => handleWordDragStart(word.id)}
                onDragEnd={handleWordDragEnd}
                onClick={() => handleAvailableWordClick(word.id)}
                className={selectedWordId === word.id ? styles.selected : ''}
              />
            ))
          ) : (
            <div className={styles.emptyState}>
              {t.allWordsPlaced}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
