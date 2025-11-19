export const initializeCard = () => ({
  ease: 2.5,
  interval: 0,
  nextReviewAt: Date.now(),
  reviews: 0
});

export const updateSRS = (card, grade) => {
  // SM-2 lite implementation
  const newCard = { ...card, reviews: card.reviews + 1 };
  
  if (grade < 2) { // Again
    newCard.ease = Math.max(1.3, card.ease - 0.2);
    newCard.interval = 1;
  } else { // Good/Easy
    newCard.ease = grade === 2 ? card.ease : card.ease + 0.1;
    newCard.interval = card.interval === 0 ? 1 : 
                      card.interval === 1 ? 3 : 
                      Math.round(card.interval * newCard.ease);
  }
  
  newCard.nextReviewAt = Date.now() + newCard.interval * 24 * 60 * 60 * 1000;
  return newCard;
};

export const getNextCard = (cards) => {
  const dueCards = cards.filter(card => card.nextReviewAt <= Date.now());
  return dueCards.length > 0 ? dueCards[0] : null;
};