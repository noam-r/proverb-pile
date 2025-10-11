import React from 'react';
import { render, screen } from '@testing-library/react';
import { GamePage } from './pages/GamePage';

test('renders without crashing', () => {
  // Just test that the component renders without throwing an error
  const { container } = render(<GamePage />);
  expect(container).toBeInTheDocument();
});

test('shows loading state initially', () => {
  render(<GamePage />);
  // Should show loading state initially
  expect(screen.getByText(/Loading puzzle|טוען חידה/)).toBeInTheDocument();
});
