/**
 * CSV-based puzzle loader utility
 * Loads and parses proverb data from CSV files
 */

import { PuzzleData, Proverb, LanguageCode } from '../types';

// CSV files are served from public directory

interface CSVRow {
  solution: string;
  culture: string;
  meaning: string;
}

/**
 * Parse CSV text into array of objects
 */
const parseCSV = (csvText: string): CSVRow[] => {
  const lines = csvText.trim().split('\n');
  // const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  return lines.slice(1).map(line => {
    // Handle CSV parsing with quoted fields
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim()); // Add the last value
    
    return {
      solution: values[0] || '',
      culture: values[1] || '',
      meaning: values[2] || ''
    };
  }).filter(row => row.solution && row.culture && row.meaning);
};

/**
 * Load all proverbs from a CSV file
 */
const loadProverbsFromCSV = async (language: LanguageCode): Promise<CSVRow[]> => {
  try {
    // In development, we need to import the CSV files directly
    // In production, we can fetch them from the public directory
    if (process.env.NODE_ENV === 'development') {
      // For development, we'll use a hardcoded fallback since the dev server
      // doesn't serve CSV files properly
      const fallbackData = language === 'he' ? getHebrewFallbackData() : getEnglishFallbackData();
      return fallbackData;
    }
    
    // Try multiple URL patterns for production
    const possibleUrls = [
      `${process.env.PUBLIC_URL}/${language}-proverbs.csv`,
      `/${language}-proverbs.csv`
    ].filter(url => url !== '/undefined'); // Remove undefined URLs
    
    let csvText: string = '';
    let lastError: Error | null = null;
    
    for (const url of possibleUrls) {
      try {
        const response = await fetch(url);
        
        if (response.ok) {
          csvText = await response.text();
          break;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        lastError = error as Error;
      }
    }
    
    if (!csvText) {
      throw lastError || new Error('All CSV URLs failed');
    }
    
    const parsed = parseCSV(csvText);
    
    if (parsed.length === 0) {
      throw new Error('No valid proverbs found in CSV');
    }
    
    return parsed;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load ${language} proverbs:`, error);
    throw new Error(`Unable to load ${language} proverbs: ${error}`);
  }
};

/**
 * Generate a random puzzle from CSV data
 */
export const generateRandomPuzzleFromCSV = async (
  language: LanguageCode,
  excludeIndices: number[] = []
): Promise<{ puzzle: PuzzleData; usedIndices: number[] }> => {
  const allProverbs = await loadProverbsFromCSV(language);
  
  if (allProverbs.length === 0) {
    throw new Error(`No proverbs found for language: ${language}`);
  }
  
  // Filter out already used proverbs
  const availableIndices = allProverbs
    .map((_, index) => index)
    .filter(index => !excludeIndices.includes(index));
  
  // If we've used all proverbs, reset and start over
  if (availableIndices.length < 3) {
    return generateRandomPuzzleFromCSV(language, []);
  }
  
  // Randomly select 3-4 proverbs
  const numProverbs = Math.random() < 0.5 ? 3 : 4;
  const selectedIndices: number[] = [];
  const selectedProverbs: Proverb[] = [];
  
  for (let i = 0; i < numProverbs && availableIndices.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableIndices.length);
    const proverbIndex = availableIndices[randomIndex];
    const proverb = allProverbs[proverbIndex];
    
    selectedIndices.push(proverbIndex);
    selectedProverbs.push({
      solution: proverb.solution,
      culture: proverb.culture,
      meaning: proverb.meaning
    });
    
    // Remove this index from available indices
    availableIndices.splice(randomIndex, 1);
  }
  
  const puzzle: PuzzleData = {
    version: "1",
    language,
    proverbs: selectedProverbs
  };
  
  return {
    puzzle,
    usedIndices: [...excludeIndices, ...selectedIndices]
  };
};

/**
 * Get the total number of available proverbs for a language
 */
export const getProverbCount = async (language: LanguageCode): Promise<number> => {
  try {
    const proverbs = await loadProverbsFromCSV(language);
    return proverbs.length;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to get proverb count for ${language}:`, error);
    return 0;
  }
};

