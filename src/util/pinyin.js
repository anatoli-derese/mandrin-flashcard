// Tone number to diacritic mapping
const toneMappings = {
  'a': ['a', 'ā', 'á', 'ǎ', 'à'],
  'e': ['e', 'ē', 'é', 'ě', 'è'],
  'i': ['i', 'ī', 'í', 'ǐ', 'ì'],
  'o': ['o', 'ō', 'ó', 'ǒ', 'ò'],
  'u': ['u', 'ū', 'ú', 'ǔ', 'ù'],
  'v': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
  'ü': ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ']
};

// Reverse look-up from diacritic to tone number
const diacriticToneMap = Object.entries(toneMappings).reduce((acc, [, tones]) => {
  tones.forEach((char, index) => {
    if (index === 0) return; // skip neutral
    acc[char] = index;
  });
  return acc;
}, {});

// Convert tone number to diacritic
export const numberToDiacritic = (pinyin) => {
  return pinyin.split(' ').map(syllable => {
    const match = syllable.match(/^([a-zü]+)([1-5])$/i);
    if (!match) return syllable;
    
    let [_, letters, toneNum] = match;
    const tone = parseInt(toneNum);
    
    // Find the vowel to place the diacritic
    for (let i = letters.length - 1; i >= 0; i--) {
      const char = letters[i].toLowerCase();
      if (toneMappings[char]) {
        const newChar = toneMappings[char][tone];
        const result = letters.slice(0, i) + newChar + letters.slice(i + 1);
        return result;
      }
    }
    
    return letters;
  }).join(' ');
};

// Normalize pinyin for comparison (remove tones)
export const normalizePinyin = (pinyin) => {
  return pinyin
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[1-5]/g, '') // remove tone numbers
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim();
};

// Extract tone numbers from pinyin
export const extractTones = (pinyin) => {
  if (!pinyin) return [];

  const syllables = pinyin.trim().split(/\s+/).filter(Boolean);

  return syllables.map(syllable => {
    // Prefer explicit tone numbers when provided
    const match = syllable.match(/(?:[a-zü]*)([1-5])$/i);
    if (match) return parseInt(match[1], 10);

    // Fallback to detecting diacritic tone marks
    for (const char of syllable) {
      const tone = diacriticToneMap[char.toLowerCase()];
      if (tone) return tone;
    }

    return 5; // neutral tone
  });
};

// Compare pinyin with tone awareness
export const comparePinyin = (input, target) => {
  const normalizedInput = normalizePinyin(input);
  const normalizedTarget = normalizePinyin(target);
  
  if (normalizedInput !== normalizedTarget) return false;
  
  const inputTones = extractTones(input);
  const targetTones = extractTones(target);
  
  if (inputTones.length !== targetTones.length) return false;
  
  return inputTones.every((tone, i) => tone === targetTones[i]);
};

// Get tone color
export const getToneColor = (tone) => {
  switch(tone) {
    case 1: return 'tone tone-1';
    case 2: return 'tone tone-2';
    case 3: return 'tone tone-3';
    case 4: return 'tone tone-4';
    default: return 'tone tone-neutral';
  }
};