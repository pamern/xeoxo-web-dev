import { fail, ok } from "@/lib/api-response";
import {
  assertCustomizationCheckoutReady,
  getCustomizationForCheckout,
} from "@/features/customization/customization-server.service";
import {
  assertCartItemOwnership,
  buildCartDto,
  findActiveCart,
  getCurrentCustomerId,
  getCartOwner,
  getVariantById,
  getVariantStock,
  isVariantPurchasableStatus,
} from "@/features/cart/cart-server.service";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = {
  cart_item_id: string;
};

export async function PATCH(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { cart_item_id } = await params;
    const cartItemId = Number(cart_item_id);
    const body = await request.json();

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return fail("cart_item_id khong hop le.", 400);
    }

    const owner = await getCartOwner();
    const cartItem = await assertCartItemOwnership(cartItemId, owner);
    if (!cartItem) {
      return fail("Khong tim thay dong gio hang.", 404);
    }

    const nextCustomizationId = body.customization_id !== undefined
      ? Number(body.customization_id)
      : null;

    if (
      cartItem.item_type === "CUSTOMIZED" &&
      !nextCustomizationId &&
      body.variant_id === undefined
    ) {
      if (body.variant_id !== undefined) {
        return fail("Khong the cap nhat variant cho san pham may do.", 400);
      }

      const nextQuantity = body.quantity !== undefined ? Number(body.quantity) : Number(cartItem.quantity);
      if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
        return fail("quantity phai la so nguyen khong am.", 422);
      }

      const admin = createAdminClient();
      if (nextQuantity <= 0) {
        const { error } = await admin.schema("sales").from("cart_item").delete().eq("cart_item_id", cartItemId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await admin.schema("sales").from("cart_item").update({
          quantity: nextQuantity,
          updated_at: new Date().toISOString(),
        }).eq("cart_item_id", cartItemId);
        if (error) throw new Error(error.message);
      }
    } else {
      const nextVariantId = body.variant_id !== undefined ? Number(body.variant_id) : (cartItem.variant_id ?? 0);
      const nextQuantity = body.quantity !== undefined ? Number(body.quantity) : Number(cartItem.quantity);

      if (nextCustomizationId !== null) {
        if (!Number.isInteger(nextCustomizationId) || nextCustomizationId <= 0) {
          return fail("customization_id khong hop le.", 422);
        }

        if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
          return fail("quantity phai la so nguyen khong am.", 422);
        }

        const admin = createAdminClient();

        if (nextQuantity <= 0) {
          const { error } = await admin
            .schema("sales")
            .from("cart_item")
            .delete()
            .eq("cart_item_id", cartItemId);

          if (error) {
            throw new Error(error.message);
          }
        } else {
          const currentCustomerId = await getCurrentCustomerId();
          await assertCustomizationCheckoutReady(nextCustomizationId, currentCustomerId);
          const customization = await getCustomizationForCheckout(nextCustomizationId);

          if (!customization) {
            return fail("Khong tim thay yeu cau may do.", 404);
          }

          if (cartItem.variant_id) {
            const currentVariant = await getVariantById(cartItem.variant_id);
            if (
              currentVariant &&
              Number(currentVariant.component_id) !== Number(customization.component_id)
            ) {
              return fail("Yeu cau may do khong thuoc san pham trong gio.", 409);
            }
          }

          const cart = await findActiveCart(owner);
          if (!cart) {
            return fail("Khong tim thay gio hang.", 404);
          }

          const { data: duplicate, error: duplicateError } = await admin
            .schema("sales")
            .from("cart_item")
            .select("cart_item_id, quantity")
            .eq("cart_id", cart.cart_id)
            .eq("item_type", "CUSTOMIZED")
            .eq("customization_id", nextCustomizationId)
            .neq("cart_item_id", cartItemId)
            .maybeSingle();

          if (duplicateError) {
            throw new Error(duplicateError.message);
          }

          if (duplicate) {
            const { error: updateDuplicateError } = await admin
              .schema("sales")
              .from("cart_item")
              .update({
                quantity: Number(duplicate.quantity) + nextQuantity,
                updated_at: new Date().toISOString(),
              })
              .eq("cart_item_id", duplicate.cart_item_id);

            if (updateDuplicateError) {
              throw new Error(updateDuplicateError.message);
            }

            const { error: deleteSourceError } = await admin
              .schema("sales")
              .from("cart_item")
              .delete()
              .eq("cart_item_id", cartItemId);

            if (deleteSourceError) {
              throw new Error(deleteSourceError.message);
            }
          } else {
            const { error } = await admin
              .schema("sales")
              .from("cart_item")
              .update({
                item_type: "CUSTOMIZED",
                variant_id: null,
                customization_id: nextCustomizationId,
                customization_snapshot: customization.measurement_snapshot ?? null,
                quantity: nextQuantity,
                unit_price: Number(customization.custom_price),
                updated_at: new Date().toISOString(),
              })
              .eq("cart_item_id", cartItemId);

            if (error) {
              throw new Error(error.message);
            }
          }
        }
      } else {
        if (!Number.isInteger(nextVariantId) || nextVariantId <= 0) {
          return fail("variant_id khong hop le.", 422);
        }

        if (!Number.isInteger(nextQuantity) || nextQuantity < 0) {
          return fail("quantity phai la so nguyen khong am.", 422);
        }

        const admin = createAdminClient();

        if (nextQuantity <= 0) {
          const { error } = await admin
            .schema("sales")
            .from("cart_item")
            .delete()
            .eq("cart_item_id", cartItemId);

          if (error) {
            throw new Error(error.message);
          }
        } else {
          const variant = await getVariantById(nextVariantId);
          if (!variant || !isVariantPurchasableStatus(variant.status)) {
            return fail("Bien the san pham khong kha dung.", 404);
          }

          if (cartItem.customization_id) {
            const currentCustomization = await getCustomizationForCheckout(cartItem.customization_id);
            if (
              currentCustomization &&
              Number(currentCustomization.component_id) !== Number(variant.component_id)
            ) {
              return fail("Bien the moi khong thuoc san pham trong gio.", 409);
            }
          }

          const cart = await findActiveCart(owner);
          if (!cart) {
            return fail("Khong tim thay gio hang.", 404);
          }

          const { data: duplicate, error: duplicateError } = await admin
            .schema("sales")
            .from("cart_item")
            .select("cart_item_id, quantity")
            .eq("cart_id", cart.cart_id)
            .eq("item_type", "STANDARD")
            .eq("variant_id", nextVariantId)
            .neq("cart_item_id", cartItemId)
            .maybeSingle();

          if (duplicateError) {
            throw new Error(duplicateError.message);
          }

          const stockQuantity = await getVariantStock(nextVariantId);
          const requestedQuantity = nextQuantity + Number(duplicate?.quantity ?? 0);

          if (stockQuantity <= 0) {
            return fail("San pham da het hang.", 409);
          }

          if (requestedQuantity > stockQuantity) {
            return fail(`Chi con ${stockQuantity} san pham trong kho.`, 409);
          }

          if (duplicate) {
            const { error: updateDuplicateError } = await admin
              .schema("sales")
              .from("cart_item")
              .update({
                quantity: Number(duplicate.quantity) + nextQuantity,
                updated_at: new Date().toISOString(),
              })
              .eq("cart_item_id", duplicate.cart_item_id);

            if (updateDuplicateError) {
              throw new Error(updateDuplicateError.message);
            }

            const { error: deleteSourceError } = await admin
              .schema("sales")
              .from("cart_item")
              .delete()
              .eq("cart_item_id", cartItemId);

            if (deleteSourceError) {
              throw new Error(deleteSourceError.message);
            }
          } else {
            const { error } = await admin
              .schema("sales")
              .from("cart_item")
              .update({
                item_type: "STANDARD",
                variant_id: nextVariantId,
                customization_id: null,
                customization_snapshot: null,
                quantity: nextQuantity,
                unit_price: Number(variant.price),
                updated_at: new Date().toISOString(),
              })
              .eq("cart_item_id", cartItemId);

            if (error) {
              throw new Error(error.message);
            }
          }
        }
      }
    }

    const cart = await findActiveCart(owner);
    const dto = await buildCartDto(cart);
    return ok(dto, "Cap nhat gio hang thanh cong.");
  } catch (error) {
    console.error("[cart-items/PATCH]", error);
    return fail(
      "Khong the cap nhat gio hang.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { cart_item_id } = await params;
    const cartItemId = Number(cart_item_id);

    if (!Number.isInteger(cartItemId) || cartItemId <= 0) {
      return fail("cart_item_id khong hop le.", 400);
    }

    const owner = await getCartOwner();
    const cartItem = await assertCartItemOwnership(cartItemId, owner);
    if (!cartItem) {
      return fail("Khong tim thay dong gio hang.", 404);
    }

    const admin = createAdminClient();
    const { error } = await admin
      .schema("sales")
      .from("cart_item")
      .delete()
      .eq("cart_item_id", cartItemId);

    if (error) {
      throw new Error(error.message);
    }

    return ok({ cart_item_id: cartItemId }, "Xoa san pham khoi gio hang thanh cong.");
  } catch (error) {
    console.error("[cart-items/DELETE]", error);
    return fail(
      "Khong the xoa san pham khoi gio.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
