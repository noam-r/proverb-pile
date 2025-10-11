/**
 * GameStatistics component for displaying game performance statistics
 */

import React from 'react';
import styles from './GameStatistics.module.css';

interface GameStatisticsProps {
  hintsUsed: number;
  validationAttempts: number;
  totalValidationAttempts: number;
  isRTL?: boolean;
  translations: {
    hintsUsed: string;
    validationAttempts: string;
    perfectScore: string;
    firstTry: string;
    noHints: string;
    minimalHints: string;
    excellentWork: string;
  };
}

export const GameStatistics: React.FC<GameStatisticsProps> = ({
  hintsUsed,
  validationAttempts,
  totalValidationAttempts: _totalValidationAttempts,
  isRTL = false,
  translations,
}) => {
  const attemptsUsed = 3 - validationAttempts;
  const isPerfectScore = hintsUsed === 0 && attemptsUsed === 1;
  const isFirstTry = attemptsUsed === 1;
  const isNoHints = hintsUsed === 0;
  const isMinimalHints = hintsUsed > 0 && hintsUsed <= 3; // Used some hints but kept it minimal
  const isExcellentWork = hintsUsed === 0 || (hintsUsed <= 2 && attemptsUsed === 1);

  return (
    <div className={`${styles.statistics} ${isRTL ? styles.rtl : ''}`}>
      <div className={styles.statsGrid}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>{translations.hintsUsed}:</span>
          <span className={styles.statValue}>{hintsUsed}</span>
        </div>
        
        <div className={styles.statItem}>
          <span className={styles.statLabel}>{translations.validationAttempts}:</span>
          <span className={styles.statValue}>{attemptsUsed}</span>
        </div>
      </div>

      {/* Achievement badges with clean NYT-style design */}
      {(isPerfectScore || isFirstTry || isNoHints || isMinimalHints || isExcellentWork) && (
        <div className={styles.achievements}>
          {isPerfectScore && (
            <div className={`${styles.achievement} ${styles.perfect}`}>
              {translations.perfectScore}
            </div>
          )}
          {isFirstTry && !isPerfectScore && (
            <div className={`${styles.achievement} ${styles.firstTry}`}>
              {translations.firstTry}
            </div>
          )}
          {isNoHints && !isPerfectScore && (
            <div className={`${styles.achievement} ${styles.noHints}`}>
              {translations.noHints}
            </div>
          )}
          {isMinimalHints && !isNoHints && !isPerfectScore && (
            <div className={`${styles.achievement} ${styles.minimal}`}>
              {translations.minimalHints}
            </div>
          )}
          {isExcellentWork && !isPerfectScore && !isNoHints && !isMinimalHints && (
            <div className={`${styles.achievement} ${styles.excellent}`}>
              {translations.excellentWork}
            </div>
          )}
        </div>
      )}
    </div>
  );
};