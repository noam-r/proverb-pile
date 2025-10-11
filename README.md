# Proverb Pile

A minimalist word puzzle game where players separate scrambled words from multiple proverbs. Words from 3-4 proverbs are mixed together, and players must figure out which words belong to each proverb.

🎮 **[Play Now](https://noam-r.github.io/proverb-pile/)**

## Features

- **Multi-Proverb Challenge**: Words from 3-4 proverbs mixed together
- **Mobile-First Design**: Optimized touch interface with fixed word pool
- **Puzzle Builder**: Create and share custom puzzles via URL
- **Multilingual**: English and Hebrew with full RTL support
- **Cultural Learning**: Discover the origin and meaning of each proverb
- **Stateless**: No backend, no tracking - puzzles are encoded in the URL

## How to Play

1. Words from all proverbs are shuffled in the pool at the bottom
2. Click/tap a word to select it
3. Click/tap an empty position in a proverb to place the word
4. Complete all proverbs and click "Check Answer"
5. Learn about the cultural context of each proverb

## Creating Custom Puzzles

1. Go to the [Puzzle Builder](https://noam-r.github.io/proverb-pile/#/builder)
2. Select a language (English or Hebrew)
3. Enter 3-4 proverbs (3-10 words each)
4. Add cultural origin and meaning
5. Generate and share the URL!

Alternatively, paste an existing puzzle URL to edit it.

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
npm start
```

Runs at [http://localhost:3000](http://localhost:3000)

### Testing

```bash
npm test
```

All 89 tests pass with full coverage of core functionality.

### Build

```bash
npm run build
```

Builds production bundle optimized for GitHub Pages.

## Technology Stack

- React 18 with TypeScript
- CSS Modules for styling
- React Testing Library + Jest
- GitHub Pages deployment
- GitHub Actions CI/CD

## Project Structure

```
src/
  components/      # React components
  hooks/           # Custom hooks (game state management)
  utils/           # Utilities (encoding, translations, validation)
  types/           # TypeScript definitions
  pages/           # Main pages (Game, Builder)
  data/            # Default puzzle data
```

## Architecture

### Stateless Design
Puzzles are Base64-encoded in the URL, requiring no backend or database. Benefits:
- Zero hosting cost (static site)
- Easy sharing (copy URL)
- Privacy-friendly (no tracking)
- Works offline after first load

### Mobile-First
- Word pool fixed to bottom of screen
- Large touch targets (44px minimum)
- Click-to-select instead of drag-and-drop
- Optimized for phones and tablets

## Deployment

Automatically deployed to GitHub Pages via GitHub Actions on push to master:
1. Tests run with full coverage
2. Build production bundle
3. Deploy directly to GitHub Pages (no gh-pages branch)

Live at: https://noam-r.github.io/proverb-pile/

## License

**PolyForm Noncommercial License 1.0.0**

This software is for noncommercial use only. See [LICENSE](LICENSE) for full terms.

## Contact

For questions, feedback, or bug reports:
- Email: kalbigames@pm.me
- GitHub: [noam-r/proverb-pile](https://github.com/noam-r/proverb-pile)

---

Made with ❤️ for language learners and puzzle enthusiasts
