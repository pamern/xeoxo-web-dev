import { fail, ok } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";

type Params = {
  order_id: string;
};

export async function POST(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const { order_id: orderIdParam } = await params;
    const orderId = Number(orderIdParam);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return fail("order_id khong hop le.", 400);
    }

    const admin = createAdminClient();
    const currentCustomerId = await getCurrentCustomerId();
    const { data: order, error: orderError } = await admin
      .schema("sales")
      .from("sales_order")
      .select("order_id, order_code, customer_id, order_status, payment_status, total_amount")
      .eq("order_id", orderId)
      .maybeSingle();

    if (orderError) {
      throw new Error(orderError.message);
    }

    if (!order) {
      return fail("Khong tim thay don hang.", 404);
    }

    if (currentCustomerId && Number(order.customer_id) !== currentCustomerId) {
      return fail("Khong co quyen thao tac tren don hang nay.", 403);
    }

    const { data: payment, error: paymentError } = await admin
      .schema("sales")
      .from("payment")
      .select("payment_id")
      .eq("order_id", orderId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (paymentError) {
      throw new Error(paymentError.message);
    }

    return ok(
      {
        order_id: Number(order.order_id),
        order_code: order.order_code,
        order_status: order.order_status,
        payment_status: order.payment_status,
        total_amount: Number(order.total_amount),
        payment_id: payment?.payment_id ? Number(payment.payment_id) : null,
        payment_url: undefined,
      },
      "Tao thanh toan thanh cong.",
    );
  } catch (error) {
    console.error("[orders/payments/POST]", error);
    return fail(
      error instanceof Error ? error.message : "Khong the tao thanh toan.",
      400,
    );
  }
}
