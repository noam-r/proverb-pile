/**
 * Game Page - Main puzzle game (V2 with new architecture)
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useMultiProverbGameState } from '../hooks/useMultiProverbGameState';
import { MultiProverbPuzzleV2 } from '../components/MultiProverbPuzzleV2';
import { Modal, CulturalContext, OnboardingModal } from '../components';
import hebrewPuzzles from '../data/hebrew_puzzles.json';
import { PuzzleData } from '../types';
import { getTranslations } from '../utils';
import { decodePuzzle, validatePuzzle } from '../utils/puzzleLoader';

export const GamePage: React.FC = () => {
  // Load puzzle from URL parameter or use default Hebrew puzzles
  const puzzleData = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const encodedPuzzle = params.get('puzzle');

    if (encodedPuzzle) {
      try {
        const decoded = decodePuzzle(encodedPuzzle);
        const validation = validatePuzzle(decoded);

        if (validation.isValid) {
          return decoded as PuzzleData;
        } else {
          // eslint-disable-next-line no-console
          console.error('Invalid puzzle data:', validation.error);
          return hebrewPuzzles as PuzzleData;
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to decode puzzle:', error);
        return hebrewPuzzles as PuzzleData;
      }
    }

    return hebrewPuzzles as PuzzleData;
  }, []);

  const {
    gameState,
    availableWords,
    moveWord,
    removeWord,
    validate,
    reset,
    useHint,
  } = useMultiProverbGameState(puzzleData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const language = gameState.puzzleData?.language || 'en';
  const isRTL = language === 'he';
  const t = useMemo(() => getTranslations(language as 'en' | 'he'), [language]);

  // Show onboarding on first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  }, []);

  // Auto-open modal when game is completed
  useEffect(() => {
    if (gameState.isCompleted) {
      setIsModalOpen(true);
    }
  }, [gameState.isCompleted]);

  if (gameState.error) {
    return (
      <div className="error-container" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1>{t.errorLoading}</h1>
        <p>{gameState.error}</p>
        <p>{t.errorMessage}</p>
        <p>
          {isRTL ? 'או ' : 'Or '}
          <a href="/#/builder">{t.orCreate}</a>
          {isRTL ? '' : '!'}
        </p>
      </div>
    );
  }

  if (!gameState.puzzleData) {
    return (
      <div className="loading-container" dir={isRTL ? 'rtl' : 'ltr'}>
        <p>{t.loading}</p>
      </div>
    );
  }

  return (
    <>
      <header className="App-header" dir={isRTL ? 'rtl' : 'ltr'}>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setIsOnboardingOpen(true)}
            style={{
              position: 'absolute',
              top: 0,
              right: isRTL ? 'auto' : '20px',
              left: isRTL ? '20px' : 'auto',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={t.help}
            title={t.help}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="currentColor" />
            </svg>
          </button>
        </div>
        <h1>{t.appName}</h1>
        <p className="subtitle">
          {t.subtitle(gameState.puzzleData.proverbs.length)}
        </p>
      </header>

      <main dir={isRTL ? 'rtl' : 'ltr'}>
        <MultiProverbPuzzleV2
          puzzleData={gameState.puzzleData}
          allWords={gameState.allWords}
          availableWords={availableWords}
          proverbValidation={gameState.proverbValidation}
          isCompleted={gameState.isCompleted}
          hintsRemaining={gameState.hintsRemaining}
          revealedMeanings={gameState.revealedMeanings}
          onMoveWord={moveWord}
          onRemoveWord={removeWord}
          onValidate={validate}
          onReset={reset}
          onRevealMeaning={useHint}
          isRTL={isRTL}
          translations={t}
        />
      </main>

      <footer className="App-footer" dir={isRTL ? 'rtl' : 'ltr'}>
        <a href="/#/builder">{t.createPuzzle}</a>
      </footer>

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        isRTL={isRTL}
        translations={t}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t.congratulations}
        isRTL={isRTL}
      >
        <div>
          {gameState.puzzleData.proverbs.map((proverb, index) => (
            <CulturalContext
              key={index}
              proverb={proverb}
              isRTL={isRTL}
              translations={t}
            />
          ))}
        </div>
      </Modal>
    </>
  );
};
