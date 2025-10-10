import React from 'react';
import { render, screen } from '@testing-library/react';
import { GamePage } from './pages/GamePage';

test('renders without crashing', () => {
  render(<GamePage />);
  // Check that the component renders without crashing
  // In test environment, it should show error state due to missing puzzle files
  const errorHeading = screen.getByText(/(Error Loading Puzzle|שגיאה בטעינת החידה)/);
  expect(errorHeading).toBeInTheDocument();
});

test('shows create puzzle link in error state', () => {
  render(<GamePage />);
  // Should show link to create puzzle when there's an error
  const createLink = screen.getByText(/(create your own puzzle|צור חידה משלך)/);
  expect(createLink).toBeInTheDocument();
});
