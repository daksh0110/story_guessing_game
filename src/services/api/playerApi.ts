import { apiSlice } from "./apiSlice";
import type {
  ApiResponse,
  AssociateSocketRequest,
  CreatePlayerRequest,
  PlayerData,
} from "@/types/api";

export const playerApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPlayer: builder.mutation<ApiResponse<PlayerData>, CreatePlayerRequest>({
      query: (body) => ({
        url: "/players/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Player", "Room"],
    }),

    associateSocket: builder.mutation<
      ApiResponse<PlayerData>,
      AssociateSocketRequest
    >({
      query: (body) => ({
        url: "/players/associate-socket",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Player", "Room"],
    }),

    getPlayer: builder.query<ApiResponse<PlayerData>, number>({
      query: (id) => `/players/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Player", id }],
    }),
  }),
});

export const {
  useCreatePlayerMutation,
  useAssociateSocketMutation,
  useGetPlayerQuery,
} = playerApi;