/**
 * Check if there are more puzzles available
 */
export const hasMorePuzzles = (usedIndices: number[], totalCount: number): boolean => {
  return usedIndices.length < totalCount - 3; // Need at least 3 proverbs for a puzzle
};

/**
 * Fallback English proverbs for development
 */
const getEnglishFallbackData = (): CSVRow[] => [
  {
    solution: "When elephants fight, it is the grass that suffers",
    culture: "Kenyan",
    meaning: "Ordinary people suffer when the powerful clash"
  },
  {
    solution: "The child who is not embraced by the village will burn it down to feel its warmth",
    culture: "Nigerian", 
    meaning: "Neglect breeds resentment and destruction"
  },
  {
    solution: "Do not call the forest that shelters you a jungle",
    culture: "Congolese",
    meaning: "Respect those who protect and support you"
  },
  {
    solution: "Even the smallest rooster thinks he is king of the yard",
    culture: "Haitian",
    meaning: "People often overestimate their importance"
  },
  {
    solution: "He who learns, teaches",
    culture: "Ethiopian",
    meaning: "Knowledge should be shared, not hoarded"
  },
  {
    solution: "A man who uses force is afraid of reasoning",
    culture: "Ghanaian",
    meaning: "Violence comes from weakness, not strength"
  },
  {
    solution: "Empty bags cannot stand upright",
    culture: "Italian",
    meaning: "Poverty or lack of means makes dignity difficult"
  },
  {
    solution: "He who wants to harvest honey must brave the bees",
    culture: "Russian",
    meaning: "You can't achieve success without facing risk"
  },
  {
    solution: "The tongue has no bones but can break bones",
    culture: "Turkish",
    meaning: "Words can cause great harm"
  },
  {
    solution: "A bird in the hand is worth two in the bush",
    culture: "English",
    meaning: "It's better to have something certain than to risk it for something better"
  }
];

/**
 * Fallback Hebrew proverbs for development
 */
const getHebrewFallbackData = (): CSVRow[] => [
  {
    solution: "המסמר הבולט מקבל את הפטיש",
    culture: "יפנית",
    meaning: "לא טוב להתבלט או לסטות מהקבוצה"
  },
  {
    solution: "האמן, אבל בדוק",
    culture: "רוסית",
    meaning: "חשוב לתת אמון, אך לא בעיניים עצומות"
  },
  {
    solution: "כשאין דגים, גם סרטנים נחשבים לדגים",
    culture: "סינית",
    meaning: "כשהמצב קשה, מסתפקים במה שיש"
  },
  {
    solution: "הביצה מלמדת את התרנגולת",
    culture: "אנגלית",
    meaning: "מי שפחות מנוסה מנסה ללמד את המומחה"
  },
  {
    solution: "אל תשרוף את הגשר שאתה צריך לעבור עליו",
    culture: "אמריקאית",
    meaning: "אל תפגע באנשים שתזדקק להם בעתיד"
  },
  {
    solution: "מי שקובר בור לאחרים, נופל בו בעצמו",
    culture: "גרמנית",
    meaning: "מי שמתכנן רעה לאחרים, נפגע ממנה בעצמו"
  },
  {
    solution: "אל תמכור את העור לפני שהרגת את הדוב",
    culture: "צרפתית",
    meaning: "אל תשמח או תתחייב לפני שהשגת את מבוקשך"
  },
  {
    solution: "כששני פילים נלחמים, הדשא נרמס",
    culture: "אפריקאית",
    meaning: "כשחזקים נאבקים, החלשים הם שסובלים"
  },
  {
    solution: "טיפה אחר טיפה ממלאת את הכד",
    culture: "ערבית",
    meaning: "מאמצים קטנים ומתמשכים מובילים לתוצאות גדולות"
  },
  {
    solution: "דרך ארץ קדמה לתורה",
    culture: "עברית",
    meaning: "נימוסים וכבוד הדדי חשובים יותר מידע"
  }
];