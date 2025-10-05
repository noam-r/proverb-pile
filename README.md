# Proverb Pile

A minimalist, stateless word puzzle game where players drag-and-drop scrambled words to reconstruct proverbs from multiple cultures.

## 🎯 Features

- **Stateless Puzzle Delivery**: Puzzles loaded via Base64-encoded URL parameters
- **Multilingual Support**: Initial support for English and Hebrew
- **Drag-and-Drop Interface**: Intuitive word rearrangement mechanics
- **Cultural Context**: Learn about proverbs from different cultures
- **NYT-Style Minimalist Design**: Clean, accessible interface

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

## 📂 Project Structure

```
src/
  components/     # React components
  hooks/          # Custom React hooks
  utils/          # Utility functions
  types/          # TypeScript type definitions
  styles/         # CSS modules and styles
  tests/          # Test files
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

## 📊 Performance Goals

- Load time: < 1 second
- Lighthouse performance score: > 90
- Test coverage: > 90%
- WCAG 2.1 AA accessibility compliance

## 🤝 Contributing

1. Follow the TypeScript and ESLint configurations
2. Write tests for new features
3. Ensure accessibility standards are met
4. Use Prettier for code formatting

---

Generated with [Claude Code](https://claude.com/claude-code)
