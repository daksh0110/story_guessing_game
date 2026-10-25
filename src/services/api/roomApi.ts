import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  CreateRoomRequest,
  JoinRoomRequest,
  RoomData,
} from "@/types/api";

export const roomApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createRoom: builder.mutation<ApiResponse<RoomData>, CreateRoomRequest>({
      query: (body) => ({
        url: "/rooms/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Room"],
    }),

    joinRoom: builder.mutation<ApiResponse<RoomData>, JoinRoomRequest>({
      query: (body) => ({
        url: "/rooms/join",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Room"],
    }),

    getRoom: builder.query<ApiResponse<RoomData>, string>({
      query: (code) => `/rooms/${encodeURIComponent(code)}`,
      providesTags: (_result, _error, code) => [{ type: "Room", id: code }],
    }),
  }),
});

export const {
  useCreateRoomMutation,
  useJoinRoomMutation,
  useGetRoomQuery,
} = roomApi;
