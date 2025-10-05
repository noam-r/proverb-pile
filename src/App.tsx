import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { GamePage } from './pages/GamePage';
import { BuilderPage } from './pages/BuilderPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<GamePage />} />
          <Route path="/builder" element={<BuilderPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
