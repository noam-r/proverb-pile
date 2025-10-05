/**
 * Builder Page - Puzzle creation interface
 */

import React from 'react';
import { PuzzleBuilder } from '../components';

export const BuilderPage: React.FC = () => {
  return (
    <>
      <nav className="builder-nav">
        <a href="/">← Back to Game</a>
      </nav>
      <PuzzleBuilder />
    </>
  );
};
