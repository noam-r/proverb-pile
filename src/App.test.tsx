import React from 'react';
import { render, screen } from '@testing-library/react';
import { HashRouter } from 'react-router-dom';
import { GamePage } from './pages/GamePage';

test('renders without crashing', () => {
  // Just test that the component renders without throwing an error
  const { container } = render(
    <HashRouter>
      <GamePage />
    </HashRouter>
  );
  expect(container).toBeInTheDocument();
});

test('shows loading state initially', () => {
  render(
    <HashRouter>
      <GamePage />
    </HashRouter>
  );
  // Should show loading state initially
  expect(screen.getByText(/Loading puzzle|טוען חידה/)).toBeInTheDocument();
});
