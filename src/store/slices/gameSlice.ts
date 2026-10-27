import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { PlayerData, RoomData } from "@/types/api";

interface GameState {
  currentRoom: RoomData | null;
  currentPlayer: PlayerData | null;
  players: PlayerData[];
  socketId: string | null;
  socketConnected: boolean;
}

const initialState: GameState = {
  currentRoom: null,
  currentPlayer: null,
  players: [],
  socketId: null,
  socketConnected: false,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setSocketId: (state, action: PayloadAction<string | null>) => {
      state.socketId = action.payload;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.socketConnected = action.payload;
    },
    setRoom: (state, action: PayloadAction<RoomData | null>) => {
      state.currentRoom = action.payload;
      if (action.payload) {
        state.players = action.payload.players || [];
        if (action.payload.current_player) {
          state.currentPlayer = action.payload.current_player;
        }
      }
    },
    setCurrentPlayer: (state, action: PayloadAction<PlayerData | null>) => {
      state.currentPlayer = action.payload;
    },
    playerJoined: (state, action: PayloadAction<PlayerData>) => {
      const existingIndex = state.players.findIndex(
        (p) => p.id === action.payload.id,
      );
      if (existingIndex >= 0) {
        state.players[existingIndex] = action.payload;
      } else {
        state.players.push(action.payload);
      }
      if (state.currentRoom) {
        state.currentRoom.players = state.players;
      }
    },
    playerLeft: (state, action: PayloadAction<{ player_id: number }>) => {
      state.players = state.players.filter((p) => p.id !== action.payload.player_id);
      if (state.currentRoom) {
        state.currentRoom.players = state.players;
      }
    },
    setPlayers: (state, action: PayloadAction<PlayerData[]>) => {
      state.players = action.payload;
      if (state.currentRoom) {
        state.currentRoom.players = action.payload;
      }
    },
    clearSession: (state) => {
      state.currentRoom = null;
      state.currentPlayer = null;
      state.players = [];
    },
  },
});

export const {
  setSocketId,
  setSocketConnected,
  setRoom,
  setCurrentPlayer,
  playerJoined,
  playerLeft,
  setPlayers,
  clearSession,
} = gameSlice.actions;

export default gameSlice.reducer;
