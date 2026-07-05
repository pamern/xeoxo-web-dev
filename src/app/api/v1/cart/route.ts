import { fail, ok } from "@/lib/api-response";
import {
  buildCartDto,
  findActiveCart,
  getCartOwner,
} from "@/features/cart/cart-server.service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const owner = await getCartOwner();
    const cart = await findActiveCart(owner);
    const dto = await buildCartDto(cart);

    return ok(dto, "Lay gio hang thanh cong.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải giỏ hàng.";
    console.error("[cart/GET] failed", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return fail(
      message,
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function DELETE() {
  try {
    const owner = await getCartOwner();
    const cart = await findActiveCart(owner);

    if (!cart) {
      return ok({ cart_id: null }, "Giỏ hàng đang rỗng.");
    }

    const admin = createAdminClient();
    const { error } = await admin
      .schema("sales")
      .from("cart_item")
      .delete()
      .eq("cart_id", cart.cart_id);

    if (error) {
      throw new Error(error.message);
    }

    return ok({ cart_id: cart.cart_id }, "Đã xoá toàn bộ giỏ hàng.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể xoá giỏ hàng.";
    console.error("[cart/DELETE] failed", {
      message,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return fail(
      message,
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
