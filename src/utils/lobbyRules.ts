import { MIN_PLAYERS_TO_START } from "@/constants/game";
import type { Room } from "@/types/game";

/** Returns why the host cannot start the game yet, or null when it can. */
export function getStartBlocker(room: Room): string | null {
  const playerCount = room.players.length;

  if (playerCount < MIN_PLAYERS_TO_START) {
    const missing = MIN_PLAYERS_TO_START - playerCount;
    return `Need ${missing} more player${missing === 1 ? "" : "s"} to start.`;
  }

  const artistCount = room.players.filter((p) => p.team === "artists").length;

  if (artistCount === 0 || artistCount === playerCount) {
    return "Each team needs at least one player.";
  }

  if (room.players.some((p) => !p.ready)) {
    return "Waiting for everyone to be ready.";
  }

  return null;
}
