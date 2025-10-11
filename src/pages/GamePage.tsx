/**
 * Game Page - Main puzzle game (V2 with new architecture)
 * 
 * Supports URL parameters:
 * - puzzle: encoded puzzle data for custom puzzles
 * - lang/language: preferred language (en/he)
 * 
 * Language preference is saved to localStorage and persists across sessions.
 * URL is updated when language changes to allow sharing language-specific links.
 * 
 * Examples:
 * - /?lang=en (English puzzles)
 * - /?lang=he (Hebrew puzzles)
 * - /?language=en (alternative parameter name)
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMultiProverbGameState } from '../hooks/useMultiProverbGameState';
import { MultiProverbPuzzleV2 } from '../components/MultiProverbPuzzleV2';
import { Modal, CulturalContext, OnboardingModal, GameOverModal, GameStatistics } from '../components';
import { LanguageSelector } from '../components/LanguageSelector';
import { PuzzleData, LanguageCode } from '../types';
import { getTranslations, getCurrentLanguagePreference } from '../utils';
import { decodePuzzle, validatePuzzle } from '../utils/puzzleLoader';




export const GamePage: React.FC = () => {
  const [puzzleData, setPuzzleData] = useState<PuzzleData | null>(null);
  const [puzzleError, setPuzzleError] = useState<string | null>(null);
  const [isCustomPuzzle, setIsCustomPuzzle] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(getCurrentLanguagePreference);
  const [hasMorePuzzlesAvailable] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Load puzzle from URL parameter or generate from CSV
  const loadPuzzle = async (language?: LanguageCode) => {
    // Prevent multiple simultaneous loads
    if (isLoading) return;
    
    setIsLoading(true);
    setPuzzleError(null);
    
    try {
      const params = new URLSearchParams(window.location.search);
      const encodedPuzzle = params.get('puzzle');

      if (encodedPuzzle) {
        // Custom puzzle from URL
        try {
          const decoded = decodePuzzle(encodedPuzzle);
          const validation = validatePuzzle(decoded);

          if (validation.isValid) {
            setPuzzleData(decoded as PuzzleData);
            setIsCustomPuzzle(true);
            setCurrentLanguage(decoded.language as LanguageCode);
            return;
          } else {
            // eslint-disable-next-line no-console
            console.error('Invalid puzzle data:', validation.error);
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Failed to decode puzzle:', error);
        }
      }

      // Load puzzle based on selected language
      const targetLanguage = language || currentLanguage;
      
      try {
        // eslint-disable-next-line no-console
        console.log(`Attempting to load ${targetLanguage} puzzle...`);
        const { generateRandomPuzzleFromCSV } = await import('../utils/csvPuzzleLoader');
        // eslint-disable-next-line no-console
        console.log('CSV puzzle loader imported successfully');
        const { puzzle } = await generateRandomPuzzleFromCSV(targetLanguage);
        // eslint-disable-next-line no-console
        console.log(`${targetLanguage} puzzle loaded:`, puzzle);
        setPuzzleData(puzzle);
        setIsCustomPuzzle(false);
        setCurrentLanguage(targetLanguage);
        // eslint-disable-next-line no-console
        console.log('Puzzle data set successfully');
      } catch (csvError) {
        // eslint-disable-next-line no-console
        console.error('CSV loading failed, trying Hebrew fallback:', csvError);
        
        // Fallback to Hebrew puzzle system if CSV fails
        try {
          const { loadRandomHebrewPuzzle } = await import('../utils/randomPuzzleLoader');
          const fallbackPuzzle = await loadRandomHebrewPuzzle();
          setPuzzleData(fallbackPuzzle);
          setIsCustomPuzzle(false);
          setCurrentLanguage('he');
        } catch (fallbackError) {
          // eslint-disable-next-line no-console
          console.error('Fallback failed:', fallbackError);
          setPuzzleError('Failed to load puzzle');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Track if initial load has been called
  const initialLoadRef = useRef(false);

  // Save initial language to localStorage if it came from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get('lang') || params.get('language');
    if (urlLanguage === 'en' || urlLanguage === 'he') {
      localStorage.setItem('preferredLanguage', urlLanguage);
    }
  }, []);

  useEffect(() => {
    if (!initialLoadRef.current) {
      initialLoadRef.current = true;
      // eslint-disable-next-line no-console
      console.log('Initial puzzle load triggered with language:', currentLanguage);
      loadPuzzle(currentLanguage);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    gameState,
    availableWords,
    moveWord,
    removeWord,
    validate,
    validateProverb,
    reset,
    useHint,
    selectWord,
    selectPlaceholder,
    clearSelection,
    findNextEmptySlot,
    updateAutoFocus,
  } = useMultiProverbGameState(puzzleData);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);

  const isRTL = (puzzleData?.language || currentLanguage) === 'he';
  const t = useMemo(() => getTranslations((puzzleData?.language || currentLanguage) as 'en' | 'he'), [puzzleData?.language, currentLanguage]);

  // Handle language change (only for CSV puzzles)
  const handleLanguageChange = (newLanguage: LanguageCode) => {
    if (!isCustomPuzzle) {
      // Save language preference to localStorage
      localStorage.setItem('preferredLanguage', newLanguage);
      
      // Update URL to reflect language choice (for sharing)
      const url = new URL(window.location.href);
      url.searchParams.set('lang', newLanguage);
      window.history.replaceState({}, '', url.toString());
      
      setCurrentLanguage(newLanguage);
      loadPuzzle(newLanguage);
    }
  };

  // Handle next puzzle (only for CSV puzzles)
  const handleNextPuzzle = () => {
    if (!isCustomPuzzle) {
      loadPuzzle(currentLanguage);
    }
  };

  // Handle retry - reset the current puzzle
  const handleRetry = () => {
    setIsGameOverModalOpen(false);
    reset();
  };

  // Handle new puzzle from game over modal
  const handleNewPuzzleFromGameOver = () => {
    setIsGameOverModalOpen(false);
    if (!isCustomPuzzle) {
      loadPuzzle(currentLanguage);
    } else {
      // For custom puzzles, just reset
      reset();
    }
  };

  // Show onboarding on first visit
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setIsOnboardingOpen(true);
      setIsHelpMode(false); // Initial onboarding, not help mode
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  }, []);

  // Auto-open modal when game is completed
  useEffect(() => {
    if (gameState.isCompleted) {
      setIsModalOpen(true);
    }
  }, [gameState.isCompleted]);

  // Auto-open game over modal when game has failed
  useEffect(() => {
    if (gameState.hasFailedGame) {
      setIsGameOverModalOpen(true);
    }
  }, [gameState.hasFailedGame]);

  if (puzzleError || (gameState.error && !isLoading && puzzleData === null)) {
    return (
      <div className="error-container" dir={isRTL ? 'rtl' : 'ltr'}>
        <h1>{t.errorLoading}</h1>
        <p>{puzzleError || gameState.error}</p>
        <p>{t.errorMessage}</p>
        <p>
          {isRTL ? 'או ' : 'Or '}
          <Link to="/builder">{t.orCreate}</Link>
          {isRTL ? '' : '!'}
        </p>
      </div>
    );
  }

  if (isLoading || !puzzleData || !gameState.puzzleData) {
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
          <div style={{
            position: 'absolute',
            top: 0,
            right: isRTL ? 'auto' : '20px',
            left: isRTL ? '20px' : 'auto',
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {/* Language selector - only show for CSV puzzles */}
            {!isCustomPuzzle && (
              <LanguageSelector
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
                isRTL={isRTL}
              />
            )}
            
            <button
              onClick={() => {
                setIsHelpMode(true); // This is help mode, not initial onboarding
                setIsOnboardingOpen(true);
              }}
              style={{
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
        </div>
        <h1>{t.appName}</h1>
        <p className="subtitle">
          {t.subtitle(puzzleData.proverbs.length)}
        </p>
      </header>

      <main dir={isRTL ? 'rtl' : 'ltr'}>
        <MultiProverbPuzzleV2
          puzzleData={puzzleData}
          allWords={gameState.allWords}
          availableWords={availableWords}
          proverbValidation={gameState.proverbValidation}
          isCompleted={gameState.isCompleted}
          usedHints={gameState.usedHints}
          wordHintsUsed={gameState.wordHintsUsed}
          validationAttempts={gameState.validationAttempts}
          hasFailedGame={gameState.hasFailedGame}
          selectionState={gameState.selectionState}
          onMoveWord={moveWord}
          onRemoveWord={removeWord}
          onValidate={validate}
          onValidateProverb={validateProverb}
          onReset={reset}
          onRevealMeaning={useHint}
          onSelectWord={selectWord}
          onSelectPlaceholder={selectPlaceholder}
          onClearSelections={clearSelection}
          onUpdateAutoFocus={updateAutoFocus}
          findNextEmptySlot={findNextEmptySlot}
          isRTL={isRTL}
          translations={t}
        />
      </main>



      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        isRTL={isRTL}
        showCreatePuzzleLink={isHelpMode}
        translations={t}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t.congratulations}
        isRTL={isRTL}
        footer={
          !isCustomPuzzle && hasMorePuzzlesAvailable ? (
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'center'
            }}>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  handleNextPuzzle();
                }}
                style={{
                  padding: '14px 32px',
                  fontSize: '14px',
                  fontWeight: '700',
                  border: '1px solid #121213',
                  backgroundColor: '#121213',
                  color: '#ffffff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#787c7e';
                  e.currentTarget.style.borderColor = '#787c7e';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#121213';
                  e.currentTarget.style.borderColor = '#121213';
                }}
              >
                {t.nextPuzzle}
              </button>
            </div>
          ) : undefined
        }
      >
        <div>
          <GameStatistics
            hintsUsed={gameState.totalHintsUsed}
            validationAttempts={gameState.validationAttempts}
            totalValidationAttempts={gameState.totalValidationAttempts}
            isRTL={isRTL}
            translations={t}
          />
          
          {puzzleData.proverbs.map((proverb, index) => (
            <CulturalContext
              key={index}
              proverb={proverb}
              isRTL={isRTL}
              translations={t}
            />
          ))}
        </div>
      </Modal>

      <GameOverModal
        isOpen={isGameOverModalOpen}
        onClose={() => setIsGameOverModalOpen(false)}
        puzzleData={puzzleData}
        onRetry={handleRetry}
        onNewPuzzle={handleNewPuzzleFromGameOver}
        isRTL={isRTL}
        translations={t}
      />
    </>
  );
};
