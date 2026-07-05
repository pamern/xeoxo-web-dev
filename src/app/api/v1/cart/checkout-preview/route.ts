import { fail, ok } from "@/lib/api-response";
import { prepareCheckout } from "@/features/checkout/checkout-server.service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const preview = await prepareCheckout(body.cart_item_ids, body.voucher_code);

    return ok(
      {
        items: preview.items,
        subtotal: preview.subtotal,
        shipping_fee: preview.shipping_fee,
        discount_amount: preview.discount_amount,
        reward_discount_amount: preview.reward_discount_amount,
        total_amount: preview.total_amount,
      },
      "Tinh tien thanh cong.",
    );
  } catch (error) {
    console.error("[cart/checkout-preview/POST]", error);
    return fail(
      error instanceof Error ? error.message : "Khong the tinh tien thanh toan.",
      400,
    );
  }
}
