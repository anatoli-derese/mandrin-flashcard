import React, { useState, useEffect, useMemo } from 'react';
import Flashcard from './flashcard';
import PinyinInput from './PinyinInput';
import { initialDeck } from '../data/deck';
import { initializeCard, updateSRS, getNextCard } from '../util/srs';

const buildFreshDeck = () => initialDeck.map(card => ({
  ...card,
  ...initializeCard()
}));

const FlashcardApp = () => {
  const [cards, setCards] = useState([]);
  const [currentCard, setCurrentCard] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mandarin-flashcards');
    if (saved) {
      setCards(JSON.parse(saved));
    } else {
      setCards(buildFreshDeck());
    }
  }, []);

  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem('mandarin-flashcards', JSON.stringify(cards));
    }
  }, [cards]);

  useEffect(() => {
    if (cards.length > 0) {
      const next = getNextCard(cards);
      setCurrentCard(next || cards[0]);
    }
  }, [cards]);

  const dueCount = useMemo(
    () => cards.filter(card => card.nextReviewAt <= Date.now()).length,
    [cards]
  );

  const masteredCount = useMemo(
    () => cards.filter(card => card.interval >= 7).length,
    [cards]
  );

  const totalReviews = useMemo(
    () => cards.reduce((sum, card) => sum + card.reviews, 0),
    [cards]
  );

  const sessionProgress = cards.length
    ? Math.min(100, Math.round(((cards.length - dueCount) / cards.length) * 100))
    : 0;

  const upNext = useMemo(() => {
    if (!currentCard) return [];
    return cards
      .filter(card => card.id !== currentCard.id)
      .sort((a, b) => a.nextReviewAt - b.nextReviewAt)
      .slice(0, 4);
  }, [cards, currentCard]);

  const formatNextReview = (timestamp) => {
    const diff = timestamp - Date.now();
    if (diff <= 0) return 'Due now';
    const minutes = Math.round(diff / 60000);
    if (minutes < 60) return `in ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `in ${hours} hr`;
    const days = Math.round(hours / 24);
    return `in ${days} day${days > 1 ? 's' : ''}`;
  };

  const handleFlip = () => {
    if (isChecking) return;
    setShowAnswer(prev => !prev);
  };

  const handleReveal = () => {
    if (isChecking || showAnswer) return;
    setShowAnswer(true);
  };

  const handleSkip = () => {
    if (!currentCard || cards.length < 2) return;
    const remaining = cards.filter(card => card.id !== currentCard.id);
    const next = getNextCard(remaining) || remaining[0];
    if (next) {
      setCurrentCard(next);
      setShowAnswer(false);
    }
  };

  const handleAnswer = (isCorrect) => {
    setIsChecking(true);
    const grade = isCorrect ? 2 : 0;

    setCards(prev => prev.map(card =>
      card.id === currentCard.id ? updateSRS(card, grade) : card
    ));

    setTimeout(() => {
      setIsChecking(false);
      setShowAnswer(false);
    }, 1500);
  };

  const handleGrade = (grade) => {
    setCards(prev => prev.map(card =>
      card.id === currentCard.id ? updateSRS(card, grade) : card
    ));
    setShowAnswer(false);
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Reset progress? This will clear your review history and restore the starter deck.'
    );
    if (!confirmed) return;

    const freshDeck = buildFreshDeck();
    localStorage.setItem('mandarin-flashcards', JSON.stringify(freshDeck));
    setCards(freshDeck);
    setCurrentCard(freshDeck[0]);
    setShowAnswer(false);
  };

  if (!currentCard) {
    return (
      <div className="app-shell">
        <div className="panel loading-state">Preparing your deck…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="panel hero-panel">
        <div className="hero-grid">
          <div className="header-copy">
            <p className="eyebrow">Daily trainer</p>
            <h1>Mandarin flashcards</h1>
            <p className="subhead">
              Stay in the flow with a clear reading surface, live metrics,
              and glanceable next steps. Grade as soon as you reveal the
              pronunciation to keep SRS timing honest.
            </p>
            <div className="session-progress" aria-live="polite">
              <div className="progress-track">
                <div
                  className="progress-value"
                  style={{ '--progress': `${sessionProgress}%` }}
                />
              </div>
              <div className="progress-meta">
                <span>{sessionProgress}% of deck cleared</span>
                <span>{cards.length - dueCount} / {cards.length} reviewed</span>
              </div>
            </div>
            <div className="header-actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleReveal}
                disabled={showAnswer || isChecking}
              >
                Reveal answer
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleSkip}
                disabled={cards.length < 2}
              >
                Skip card
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={handleReset}
              >
                Reset progress
              </button>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <p>Due now</p>
              <strong>{dueCount}</strong>
              <span>cards waiting</span>
            </div>
            <div className="stat-card">
              <p>Mastered</p>
              <strong>{masteredCount}</strong>
              <span>≥ 1 week interval</span>
            </div>
            <div className="stat-card">
              <p>Reviews logged</p>
              <strong>{totalReviews}</strong>
              <span>lifetime</span>
            </div>
          </div>
        </div>
      </header>

      <main className="workspace-grid">
        <section className="panel focus-panel">
          <div className="card-panel__header">
            <div>
              <p className="eyebrow">Active card</p>
              <h2>{currentCard.english}</h2>
            </div>
            <div className="card-panel__meta">
              <span>{formatNextReview(currentCard.nextReviewAt)}</span>
              <span>{currentCard.reviews} reviews</span>
            </div>
          </div>

          <Flashcard
            card={currentCard}
            showAnswer={showAnswer}
            onFlip={handleFlip}
          />

          <div className="card-insights">
            <div className="insight">
              <span className="label">HSK level</span>
              <strong>{currentCard.hsk}</strong>
            </div>
            <div className="insight">
              <span className="label">Ease factor</span>
              <strong>{currentCard.ease?.toFixed(2) || '2.50'}</strong>
            </div>
            <div className="insight">
              <span className="label">Interval</span>
              <strong>{currentCard.interval ? `${currentCard.interval} day${currentCard.interval > 1 ? 's' : ''}` : 'Learning'}</strong>
            </div>
            <div className="insight">
              <span className="label">Due</span>
              <strong>{formatNextReview(currentCard.nextReviewAt)}</strong>
            </div>
          </div>
        </section>

        <section className="panel response-panel">
          <div className="response-panel__header">
            <div>
              <p className="eyebrow">Answer & grade</p>
              <h3>Type the pinyin with tone numbers</h3>
            </div>
            <span className="helper">Example: <strong>ni3 hao3</strong></span>
          </div>

          {showAnswer ? (
            <>
              <PinyinInput
                targetPinyin={currentCard.pinyin}
                onAnswer={handleAnswer}
                disabled={isChecking}
              />

              <div className="grade-controls">
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => handleGrade(0)}
                  disabled={isChecking}
                >
                  Again
                  <span className="btn-hint">shows immediately</span>
                </button>
                <button
                  type="button"
                  className="btn btn--success"
                  onClick={() => handleGrade(2)}
                  disabled={isChecking}
                >
                  Good
                  <span className="btn-hint">on schedule</span>
                </button>
                <button
                  type="button"
                  className="btn btn--info"
                  onClick={() => handleGrade(3)}
                  disabled={isChecking}
                >
                  Easy
                  <span className="btn-hint">push back</span>
                </button>
              </div>
            </>
          ) : (
            <div className="placeholder">
              <h4>Ready when you are</h4>
              <p>Flip the card first to reveal the prompt and unlock the answer area.</p>
              <ul>
                <li>Spacebar or tap flips the card</li>
                <li>Use “Reveal answer” if clicking feels awkward</li>
                <li>Skip cards anytime—you can always revisit them later</li>
              </ul>
            </div>
          )}
        </section>

        <section className="panel queue-panel">
          <div className="response-panel__header">
            <div>
              <p className="eyebrow">Up next</p>
              <h3>Preview the queue</h3>
            </div>
            <span className="helper">{upNext.length ? 'Due soon' : 'All caught up'}</span>
          </div>
          {upNext.length ? (
            <ul className="queue-list">
              {upNext.map(card => (
                <li key={card.id} className="queue-item">
                  <div className="queue-word">
                    <span className="hanzi">{card.hanzi}</span>
                    <span className="pinyin">{card.pinyin}</span>
                  </div>
                  <div className="queue-meta">
                    <span className="badge">{card.hsk}</span>
                    <span className="time">{formatNextReview(card.nextReviewAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="placeholder">
              <h4>No cards waiting</h4>
              <p>Keep reviewing to unlock more material. Fresh cards will appear here when they are due.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default FlashcardApp;