import type { Category, Difficulty } from "@/types/game";

export const CATEGORIES: readonly Category[] = [
  "Comedy",
  "Fantasy",
  "Family Friendly",
  "Adventure",
  "Sci-Fi",
  "Mystery",
  "Animals",
  "School",
  "Office",
  "Random Chaos",
];

export const DIFFICULTIES: readonly Difficulty[] = ["Easy", "Medium", "Hard"];

export const DRAW_SECONDS_BY_DIFFICULTY: Record<Difficulty, number> = {
  Easy: 90,
  Medium: 75,
  Hard: 60,
};

export const MAX_PLAYER_OPTIONS: readonly number[] = [4, 6, 8];

export const MIN_PLAYERS_TO_START = 4;
export const ROOM_CODE_LENGTH = 4;
export const ROOM_RETENTION_MS = 24 * 60 * 60 * 1000;
/** Extra time after the timer ends so late artist submissions still land. */
export const ROUND_GRACE_MS = 2000;

export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 16;

/** Placeholder scene cards until the AI service provides real ones. */
export const SCENE_CARDS: readonly string[] = [
  "Draw a wizard casting a magical spell.",
  "Draw a king eating at a royal dinner.",
  "Draw magic going out of control.",
  "Draw a confused chicken wearing a crown.",
  "Draw a pirate carrying something valuable.",
  "Draw a dolphin waiting in the ocean.",
  "Draw someone running away.",
  "Draw a giant birthday cake exploding.",
  "Draw a knight sword-fighting a much smaller opponent while looking terrified.",
  "Draw a dragon sneezing fire onto a birthday cake.",
];
