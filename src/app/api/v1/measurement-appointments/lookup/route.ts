import { fail, ok } from "@/lib/api-response";
import { appointmentLookupSchema } from "@/validations/appointment/appointment-lookup.schema";
import { lookupAppointmentByContact } from "@/features/appointment/appointment-lookup.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawInput = {
      appointment_code:
        searchParams.get("appointment_code") ??
        searchParams.get("appointment_id") ??
        "",
      contact: searchParams.get("contact") ?? "",
    };

    if (!rawInput.appointment_code || !rawInput.contact) {
      return fail("Vui lòng nhập mã lịch hẹn và SĐT/email.", 400);
    }

    const parsed = appointmentLookupSchema.safeParse(rawInput);
    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu tra cứu không hợp lệ.",
        400,
      );
    }

    const appointment = await lookupAppointmentByContact(parsed.data);
    if (!appointment) {
      return fail("Không tìm thấy lịch hẹn.", 404);
    }

    return ok(appointment, "Thành công");
  } catch (error) {
    console.error("[measurement-appointments/lookup/GET]", error);
    return fail(
      "Không thể tra cứu lịch hẹn lúc này.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
