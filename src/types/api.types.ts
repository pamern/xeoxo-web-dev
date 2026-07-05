export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
};

export function getApiErrorMessage<T>(
  payload: ApiResponse<T>,
  fallback: string,
) {
  if (typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }

  return payload.message ?? fallback;
}

