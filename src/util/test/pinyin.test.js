import { comparePinyin, normalizePinyin, numberToDiacritic } from '../pinyin';

test('normalizePinyin removes tones', () => {
  expect(normalizePinyin('nǐ hǎo')).toBe('ni hao');
  expect(normalizePinyin('ni3 hao3')).toBe('ni hao');
});

test('comparePinyin matches equivalent forms', () => {
  expect(comparePinyin('ni3 hao3', 'nǐ hǎo')).toBe(true);
  expect(comparePinyin('nǐ hǎo', 'ni3 hao3')).toBe(true);
  expect(comparePinyin('ni3', 'nǐ')).toBe(true);
});

test('comparePinyin rejects wrong tones', () => {
  expect(comparePinyin('ni2 hao3', 'nǐ hǎo')).toBe(false);
  expect(comparePinyin('ni3', 'nī')).toBe(false);
});