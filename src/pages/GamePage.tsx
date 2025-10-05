/**
 * Game Page - Main puzzle game
 */

import React, { useState } from 'react';
import { useGameState } from '../hooks';
import { MultiProverbPuzzle, Modal, CulturalContext } from '../components';
import samplePuzzles from '../data/sample_puzzles.json';
import { PuzzleData } from '../types';

export const GamePage: React.FC = () => {
  const { gameState, actions } = useGameState(samplePuzzles as PuzzleData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProverbIndex, setSelectedProverbIndex] = useState(0);

  if (gameState.error) {
    return (
      <div className="error-container">
        <h1>Error Loading Puzzle</h1>
        <p>{gameState.error}</p>
        <p>
          Add a puzzle parameter to the URL or check the puzzle format.
        </p>
        <p>
          Or <a href="/#/builder">create your own puzzle</a>!
        </p>
      </div>
    );
  }

  if (gameState.proverbStates.length === 0) {
    return (
      <div className="loading-container">
        <p>Loading puzzle...</p>
      </div>
    );
  }

  const isRTL = gameState.puzzleData?.language === 'he';

  return (
    <>
      <header className="App-header">
        <h1>Proverb Pile</h1>
        <p className="subtitle">
          Separate the mixed words into {gameState.proverbStates.length}{' '}
          proverbs
        </p>
        <nav className="nav-links">
          <a href="/#/builder">Create Puzzle</a>
        </nav>
      </header>

      <main>
        <MultiProverbPuzzle
          proverbStates={gameState.proverbStates}
          onMoveWord={actions.moveWord}
          onValidate={actions.validate}
          onReset={actions.reset}
          isRTL={isRTL}
        />

        {gameState.isCompleted && (
          <div className="cultural-context-prompt">
            {gameState.proverbStates.map((state, index) => (
              <button
                key={index}
                className="learn-more-button"
                onClick={() => {
                  setSelectedProverbIndex(index);
                  setIsModalOpen(true);
                }}
                style={{ marginRight: '8px', marginBottom: '8px' }}
              >
                Learn About Proverb {index + 1}
              </button>
            ))}
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="About This Proverb"
          isRTL={isRTL}
        >
          <CulturalContext
            proverb={gameState.proverbStates[selectedProverbIndex]?.proverb}
            isRTL={isRTL}
          />
        </Modal>

        {gameState.isCompleted && (
          <div className="completion-message">
            <h2>🎉 Congratulations!</h2>
            <p>You've correctly separated all the proverbs!</p>
            <button onClick={actions.resetGame}>Play Again</button>
          </div>
        )}
      </main>
    </>
  );
};
