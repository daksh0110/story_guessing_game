import {
  DRAW_SECONDS_BY_DIFFICULTY,
  ROOM_CODE_LENGTH,
  ROOM_RETENTION_MS,
  ROUND_GRACE_MS,
  SCENE_CARDS,
} from "@/constants/game";
import type { Stroke } from "@/types/drawing";
import type { Player, Room, RoomSettings, Team } from "@/types/game";
import { getStartBlocker } from "@/utils/lobbyRules";
import { readStoredJson, writeStoredJson } from "@/utils/storage";
import { normalizeRoomCode } from "@/utils/validation";
import { getCurrentPlayerId, setCurrentPlayerId } from "@/services/identity";
import { clearDrawingLog } from "@/services/drawingChannel";
import type { RoomData, PlayerData } from "@/types/api";

export { getCurrentPlayerId, setCurrentPlayerId };

/**
 * Frontend stand-in for the game server. Rooms live in localStorage, so
 * lobbies sync across browser tabs on the same machine. Components only use
 * these exports, so swapping in Socket.IO later means changing this file alone.
 */

const ROOMS_STORAGE_KEY = "storyframes:rooms";
const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type RoomMap = Record<string, Room>;
type Subscriber = () => void;

export class RoomServiceError extends Error {}

const subscribers = new Set<Subscriber>();

function notifySubscribers() {
  subscribers.forEach((callback) => callback());
}

// Other tabs write to localStorage; this keeps every open lobby up to date.
window.addEventListener("storage", (event) => {
  if (event.key === ROOMS_STORAGE_KEY) {
    notifySubscribers();
  }
});

function loadRooms(): RoomMap {
  return readStoredJson<RoomMap>(ROOMS_STORAGE_KEY, {});
}

function saveRooms(rooms: RoomMap) {
  writeStoredJson(ROOMS_STORAGE_KEY, rooms);
  notifySubscribers();
}

function pruneStaleRooms(rooms: RoomMap): RoomMap {
  const cutoff = Date.now() - ROOM_RETENTION_MS;

  return Object.fromEntries(
    Object.entries(rooms).filter(([, room]) => room.createdAt >= cutoff),
  );
}

function randomRoomCode(): string {
  return Array.from({ length: ROOM_CODE_LENGTH }, () =>
    ROOM_CODE_CHARS.charAt(Math.floor(Math.random() * ROOM_CODE_CHARS.length)),
  ).join("");
}

function generateRoomCode(rooms: RoomMap): string {
  let code = randomRoomCode();

  while (rooms[code]) {
    code = randomRoomCode();
  }

  return code;
}

function createPlayer(id: string, name: string, team: Team): Player {
  return { id, name, team, ready: false, joinedAt: Date.now() };
}

