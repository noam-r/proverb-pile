/**
 * Builder Page - Puzzle creation interface
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { PuzzleBuilder } from '../components';

export const BuilderPage: React.FC = () => {
  return (
    <>
      <nav className="builder-nav">
        <Link to="/">← Back to Game</Link>
      </nav>
      <PuzzleBuilder />
    </>
  );
};
