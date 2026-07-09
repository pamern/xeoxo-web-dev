import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { getMeasurementAppointmentsByCustomerId } from "@/features/appointment/account-appointment-history";
import { accountAppointmentQuerySchema } from "@/validations/appointment/account-appointment-query.schema";
import { createAppointment } from "@/features/appointment/appointment-server.service";
import { createAppointmentSchema } from "@/validations/appointment.schema";

export async function GET(request: Request) {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để xem lịch hẹn.", 401);
    }

    const { searchParams } = new URL(request.url);
    const parsed = accountAppointmentQuerySchema.safeParse({
      limit: searchParams.get("limit") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      status_group: searchParams.get("status_group") ?? undefined,
    });

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Query lịch hẹn không hợp lệ.",
        400,
      );
    }

    const appointments = await getMeasurementAppointmentsByCustomerId(
      customerId,
      parsed.data,
    );

    return ok(appointments, "Lấy danh sách lịch hẹn thành công.");
  } catch (error) {
    console.error("[measurement-appointments/GET]", error);
    return fail(
      "Không thể tải danh sách lịch hẹn.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function POST(request: Request) {
  try {
    const customerId = await getCurrentCustomerId(); // Co the null neu la guest
    const body = await request.json();

    const result = createAppointmentSchema.safeParse(body);

    if (!result.success) {
      return fail("Du lieu khong hop le.", 422, result.error.errors);
    }

    const appointment = await createAppointment(customerId, result.data);
    return ok(appointment, "Dat lich tu van may do thanh cong.", 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Loi he thong.";
    console.error("[measurement-appointments/POST]", error);
    return fail("Loi he thong.", 500, message);
  }
}
