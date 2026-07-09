import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import { createCustomizationRequest } from "@/features/customization/customization-server.service";
import { createCustomizationSchema } from "@/validations/customization.schema";

export async function POST(request: Request) {
  try {
    const customerId = await getCurrentCustomerId(); // Co the null neu la guest
    const body = await request.json();

    const result = createCustomizationSchema.safeParse(body);

    if (!result.success) {
      return fail("Du lieu khong hop le.", 422, result.error.errors);
    }

    const customizationRequest = await createCustomizationRequest(customerId, result.data);
    return ok(customizationRequest, "Tao yeu cau may do thanh cong.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Loi he thong.";
    console.error("[customization-requests/POST]", error);
    return fail("Loi he thong.", 500, message);
  }
}
