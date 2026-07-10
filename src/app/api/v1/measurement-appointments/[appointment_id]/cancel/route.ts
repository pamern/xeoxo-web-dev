import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import {
  cancelCustomerAppointment,
  cancelLookupAppointment,
} from "@/features/appointment/cancel-appointment.service";
import { cancelAppointmentSchema } from "@/validations/appointment/cancel-appointment.schema";

type Params = {
  appointment_id: string;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const customerId = await getCurrentCustomerId();
    const { appointment_id } = await params;
    const appointmentId = Number(appointment_id);

    if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
      return fail("Mã lịch hẹn không hợp lệ.", 400);
    }

    const payload = await request.json().catch(() => ({}));
    const parsed = cancelAppointmentSchema.safeParse(payload);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu hủy lịch không hợp lệ.",
        400,
      );
    }

    if (!customerId && !parsed.data.contact) {
      return fail("Vui lòng nhập SĐT hoặc email để hủy lịch hẹn.", 400);
    }

    const result = customerId
      ? await cancelCustomerAppointment(
          customerId,
          appointmentId,
          parsed.data.cancel_reason,
        )
      : await cancelLookupAppointment(
          appointmentId,
          parsed.data.contact ?? "",
          parsed.data.cancel_reason,
        );

    if (!result.success) {
      const normalizedMessage = result.message.toLowerCase();
      const status =
        normalizedMessage.includes("không tìm thấy")
          ? 404
          : normalizedMessage.includes("không có quyền") ||
              normalizedMessage.includes("không khớp")
            ? 403
            : normalizedMessage.includes("đã được hủy") ||
                normalizedMessage.includes("không còn có thể hủy") ||
                normalizedMessage.includes("đã hoàn thành")
              ? 409
              : 400;

      return fail(result.message, status);
    }

    return ok(
      {
        appointment_id: result.appointment_id ?? appointmentId,
        appointment_status: result.appointment_status ?? "CANCELLED",
      },
      result.message,
    );
  } catch (error) {
    console.error("[measurement-appointments/[appointment_id]/cancel/PATCH]", error);
    return fail(
      "Không thể hủy lịch hẹn.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
