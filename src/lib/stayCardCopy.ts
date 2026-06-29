import { Stay } from '../types';

function cleanCardCopy(text: string | null | undefined) {
  if (!text) return '';
  return text
    .replace(/^(The Draw:|The Flex:)\s*/i, '')
    .replace(/\bBuilt for[^.?!]*[.?!]?\s*$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanSupportCopy(text: string | null | undefined) {
  if (!text) return '';

  return text
    .replace(/^(The Draw:|The Flex:)\s*/i, '')
    .replace(/^you (are|want|prefer|value|appreciate|thrive on|seek|love)\s+/i, '')
    .replace(/^ideal for\s+/i, '')
    .replace(/^perfect for\s+/i, '')
    .replace(/^a masterful choice for\s+/i, '')
    .replace(/^an? (sophisticated|masterful|ideal|perfect) choice for\s+/i, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^[a-z]/, (char) => char.toUpperCase());
}

function trimToSentence(text: string) {
  if (!text) return '';
  const normalized = text.trim();
  const abbreviations = new Set([
    'st.',
    'mr.',
    'mrs.',
    'ms.',
    'dr.',
    'jr.',
    'sr.',
    'mt.',
  ]);

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    if (!['.', '!', '?'].includes(char)) continue;

    const slice = normalized.slice(0, index + 1);
    const lastToken = slice.split(/\s+/).at(-1)?.toLowerCase() || '';
    if (abbreviations.has(lastToken)) continue;

    const nextChar = normalized[index + 1];
    if (!nextChar || /\s/.test(nextChar)) {
      return slice.trim();
    }
  }

  return normalized;
}

function normalizeCopyEnd(text: string) {
  if (!text) return '';
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function trimSupportSentence(text: string, maxLength: number) {
  if (!text || maxLength < 24) return '';
  if (text.length <= maxLength) return text;

  const weakEndingWords = new Set([
    'a', 'an', 'and', 'as', 'at', 'by', 'for', 'from', 'in', 'into', 'its', 'of', 'on', 'or', 'the', 'their', 'with',
  ]);

  const trimmed = text.slice(0, maxLength);
  const breakpoints = ['. ', ', ', '; ', ' ']
    .map((separator) => trimmed.lastIndexOf(separator))
    .filter((index) => index > maxLength * 0.6)
    .sort((a, b) => b - a);

  for (const breakpoint of breakpoints) {
    const candidate = trimmed.slice(0, breakpoint).trim().replace(/[.,;:\s]+$/, '');
    const words = candidate.split(/\s+/).filter(Boolean);
    const lastWord = words.at(-1)?.toLowerCase() || '';

    if (words.length >= 5 && !weakEndingWords.has(lastWord)) {
      return `${candidate}.`;
    }
  }

  return '';
}

function dedupeCopySegments(parts: string[]) {
  const seen = new Set<string>();
  return parts.filter((part) => {
    const key = part.toLowerCase();
    if (!part || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getStayCardBodyCopy(stay: Stay) {
  if (stay.cardTeaser) return stay.cardTeaser.trim();
  if (stay.description) return stay.description.trim();
  return '';
}
