import type { CreateAppointmentValues, AppointmentDto } from "@/types/appointment.types";
import type { ApiResponse } from "@/lib/api-response";

export async function createAppointment(values: CreateAppointmentValues): Promise<AppointmentDto> {
  const response = await fetch("/api/v1/measurement-appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const result = (await response.json()) as ApiResponse<AppointmentDto>;
  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data!;
}
