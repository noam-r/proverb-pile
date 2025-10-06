/**
 * Puzzle Builder component for creating custom puzzles
 */

import React, { useState, useCallback, useMemo } from 'react';
import { PuzzleData, Proverb, LanguageCode } from '../types';
import { encodePuzzle, decodePuzzle, validatePuzzle, shuffleArray, getTranslations } from '../utils';
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
  const [decodeInput, setDecodeInput] = useState<string>('');

  // Get translations and RTL setting based on selected language
  const t = useMemo(() => getTranslations(language), [language]);
  const isRTL = language === 'he';

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
        throw new Error(t.errorAllSolutions);
      }

      if (proverbs.some(p => !p.culture.trim())) {
        throw new Error(t.errorAllCultures);
      }

      if (proverbs.some(p => !p.meaning.trim())) {
        throw new Error(t.errorAllMeanings);
      }

      // Create puzzle data
      const puzzleProverbs: Proverb[] = proverbs.map((p, index) => {
        const words = tokenizeWords(p.solution);

        if (words.length < 3) {
          throw new Error(t.errorMinWords(index + 1, words.length));
        }

        if (words.length > 10) {
          throw new Error(t.errorMaxWords(index + 1, words.length));
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
  }, [language, proverbs, t]);

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

  const handleDecode = useCallback(() => {
    try {
      setError('');

      if (!decodeInput.trim()) {
        return;
      }

      // Extract encoded string from input
      // Could be a full URL or just the encoded string
      let encodedString = decodeInput.trim();

      // If it's a URL, extract the puzzle parameter
      if (encodedString.includes('?puzzle=')) {
        const url = new URL(encodedString);
        encodedString = url.searchParams.get('puzzle') || '';
      } else if (encodedString.includes('puzzle=')) {
        // Handle case where user pastes just the query string
        const params = new URLSearchParams(encodedString);
        encodedString = params.get('puzzle') || encodedString;
      }

      // Decode the puzzle
      const puzzleData = decodePuzzle(encodedString);

      // Validate the decoded puzzle
      const validation = validatePuzzle(puzzleData);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Load the puzzle data into the form
      setLanguage(puzzleData.language);

      const loadedProverbs: ProverbInput[] = puzzleData.proverbs.map(p => ({
        solution: p.solution,
        culture: p.culture,
        meaning: p.meaning,
      }));

      setProverbs(loadedProverbs);
      setDecodeInput('');
      setGeneratedURL('');
    } catch (err) {
      setError(
        t.errorDecoding + ' ' + (err instanceof Error ? err.message : '')
      );
    }
  }, [decodeInput, t]);

  return (
    <div className={styles.container} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t.puzzleBuilder}</h1>
        <p className={styles.description}>
          {t.builderDescription}
        </p>
      </div>

      <div className={styles.form}>
        {/* Language Selection */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t.languageLabel}</div>
          <div className={styles.languageSelector}>
            <button
              className={`${styles.languageOption} ${
                language === 'en' ? styles.selected : ''
              }`}
              onClick={() => setLanguage('en')}
            >
              {t.english}
            </button>
            <button
              className={`${styles.languageOption} ${
                language === 'he' ? styles.selected : ''
              }`}
              onClick={() => setLanguage('he')}
            >
              {t.hebrew}
            </button>
          </div>
        </div>

        {/* Decode Section */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t.decodeLabel}</div>
          <p className={styles.hint}>{t.decodeDescription}</p>
          <div className={styles.decodeContainer}>
            <textarea
              className={styles.decodeInput}
              value={decodeInput}
              onChange={e => setDecodeInput(e.target.value)}
              placeholder={t.decodePlaceholder}
              rows={3}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={handleDecode}
              disabled={!decodeInput.trim()}
            >
              {t.decodeButton}
            </button>
          </div>
        </div>

        {/* Proverb Inputs */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>{t.proverbsLabel}</div>
          <div className={styles.proverbInputs}>
            {proverbs.map((proverb, index) => (
              <div key={index} className={styles.proverbCard}>
                <div className={styles.proverbHeader}>
                  <span className={styles.proverbNumber}>
                    {t.proverbNumber(index + 1)}
                  </span>
                  {proverbs.length > 3 && (
                    <button
                      className={styles.removeButton}
                      onClick={() => handleRemoveProverb(index)}
                    >
                      {t.remove}
                    </button>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {t.proverbText}<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={proverb.solution}
                    onChange={e =>
                      handleProverbChange(index, 'solution', e.target.value)
                    }
                    placeholder={t.proverbPlaceholder}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                  <div className={styles.hint}>{t.wordsRequired}</div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {t.cultureOrigin}<span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    value={proverb.culture}
                    onChange={e =>
                      handleProverbChange(index, 'culture', e.target.value)
                    }
                    placeholder={t.culturePlaceholder}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    {t.meaningLabel}<span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    value={proverb.meaning}
                    onChange={e =>
                      handleProverbChange(index, 'meaning', e.target.value)
                    }
                    placeholder={t.meaningPlaceholder}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>
            ))}

            {proverbs.length < 4 && (
              <button
                className={styles.addButton}
                onClick={handleAddProverb}
              >
                {t.addAnother}
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
            {t.generateURL}
          </button>
          <button className={styles.button} onClick={handleClear}>
            {t.clearAll}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && <div className={styles.error}>{error}</div>}

      {/* Generated URL Output */}
      {generatedURL && (
        <div className={styles.output}>
          <div className={styles.outputTitle}>{t.puzzleGenerated}</div>
          <p>{t.shareURL}</p>
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
              {copied ? t.copied : t.copy}
            </button>
          </div>
          <p>
            <a href={generatedURL} target="_blank" rel="noopener noreferrer">
              {isRTL ? '← ' : ''}Preview Puzzle{isRTL ? '' : ' →'}
            </a>
          </p>
        </div>
      )}
    </div>
  );
};
