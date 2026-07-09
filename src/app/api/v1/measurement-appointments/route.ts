import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { createAppointment } from "@/features/appointment/appointment-server.service";
import { createAppointmentSchema } from "@/validations/appointment.schema";

export async function POST(request: Request) {
  try {
    const customerId = await getCurrentCustomerId(); // Co the null neu la guest
    const body = await request.json();

    const result = createAppointmentSchema.safeParse(body);

    if (!result.success) {
      return fail("Du lieu khong hop le.", 422, result.error.errors);
    }

    const appointment = await createAppointment(customerId, result.data);
    return ok(appointment, "Dat lich tu van may do thanh cong.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Loi he thong.";
    console.error("[measurement-appointments/POST]", error);
    return fail("Loi he thong.", 500, message);
  }
}
