# Known Issues

## CRITICAL: Drag-and-Drop Places Words in Wrong Proverb

**Status**: BLOCKING - Game is currently unplayable

**Description**:
When dragging a word from "Available Words" and dropping it into a proverb's position, the word appears in a DIFFERENT proverb at the same position number.

**Example**:
- Drag "don't" to Proverb 3, position 4
- Word appears in Proverb 1, position 4 instead

**Root Cause**:
Fundamental architectural mismatch between game design and implementation:

1. **Game Design Intent**: Words from all 3 proverbs should be fully mixed together. Users should be able to place ANY word into ANY proverb's position.

2. **Current Implementation**: Each word "belongs" to a specific proverb and is stored in that proverb's `wordPositions` array. Words cannot move between proverbs.

3. **The Bug**: When `handleDrop` is called:
   - It receives `targetProverbIndex` (which proverb the drop zone belongs to)
   - But it calls `onMoveWord(draggedWord.proverbIndex, ...)` using the SOURCE proverb
   - This places the word in the source proverb at the target position
   - Result: wrong proverb, right position

**Why Simple Fix Doesn't Work**:
Changing `onMoveWord(draggedWord.proverbIndex, ...)` to `onMoveWord(targetProverbIndex, ...)` causes a different error:
- `wordIndex` is an index into the SOURCE proverb's array
- But we're now passing the TARGET proverb index
- The target proverb doesn't have that word at that index
- Result: "Cannot read property 'currentIndex' of undefined"

**Required Fix** (Major Refactoring):
The entire game state architecture needs to be redesigned:

### Current Architecture:
```typescript
ProverbState {
  proverb: { words: string[] }  // Fixed list of this proverb's words
  wordPositions: WordPosition[]  // Only tracks THIS proverb's words
}

WordPosition {
  word: string
  originalIndex: number
  currentIndex: number | null  // Position within THIS proverb only
}
```

### Required Architecture:
```typescript
GameState {
  allWords: GlobalWord[]  // ALL words from ALL proverbs
  proverbs: ProverbDefinition[]  // Just the solutions/metadata
}

GlobalWord {
  text: string
  sourceProverbId: string  // Which proverb it originally came from
  placedPosition: {
    proverbIndex: number  // Which proverb it's placed in (can be different!)
    positionIndex: number  // Position within that proverb
  } | null
}
```

### Files Requiring Changes:
1. `src/types/puzzle.ts` - Update type definitions
2. `src/hooks/useGameState.ts` - Rewrite state management
3. `src/components/MultiProverbPuzzle.tsx` - Update to use new structure
4. `src/utils/wordUtils.ts` - Update utility functions
5. All tests - Update to match new structure

### Estimated Effort:
- 4-6 hours of development
- Complete rewrite of game state logic
- All existing tests will break and need updates
- High risk of introducing new bugs

## Workaround:
None - the game cannot be played in its current state.

## Priority:
**CRITICAL** - Must be fixed before any other work.
