import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PuzzleBuilder } from './PuzzleBuilder';

describe('PuzzleBuilder', () => {
  beforeEach(() => {
    // Mock window.location for URL generation
    delete (window as any).location;
    window.location = {
      origin: 'http://localhost',
      pathname: '/proverb-pile',
    } as any;

    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(() => Promise.resolve()),
      },
    });
  });

  it('renders the puzzle builder form', () => {
    render(<PuzzleBuilder />);

    expect(screen.getByText('Puzzle Builder')).toBeInTheDocument();
    expect(screen.getByText('Language')).toBeInTheDocument();
  });

  it('displays language selector', () => {
    render(<PuzzleBuilder />);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText(/Hebrew/)).toBeInTheDocument();
  });

  it('allows changing language', () => {
    const { container } = render(<PuzzleBuilder />);

    const hebrewButton = screen.getByText(/Hebrew/);
    fireEvent.click(hebrewButton);

    // Hebrew button should now have 'selected' class
    expect(hebrewButton.className).toContain('selected');
  });

  it('renders three proverb input sections by default', () => {
    render(<PuzzleBuilder />);

    expect(screen.getByText('Proverb 1')).toBeInTheDocument();
    expect(screen.getByText('Proverb 2')).toBeInTheDocument();
    expect(screen.getByText('Proverb 3')).toBeInTheDocument();
  });

  it('allows adding a fourth proverb', () => {
    render(<PuzzleBuilder />);

    const addButton = screen.getByText('+ Add Another Proverb (Optional)');
    fireEvent.click(addButton);

    expect(screen.getByText('Proverb 4')).toBeInTheDocument();
    expect(screen.queryByText('+ Add Another Proverb (Optional)')).not.toBeInTheDocument();
  });

  it('allows removing the fourth proverb', () => {
    render(<PuzzleBuilder />);

    const addButton = screen.getByText('+ Add Another Proverb (Optional)');
    fireEvent.click(addButton);

    expect(screen.getByText('Proverb 4')).toBeInTheDocument();

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(screen.queryByText('Proverb 4')).not.toBeInTheDocument();
    expect(screen.getByText('+ Add Another Proverb (Optional)')).toBeInTheDocument();
  });

  it('has input fields for solution, culture, and meaning', () => {
    render(<PuzzleBuilder />);

    // Each proverb should have these fields (looking for the label text)
    expect(screen.getAllByText(/Proverb Text/i).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/Culture\/Origin/i).length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByText(/Meaning/i).length).toBeGreaterThanOrEqual(3);
  });

  it('allows entering proverb data', async () => {
    render(<PuzzleBuilder />);

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    const cultureInputs = screen.getAllByPlaceholderText(/English, Chinese/i);
    const meaningInputs = screen.getAllByPlaceholderText(/What does/i);

    await userEvent.type(solutionInputs[0], 'A bird in hand');
    await userEvent.type(cultureInputs[0], 'English');
    await userEvent.type(meaningInputs[0], 'Something you have is better');

    expect(solutionInputs[0]).toHaveValue('A bird in hand');
    expect(cultureInputs[0]).toHaveValue('English');
    expect(meaningInputs[0]).toHaveValue('Something you have is better');
  });

  it('shows error when generating with empty fields', async () => {
    render(<PuzzleBuilder />);

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/All proverbs must have/i)).toBeInTheDocument();
    });
  });

  it('shows error when solution has too few words', async () => {
    // Using userEvent v13 API (no setup needed)
    render(<PuzzleBuilder />);

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    const cultureInputs = screen.getAllByPlaceholderText(/English, Chinese/i);
    const meaningInputs = screen.getAllByPlaceholderText(/What does/i);

    // Enter data for all three proverbs but with short solutions
    for (let i = 0; i < 3; i++) {
      await userEvent.type(solutionInputs[i], 'Too short');
      await userEvent.type(cultureInputs[i], 'Test');
      await userEvent.type(meaningInputs[i], 'Test meaning');
    }

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      const errorText = screen.getByText(/must contain between 5 and 10 words/i);
      expect(errorText).toBeInTheDocument();
    });
  });

  it('generates valid puzzle URL with correct data', async () => {
    // Using userEvent v13 API (no setup needed)
    render(<PuzzleBuilder />);

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    const cultureInputs = screen.getAllByPlaceholderText(/English, Chinese/i);
    const meaningInputs = screen.getAllByPlaceholderText(/What does/i);

    // Enter valid data for all three proverbs
    const proverbs = [
      'A bird in the hand is worth two',
      'The early bird catches the worm today',
      'Better late than never in the morning',
    ];

    for (let i = 0; i < 3; i++) {
      await userEvent.type(solutionInputs[i], proverbs[i]);
      await userEvent.type(cultureInputs[i], 'English');
      await userEvent.type(meaningInputs[i], 'Test meaning here');
    }

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Generated Puzzle URL:')).toBeInTheDocument();
    });

    // Should display a URL with puzzle parameter
    const urlDisplay = screen.getByText(/http:\/\/localhost\/proverb-pile\?puzzle=/);
    expect(urlDisplay).toBeInTheDocument();
  });

  it('shows copy button after URL generation', async () => {
    // Using userEvent v13 API (no setup needed)
    render(<PuzzleBuilder />);

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    const cultureInputs = screen.getAllByPlaceholderText(/English, Chinese/i);
    const meaningInputs = screen.getAllByPlaceholderText(/What does/i);

    for (let i = 0; i < 3; i++) {
      await userEvent.type(solutionInputs[i], 'This is a valid proverb with enough words');
      await userEvent.type(cultureInputs[i], 'Test Culture');
      await userEvent.type(meaningInputs[i], 'This is the meaning of the proverb');
    }

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
    });
  });

  it('copies URL to clipboard when copy button is clicked', async () => {
    // Using userEvent v13 API (no setup needed)
    const writeTextMock = jest.fn(() => Promise.resolve());
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock },
    });

    render(<PuzzleBuilder />);

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    const cultureInputs = screen.getAllByPlaceholderText(/English, Chinese/i);
    const meaningInputs = screen.getAllByPlaceholderText(/What does/i);

    for (let i = 0; i < 3; i++) {
      await userEvent.type(solutionInputs[i], 'This is a valid proverb with enough words');
      await userEvent.type(cultureInputs[i], 'Test Culture');
      await userEvent.type(meaningInputs[i], 'This is the meaning of the proverb');
    }

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
    });

    const copyButton = screen.getByText('Copy to Clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining('puzzle='));
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('resets copy button text after delay', async () => {
    jest.useFakeTimers();
    // Using userEvent v13 API (no setup needed)

    render(<PuzzleBuilder />);

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    const cultureInputs = screen.getAllByPlaceholderText(/English, Chinese/i);
    const meaningInputs = screen.getAllByPlaceholderText(/What does/i);

    for (let i = 0; i < 3; i++) {
      await userEvent.type(solutionInputs[i], 'This is a valid proverb with enough words');
      await userEvent.type(cultureInputs[i], 'Test Culture');
      await userEvent.type(meaningInputs[i], 'This is the meaning of the proverb');
    }

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
    });

    const copyButton = screen.getByText('Copy to Clipboard');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    // Fast-forward time
    jest.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByText('Copy to Clipboard')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('validates word count (5-10 words)', async () => {
    // Using userEvent v13 API (no setup needed)
    render(<PuzzleBuilder />);

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    const cultureInputs = screen.getAllByPlaceholderText(/English, Chinese/i);
    const meaningInputs = screen.getAllByPlaceholderText(/What does/i);

    // Too many words (11 words)
    await userEvent.type(solutionInputs[0], 'One two three four five six seven eight nine ten eleven');
    await userEvent.type(cultureInputs[0], 'Test');
    await userEvent.type(meaningInputs[0], 'Test');

    // Valid
    await userEvent.type(solutionInputs[1], 'One two three four five six');
    await userEvent.type(cultureInputs[1], 'Test');
    await userEvent.type(meaningInputs[1], 'Test');

    // Valid
    await userEvent.type(solutionInputs[2], 'One two three four five');
    await userEvent.type(cultureInputs[2], 'Test');
    await userEvent.type(meaningInputs[2], 'Test');

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/must contain between 5 and 10 words/i)).toBeInTheDocument();
    });
  });

  it('clears error when user starts typing', async () => {
    // Using userEvent v13 API (no setup needed)
    render(<PuzzleBuilder />);

    const generateButton = screen.getByText('Generate Puzzle URL');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText(/All proverbs must have/i)).toBeInTheDocument();
    });

    const solutionInputs = screen.getAllByPlaceholderText(/Don't bite/i);
    await userEvent.type(solutionInputs[0], 'A');

    await waitFor(() => {
      expect(screen.queryByText(/All proverbs must have/i)).not.toBeInTheDocument();
    });
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<PuzzleBuilder />);

    // Component uses CSS modules, check for container and form
    expect(container.querySelector('[class*="container"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="form"]')).toBeInTheDocument();
  });

  it('handles Hebrew language selection', () => {
    render(<PuzzleBuilder />);

    const hebrewButton = screen.getByText(/Hebrew/);
    fireEvent.click(hebrewButton);

    expect(hebrewButton.className).toContain('selected');
  });
});
