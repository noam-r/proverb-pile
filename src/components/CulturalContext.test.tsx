import React from 'react';
import { render, screen } from '@testing-library/react';
import { CulturalContext } from './CulturalContext';
import { getTranslations } from '../utils';
import type { Proverb } from '../types';

const mockProverb: Proverb = {
  id: 'test-proverb',
  words: ['A', 'bird', 'in', 'hand'],
  solution: 'A bird in hand',
  culture: 'English',
  meaning: 'Something you have is better than something you might get',
};

const mockTranslations = getTranslations('en');

describe('CulturalContext', () => {
  it('renders the proverb solution', () => {
    render(<CulturalContext proverb={mockProverb} translations={mockTranslations} />);

    expect(screen.getByText(/"A bird in hand"/)).toBeInTheDocument();
  });

  it('renders the culture/origin', () => {
    render(<CulturalContext proverb={mockProverb} translations={mockTranslations} />);

    expect(screen.getByText(/English/)).toBeInTheDocument();
  });

  it('renders the meaning', () => {
    render(<CulturalContext proverb={mockProverb} translations={mockTranslations} />);

    expect(screen.getByText(/Something you have is better than something you might get/)).toBeInTheDocument();
  });

  it('renders section headers', () => {
    render(<CulturalContext proverb={mockProverb} translations={mockTranslations} />);

    expect(screen.getByText(/Origin/)).toBeInTheDocument();
    expect(screen.getByText(/Meaning/)).toBeInTheDocument();
  });

  it('applies correct CSS class', () => {
    const { container } = render(<CulturalContext proverb={mockProverb} translations={mockTranslations} />);

    // Component uses CSS modules, so we check for the container class
    expect(container.querySelector('[class*="container"]')).toBeInTheDocument();
  });

  it('handles Hebrew proverbs', () => {
    const hebrewProverb: Proverb = {
      id: 'hebrew-proverb',
      words: ['שלום', 'עולם'],
      solution: 'שלום עולם',
      culture: 'Hebrew',
      meaning: 'Hello world',
    };

    const hebrewTranslations = getTranslations('he');
    render(<CulturalContext proverb={hebrewProverb} translations={hebrewTranslations} />);

    expect(screen.getByText(/"שלום עולם"/)).toBeInTheDocument();
    expect(screen.getByText(/Hebrew/)).toBeInTheDocument();
    expect(screen.getByText(/Hello world/)).toBeInTheDocument();
  });

  it('handles long meanings', () => {
    const longMeaning = 'This is a very long meaning that explains the proverb in great detail, covering its historical context, cultural significance, and modern usage in everyday conversation.';
    const proverbWithLongMeaning: Proverb = {
      ...mockProverb,
      meaning: longMeaning,
    };

    render(<CulturalContext proverb={proverbWithLongMeaning} translations={mockTranslations} />);

    expect(screen.getByText(longMeaning)).toBeInTheDocument();
  });

  it('handles special characters in culture name', () => {
    const specialProverb: Proverb = {
      ...mockProverb,
      culture: 'Chinese (Mandarin)',
    };

    render(<CulturalContext proverb={specialProverb} translations={mockTranslations} />);

    expect(screen.getByText(/Chinese \(Mandarin\)/)).toBeInTheDocument();
  });
});
