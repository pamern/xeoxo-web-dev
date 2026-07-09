import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { getCurrentProfile, upsertProfile } from "@/features/measurement/measurement-server.service";
import { saveMeasurementProfileSchema } from "@/validations/measurement.schema";

export async function GET() {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Vui long dang nhap.", 401);
    }

    const profile = await getCurrentProfile(customerId);

    // Nếu không có, có thể trả về mảng rỗng hoặc profile mặc định
    if (!profile) {
       return ok(null, "Khong tim thay so do.");
    }

    return ok(profile, "Thanh cong");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Loi he thong.";
    console.error("[measurement-profiles/current/GET]", error);
    return fail("Loi he thong.", 500, message);
  }
}

export async function PUT(request: Request) {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Vui long dang nhap.", 401);
    }

    const body = await request.json();
    const result = saveMeasurementProfileSchema.safeParse(body);

    if (!result.success) {
      return fail("Du lieu khong hop le.", 422, result.error.errors);
    }

    const profile = await upsertProfile(customerId, result.data.measurements);
    return ok(profile, "Luu so do thanh cong.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Loi he thong.";
    console.error("[measurement-profiles/current/PUT]", error);
    return fail("Loi he thong.", 500, message);
  }
}
