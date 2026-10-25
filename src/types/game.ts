import type { Stroke } from "@/types/drawing";

export type Team = "artists" | "guessers";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type Category =
  | "Comedy"
  | "Fantasy"
  | "Family Friendly"
  | "Adventure"
  | "Sci-Fi"
  | "Mystery"
  | "Animals"
  | "School"
  | "Office"
  | "Random Chaos";

export type RoomStatus = "lobby" | "drawing" | "gallery";

export type RoomSettings = {
  category: Category;
  difficulty: Difficulty;
  maxPlayers: number;
};

export type Player = {
  id: string;
  name: string;
  team: Team;
  ready: boolean;
  joinedAt: number;
};

export type Room = {
  code: string;
  hostId: string;
  status: RoomStatus;
  settings: RoomSettings;
  players: Player[];
  /** playerId -> scene card text. Private in the real game; shown after the round. */
  scenes: Record<string, string>;
  /** playerId -> submitted strokes. */
  drawings: Record<string, Stroke[]>;
  roundEndsAt: number | null;
  createdAt: number;
};
