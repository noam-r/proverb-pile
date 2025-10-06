# Testing Guide for Proverb Pile

This document outlines the testing procedures and guidelines for the Proverb Pile project.

## Automated Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests without watch mode
npm test -- --watchAll=false
```

### Test Coverage

Current test coverage (as of Phase 7):
- **Total Tests**: 101
- **Passing Tests**: 86
- **Overall Coverage**: 53%

#### Component Coverage
- **Modal**: 100% statement coverage
- **CulturalContext**: 100% statement coverage
- **wordUtils**: 100% coverage
- **puzzleLoader**: 79% coverage
- **MultiProverbPuzzle**: 62% coverage
- **PuzzleBuilder**: 33% coverage

### Test Suites

1. **src/utils/wordUtils.test.ts** - Word manipulation utilities
2. **src/utils/puzzleLoader.test.ts** - Puzzle encoding/decoding
3. **src/App.test.tsx** - Main app component
4. **src/components/Modal.test.tsx** - Modal overlay component
5. **src/components/CulturalContext.test.tsx** - Cultural context display
6. **src/components/MultiProverbPuzzle.test.tsx** - Multi-proverb puzzle interface
7. **src/components/PuzzleBuilder.test.tsx** - Puzzle creation tool

## Manual Testing

### Cross-Browser Testing

Test the application on the following browsers:

#### Desktop Browsers
- [ ] **Chrome** (latest version)
  - Drag and drop functionality
  - Word placement
  - Modal interactions
  - Puzzle validation
  - URL encoding/decoding
- [ ] **Firefox** (latest version)
  - Same tests as Chrome
  - Check for drag-drop API differences
- [ ] **Safari** (latest version)
  - Same tests as Chrome
  - Verify touch/drag interactions
- [ ] **Edge** (latest version)
  - Same tests as Chrome

#### Mobile Browsers
- [ ] **Chrome Mobile** (Android)
  - Touch interactions for word placement
  - Responsive layout
  - Modal scrolling
- [ ] **Safari Mobile** (iOS)
  - Touch interactions
  - Responsive layout
  - Modal behavior

### Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Use Enter/Space to activate buttons
- [ ] Use Escape to close modals
- [ ] Drag-and-drop alternative (click to place)

#### Screen Reader Testing
Test with the following screen readers:
- [ ] **NVDA** (Windows)
- [ ] **JAWS** (Windows)
- [ ] **VoiceOver** (macOS/iOS)
- [ ] **TalkBack** (Android)

Check for:
- Proper ARIA labels
- Role attributes
- Focus management
- Status announcements

#### Color Contrast
- [ ] Verify WCAG 2.1 AA compliance
- [ ] Test with color blindness simulators
- [ ] Check focus indicators are visible

### Responsive Design Testing

Test on the following viewport sizes:

#### Mobile
- [ ] iPhone SE (375x667)
- [ ] iPhone 12 Pro (390x844)
- [ ] Samsung Galaxy S20 (360x800)

#### Tablet
- [ ] iPad Mini (768x1024)
- [ ] iPad Pro (1024x1366)

#### Desktop
- [ ] Laptop (1366x768)
- [ ] Desktop HD (1920x1080)
- [ ] Desktop 4K (3840x2160)

### Feature Testing Checklist

#### Game Play
- [ ] Words shuffle properly on load
- [ ] Words from all proverbs are mixed together
- [ ] Drag and drop works smoothly
- [ ] Click-to-place works as alternative
- [ ] Drop zones highlight correctly
- [ ] Words can be removed from drop zones
- [ ] Validate button only enabled when all words placed
- [ ] Validation shows correct/incorrect feedback
- [ ] Cultural context modal opens
- [ ] Cultural context modal closes (click outside, X button, Escape)
- [ ] Reset button clears all progress
- [ ] All 3 proverbs must be correct to win

#### Puzzle Builder
- [ ] Language selection works (English/Hebrew)
- [ ] Can add 4th proverb
- [ ] Can remove 4th proverb
- [ ] Input validation works (5-10 words)
- [ ] Error messages display correctly
- [ ] Generate button creates valid URL
- [ ] Copy to clipboard works
- [ ] Generated puzzles load correctly
- [ ] RTL layout works for Hebrew

#### URL Handling
- [ ] Puzzle data encodes correctly
- [ ] Puzzle data decodes correctly
- [ ] Invalid URLs show error message
- [ ] Missing puzzle parameter shows error
- [ ] Corrupted puzzle data handled gracefully

#### Routing
- [ ] Home page (/) loads game
- [ ] Builder page (/builder) loads builder
- [ ] Navigation between pages works
- [ ] Back button works correctly
- [ ] URLs update correctly (HashRouter)

## Performance Testing

### Load Time
- [ ] Initial page load < 3 seconds
- [ ] Puzzle loads immediately from URL
- [ ] No jank when dragging words
- [ ] Modal opens/closes smoothly

### Bundle Size
Check bundle size with:
```bash
npm run build
```

Expected sizes:
- Main bundle: < 500KB
- CSS: < 50KB

## Security Testing

### Input Validation
- [ ] XSS protection in puzzle text
- [ ] SQL injection not applicable (no backend)
- [ ] URL parameter sanitization
- [ ] Base64 decoding error handling

### Content Security
- [ ] No inline scripts
- [ ] External resources from trusted CDNs
- [ ] HTTPS enforced (GitHub Pages)

## Regression Testing

When making changes, always test:
1. [ ] Existing puzzles still load correctly
2. [ ] Word shuffling still works
3. [ ] All 49+ existing tests still pass
4. [ ] No console errors or warnings
5. [ ] No performance degradation

## Bug Reporting

When reporting bugs, include:
- Browser and version
- Device (if mobile)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots/video if applicable
- Console errors (if any)

## Continuous Integration

The project uses GitHub Actions for CI/CD:
- Tests run on every pull request
- Tests must pass before merging
- Deployment to GitHub Pages on push to master

See [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) for CI configuration.

## Future Testing Improvements

- Add E2E tests with Playwright or Cypress
- Add visual regression testing
- Increase component test coverage to 80%+
- Add performance benchmarking
- Add automated accessibility testing with axe-core
 
