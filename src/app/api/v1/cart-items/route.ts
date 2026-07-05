import { fail, ok } from "@/lib/api-response";
import {
  buildCartDto,
  getCartOwner,
  getOrCreateActiveCart,
  getVariantById,
  getVariantStock,
} from "@/features/cart/cart-server.service";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const variantId = Number(body.variant_id);
    const quantity = Number(body.quantity ?? 1);
    console.info("[cart-items/POST] start", { variantId, quantity });

    if (!Number.isInteger(variantId) || variantId <= 0) {
      return fail("variant_id khong hop le.", 400);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail("quantity phai la so nguyen duong.", 422);
    }

    const variant = await getVariantById(variantId);
    if (!variant || variant.status !== "ACTIVE") {
      return fail("Bien the san pham khong kha dung.", 404);
    }

    const admin = createAdminClient();
    const { data: component, error: componentError } = await admin
      .schema("catalog")
      .from("product_component")
      .select("component_id, product_line_id")
      .eq("component_id", variant.component_id)
      .maybeSingle();

    if (componentError) throw new Error(componentError.message);
    if (!component) return fail("San pham khong con ton tai.", 404);

    const { data: productLine, error: productLineError } = await admin
      .schema("catalog")
      .from("product_line")
      .select("product_line_id, status")
      .eq("product_line_id", component.product_line_id)
      .maybeSingle();

    if (productLineError) throw new Error(productLineError.message);
    if (!productLine || productLine.status !== "ACTIVE") {
      return fail("San pham hien khong the mua.", 409);
    }

    const stockQuantity = await getVariantStock(variantId);
    if (stockQuantity <= 0) {
      return fail("San pham da het hang.", 409);
    }

    const owner = await getCartOwner();
    console.info("[cart-items/POST] owner", owner);
    const cart = await getOrCreateActiveCart(owner);
    const { data: existing, error: existingError } = await admin
      .schema("sales")
      .from("cart_item")
      .select("cart_item_id, quantity")
      .eq("cart_id", cart.cart_id)
      .eq("variant_id", variantId)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const requestedTotal = Number(existing?.quantity ?? 0) + quantity;

    if (requestedTotal > stockQuantity) {
      return fail(`Chi con ${stockQuantity} san pham trong kho.`, 409);
    }

    if (existing) {
      const nextQuantity = Number(existing.quantity) + quantity;
      const { error } = await admin
        .schema("sales")
        .from("cart_item")
        .update({
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("cart_item_id", existing.cart_item_id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const now = new Date().toISOString();
      const { error } = await admin.schema("sales").from("cart_item").insert({
        cart_id: cart.cart_id,
        variant_id: variantId,
        quantity,
        unit_price: Number(variant.price),
        created_at: now,
        updated_at: now,
      });

      if (error) {
        throw new Error(error.message);
      }
    }

    const dto = await buildCartDto(cart);
    return ok(dto, "Đã thêm sản phẩm vào giỏ.");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể thêm sản phẩm vào giỏ.";
    console.error("[cart-items/POST] failed", {
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
