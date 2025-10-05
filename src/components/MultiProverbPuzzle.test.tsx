import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MultiProverbPuzzle } from './MultiProverbPuzzle';
import type { ProverbState } from '../types';

const mockProverbStates: ProverbState[] = [
  {
    proverb: {
      id: 'p1',
      words: ['A', 'bird', 'in', 'hand'],
      solution: 'A bird in hand',
      culture: 'English',
      meaning: 'Something you have is better',
    },
    wordPositions: [
      { word: 'A', originalIndex: 0, currentIndex: null },
      { word: 'bird', originalIndex: 1, currentIndex: null },
      { word: 'in', originalIndex: 2, currentIndex: null },
      { word: 'hand', originalIndex: 3, currentIndex: null },
    ],
    isSolved: false,
    isValidated: false,
  },
  {
    proverb: {
      id: 'p2',
      words: ['The', 'early', 'bird', 'catches'],
      solution: 'The early bird catches',
      culture: 'English',
      meaning: 'Start early for success',
    },
    wordPositions: [
      { word: 'The', originalIndex: 0, currentIndex: null },
      { word: 'early', originalIndex: 1, currentIndex: null },
      { word: 'bird', originalIndex: 2, currentIndex: null },
      { word: 'catches', originalIndex: 3, currentIndex: null },
    ],
    isSolved: false,
    isValidated: false,
  },
  {
    proverb: {
      id: 'p3',
      words: ['Better', 'late', 'than', 'never'],
      solution: 'Better late than never',
      culture: 'English',
      meaning: 'It is better to do something late',
    },
    wordPositions: [
      { word: 'Better', originalIndex: 0, currentIndex: null },
      { word: 'late', originalIndex: 1, currentIndex: null },
      { word: 'than', originalIndex: 2, currentIndex: null },
      { word: 'never', originalIndex: 3, currentIndex: null },
    ],
    isSolved: false,
    isValidated: false,
  },
];

describe('MultiProverbPuzzle', () => {
  const mockOnMoveWord = jest.fn();
  const mockOnValidate = jest.fn();
  const mockOnReset = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all three proverbs', () => {
    render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Proverb 1')).toBeInTheDocument();
    expect(screen.getByText('Proverb 2')).toBeInTheDocument();
    expect(screen.getByText('Proverb 3')).toBeInTheDocument();
  });

  it('displays validate button', () => {
    render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Validate')).toBeInTheDocument();
  });

  it('displays reset button', () => {
    render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('calls onValidate when validate button is clicked', () => {
    render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    const validateButton = screen.getByText('Validate');
    fireEvent.click(validateButton);

    expect(mockOnValidate).toHaveBeenCalledTimes(1);
  });

  it('calls onReset when reset button is clicked', () => {
    render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    expect(mockOnReset).toHaveBeenCalledTimes(1);
  });

  it('displays available words', () => {
    render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    // All words should be in available pool (12 words total)
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getAllByText('bird').length).toBeGreaterThan(0);
    expect(screen.getByText('Better')).toBeInTheDocument();
  });

  it('displays correct number of drop zones', () => {
    const { container } = render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    // 3 proverbs with 4 words each = 12 drop zones
    const dropZones = container.querySelectorAll('[data-testid^="drop-zone-"]');
    expect(dropZones.length).toBe(12);
  });

  it('shows error state when proverb is validated incorrectly', () => {
    const statesWithError: ProverbState[] = [
      {
        ...mockProverbStates[0],
        isValidated: true,
        isSolved: false,
      },
      ...mockProverbStates.slice(1),
    ];

    const { container } = render(
      <MultiProverbPuzzle
        proverbStates={statesWithError}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    // Check for error styling (CSS module classes)
    const errorSection = container.querySelector('[class*="error"]');
    expect(errorSection).toBeInTheDocument();
  });

  it('shows success state when proverb is solved', () => {
    const statesWithSuccess: ProverbState[] = [
      {
        ...mockProverbStates[0],
        isValidated: true,
        isSolved: true,
      },
      ...mockProverbStates.slice(1),
    ];

    const { container } = render(
      <MultiProverbPuzzle
        proverbStates={statesWithSuccess}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    // Check for success styling
    const successSection = container.querySelector('[class*="success"]');
    expect(successSection).toBeInTheDocument();
  });

  it('applies RTL layout when isRTL is true', () => {
    const { container } = render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
        isRTL={true}
      />
    );

    const puzzleContainer = container.querySelector('[class*="container"]');
    expect(puzzleContainer?.className).toContain('rtl');
  });

  it('applies LTR layout by default', () => {
    const { container } = render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    const puzzleContainer = container.querySelector('[class*="container"]');
    expect(puzzleContainer?.className).not.toContain('rtl');
  });

  it('renders proverb headers', () => {
    const { container } = render(
      <MultiProverbPuzzle
        proverbStates={mockProverbStates}
        onMoveWord={mockOnMoveWord}
        onValidate={mockOnValidate}
        onReset={mockOnReset}
      />
    );

    // Check that proverb sections exist
    const proverbSections = container.querySelectorAll('[class*="proverbItem"]');
    expect(proverbSections.length).toBe(3);
  });
});
