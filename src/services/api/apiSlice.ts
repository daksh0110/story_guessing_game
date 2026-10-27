import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const backendUrl =
  import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: backendUrl,
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Room", "Player"],
  endpoints: () => ({}),
});
