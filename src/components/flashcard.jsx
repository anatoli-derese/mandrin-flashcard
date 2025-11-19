import React from 'react';
import { numberToDiacritic, getToneColor, extractTones } from '../util/pinyin';

const Flashcard = ({ card, showAnswer, onFlip }) => {
  const displayPinyin = numberToDiacritic(card.pinyin);
  const tones = extractTones(card.pinyin);
  const syllables = displayPinyin.split(' ');

  const handleKeyDown = (event) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onFlip();
    }
  };

  return (
    <div
      className={`flashcard ${showAnswer ? 'flashcard--answer' : 'flashcard--question'}`}
      role="button"
      tabIndex={0}
      aria-pressed={showAnswer}
      aria-label={showAnswer ? 'Hide answer' : 'Reveal answer'}
      onClick={onFlip}
      onKeyDown={handleKeyDown}
    >
      {!showAnswer ? (
        <div className="flashcard__face">
          <span className="flashcard__badge">{card.hsk}</span>
          <div className="flashcard__character">{card.hanzi}</div>
          <div className="flashcard__meta">
            <span>{card.english}</span>
          </div>
          <p className="flashcard__hint">Tap or press space to reveal pronunciation</p>
        </div>
      ) : (
        <div className="flashcard__face flashcard__face--answer">
          <span className="flashcard__badge">{card.hsk}</span>
          <div className="flashcard__character">{card.hanzi}</div>
          <div className="flashcard__pinyin">
            {syllables.map((syllable, index) => (
              <span key={syllable + index} className={getToneColor(tones[index])}>
                {syllable}
              </span>
            ))}
          </div>
          <div className="flashcard__english">{card.english}</div>
          <div className="flashcard__meta">
            <span>Tap to hide</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Flashcard;