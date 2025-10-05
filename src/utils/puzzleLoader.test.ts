/**
 * Tests for puzzle loader utilities
 */

import {
  encodePuzzle,
  decodePuzzle,
  validatePuzzle,
  getPuzzleFromURL,
} from './puzzleLoader';
import { PuzzleData } from '../types';

const validPuzzle: PuzzleData = {
  version: '1',
  language: 'en',
  proverbs: [
    {
      id: 'test-proverb-1',
      words: ['test', 'proverb', 'one', 'here', 'now'],
      solution: 'Test proverb one here now',
      culture: 'Test Culture',
      meaning: 'This is a test proverb meaning',
    },
    {
      id: 'test-proverb-2',
      words: ['another', 'test', 'proverb', 'example', 'words'],
      solution: 'Another test proverb example words',
      culture: 'Test Culture',
      meaning: 'This is another test proverb meaning',
    },
    {
      id: 'test-proverb-3',
      words: ['third', 'test', 'proverb', 'sample', 'text'],
      solution: 'Third test proverb sample text',
      culture: 'Test Culture',
      meaning: 'This is a third test proverb meaning',
    },
  ],
};

describe('encodePuzzle', () => {
  it('should encode puzzle data to base64', () => {
    const encoded = encodePuzzle(validPuzzle);
    expect(typeof encoded).toBe('string');
    expect(encoded.length).toBeGreaterThan(0);
  });

  it('should produce valid base64 string', () => {
    const encoded = encodePuzzle(validPuzzle);
    expect(() => atob(encoded)).not.toThrow();
  });
});

describe('decodePuzzle', () => {
  it('should decode valid base64 puzzle', () => {
    const encoded = encodePuzzle(validPuzzle);
    const decoded = decodePuzzle(encoded);
    expect(decoded).toEqual(validPuzzle);
  });

  it('should throw error for invalid base64', () => {
    expect(() => decodePuzzle('invalid-base64!!!')).toThrow();
  });

  it('should throw error for non-JSON content', () => {
    const invalidBase64 = btoa('not json content');
    expect(() => decodePuzzle(invalidBase64)).toThrow();
  });
});

describe('validatePuzzle', () => {
  it('should validate correct puzzle data', () => {
    const result = validatePuzzle(validPuzzle);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject null puzzle data', () => {
    const result = validatePuzzle(null);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('null or undefined');
  });

  it('should reject missing version', () => {
    const invalid = { ...validPuzzle, version: undefined };
    const result = validatePuzzle(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('version');
  });

  it('should reject missing language', () => {
    const invalid = { ...validPuzzle, language: undefined };
    const result = validatePuzzle(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('language');
  });

  it('should reject invalid language code', () => {
    const invalid = { ...validPuzzle, language: 'invalid' };
    const result = validatePuzzle(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Invalid language code');
  });

  it('should reject too few proverbs', () => {
    const invalid = { ...validPuzzle, proverbs: validPuzzle.proverbs.slice(0, 2) };
    const result = validatePuzzle(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('number of proverbs');
  });

  it('should reject too many proverbs', () => {
    const invalid = {
      ...validPuzzle,
      proverbs: [...validPuzzle.proverbs, validPuzzle.proverbs[0], validPuzzle.proverbs[0]],
    };
    const result = validatePuzzle(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('number of proverbs');
  });

  it('should reject proverb with invalid ID pattern', () => {
    const invalid = {
      ...validPuzzle,
      proverbs: [
        { ...validPuzzle.proverbs[0], id: 'Invalid ID!' },
        ...validPuzzle.proverbs.slice(1),
      ],
    };
    const result = validatePuzzle(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('ID must contain only');
  });

  it('should reject proverb with too few words', () => {
    const invalid = {
      ...validPuzzle,
      proverbs: [
        { ...validPuzzle.proverbs[0], words: ['too', 'few', 'words'] },
        ...validPuzzle.proverbs.slice(1),
      ],
    };
    const result = validatePuzzle(invalid);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('5-10 words');
  });
});

describe('getPuzzleFromURL', () => {
  it('should extract puzzle parameter from URL string', () => {
    const url = 'https://example.com?puzzle=test123';
    const puzzle = getPuzzleFromURL(url);
    expect(puzzle).toBe('test123');
  });

  it('should return null if no puzzle parameter', () => {
    const url = 'https://example.com';
    const puzzle = getPuzzleFromURL(url);
    expect(puzzle).toBeNull();
  });

  it('should handle URL with multiple parameters', () => {
    const url = 'https://example.com?foo=bar&puzzle=test123&baz=qux';
    const puzzle = getPuzzleFromURL(url);
    expect(puzzle).toBe('test123');
  });
});
