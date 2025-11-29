import { Guide } from '../types';

// The ID from the provided Google Sheet URL
const SPREADSHEET_ID = '1Q7lxOVt9AtUXOqOZrBiqavjQh13lgkDjfdeOaPVZcNE';
// Using the Google Visualization API endpoint for better CSV export reliability
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv`;

export const fetchAndParseGuides = async (): Promise<Guide[]> => {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch spreadsheet: ${response.statusText}`);
    }
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.warn("Error fetching live data, falling back to mock data for demo purposes.", error);
    return getMockGuides();
  }
};

const parseCSV = (csvText: string): Guide[] => {
  const lines = csvText.split('\n');
  const guides: Guide[] = [];
  
  // Basic CSV parser - assumes header is row 0
  // Structure inferred: Title, Description, Link, Category/Tags
  // We skip the header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted CSV fields roughly
    const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
    // Simple split for demo if regex fails or complex CSV needed (using simple split for robustness on simple sheets)
    // A robust regex split for CSV:
    const row = parseCSVLine(line);

    if (row.length >= 2) {
      // Mapping columns based on typical sheet structure. 
      // Adjust indices based on actual sheet columns if known.
      // Assuming: Column A = Title, Column B = Description, Column C = URL, Column D = Category
      guides.push({
        id: `guide-${i}`,
        title: cleanField(row[0] || 'Untitled'),
        description: cleanField(row[1] || 'No description available'),
        url: cleanField(row[2] || '#'),
        category: cleanField(row[3] || 'General'),
        tags: row[4] ? cleanField(row[4]).split(',').map(t => t.trim()) : []
      });
    }
  }
  return guides;
};

const cleanField = (field: string): string => {
  return field.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
};

// Simple parser for CSV lines handling quotes
const parseCSVLine = (text: string): string[] => {
  const result: string[] = [];
  let cur = '';
  let inQuote = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuote) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = false;
        }
      } else {
        cur += char;
      }
    } else {
      if (char === '"') {
        inQuote = true;
      } else if (char === ',') {
        result.push(cur);
        cur = '';
      } else {
        cur += char;
      }
    }
  }
  result.push(cur);
  return result;
};

const getMockGuides = (): Guide[] => [
  {
    id: '1',
    title: 'How to Reset Your Password',
    description: 'A step-by-step guide on recovering and resetting your account password securely.',
    category: 'Account Security',
    url: '#',
    tags: ['password', 'security', 'login']
  },
  {
    id: '2',
    title: 'Setting Up 2FA',
    description: 'Enable two-factor authentication to add an extra layer of security to your profile.',
    category: 'Account Security',
    url: '#',
    tags: ['2fa', 'security', 'mfa']
  },
  {
    id: '3',
    title: 'Understanding Your Billing Invoice',
    description: 'Learn how to read your monthly statement and understand all charges.',
    category: 'Billing',
    url: '#',
    tags: ['invoice', 'money', 'billing']
  },
  {
    id: '4',
    title: 'Integration with Slack',
    description: 'Connect our platform with your Slack workspace for real-time notifications.',
    category: 'Integrations',
    url: '#',
    tags: ['slack', 'api', 'connect']
  },
  {
    id: '5',
    title: 'API Rate Limits Explained',
    description: 'Technical documentation regarding the limitations of our REST API endpoints.',
    category: 'Developer',
    url: '#',
    tags: ['api', 'dev', 'limits']
  }
];
