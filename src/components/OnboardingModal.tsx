/**
 * Onboarding Modal - Shows game instructions to new users
 */

import React from 'react';
import { Modal } from './Modal';
import styles from './OnboardingModal.module.css';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isRTL?: boolean;
  showCreatePuzzleLink?: boolean;
  translations: {
    onboardingTitle: string;
    onboardingStep1: string;
    onboardingStep2: string;
    onboardingStep3: string;
    onboardingGotIt: string;
    createPuzzle: string;
  };
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  isRTL = false,
  showCreatePuzzleLink = false,
  translations: t,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.onboardingTitle} isRTL={isRTL}>
      <div className={styles.onboardingContent}>
        {/* Step 1: Select a word */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <p className={styles.stepText}>{t.onboardingStep1}</p>
            <div className={styles.illustration}>
              <div className={`${styles.exampleWord} ${styles.animateSelect}`}>
                {isRTL ? 'דוגמה' : 'Example'}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Tap empty slot */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <p className={styles.stepText}>{t.onboardingStep2}</p>
            <div className={styles.illustration}>
              <div className={styles.tapContainer}>
                <div className={styles.emptySlot}></div>
                <img
                  src="/proverb-pile/hand-tap.png"
                  alt="Tap gesture"
                  className={styles.tapIcon}
                  width="32"
                  height="32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Check answer */}
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <p className={styles.stepText}>{t.onboardingStep3}</p>
            <div className={styles.illustration}>
              <button className={styles.exampleButton}>
                {isRTL ? 'בדוק תשובה' : 'Check Answer'}
              </button>
            </div>
          </div>
        </div>

        {/* Got it button */}
        <button className={styles.gotItButton} onClick={onClose}>
          {t.onboardingGotIt}
        </button>

        {/* Create Puzzle Link - only show when opened as help modal */}
        {showCreatePuzzleLink && (
          <div className={styles.createPuzzleSection}>
            <a 
              href="/#/builder" 
              className={styles.createPuzzleLink}
              onClick={onClose}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.pencilIcon}
              >
                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                <path d="m15 5 4 4" />
              </svg>
              {t.createPuzzle}
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
