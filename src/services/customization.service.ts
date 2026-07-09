import type { CreateCustomizationValues, CustomizationRequestDto } from "@/types/customization.types";
import type { ApiResponse } from "@/lib/api-response";

export async function createCustomizationRequest(values: CreateCustomizationValues): Promise<CustomizationRequestDto> {
  const response = await fetch("/api/v1/customization-requests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const result = (await response.json()) as ApiResponse<CustomizationRequestDto>;
  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data!;
}
