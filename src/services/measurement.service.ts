import type { MeasurementProfileDto, SaveMeasurementProfileValues } from "@/types/measurement.types";
import type { ApiResponse } from "@/lib/api-response";

export async function getCurrentProfile(): Promise<MeasurementProfileDto | null> {
  const response = await fetch("/api/v1/measurement-profiles/current", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    return null;
  }

  const result = (await response.json()) as ApiResponse<MeasurementProfileDto | null>;
  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data ?? null;
}

export async function saveProfile(values: SaveMeasurementProfileValues): Promise<MeasurementProfileDto> {
  const response = await fetch("/api/v1/measurement-profiles/current", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const result = (await response.json()) as ApiResponse<MeasurementProfileDto>;
  if (!result.success) {
    throw new Error(typeof result.error === "string" ? result.error : result.message);
  }

  return result.data!;
}
