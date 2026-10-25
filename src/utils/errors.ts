import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ApiErrorResponse } from "@/types/api";

export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  );
}

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | Error | unknown,
): string {
  if (!error) {
    return "An unknown error occurred.";
  }

  // Handle RTK Query FetchBaseQueryError
  if (isFetchBaseQueryError(error)) {
    if (isApiErrorResponse(error.data)) {
      if (
        error.data.data &&
        typeof error.data.data === "object" &&
        "errors" in error.data.data &&
        Array.isArray(error.data.data.errors) &&
        error.data.data.errors.length > 0
      ) {
        const firstErr = error.data.data.errors[0];
        if (firstErr && typeof firstErr.msg === "string") {
          return firstErr.msg;
        }
      }
      return error.data.message;
    }

    if (typeof error.data === "string") {
      return error.data;
    }

    if (typeof error.status === "number") {
      return `Server error (${error.status}). Please try again.`;
    }

    return "Network error. Please check your connection.";
  }

  // Standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // SerializedError from Redux Toolkit
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return "Something went wrong. Please try again.";
}
