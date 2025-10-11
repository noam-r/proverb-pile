/**
 * Multi-Proverb Puzzle component - V2 with cross-proverb word movement
 * This version uses the new architecture that allows words to be placed in any proverb
 */

import React, { useState, useCallback, useMemo } from 'react';
import { PuzzleData, GlobalWord, SelectionState } from '../types/puzzle';
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
  usedHints: Set<number>;
  wordHintsUsed: Map<number, number>;
  validationAttempts: number;
  hasFailedGame: boolean;
  selectionState: SelectionState;
  onMoveWord: (wordId: string, proverbIndex: number, position: number) => void;
  onRemoveWord: (wordId: string) => void;
  onValidate: () => void;
  onValidateProverb: (proverbIndex: number) => void;
  onReset: () => void;
  onRevealMeaning: (proverbIndex: number) => void;
  onSelectWord: (wordId: string | null) => void;
  onSelectPlaceholder: (proverbIndex: number, positionIndex: number) => void;
  onClearSelections: () => void;
  onUpdateAutoFocus: (target: { proverbIndex: number; positionIndex: number } | null) => void;
  findNextEmptySlot: (currentProverbIndex: number, currentPosition: number) => { proverbIndex: number; positionIndex: number } | null;
  isRTL?: boolean;
  translations: ReturnType<typeof getTranslations>;
}

