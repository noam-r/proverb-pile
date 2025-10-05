/**
 * Cultural context display component
 */

import React from 'react';
import { Proverb } from '../types';
import styles from './CulturalContext.module.css';

interface CulturalContextProps {
  proverb: Proverb;
  isRTL?: boolean;
}

export const CulturalContext: React.FC<CulturalContextProps> = ({
  proverb,
  isRTL = false,
}) => {
  const containerClassName = isRTL
    ? `${styles.container} ${styles.rtl}`
    : styles.container;

  return (
    <div className={containerClassName}>
      <div className={styles.successMessage}>
        <span className={styles.successIcon}>🎉</span>
        <div>Correct! Well done!</div>
      </div>

      <div className={styles.proverb}>"{proverb.solution}"</div>

      <div className={styles.section}>
        <div className={styles.label}>
          <span className={styles.icon}>🌍</span>
          Origin
        </div>
        <div className={styles.value}>{proverb.culture}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>
          <span className={styles.icon}>💡</span>
          Meaning
        </div>
        <div className={styles.value}>{proverb.meaning}</div>
      </div>
    </div>
  );
};
