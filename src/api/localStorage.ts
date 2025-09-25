const HIGH_SCORE_KEY = 'zek_escape_highscore';

export const getHighScore = (): number => {
  const score = localStorage.getItem(HIGH_SCORE_KEY);
  return score ? parseFloat(score) : 0;
};

export const setHighScore = (score: number): void => {
  localStorage.setItem(HIGH_SCORE_KEY, score.toString());
};

export const clearHighScore = (): void => {
  localStorage.removeItem(HIGH_SCORE_KEY);
};