/** New players join whichever team is smaller. Ties go to the artists. */
function pickTeam(players: Player[]): Team {
  const artistCount = players.filter((p) => p.team === "artists").length;
  const guesserCount = players.length - artistCount;

  return artistCount <= guesserCount ? "artists" : "guessers";
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function requireRoom(rooms: RoomMap, code: string): Room {
  const room = rooms[normalizeRoomCode(code)];

  if (!room) {
    throw new RoomServiceError("No lobby found with that code.");
  }

  return room;
}

function requireCurrentPlayer(room: Room): Player {
  const player = room.players.find((p) => p.id === getCurrentPlayerId());

  if (!player) {
    throw new RoomServiceError("You are not in this lobby.");
  }

  return player;
}

function requireHost(room: Room) {
  if (room.hostId !== getCurrentPlayerId()) {
    throw new RoomServiceError("Only the host can do that.");
  }
}

/** The mutator returns `false` when nothing changed, which skips the save. */
function mutateRoom(code: string, mutate: (room: Room) => boolean | void) {
  const rooms = loadRooms();
  const room = requireRoom(rooms, code);

  if (mutate(room) === false) {
    return;
  }

  saveRooms(rooms);
}

export async function createRoom(
  hostName: string,
  settings: RoomSettings,
): Promise<Room> {
  const rooms = pruneStaleRooms(loadRooms());
  const code = generateRoomCode(rooms);
  const host = createPlayer(getCurrentPlayerId(), hostName, "artists");

  const room: Room = {
    code,
    hostId: host.id,
    status: "lobby",
    settings,
    players: [host],
    scenes: {},
    drawings: {},
    roundEndsAt: null,
    createdAt: Date.now(),
  };

  rooms[code] = room;
  saveRooms(rooms);

  return room;
}

export async function joinRoom(code: string, name: string): Promise<Room> {
  const rooms = loadRooms();
  const room = requireRoom(rooms, code);
  const playerId = getCurrentPlayerId();

  if (room.players.some((p) => p.id === playerId)) {
    return room;
  }

  if (room.status !== "lobby") {
    throw new RoomServiceError("This game has already started.");
  }

  if (room.players.length >= room.settings.maxPlayers) {
    throw new RoomServiceError("This lobby is full.");
  }

  room.players.push(createPlayer(playerId, name, pickTeam(room.players)));
  saveRooms(rooms);

  return room;
}

export function syncRoomFromBackend(
  roomData: RoomData,
  currentPlayer?: PlayerData | null,
): Room {
  const rooms = loadRooms();
  const normalized = normalizeRoomCode(roomData.code);
  const existingRoom = rooms[normalized];

  const hostPlayer =
    roomData.players?.find((p) => p.is_host) || roomData.players?.[0];
  const hostId = hostPlayer ? String(hostPlayer.id) : getCurrentPlayerId();

  const formattedDifficulty =
    roomData.configuration?.difficulty?.toLowerCase() === "easy"
      ? "Easy"
      : roomData.configuration?.difficulty?.toLowerCase() === "hard"
      ? "Hard"
      : "Medium";

  const players: Player[] = (roomData.players || []).map((p, idx) => {
    const pId = String(p.id);
    const existingP = existingRoom?.players.find((ep) => ep.id === pId);
    return {
      id: pId,
      name: p.name,
      team: existingP?.team ?? (idx % 2 === 0 ? "artists" : "guessers"),
      ready: existingP?.ready ?? false,
      joinedAt: p.created_at ? Date.parse(p.created_at) : Date.now(),
    };
  });

  const room: Room = {
    code: normalized,
    hostId,
    status: existingRoom?.status ?? "lobby",
    settings: {
      category: (roomData.configuration?.category as any) ?? "Comedy",
      difficulty: formattedDifficulty as any,
      maxPlayers: roomData.configuration?.max_players ?? 8,
    },
    players,
    scenes: existingRoom?.scenes ?? {},
    drawings: existingRoom?.drawings ?? {},
    roundEndsAt: existingRoom?.roundEndsAt ?? null,
    createdAt: existingRoom?.createdAt ?? Date.now(),
  };

  const hasChanged =
    !existingRoom ||
    existingRoom.players.length !== players.length ||
    JSON.stringify(existingRoom.players.map((p) => p.id)) !==
      JSON.stringify(players.map((p) => p.id));

  if (hasChanged) {
    rooms[normalized] = room;
    saveRooms(rooms);
  } else {
    rooms[normalized] = room;
  }

  if (currentPlayer) {
    setCurrentPlayerId(currentPlayer.id);
  }

  return room;
}

export async function refreshRoomFromBackend(code: string): Promise<Room | null> {
  const normalized = normalizeRoomCode(code);
  try {
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";
    const res = await fetch(
      `${backendUrl}/rooms/${encodeURIComponent(normalized)}`,
    );
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return syncRoomFromBackend(json.data);
      }
    }
  } catch (err) {
    console.warn("Could not refresh room from backend:", err);
  }

  return null;
}

export async function getRoom(code: string): Promise<Room | null> {
  const normalized = normalizeRoomCode(code);
  const rooms = loadRooms();
  if (rooms[normalized]) {
    return rooms[normalized];
  }

  return refreshRoomFromBackend(code);
}

