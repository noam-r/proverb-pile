/**
 * Puzzle Builder component for creating custom puzzles
 */

import React, { useState, useCallback } from 'react';
import { PuzzleData, Proverb, LanguageCode } from '../types';
import { encodePuzzle, validatePuzzle, shuffleArray } from '../utils';
import styles from './PuzzleBuilder.module.css';

interface ProverbInput {
  solution: string;
  culture: string;
  meaning: string;
}

export const PuzzleBuilder: React.FC = () => {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [proverbs, setProverbs] = useState<ProverbInput[]>([
    { solution: '', culture: '', meaning: '' },
    { solution: '', culture: '', meaning: '' },
    { solution: '', culture: '', meaning: '' },
  ]);
  const [generatedURL, setGeneratedURL] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleProverbChange = useCallback(
    (index: number, field: keyof ProverbInput, value: string) => {
      const newProverbs = [...proverbs];
      newProverbs[index] = { ...newProverbs[index], [field]: value };
      setProverbs(newProverbs);
      setError('');
      setGeneratedURL('');
    },
    [proverbs]
  );

  const handleAddProverb = useCallback(() => {
    if (proverbs.length < 4) {
      setProverbs([...proverbs, { solution: '', culture: '', meaning: '' }]);
    }
  }, [proverbs]);

  const handleRemoveProverb = useCallback(
    (index: number) => {
      if (proverbs.length > 3) {
        const newProverbs = proverbs.filter((_, i) => i !== index);
        setProverbs(newProverbs);
      }
    },
    [proverbs]
  );

  const tokenizeWords = (text: string): string[] => {
    // Remove punctuation and split on whitespace
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0);
  };

  const createProverbId = (solution: string, index: number): string => {
    return solution
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .slice(0, 3)
      .join('-') + `-${index + 1}`;
  };

  const handleGenerate = useCallback(() => {
    try {
      setError('');

      // Validate inputs
      if (proverbs.some(p => !p.solution.trim())) {
        throw new Error('All proverbs must have a solution text');
      }

      if (proverbs.some(p => !p.culture.trim())) {
        throw new Error('All proverbs must have a culture/origin');
      }

      if (proverbs.some(p => !p.meaning.trim())) {
        throw new Error('All proverbs must have a meaning');
      }

      // Create puzzle data
      const puzzleProverbs: Proverb[] = proverbs.map((p, index) => {
        const words = tokenizeWords(p.solution);

        if (words.length < 5) {
          throw new Error(
            `Proverb ${index + 1} must have at least 5 words (currently has ${words.length})`
          );
        }

        if (words.length > 10) {
          throw new Error(
            `Proverb ${index + 1} must have at most 10 words (currently has ${words.length})`
          );
        }

        return {
          id: createProverbId(p.solution, index),
          words: shuffleArray(words),
          solution: p.solution.trim(),
          culture: p.culture.trim(),
          meaning: p.meaning.trim(),
        };
      });

      const puzzleData: PuzzleData = {
        version: '1',
        language,
        proverbs: puzzleProverbs,
      };

      // Validate puzzle
      const validation = validatePuzzle(puzzleData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Encode puzzle
      const encoded = encodePuzzle(puzzleData);
      const baseURL = window.location.origin + window.location.pathname;
      const url = `${baseURL}?puzzle=${encoded}`;

      setGeneratedURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to generate puzzle'
      );
    }
  }, [language, proverbs]);

  const handleCopyURL = useCallback(() => {
    navigator.clipboard.writeText(generatedURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [generatedURL]);

  const handleClear = useCallback(() => {
    setProverbs([
      { solution: '', culture: '', meaning: '' },
      { solution: '', culture: '', meaning: '' },
      { solution: '', culture: '', meaning: '' },
    ]);
    setGeneratedURL('');
    setError('');
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Puzzle Builder</h1>
        <p className={styles.description}>
          Create your own Proverb Pile puzzle by entering 3-4 proverbs. Words
          will be automatically shuffled and encoded into a shareable URL.
        </p>
      </div>

      <div className={styles.form}>
        {/* Language Selection */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Language</div>
          <div className={styles.languageSelector}>
            <button
              className={`${styles.languageOption} ${
                language === 'en' ? styles.selected : ''
              }`}
              onClick={() => setLanguage('en')}
            >
              English
            </button>
            <button
              className={`${styles.languageOption} ${
                language === 'he' ? styles.selected : ''
              }`}
              onClick={() => setLanguage('he')}
            >
              Hebrew (עברית)
            </button>
          </div>
        </div>

        {/* Proverb Inputs */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Proverbs</div>
          <div className={styles.proverbInputs}>
            {proverbs.map((proverb, index) => (
              <div key={index} className={styles.proverbCard}>
                <div className={styles.proverbHeader}>
                  <span className={styles.proverbNumber}>
                    Proverb {index + 1}
                  </span>
                  {proverbs.length > 3 && (
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveProverb(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Proverb Text<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={proverb.solution}
                    onChange={e =>
                      handleProverbChange(index, 'solution', e.target.value)
                    }
                    placeholder="e.g., Don't bite the hand that feeds you"
                  />
                  <div className={styles.hint}>5-10 words required</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Culture/Origin<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={proverb.culture}
                    onChange={e =>
                      handleProverbChange(index, 'culture', e.target.value)
                    }
                    placeholder="e.g., English, Chinese, Indian"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Meaning<span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    value={proverb.meaning}
                    onChange={e =>
                      handleProverbChange(index, 'meaning', e.target.value)
                    }
                    placeholder="Explain what the proverb means..."
                  />
                </div>
              </div>
            ))}

            {proverbs.length < 4 && (
              <button
                className={styles.addButton}
                onClick={handleAddProverb}
              >
                + Add Another Proverb (Optional)
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={handleGenerate}
          >
            Generate Puzzle URL
          </button>
          <button className={styles.button} onClick={handleClear}>
            Clear All
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Generated URL Output */}
      {generatedURL && (
        <div className={styles.output}>
          <div className={styles.outputTitle}>✓ Puzzle Generated!</div>
          <p>Share this URL to let others play your puzzle:</p>
          <div className={styles.urlContainer}>
            <input
              type="text"
              className={styles.urlInput}
              value={generatedURL}
              readOnly
            />
            <button
              className={`${styles.copyButton} ${
                copied ? styles.copied : ''
              }`}
              onClick={handleCopyURL}
            >
              {copied ? '✓ Copied!' : 'Copy URL'}
            </button>
          </div>
          <p>
            <a href={generatedURL} target="_blank" rel="noopener noreferrer">
              Preview Puzzle →
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
