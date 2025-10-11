/**
 * Game Over Modal - Shows when player exhausts all validation attempts
 */

import React from 'react';
import { Modal } from './Modal';
import { PuzzleData } from '../types';
import styles from './GameOverModal.module.css';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  puzzleData: PuzzleData | null;
  onRetry: () => void;
  onNewPuzzle: () => void;
  isRTL?: boolean;
  translations: {
    gameOverTitle: string;
    gameOverMessage: string;
    correctSolutions: string;
    origin: string;
    meaning: string;
    tryAgain: string;
    newPuzzle: string;
  };
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  onClose,
  puzzleData,
  onRetry,
  onNewPuzzle,
  isRTL = false,
  translations: t,
}) => {
  // Performance optimization: don't render content when modal is closed
  if (!isOpen || !puzzleData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.gameOverTitle} isRTL={isRTL}>
      <div className={styles.gameOverContent} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Encouraging message */}
        <p className={styles.encouragingMessage}>{t.gameOverMessage}</p>

        {/* Solutions section */}
        <div className={styles.solutionsSection}>
          <h3 className={styles.solutionsTitle}>{t.correctSolutions}</h3>
          
          <div className={styles.solutionsList}>
            {puzzleData.proverbs.map((proverb, index) => (
              <div key={index} className={styles.solutionItem}>
                <div className={styles.proverbSolution}>
                  {proverb.solution}
                </div>
                
                <div className={styles.proverbDetails}>
                  <div className={styles.proverbOrigin}>
                    <strong>{t.origin}:</strong> {proverb.culture}
                  </div>
                  <div className={styles.proverbMeaning}>
                    <strong>{t.meaning}:</strong> {proverb.meaning}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.retryButton}
            onClick={onRetry}
            aria-label={t.tryAgain}
          >
            {t.tryAgain}
          </button>
          
          <button 
            className={styles.newPuzzleButton}
            onClick={onNewPuzzle}
            aria-label={t.newPuzzle}
          >
            {t.newPuzzle}
          </button>
        </div>
      </div>
    </Modal>
  );
};