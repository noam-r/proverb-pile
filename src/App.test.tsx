import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Proverb Pile title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Proverb Pile/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders instruction to separate words', () => {
  render(<App />);
  const instructionElement = screen.getByText(/Drag words from the available pool/i);
  expect(instructionElement).toBeInTheDocument();
});

test('renders proverbs section', () => {
  render(<App />);
  const proverbsElement = screen.getByText(/^Proverbs$/i);
  expect(proverbsElement).toBeInTheDocument();
});

test('renders available words section', () => {
  render(<App />);
  const wordsElement = screen.getByText(/Available words/i);
  expect(wordsElement).toBeInTheDocument();
});

test('renders check answer button', () => {
  render(<App />);
  const checkButton = screen.getByText(/Check Answer/i);
  expect(checkButton).toBeInTheDocument();
  expect(checkButton).toBeDisabled(); // Should be disabled initially
});

test('renders reset button', () => {
  render(<App />);
  const resetButton = screen.getByText(/Reset/i);
  expect(resetButton).toBeInTheDocument();
});
