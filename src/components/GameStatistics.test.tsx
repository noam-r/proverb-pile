/**
 * Tests for GameStatistics component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameStatistics } from './GameStatistics';

const mockTranslations = {
  hintsUsed: 'Hints Used',
  validationAttempts: 'Attempts Used',
  perfectScore: 'Perfect Score!',
  firstTry: 'First Try!',
  noHints: 'No Hints Used!',
  minimalHints: 'Minimal Hints Used!',
  excellentWork: 'Excellent Work!',
};

describe('GameStatistics', () => {
  it('displays basic statistics correctly', () => {
    render(
      <GameStatistics
        hintsUsed={2}
        validationAttempts={1}
        totalValidationAttempts={3}
        translations={mockTranslations}
      />
    );

    expect(screen.getByText('Hints Used:')).toBeInTheDocument();
    expect(screen.getByText('Attempts Used:')).toBeInTheDocument();
    
    // Check that both values are displayed (both happen to be 2 in this case)
    const statValues = screen.getAllByText('2');
    expect(statValues).toHaveLength(2);
  });

  it('shows perfect score achievement', () => {
    render(
      <GameStatistics
        hintsUsed={0}
        validationAttempts={2}
        totalValidationAttempts={3}
        translations={mockTranslations}
      />
    );

    expect(screen.getByText('Perfect Score!')).toBeInTheDocument();
  });

  it('shows first try achievement when no perfect score', () => {
    render(
      <GameStatistics
        hintsUsed={1}
        validationAttempts={2}
        totalValidationAttempts={3}
        translations={mockTranslations}
      />
    );

    expect(screen.getByText('First Try!')).toBeInTheDocument();
    expect(screen.queryByText('Perfect Score!')).not.toBeInTheDocument();
  });

  it('shows no hints achievement when no perfect score', () => {
    render(
      <GameStatistics
        hintsUsed={0}
        validationAttempts={1}
        totalValidationAttempts={3}
        translations={mockTranslations}
      />
    );

    expect(screen.getByText('No Hints Used!')).toBeInTheDocument();
    expect(screen.queryByText('Perfect Score!')).not.toBeInTheDocument();
  });

  it('shows minimal hints achievement', () => {
    render(
      <GameStatistics
        hintsUsed={2}
        validationAttempts={1}
        totalValidationAttempts={3}
        translations={mockTranslations}
      />
    );

    expect(screen.getByText('Minimal Hints Used!')).toBeInTheDocument();
  });

  it('shows multiple achievements when applicable', () => {
    render(
      <GameStatistics
        hintsUsed={2}
        validationAttempts={2}
        totalValidationAttempts={3}
        translations={mockTranslations}
      />
    );

    // Should show both first try and minimal hints
    expect(screen.getByText('First Try!')).toBeInTheDocument();
    expect(screen.getByText('Minimal Hints Used!')).toBeInTheDocument();
  });

  it('applies RTL class when isRTL is true', () => {
    const { container } = render(
      <GameStatistics
        hintsUsed={1}
        validationAttempts={2}
        totalValidationAttempts={3}
        isRTL={true}
        translations={mockTranslations}
      />
    );

    expect(container.querySelector('.rtl')).toBeInTheDocument();
  });
});