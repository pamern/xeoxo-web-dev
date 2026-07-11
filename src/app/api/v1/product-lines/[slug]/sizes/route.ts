import { fail, ok } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { isVariantAvailable } from "@/features/cart/cart-server.service";
import type { ProductSizeOptionDto } from "@/types/product-api.types";

type Params = {
  slug: string;
};

type InventoryAvailabilityRow = {
  variant_id: number;
  total_quantity: number | null;
};

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "CUSTOM"];

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function sizeRank(sizeName: string) {
  const normalized = sizeName.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized);
  return index === -1 ? SIZE_ORDER.length : index;
}

function dedupeSizesByName(sizes: ProductSizeOptionDto[]): ProductSizeOptionDto[] {
  const groups = new Map<string, ProductSizeOptionDto[]>();

  for (const size of sizes) {
    const key = size.size_name.trim().toLowerCase();
    const group = groups.get(key) ?? [];
    group.push(size);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const isAvailable = group.every((option) => option.is_available);
    const stockQuantity = Math.min(
      ...group.map((option) => option.stock_quantity ?? 0),
    );
    const preferred = group.find((option) => option.is_available) ?? group[0];

    return {
      ...preferred,
      is_available: isAvailable,
      stock_quantity: stockQuantity,
    };
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const { slug } = await params;
    const admin = createAdminClient();

    const { data: productLine, error: productLineError } = await admin
      .schema("catalog")
      .from("product_line")
      .select("product_line_id")
      .eq("slug", slug)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (productLineError) {
      throw new Error(productLineError.message);
    }

    if (!productLine) {
      return fail("Khong tim thay san pham.", 404);
    }

    const productLineId = Number(productLine.product_line_id);

    const { data: components, error: componentsError } = await admin
      .schema("catalog")
      .from("product_component")
      .select("component_id")
      .eq("product_line_id", productLineId);

    if (componentsError) {
      throw new Error(componentsError.message);
    }

    const componentIds = (components ?? []).map((item) => Number(item.component_id));

    const variantsResult = componentIds.length
      ? await admin
        .schema("catalog")
        .from("product_variant")
        .select("variant_id, size_option_id, price, status")
        .in("component_id", componentIds)
      : { data: [], error: null };

    if (variantsResult.error) {
      throw new Error(variantsResult.error.message);
    }

    const variants = variantsResult.data ?? [];
    const sizeIds = variants
      .map((variant) => variant.size_option_id)
      .filter((id): id is number => typeof id === "number");

    const sizesResult = sizeIds.length
      ? await admin
        .schema("catalog")
        .from("size_option")
        .select("size_option_id, size_name")
        .in("size_option_id", sizeIds)
      : { data: [], error: null };

    if (sizesResult.error) {
      throw new Error(sizesResult.error.message);
    }

    const inventoryResult = variants.length
      ? await admin
        .schema("catalog")
        .from("v_inventory_availability")
        .select("variant_id, total_quantity")
        .in(
          "variant_id",
          variants.map((variant) => variant.variant_id),
        )
      : { data: [], error: null };

    if (inventoryResult.error) {
      throw new Error(`Khong the kiem tra ton kho: ${inventoryResult.error.message}`);
    }

    const sizeMap = new Map(
      (sizesResult.data ?? []).map((size) => [
        Number(size.size_option_id),
        String(size.size_name),
      ]),
    );

    const stockMap = new Map<number, number>();
    for (const row of ((inventoryResult.data ?? []) as InventoryAvailabilityRow[])) {
      const variantId = Number(row.variant_id);
      stockMap.set(
        variantId,
        (stockMap.get(variantId) ?? 0) + Math.max(0, Number(row.total_quantity ?? 0)),
      );
    }

    const sizes = dedupeSizesByName(
      variants.map((variant) => {
        const stockQuantity = stockMap.get(Number(variant.variant_id)) ?? 0;

        return {
          variant_id: Number(variant.variant_id),
          size_name: variant.size_option_id
            ? sizeMap.get(Number(variant.size_option_id)) ?? ""
            : "",
          price: toNumber(variant.price),
          is_available: isVariantAvailable(variant.status, stockQuantity),
          stock_quantity: stockQuantity,
        };
      }),
    ).sort((a, b) => {
      const rankDifference = sizeRank(a.size_name) - sizeRank(b.size_name);
      return rankDifference || a.size_name.localeCompare(b.size_name, "vi");
    });

    return ok({ sizes }, "Lay danh sach size thanh cong.");
  } catch (error) {
    return fail(
      "Khong the tai danh sach size san pham.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
