import { API } from "@/constants/routes";
import { getApiErrorMessage, type ApiResponse } from "@/types/api.types";
import type {
  AppointmentLookupDto,
  AppointmentLookupValues,
} from "@/types/appointment-lookup.types";
import type { AppointmentDto, CreateAppointmentValues } from "@/types/appointment.types";
import type { ApiResponse as RouteApiResponse } from "@/lib/api-response";

export type CancelAppointmentValues = {
  contact?: string;
  cancel_reason?: string;
};

export type CancelAppointmentDto = {
  appointment_id: number;
  appointment_status: "CANCELLED";
};

async function readApi<T>(response: Response, fallback: string) {
  const payload = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !payload.success || payload.data === undefined) {
    throw new Error(getApiErrorMessage(payload, fallback));
  }

  return payload.data;
}

export const appointmentService = {
  async lookupAppointment(values: AppointmentLookupValues) {
    const query = new URLSearchParams({
      appointment_code: values.appointment_code,
      contact: values.contact,
    });

    const response = await fetch(
      `${API.APPOINTMENT_LOOKUP}?${query.toString()}`,
      {
        credentials: "include",
      },
    );

    return readApi<AppointmentLookupDto>(
      response,
      "Không thể tra cứu lịch hẹn.",
    );
  },

  async cancelAppointment(
    appointmentId: number,
    values: CancelAppointmentValues = {},
  ) {
    const response = await fetch(API.APPOINTMENT_CANCEL(appointmentId), {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });

    return readApi<CancelAppointmentDto>(
      response,
      "Không thể hủy lịch hẹn.",
    );
  },
};

export async function createAppointment(values: CreateAppointmentValues): Promise<AppointmentDto> {
  const response = await fetch("/api/v1/measurement-appointments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const result = (await response.json()) as RouteApiResponse<AppointmentDto>;
  if (!result.success) {
    throw new Error(result.message);
  }

  return result.data!;
}
