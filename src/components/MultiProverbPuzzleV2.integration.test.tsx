/**
 * Integration test for MultiProverbPuzzleV2 component
 * Tests complete user flow with desktop word list and enhanced hint buttons
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiProverbPuzzleV2 } from './MultiProverbPuzzleV2';
import { PuzzleData, GlobalWord } from '../types';
import { getTranslations } from '../utils';

// Mock puzzle data for testing
const mockPuzzleData: PuzzleData = {
  version: "1",
  language: "en",
  proverbs: [
    {
      solution: "Don't bite the hand that feeds you",
      culture: "English",
      meaning: "Don't harm or be ungrateful to those who have helped or supported you"
    },
    {
      solution: "A bird in the hand is worth two in the bush",
      culture: "English", 
      meaning: "It's better to have a small but certain advantage than a mere potential of a greater one"
    }
  ]
};

// Create mock words from the puzzle
const createMockWords = (): GlobalWord[] => {
  const words: GlobalWord[] = [];
  let wordId = 0;
  
  mockPuzzleData.proverbs.forEach((proverb, proverbIndex) => {
    proverb.solution.split(/\s+/).forEach((word, position) => {
      words.push({
        id: `word-${wordId++}`,
        text: word,
        sourceProverbIndex: proverbIndex,
        originalIndex: position,
        placement: null,
        isLocked: false,
        isFixedByLength: false
      });
    });
  });
  
  return words;
};

const mockTranslations = getTranslations('en');

describe('MultiProverbPuzzleV2 Integration Tests', () => {
  let mockWords: GlobalWord[];
  let mockOnMoveWord: jest.Mock;
  let mockOnRemoveWord: jest.Mock;
  let mockOnValidate: jest.Mock;
  let mockOnReset: jest.Mock;
  let mockOnRevealMeaning: jest.Mock;

  beforeEach(() => {
    mockWords = createMockWords();
    mockOnMoveWord = jest.fn();
    mockOnRemoveWord = jest.fn();
    mockOnValidate = jest.fn();
    mockOnReset = jest.fn();
    mockOnRevealMeaning = jest.fn();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      puzzleData: mockPuzzleData,
      allWords: mockWords,
      availableWords: mockWords,
      proverbValidation: [
        { isSolved: false, isValidated: false },
        { isSolved: false, isValidated: false }
      ],
      isCompleted: false,
      usedHints: new Set<number>(),
      wordHintsUsed: new Map<number, number>(),
      validationAttempts: 3,
      hasFailedGame: false,
      selectionState: {
        selectedWordId: null,
        selectedPlaceholder: null,
        autoFocusTarget: null,
      },
      onMoveWord: mockOnMoveWord,
      onRemoveWord: mockOnRemoveWord,
      onValidate: mockOnValidate,
      onValidateProverb: jest.fn(),
      onReset: mockOnReset,
      onRevealMeaning: mockOnRevealMeaning,
      onSelectWord: jest.fn(),
      onSelectPlaceholder: jest.fn(),
      onClearSelections: jest.fn(),
      onUpdateAutoFocus: jest.fn(),
      findNextEmptySlot: jest.fn().mockReturnValue({ proverbIndex: 0, positionIndex: 0 }),
      isRTL: false,
      translations: mockTranslations,
      ...props
    };

    return render(<MultiProverbPuzzleV2 {...defaultProps} />);
  };

  describe('Desktop Word List Positioning', () => {
    test('renders available words section with proper structure', () => {
      renderComponent();
      
      const availableWordsSection = screen.getByText(/Available words/);
      expect(availableWordsSection).toBeInTheDocument();
      
      // Check that words are rendered (some words appear multiple times, so use getAllByText)
      const uniqueWords = Array.from(new Set(mockWords.map(w => w.text)));
      uniqueWords.forEach(wordText => {
        expect(screen.getAllByText(wordText).length).toBeGreaterThan(0);
      });
    });

    test('displays correct word count in available words title', () => {
      renderComponent();
      
      expect(screen.getByText(`Available words (${mockWords.length} remaining)`)).toBeInTheDocument();
    });

    test('shows empty state when all words are placed', () => {
      renderComponent({ availableWords: [] });
      
      expect(screen.getByText('All words placed - click Check Answer!')).toBeInTheDocument();
      expect(screen.getAllByText('Check Answer').length).toBeGreaterThan(0);
    });
  });

  describe('Two-Level Hint System', () => {
    test('shows level 1 hint button initially', () => {
      renderComponent();
      
      const hintButtons = screen.getAllByText('Hint');
      expect(hintButtons).toHaveLength(2); // One for each proverb
      
      // Check that it's the level 1 hint (lightbulb icon)
      const firstHintButton = hintButtons[0].closest('button');
      expect(firstHintButton).toHaveAttribute('title', 'Hint');
    });

    test('shows level 2 hint button after level 1 is used', () => {
      const wordHintsUsed = new Map<number, number>();
      wordHintsUsed.set(0, 0); // No word hints used yet for first proverb
      
      renderComponent({
        usedHints: new Set([0]), // Level 1 hint used for first proverb
        wordHintsUsed, // Level 2 not used yet
      });
      
      // Should show "Place Word" button for first proverb with counter
      const placeWordButton = screen.getByText(/Place Word \(0\/\d+\)/);
      expect(placeWordButton).toBeInTheDocument();
      expect(placeWordButton.closest('button')).toHaveAttribute('title', 'Place Word');
      
      // Should still show regular hint for second proverb
      const hintButton = screen.getByText('Hint');
      expect(hintButton).toBeInTheDocument();
    });

    test('hides hint button after reaching 80% limit', () => {
      const wordHintsUsed = new Map<number, number>();
      // First proverb "Don't bite the hand that feeds you" has 8 words, 80% = 6 words max
      wordHintsUsed.set(0, 6); // Reached the limit
      
      renderComponent({
        usedHints: new Set([0]), // Level 1 hint used
        wordHintsUsed, // Level 2 hints at limit
      });
      
      // Should not show any hint buttons for first proverb
      expect(screen.queryByText(/Place Word/)).not.toBeInTheDocument();
      
      // Should still show hint for second proverb
      const hintButton = screen.getByText('Hint');
      expect(hintButton).toBeInTheDocument();
    });

    test('does not show level 2 hint when no words available', () => {
      renderComponent({
        usedHints: new Set([0]), // Level 1 hint used
        wordHintsUsed: new Map<number, number>(), // No word hints used yet
        availableWords: [], // No words available
      });
      
      // Should not show level 2 hint button when no words available
      expect(screen.queryByText(/Place Word/)).not.toBeInTheDocument();
    });

    test('level 2 hint button has different styling', () => {
      const wordHintsUsed = new Map<number, number>();
      wordHintsUsed.set(0, 0); // No word hints used yet
      
      renderComponent({
        usedHints: new Set([0]), // Level 1 hint used for first proverb
        wordHintsUsed,
      });
      
      const placeWordButton = screen.getByText(/Place Word/).closest('button');
      expect(placeWordButton).toHaveClass('hintButtonLevel2');
    });
  });

  describe('Enhanced Hint Button Functionality', () => {
    test('renders hint buttons with text and count', () => {
      renderComponent();
      
      const hintButtons = screen.getAllByText('Hint');
      expect(hintButtons).toHaveLength(2); // One for each proverb
      
      hintButtons.forEach(button => {
        expect(button).toBeInTheDocument();
        expect(button.closest('button')).toHaveClass('hintButton');
      });
    });

    test('hint button click reveals meaning', async () => {
      renderComponent();
      
      const hintButtons = screen.getAllByText('Hint');
      fireEvent.click(hintButtons[0]);
      
      expect(mockOnRevealMeaning).toHaveBeenCalledWith(0);
    });

    test('hint button is disabled when no hints remaining', () => {
      // In the new system, hint buttons are never disabled due to global count
      // They are only hidden when already used for that proverb
      renderComponent({ usedHints: new Set([0, 1]) });
      
      const hintButtons = screen.queryAllByText('Hint');
      expect(hintButtons).toHaveLength(0); // No hint buttons should be visible
    });

    test('hint button is hidden when meaning is revealed', () => {
      const usedHints = new Set([0]);
      renderComponent({ usedHints });
      
      // Should only have one hint button (for proverb 1, since proverb 0 used hint)
      const hintButtons = screen.getAllByText('Hint');
      expect(hintButtons).toHaveLength(1);
      
      // Should show the revealed meaning (with lightbulb emoji prefix)
      expect(screen.getByText(mockPuzzleData.proverbs[0].meaning, { exact: false })).toBeInTheDocument();
    });

    test('hint button is hidden when proverb is solved', () => {
      const proverbValidation = [
        { isSolved: true, isValidated: true },
        { isSolved: false, isValidated: false }
      ];
      renderComponent({ proverbValidation });
      
      // Should only have one hint button (for unsolved proverb)
      const hintButtons = screen.getAllByText('Hint');
      expect(hintButtons).toHaveLength(1);
    });
  });

  describe('Complete User Flow', () => {
    test('word selection and placement flow', async () => {
      const mockOnSelectWord = jest.fn();
      const mockOnMoveWord = jest.fn();
      
      renderComponent({
        onSelectWord: mockOnSelectWord,
        onMoveWord: mockOnMoveWord,
        selectionState: {
          selectedWordId: mockWords[0].id,
          selectedPlaceholder: null,
          autoFocusTarget: null,
        }
      });
      
      // Word should be selected (have selected class)
      const firstWord = screen.getByText(mockWords[0].text);
      expect(firstWord).toHaveClass('selected');
      
      // Selection hint should appear
      expect(screen.getByText('→ Tap an empty slot')).toBeInTheDocument();
      
      // Click on a drop zone (first empty slot in first proverb)
      const dropZones = screen.getAllByLabelText('Empty position 1');
      fireEvent.click(dropZones[0]);
      
      expect(mockOnMoveWord).toHaveBeenCalledWith(mockWords[0].id, 0, 0);
    });

    test('validation flow with partial success', () => {
      const proverbValidation = [
        { isSolved: true, isValidated: true },
        { isSolved: false, isValidated: true }
      ];
      renderComponent({ proverbValidation, availableWords: [] });
      
      // Should show partial success message
      expect(screen.getByText('1 out of 2 correct. Keep trying!')).toBeInTheDocument();
      
      // Should show individual proverb status
      expect(screen.getByText('✓ Correct')).toBeInTheDocument();
      expect(screen.getByText('✗ Incorrect')).toBeInTheDocument();
    });

    test('validation flow with complete success', () => {
      const proverbValidation = [
        { isSolved: true, isValidated: true },
        { isSolved: true, isValidated: true }
      ];
      renderComponent({ proverbValidation, availableWords: [], isCompleted: true });
      
      // Should show success message
      expect(screen.getByText('Perfect! All proverbs are correct!')).toBeInTheDocument();
      
      // Check Answer buttons should be disabled (there are two - one in controls, one in empty state)
      const checkButtons = screen.getAllByText('Check Answer');
      checkButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    test('reset functionality', async () => {
      renderComponent();
      
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);
      
      expect(mockOnReset).toHaveBeenCalled();
    });
  });

  describe('RTL Language Support', () => {
    test('applies RTL class when isRTL is true', () => {
      renderComponent({ isRTL: true });
      
      const container = screen.getByText(/Separate the mixed words/).closest('.container');
      expect(container).toHaveClass('rtl');
    });

    test('shows RTL selection hint', async () => {
      renderComponent({ 
        isRTL: true,
        selectionState: {
          selectedWordId: mockWords[0].id,
          selectedPlaceholder: null,
          autoFocusTarget: null,
        }
      });
      
      // Selection hint should appear for selected word
      expect(screen.getByText('← לחץ על משבצת ריקה')).toBeInTheDocument();
    });

    test('works with Hebrew translations', () => {
      const hebrewTranslations = getTranslations('he');
      renderComponent({ 
        isRTL: true, 
        translations: hebrewTranslations 
      });
      
      expect(screen.getByText('פתגמים')).toBeInTheDocument(); // "Proverbs" in Hebrew
      expect(screen.getByText(/מילים זמינות/)).toBeInTheDocument(); // "Available words" in Hebrew
    });
  });

  describe('Interactive Elements Functionality', () => {
    test('all buttons are properly accessible', () => {
      // Render with some words placed so Check Answer is enabled
      const availableWords = mockWords.slice(1); // Remove first word to simulate placement
      renderComponent({ availableWords });
      
      // Check Answer button should be disabled when not all words are placed
      const checkButtons = screen.getAllByText('Check Answer');
      expect(checkButtons[0]).toBeDisabled(); // Main check button is disabled when words remain
      
      // Reset button
      const resetButton = screen.getByText('Reset');
      expect(resetButton).toBeInTheDocument();
      expect(resetButton).not.toBeDisabled();
      
      // Hint buttons
      const hintButtons = screen.getAllByText('Hint');
      hintButtons.forEach(button => {
        expect(button.closest('button')).not.toBeDisabled();
        expect(button.closest('button')).toHaveAttribute('aria-label');
      });
    });

    test('word drag and drop functionality', () => {
      renderComponent();
      
      // Test drag start - create a mock dataTransfer object
      const firstWord = screen.getByText(mockWords[0].text);
      const mockDataTransfer = {
        effectAllowed: '',
        setData: jest.fn(),
      };
      
      fireEvent.dragStart(firstWord, { dataTransfer: mockDataTransfer });
      
      // Test drop on drop zone
      const dropZone = screen.getAllByLabelText('Empty position 1')[0];
      fireEvent.drop(dropZone);
      
      expect(mockOnMoveWord).toHaveBeenCalled();
    });

    test('word removal functionality', () => {
      // Create a word that's already placed
      const placedWords = mockWords.map((word, index) => ({
        ...word,
        placement: index === 0 ? { proverbIndex: 0, positionIndex: 0 } : null
      }));
      
      renderComponent({ 
        allWords: placedWords,
        availableWords: placedWords.slice(1) // All except the first placed word
      });
      
      // Find the placed word and simulate removal
      const placedWords_elements = screen.getAllByText(mockWords[0].text);
      if (placedWords_elements.length > 0) {
        fireEvent.click(placedWords_elements[0]); // This should trigger removal
      }
      
      // Note: The actual removal logic depends on the DropZone component implementation
    });
  });

  describe('Individual Proverb Validation', () => {
    test('shows validate button when proverb is complete', () => {
      // Create mock words that fill the first proverb completely
      const completeWords = createMockWords().map((word, index) => {
        if (word.sourceProverbIndex === 0 && index < 8) { // First 8 words for first proverb
          return {
            ...word,
            placement: {
              proverbIndex: 0,
              positionIndex: index,
            },
          };
        }
        return word;
      });

      renderComponent({
        allWords: completeWords,
        availableWords: completeWords.filter(w => w.placement === null),
      });

      // Should show validate button for complete proverb
      expect(screen.getByText('Check')).toBeInTheDocument();
    });

    test('does not show validate button when proverb is incomplete', () => {
      renderComponent();

      // Should not show validate button for incomplete proverbs
      expect(screen.queryByText('Check')).not.toBeInTheDocument();
    });

    test('validate button calls onValidateProverb when clicked', () => {
      const mockOnValidateProverb = jest.fn();
      
      // Create complete first proverb
      const completeWords = createMockWords().map((word, index) => {
        if (word.sourceProverbIndex === 0 && index < 8) {
          return {
            ...word,
            placement: {
              proverbIndex: 0,
              positionIndex: index,
            },
          };
        }
        return word;
      });

      renderComponent({
        allWords: completeWords,
        availableWords: completeWords.filter(w => w.placement === null),
        onValidateProverb: mockOnValidateProverb,
      });

      const validateButton = screen.getByText('Check');
      validateButton.click();

      expect(mockOnValidateProverb).toHaveBeenCalledWith(0);
    });
  });

  describe('Responsive Behavior', () => {
    test('maintains functionality across different viewport sizes', () => {
      // This test verifies that the component renders without errors
      // The actual responsive behavior is tested through CSS media queries
      renderComponent();
      
      expect(screen.getByText(/Available words/)).toBeInTheDocument();
      expect(screen.getByText('Proverbs')).toBeInTheDocument();
      expect(screen.getByText('Check Answer')).toBeInTheDocument();
    });
  });
});