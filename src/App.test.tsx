import React from 'react';
import { render, screen } from '@testing-library/react';
import { GamePage } from './pages/GamePage';

test('renders app title (English or Hebrew)', () => {
  render(<GamePage />);
  // Check for either English or Hebrew title
  const titleElement = screen.getByRole('heading', { level: 1 });
  expect(titleElement).toBeInTheDocument();
  expect(titleElement.textContent).toMatch(/(Proverb Pile|ערימת פתגמים)/);
});

test('renders instruction to separate words', () => {
  render(<GamePage />);
  // Check for instruction text in either language
  const instructionElement = screen.getByText(/(Drag words from the available pool|הפרד את המילים המעורבבות לפתגמים)/);
  expect(instructionElement).toBeInTheDocument();
});

test('renders proverbs section', () => {
  render(<GamePage />);
  // Check for proverbs section in either language
  const proverbsElement = screen.getByText(/(^Proverbs$|^פתגמים$)/);
  expect(proverbsElement).toBeInTheDocument();
});

test('renders available words section', () => {
  render(<GamePage />);
  // Check for available words in either language
  const wordsElement = screen.getByText(/(Available [Ww]ords|מילים זמינות)/);
  expect(wordsElement).toBeInTheDocument();
});

test('renders check answer button', () => {
  render(<GamePage />);
  // Check for check button in either language
  const checkButton = screen.getByText(/(Check Answer|בדוק תשובה)/);
  expect(checkButton).toBeInTheDocument();
  expect(checkButton).toBeDisabled(); // Should be disabled initially
});

test('renders reset button', () => {
  render(<GamePage />);
  // Check for reset button in either language
  const resetButton = screen.getByText(/(Reset|אתחל)/);
  expect(resetButton).toBeInTheDocument();
});
