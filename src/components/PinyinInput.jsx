import React, { useRef, useState } from 'react';
import { comparePinyin, numberToDiacritic } from '../util/pinyin';

const toneHelpers = [
  { label: 'First', tones: ['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ'] },
  { label: 'Second', tones: ['á', 'é', 'í', 'ó', 'ú', 'ǘ'] },
  { label: 'Third', tones: ['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ'] },
  { label: 'Fourth', tones: ['à', 'è', 'ì', 'ò', 'ù', 'ǜ'] }
];

const PinyinInput = ({ targetPinyin, onAnswer, disabled }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);

  const preview = input.trim()
    ? numberToDiacritic(input.trim().replace(/\s+/g, ' '))
    : '—';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (disabled) return;

    const isCorrect = comparePinyin(input, targetPinyin);
    setResult(isCorrect ? 'correct' : 'incorrect');
    setTimeout(() => {
      onAnswer(isCorrect);
      setInput('');
      setResult(null);
    }, 1000);
  };

  const handleHelperClick = (symbol) => {
    setInput(prev => `${prev}${symbol}`);
    inputRef.current?.focus();
  };

  return (
    <div className="pinyin-block">
      <form className="pinyin-form" onSubmit={handleSubmit}>
        <label htmlFor="pinyin-input">Your answer</label>
        <div className="input-row">
          <input
            id="pinyin-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type pinyin with tone numbers (e.g. ni3 hao3)"
            disabled={disabled}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={disabled || !input.trim()}
          >
            Check
          </button>
        </div>
        <div className="preview-row">
          <span className="label">Tone preview</span>
          <span className="preview-value">{preview}</span>
        </div>
      </form>

      <div className="tone-help">
        <div className="tone-help__copy">
          <strong>Need accents?</strong>
          <span>Tap to insert tone marks without changing your keyboard.</span>
        </div>
        <div className="tone-help__grid">
          {toneHelpers.map(helper => (
            <div key={helper.label} className="tone-group">
              <p>{helper.label}</p>
              <div className="tone-buttons">
                {helper.tones.map(symbol => (
                  <button
                    key={symbol}
                    type="button"
                    className="tone-chip"
                    onClick={() => handleHelperClick(symbol)}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {result && (
        <div
          className={`result-banner ${
            result === 'correct' ? 'is-correct' : 'is-wrong'
          }`}
        >
          {result === 'correct' ? 'Great pronunciation!' : 'Close—check your tones and spacing.'}
        </div>
      )}
    </div>
  );
};

export default PinyinInput;