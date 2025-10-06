/**
 * Cultural context display component
 */

import React from 'react';
import { Proverb } from '../types';
import { getTranslations } from '../utils';
import styles from './CulturalContext.module.css';

interface CulturalContextProps {
  proverb: Proverb;
  isRTL?: boolean;
  translations: ReturnType<typeof getTranslations>;
}

export const CulturalContext: React.FC<CulturalContextProps> = ({
  proverb,
  isRTL = false,
  translations: t,
}) => {
  const containerClassName = isRTL
    ? `${styles.container} ${styles.rtl}`
    : styles.container;

  return (
    <div className={containerClassName}>
      <div className={styles.proverb}>"{proverb.solution}"</div>

      <div className={styles.section}>
        <div className={styles.label}>{t.origin}</div>
        <div className={styles.value}>{proverb.culture}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.label}>{t.meaning}</div>
        <div className={styles.value}>{proverb.meaning}</div>
      </div>
    </div>
  );
};
