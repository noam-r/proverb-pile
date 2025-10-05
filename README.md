# Proverb Pile

A minimalist, stateless word puzzle game where players separate scrambled words from multiple proverbs. Mix words from 3 different proverbs are displayed together, and players must figure out which words belong to each proverb.

## 🎯 Features

- **Multi-Proverb Challenge**: All words from 3 proverbs mixed together in one puzzle
- **Stateless Puzzle Delivery**: Puzzles loaded via Base64-encoded URL parameters
- **Puzzle Builder**: Create and share your own custom puzzles
- **Multilingual Support**: English and Hebrew with RTL support
- **Drag-and-Drop Interface**: Intuitive word rearrangement with keyboard alternatives
- **Cultural Context**: Learn about the origin and meaning of each proverb
- **NYT-Style Minimalist Design**: Clean, accessible interface following WCAG 2.1 AA standards

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode at [http://localhost:3000](http://localhost:3000).

### Testing

```bash
npm test
```

Runs the test suite with coverage.

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Deploy

```bash
npm run deploy
```

Deploys the app to GitHub Pages.

## 🎮 How to Play

1. **View the mixed words**: All words from 3 proverbs are shuffled together in the "Available Words" section
2. **Separate the words**: Drag words from the pool to each proverb's answer area
3. **Complete all proverbs**: Place all words to unlock the "Validate" button
4. **Check your answers**: All 3 proverbs must be correct to win
5. **Learn the meanings**: Click the info icon to see cultural context

## 🎨 Creating Custom Puzzles

1. Navigate to the Puzzle Builder (`/builder`)
2. Select a language (English or Hebrew)
3. Enter 3-4 proverbs (5-10 words each)
4. Add cultural origin and meaning for each
5. Click "Generate Puzzle URL"
6. Share the URL with others!

## 📂 Project Structure

```
src/
  components/         # React components
    Word.tsx              # Draggable word component
    DropZone.tsx          # Drop target for words
    MultiProverbPuzzle.tsx  # Main game interface (all proverbs)
    ProverbPuzzle.tsx       # Legacy single-proverb interface
    PuzzleBuilder.tsx       # Puzzle creation tool
    Modal.tsx               # Reusable modal overlay
    CulturalContext.tsx     # Proverb information display
  hooks/              # Custom React hooks
    useGameState.ts         # Game state management
  utils/              # Utility functions
    puzzleLoader.ts         # Base64 encoding/decoding
    wordUtils.ts            # Word manipulation utilities
  types/              # TypeScript type definitions
    puzzle.ts               # Core type definitions
  pages/              # Page components
    GamePage.tsx            # Main game page
    BuilderPage.tsx         # Puzzle builder page
  styles/             # Global styles
  tests/              # Test files (*.test.tsx)
```

## 🛠️ Technology Stack

- **Frontend**: React 18+ with TypeScript
- **State Management**: React Hooks
- **Styling**: CSS Modules
- **Testing**: Jest + React Testing Library
- **Deployment**: GitHub Pages
- **CI/CD**: GitHub Actions

## 📝 Development Plan

See [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md) for the complete development roadmap.

## 📊 Current Status

### Test Coverage
- **Total Tests**: 101
- **Passing Tests**: 86
- **Coverage**: 53% (target: 90%)

### Components
- ✅ Modal: 100% coverage
- ✅ CulturalContext: 100% coverage
- ✅ Utils (wordUtils): 100% coverage
- ⚠️ PuzzleBuilder: 33% coverage
- ⚠️ MultiProverbPuzzle: 62% coverage

### Performance
- Load time: < 1 second
- Lighthouse performance score: > 90 (target)
- WCAG 2.1 AA accessibility compliance

See [TESTING.md](./TESTING.md) for detailed testing procedures.

## 🌐 Architecture Decisions

### Stateless Design
Puzzles are encoded in the URL using Base64, eliminating the need for a backend database. This makes the game:
- Easy to share (just copy the URL)
- Zero-cost to host (static site on GitHub Pages)
- Privacy-friendly (no data collection)

### Multi-Proverb Gameplay
Original design had 3 sequential stages (one proverb at a time). Changed to single stage with all words mixed together for increased difficulty and engagement.

### Fisher-Yates Shuffle
Words are shuffled using the Fisher-Yates algorithm to ensure true randomization across all proverbs, preventing players from identifying words by their grouping.

## 🔧 Key Technical Implementations

- **HTML5 Drag-and-Drop API**: Native browser support for word dragging
- **React Hooks**: useState, useCallback, useMemo for optimal performance
- **CSS Modules**: Component-scoped styling preventing conflicts
- **TypeScript**: Full type safety across the application
- **React Router v7**: HashRouter for client-side routing on GitHub Pages
- **Base64 Encoding**: Compact puzzle serialization in URLs

## 🚀 Deployment

### GitHub Pages
The app is automatically deployed to GitHub Pages via GitHub Actions:

1. Push to `master` branch
2. GitHub Actions runs tests
3. If tests pass, builds production bundle
4. Deploys to `gh-pages` branch
5. Available at: `https://yourusername.github.io/proverb-pile`

### Manual Deployment

```bash
npm run deploy
```

## 🤝 Contributing

1. Follow the TypeScript and ESLint configurations
2. Write tests for new features (see [TESTING.md](./TESTING.md))
3. Ensure accessibility standards are met
4. Use Prettier for code formatting
5. Run `npm test` before committing

## 📖 Additional Documentation

- [DEVELOPMENT_PLAN.md](../DEVELOPMENT_PLAN.md) - Complete development roadmap
- [TESTING.md](./TESTING.md) - Testing procedures and checklist

## 🐛 Known Issues

- Some PuzzleBuilder tests failing due to complex UI interactions
- Drag-and-drop may have browser-specific quirks on older browsers
- Mobile drag-and-drop could be improved with touch-optimized interactions

## 🎯 Future Enhancements

- Daily puzzle feature
- Leaderboard/scoring system
- More languages (Spanish, French, Chinese, Arabic)
- Sound effects and animations
- Social sharing with preview cards
- Progressive Web App (PWA) support

---

## 📄 License

This project was generated with [Claude Code](https://claude.com/claude-code)