/** Calls `callback` whenever any room changes. Returns an unsubscribe function. */
export function subscribeToRooms(callback: Subscriber): () => void {
  subscribers.add(callback);

  return () => {
    subscribers.delete(callback);
  };
}

export async function setReady(code: string): Promise<void> {
  mutateRoom(code, (room) => {
    const player = requireCurrentPlayer(room);
    player.ready = !player.ready;
  });
}

export async function setTeam(code: string, team: Team): Promise<void> {
  mutateRoom(code, (room) => {
    if (room.status !== "lobby") {
      throw new RoomServiceError("Teams are locked while a round is running.");
    }

    requireCurrentPlayer(room).team = team;
  });
}

export async function startGame(code: string): Promise<void> {
  mutateRoom(code, (room) => {
    requireHost(room);

    if (room.status !== "lobby") {
      throw new RoomServiceError("The game has already started.");
    }

    const blocker = getStartBlocker(room);

    if (blocker) {
      throw new RoomServiceError(blocker);
    }

    const artists = room.players.filter((p) => p.team === "artists");
    const cards = shuffle(SCENE_CARDS);

    room.scenes = Object.fromEntries(
      artists.map((artist, index) => [artist.id, cards[index % cards.length]]),
    );
    room.drawings = {};
    room.status = "drawing";
    room.roundEndsAt =
      Date.now() + DRAW_SECONDS_BY_DIFFICULTY[room.settings.difficulty] * 1000;

    clearDrawingLog(room.code);
  });
}

export async function submitDrawing(code: string, strokes: Stroke[]): Promise<void> {
  mutateRoom(code, (room) => {
    if (room.status !== "drawing" || room.roundEndsAt === null) {
      throw new RoomServiceError("The drawing phase is over.");
    }

    if (Date.now() > room.roundEndsAt + ROUND_GRACE_MS) {
      throw new RoomServiceError("Time is up.");
    }

    const player = requireCurrentPlayer(room);

    if (player.team !== "artists") {
      throw new RoomServiceError("Only artists can draw.");
    }

    if (room.drawings[player.id] !== undefined) {
      return false;
    }

    room.drawings[player.id] = strokes;
  });
}

/**
 * Moves the round to the gallery once every artist has submitted, or once the
 * timer and grace period have run out. Any client may call it; extra calls are no-ops.
 */
export async function finishRound(code: string): Promise<void> {
  mutateRoom(code, (room) => {
    if (room.status !== "drawing" || room.roundEndsAt === null) {
      return false;
    }

    const artistIds = room.players
      .filter((p) => p.team === "artists")
      .map((p) => p.id);
    const allSubmitted = artistIds.every((id) => room.drawings[id] !== undefined);
    const graceOver = Date.now() >= room.roundEndsAt + ROUND_GRACE_MS;

    if (!allSubmitted && !graceOver) {
      return false;
    }

    room.status = "gallery";
    room.roundEndsAt = null;
  });
}

/** Host sends everyone back to the lobby for another round. */
export async function resetLobby(code: string): Promise<void> {
  mutateRoom(code, (room) => {
    requireHost(room);

    if (room.status !== "gallery") {
      return false;
    }

    room.status = "lobby";
    room.scenes = {};
    room.drawings = {};
    room.roundEndsAt = null;
    room.players.forEach((player) => {
      player.ready = false;
    });
  });
}

export async function leaveRoom(code: string): Promise<void> {
  const rooms = loadRooms();
  const room = rooms[normalizeRoomCode(code)];

  if (!room) {
    return;
  }

  const playerId = getCurrentPlayerId();
  room.players = room.players.filter((p) => p.id !== playerId);

  if (room.players.length === 0) {
    delete rooms[room.code];
  } else if (room.hostId === playerId) {
    room.hostId = room.players[0].id;
  }

  saveRooms(rooms);
}
