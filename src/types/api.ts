export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  data?: {
    errors?: Array<{
      loc?: (string | number)[];
      msg?: string;
      type?: string;
    }>;
  } | null;
}

export interface RoomConfiguration {
  category: string;
  max_players: number;
  difficulty: "easy" | "medium" | "hard" | string;
}

export interface PlayerData {
  id: number;
  name: string;
  room_id: number;
  is_host: boolean;
  connected: boolean;
  sid?: string | null;
  created_at?: string | null;
  disconnected_at?: string | null;
}

export interface RoomData {
  id: number;
  code: string;
  configuration: RoomConfiguration;
  players: PlayerData[];
  current_player?: PlayerData | null;
}

export interface CreateRoomRequest {
  player_name: string;
  configuration: RoomConfiguration;
  socket_id?: string | null;
}

export interface JoinRoomRequest {
  player_name: string;
  code: string;
  socket_id?: string | null;
}

export interface CreatePlayerRequest {
  name: string;
  room_id?: number | null;
  room_code?: string | null;
  socket_id?: string | null;
  is_host?: boolean;
}

export interface AssociateSocketRequest {
  player_id: number;
  socket_id: string;
  room_code?: string | null;
}
