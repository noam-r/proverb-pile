import React from 'react';
import { useGameState } from './hooks';
import { ProverbPuzzle } from './components';
import samplePuzzles from './data/sample_puzzles.json';
import { PuzzleData } from './types';
import './App.css';

function App() {
  const { gameState, currentProverbState, actions } = useGameState(
    samplePuzzles as PuzzleData
  );

  if (gameState.error) {
    return (
      <div className="App">
        <div className="error-container">
          <h1>Error Loading Puzzle</h1>
          <p>{gameState.error}</p>
          <p>
            Add a puzzle parameter to the URL or check the puzzle format.
          </p>
        </div>
      </div>
    );
  }

  if (!currentProverbState) {
    return (
      <div className="App">
        <div className="loading-container">
          <p>Loading puzzle...</p>
        </div>
      </div>
    );
  }

  const isRTL = gameState.puzzleData?.language === 'he';

  return (
    <div className="App">
      <header className="App-header">
        <h1>Proverb Pile</h1>
        <p className="subtitle">
          Reconstruct proverbs from around the world
        </p>
        <div className="puzzle-progress">
          Puzzle {gameState.currentProverbIndex + 1} of{' '}
          {gameState.proverbStates.length}
        </div>
      </header>

      <main>
        <ProverbPuzzle
          proverbState={currentProverbState}
          onMoveWord={actions.moveWord}
          onValidate={actions.validate}
          onReset={actions.resetProverb}
          isRTL={isRTL}
        />

        {currentProverbState.isSolved && (
          <div className="cultural-context">
            <h3>About this proverb</h3>
            <p>
              <strong>Origin:</strong> {currentProverbState.proverb.culture}
            </p>
            <p>
              <strong>Meaning:</strong> {currentProverbState.proverb.meaning}
            </p>
          </div>
        )}

        {gameState.proverbStates.length > 1 && (
          <div className="navigation">
            <button
              onClick={actions.previousProverb}
              disabled={gameState.currentProverbIndex === 0}
            >
              ← Previous
            </button>
            <button
              onClick={actions.nextProverb}
              disabled={
                gameState.currentProverbIndex ===
                gameState.proverbStates.length - 1
              }
            >
              Next →
            </button>
          </div>
        )}

        {gameState.isCompleted && (
          <div className="completion-message">
            <h2>🎉 Congratulations!</h2>
            <p>You've completed all the proverbs!</p>
            <button onClick={actions.resetGame}>Play Again</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
