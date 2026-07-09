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
    const quantity = Number(body.quantity ?? 1);
    const variantId = body.variant_id ? Number(body.variant_id) : null;
    const customizationId = body.customization_id ? Number(body.customization_id) : null;
    const itemType =
      body.item_type === "CUSTOMIZED" || customizationId
        ? "CUSTOMIZED"
        : "STANDARD";

    console.info("[cart-items/POST] start", { itemType, variantId, customizationId, quantity });

    if (!Number.isInteger(quantity) || quantity <= 0) {
      return fail("quantity phai la so nguyen duong.", 422);
    }

    const admin = createAdminClient();
    let finalVariantId: number | null = null;
    let finalUnitPrice = 0;
    let finalCustomizationId: number | null = null;
    let finalCustomizationSnapshot: unknown = null;
    let stockQuantity = 999; // Default large for customized if no inventory check

    if (itemType === "STANDARD") {
      if (!variantId || !Number.isInteger(variantId) || variantId <= 0) {
        return fail("variant_id khong hop le cho san pham STANDARD.", 400);
      }
      finalVariantId = variantId;

      const variant = await getVariantById(finalVariantId);
      if (!variant || variant.status !== "ACTIVE") {
        return fail("Bien the san pham khong kha dung.", 404);
      }

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

      stockQuantity = await getVariantStock(finalVariantId);
      if (stockQuantity <= 0) {
        return fail("San pham da het hang.", 409);
      }

      finalUnitPrice = Number(variant.price);
    } else {
      if (!customizationId || !Number.isInteger(customizationId) || customizationId <= 0) {
        return fail("customization_id khong hop le cho san pham CUSTOMIZED.", 400);
      }
      finalCustomizationId = customizationId;

      const { data: request, error: requestError } = await admin
        .schema("customization")
        .from("customization_request")
        .select("custom_price, component_id, customization_status, measurement_snapshot")
        .eq("customization_id", finalCustomizationId)
        .maybeSingle();

      if (requestError) throw new Error(requestError.message);
      if (!request) return fail("Khong tim thay yeu cau may do.", 404);

      // We don't check stock for customized items currently as they are made to order
      finalUnitPrice = Number(request.custom_price);
      finalCustomizationSnapshot = request.measurement_snapshot ?? null;
    }

    const owner = await getCartOwner();
    console.info("[cart-items/POST] owner", owner);
    const cart = await getOrCreateActiveCart(owner);

    // Check if item already exists in cart
    let existingQuery = admin
      .schema("sales")
      .from("cart_item")
      .select("cart_item_id, quantity")
      .eq("cart_id", cart.cart_id)
      .eq("item_type", itemType);

    if (itemType === "STANDARD") {
      existingQuery = existingQuery.eq("variant_id", finalVariantId!);
    } else {
      existingQuery = existingQuery.eq("customization_id", finalCustomizationId!);
    }

    const { data: existing, error: existingError } = await existingQuery.maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    const requestedTotal = Number(existing?.quantity ?? 0) + quantity;

    if (itemType === "STANDARD" && requestedTotal > stockQuantity) {
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
      const insertData: any = {
        cart_id: cart.cart_id,
        item_type: itemType,
        quantity,
        unit_price: finalUnitPrice,
        created_at: now,
        updated_at: now,
      };

      if (itemType === "STANDARD") {
        insertData.variant_id = finalVariantId;
      } else {
        insertData.customization_id = finalCustomizationId;
        insertData.customization_snapshot = finalCustomizationSnapshot;
      }

      const { error } = await admin.schema("sales").from("cart_item").insert(insertData);

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
