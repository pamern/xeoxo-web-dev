import { fail, ok } from "@/lib/api-response";
import { createCheckoutOrder } from "@/features/checkout/checkout-server.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = await createCheckoutOrder(body);

    return ok(order, "Tao don hang thanh cong.", 201);
  } catch (error) {
    console.error("[orders/POST]", error);
    return fail(
      error instanceof Error ? error.message : "Khong the tao don hang.",
      400,
    );
  }
}