export const MultiProverbPuzzleV2: React.FC<MultiProverbPuzzleV2Props> = ({
  puzzleData,
  allWords,
  availableWords,
  proverbValidation,
  isCompleted,
  usedHints,
  wordHintsUsed,
  validationAttempts: _validationAttempts,
  hasFailedGame,
  selectionState,
  onMoveWord,
  onRemoveWord,
  onValidate,
  onValidateProverb,
  onReset,
  onRevealMeaning,
  onSelectWord,
  onSelectPlaceholder,
  onClearSelections,
  onUpdateAutoFocus,
  findNextEmptySlot,
  isRTL = false,
  translations: t,
}) => {
  const [draggedWordId, setDraggedWordId] = useState<string | null>(null);

  // Shuffle available words once (only when the list of word IDs changes)
  // Performance optimization: use length check first, then expensive join operation
  const shuffledAvailableWords = useMemo(() => {
    if (availableWords.length === 0) return [];
    const shuffled = shuffleArray([...availableWords]);
    return shuffled;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableWords.length, availableWords.map(w => w.id).sort().join(',')]);

  const handleWordDragStart = useCallback((wordId: string) => {
    setDraggedWordId(wordId);
  }, []);

  const handleWordDragEnd = useCallback(() => {
    setDraggedWordId(null);
  }, []);

  const handleDrop = useCallback(
    (proverbIndex: number, position: number) => {
      const wordId = draggedWordId || selectionState.selectedWordId;
      if (wordId) {
        onMoveWord(wordId, proverbIndex, position);
        
        // Clear selections after placing
        onClearSelections();
        
        // Auto-focus to next empty slot for continuous placement
        const nextSlot = findNextEmptySlot(proverbIndex, position);
        if (nextSlot) {
          onUpdateAutoFocus(nextSlot);
        }
      }
    },
    [draggedWordId, selectionState.selectedWordId, onMoveWord, onClearSelections, findNextEmptySlot, onUpdateAutoFocus]
  );

  const handleWordRemove = useCallback(
    (wordId: string) => {
      onRemoveWord(wordId);
    },
    [onRemoveWord]
  );

  const handleAvailableWordClick = useCallback(
    (wordId: string) => {
      // Enhanced bidirectional selection: if word is already selected, deselect it
      if (selectionState.selectedWordId === wordId) {
        onSelectWord(null);
        return;
      }

      // Determine where to place the word automatically
      let targetSlot = null;

      // Priority 1: If there's a selected placeholder, use it
      if (selectionState.selectedPlaceholder) {
        targetSlot = selectionState.selectedPlaceholder;
      }
      // Priority 2: If there's an auto-focus target, use it
      else if (selectionState.autoFocusTarget) {
        targetSlot = selectionState.autoFocusTarget;
      }
      // Priority 3: Find the next available empty slot
      else {
        targetSlot = findNextEmptySlot(-1, -1); // Start from beginning
      }

      // If we found a target slot, place the word immediately
      if (targetSlot) {
        const { proverbIndex, positionIndex } = targetSlot;
        onMoveWord(wordId, proverbIndex, positionIndex);
        
        // Clear selections and set auto-focus to next slot
        onClearSelections();
        const nextSlot = findNextEmptySlot(proverbIndex, positionIndex);
        if (nextSlot) {
          onUpdateAutoFocus(nextSlot);
        }
      } else {
        // No available slots, just select the word (fallback)
        onSelectWord(wordId);
      }
    },
    [selectionState.selectedWordId, selectionState.selectedPlaceholder, selectionState.autoFocusTarget, onSelectWord, onMoveWord, onClearSelections, findNextEmptySlot, onUpdateAutoFocus]
  );

  // Handle placeholder click for bidirectional selection
  const handlePlaceholderClick = useCallback(
    (proverbIndex: number, positionIndex: number) => {
      // If there's a selected word, place it immediately
      if (selectionState.selectedWordId) {
        onMoveWord(selectionState.selectedWordId, proverbIndex, positionIndex);
        
        // Clear selections and set auto-focus to next slot
        onClearSelections();
        const nextSlot = findNextEmptySlot(proverbIndex, positionIndex);
        if (nextSlot) {
          onUpdateAutoFocus(nextSlot);
        }
      } else {
        // Select this placeholder
        onSelectPlaceholder(proverbIndex, positionIndex);
      }
    },
    [selectionState.selectedWordId, onMoveWord, onClearSelections, findNextEmptySlot, onUpdateAutoFocus, onSelectPlaceholder]
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
              // Build drop zones for this proverb - optimized with pre-filtering
              const wordCount = proverb.solution.split(/\s+/).length;
              
              // Pre-filter words for this proverb to avoid repeated searches
              const proverbWords = allWords.filter(
                w => w.placement && w.placement.proverbIndex === proverbIndex
              );
              
              const dropZones = Array.from(
                { length: wordCount },
                (_, position) => {
                  // Find the word at this position from pre-filtered array
                  const wordAtPosition = proverbWords.find(
                    w => w.placement!.positionIndex === position
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!validation.isSolved && (() => {
                        const hasAvailableWords = availableWords.some(word => word.sourceProverbIndex === proverbIndex);
                        const showLevel1 = !usedHints.has(proverbIndex);
                        
                        // Calculate hint limits for level 2
                        const totalWords = proverb.solution.split(/\s+/).length;
                        const maxHintWords = Math.floor(totalWords * 0.8);
                        const currentHintWords = wordHintsUsed.get(proverbIndex) || 0;
                        const canUseWordHint = usedHints.has(proverbIndex) && hasAvailableWords && currentHintWords < maxHintWords;
                        
                        if (showLevel1 || canUseWordHint) {
                          const isLevel2 = canUseWordHint && !showLevel1;
                          const buttonText = isLevel2 ? `${t.hintWord} (${currentHintWords}/${maxHintWords})` : t.hintSimple;
                          
                          return (
                            <button
                              onClick={() => onRevealMeaning(proverbIndex)}
                              disabled={isCompleted}
                              className={`${styles.hintButton} ${isLevel2 ? styles.hintButtonLevel2 : ''}`}
                              title={isLevel2 ? t.hintWord : t.hintSimple}
                              aria-label={`${isLevel2 ? t.hintWord : t.hintSimple} - ${t.proverb} ${proverbIndex + 1}`}
                            >
                              {isLevel2 ? (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                              ) : (
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M9 18h6" />
                                  <path d="M10 22h4" />
                                  <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
                                </svg>
                              )}
                              <span className={styles.hintText}>
                                {buttonText}
                              </span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                      
                      {/* Individual proverb validation button */}
                      {!validation.isSolved && (() => {
                        // Check if proverb has all positions filled
                        const totalWords = proverb.solution.split(/\s+/).length;
                        const placedWords = allWords.filter(
                          word => word.placement && word.placement.proverbIndex === proverbIndex
                        );
                        const isComplete = placedWords.length === totalWords;
                        
                        if (isComplete) {
                          return (
                            <button
                              onClick={() => onValidateProverb(proverbIndex)}
                              disabled={isCompleted || hasFailedGame}
                              className={styles.validateButton}
                              title={t.validateProverb}
                              aria-label={`${t.validateProverb} - ${t.proverb} ${proverbIndex + 1}`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="20,6 9,17 4,12" />
                              </svg>
                              <span className={styles.validateText}>
                                {t.validateProverb}
                              </span>
                            </button>
                          );
                        }
                        return null;
                      })()}
                      
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
                  </div>

                  {usedHints.has(proverbIndex) && (
                    <div className={styles.hintMeaning}>
                      💡 {proverb.meaning}
                    </div>
                  )}

                  <div className={styles.solutionContainer}>
                    {dropZones.map(zone => (
                      <DropZone
                        key={zone.position}
                        index={zone.position}
                        word={zone.word}
                        wordIndex={zone.wordId ? 0 : null} // Not used in V2
                        isLocked={zone.isLocked}
                        isSelected={
                          !zone.word && 
                          selectionState.selectedPlaceholder?.proverbIndex === proverbIndex &&
                          selectionState.selectedPlaceholder?.positionIndex === zone.position
                        }
                        isAutoFocus={
                          !zone.word && 
                          selectionState.autoFocusTarget?.proverbIndex === proverbIndex &&
                          selectionState.autoFocusTarget?.positionIndex === zone.position
                        }
                        isRTL={isRTL}
                        isCorrect={validation.isSolved && validation.isValidated}
                        isIncorrect={!validation.isSolved && validation.isValidated}
                        onDrop={position => handleDrop(proverbIndex, position)}
                        onPlaceholderClick={position => handlePlaceholderClick(proverbIndex, position)}
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
            disabled={!allWordsPlaced || isCompleted || hasFailedGame}
          >
            {t.checkAnswer}
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
          {!selectionState.selectedWordId && !selectionState.selectedPlaceholder && selectionState.autoFocusTarget && (
            <span className={styles.selectionHint}>
              {isRTL ? ' ← לחץ על מילה למיקום אוטומטי' : ' → Tap a word to place it automatically'}
            </span>
          )}
          {selectionState.selectedWordId && (
            <span className={styles.selectionHint}>
              {isRTL ? ' ← לחץ על משבצת ריקה' : ' → Tap an empty slot'}
            </span>
          )}
          {selectionState.selectedPlaceholder && (
            <span className={styles.selectionHint}>
              {isRTL ? ' ← בחר מילה מהמגש' : ' → Select a word from tray'}
            </span>
          )}
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
                className={selectionState.selectedWordId === word.id ? styles.selected : ''}
              />
            ))
          ) : (
            <div className={styles.emptyStateWithButton}>
              <div className={styles.emptyState}>
                {t.allWordsPlaced}
              </div>
              <button
                className={`${styles.button} ${styles.primary} ${styles.checkButtonMobile}`}
                onClick={onValidate}
                disabled={isCompleted || hasFailedGame}
              >
                {t.checkAnswer}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
