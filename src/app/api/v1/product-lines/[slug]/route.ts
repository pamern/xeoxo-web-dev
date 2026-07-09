import { fail, ok } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { isVariantAvailable } from "@/features/cart/cart-server.service";

export const dynamic = "force-dynamic";

type Params = {
  slug: string;
};

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "CUSTOM"];

function sizeRank(sizeName: string) {
  const normalized = sizeName.trim().toUpperCase();
  const index = SIZE_ORDER.indexOf(normalized);
  return index === -1 ? SIZE_ORDER.length : index;
}

type SizeOption = {
  variant_id: number;
  size_name: string;
  price: number;
  is_available: boolean;
  stock_quantity: number;
};

type InventoryAvailabilityRow = {
  variant_id: number;
  total_quantity: number | null;
};

// Một product_line có thể có nhiều product_component (vd: set Áo + Quần),
// mỗi component lại có variant riêng cho cùng 1 size_name -> gộp về 1 dòng
// mỗi size, tránh hiện trùng size ngoài UI. Size chỉ thật sự "còn hàng" khi
// tất cả component của size đó đều còn hàng.
function dedupeSizesByName(sizes: SizeOption[]): SizeOption[] {
  const groups = new Map<string, SizeOption[]>();

  for (const size of sizes) {
    const key = size.size_name.trim().toLowerCase();
    const group = groups.get(key) ?? [];
    group.push(size);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const isAvailable = group.every((option) => option.is_available);
    const stockQuantity = Math.min(...group.map((option) => option.stock_quantity));
    const preferred =
      group.find((option) => option.is_available) ?? group[0];

    return {
      ...preferred,
      is_available: isAvailable,
      stock_quantity: stockQuantity,
    };
  });
}

function mediaUrl(storageKey?: string | null, bucketName?: string | null) {
  if (!storageKey) {
    return "/images/placeholder.png";
  }

  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    return storageKey;
  }

  if (storageKey.startsWith("/")) {
    return storageKey;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.error("[product-lines/mediaUrl] Missing NEXT_PUBLIC_SUPABASE_URL", {
      storageKey,
    });
    return "/images/placeholder.png";
  }

  const normalizedKey = storageKey.replace(/^\/+/, "");
  const normalizedBucket = bucketName?.replace(/^\/+|\/+$/g, "");

  if (normalizedBucket && !normalizedKey.startsWith(`${normalizedBucket}/`)) {
    return `${supabaseUrl}/storage/v1/object/public/${normalizedBucket}/${normalizedKey}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${normalizedKey}`;
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    console.info("[product-lines/[slug]/GET] start", { slug });
    const admin = createAdminClient();

    const { data: productLine, error: productLineError } = await admin
      .schema("catalog")
      .from("product_line")
      .select(
        "product_line_id, slug, line_name, description, color_id, material_id, status, design_style, usage_context, features",
      )
      .eq("slug", slug)
      .eq("status", "ACTIVE")
      .maybeSingle();

    console.info("[product-lines/[slug]/GET] query result", { slug, productLine, productLineError });

    if (productLineError) {
      throw new Error(productLineError.message);
    }

    if (!productLine) {
      console.warn("[product-lines/[slug]/GET] not_found", { slug });
      return fail("Khong tim thay san pham.", 404);
    }

    const productLineId = Number(productLine.product_line_id);
    const [
      mediaResult,
      colorResult,
      materialResult,
      componentsResult,
    ] = await Promise.all([
      admin
        .schema("catalog")
        .from("product_line_media")
        .select("media_id, media_role, display_order")
        .eq("product_line_id", productLineId)
        .order("display_order", { ascending: true }),
      productLine.color_id
        ? admin
            .schema("catalog")
            .from("color")
            .select("color_name, color_code")
            .eq("color_id", productLine.color_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      productLine.material_id
        ? admin
            .schema("catalog")
            .from("material")
            .select("material_name, description, care_instruction")
            .eq("material_id", productLine.material_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      admin
        .schema("catalog")
        .from("product_component")
        .select("component_id, component_name, component_type, is_required, display_order")
        .eq("product_line_id", productLineId)
        .order("display_order", { ascending: true }),
    ]);

    for (const result of [
      mediaResult,
      colorResult,
      materialResult,
      componentsResult,
    ]) {
      if (result.error) {
        throw new Error(result.error.message);
      }
    }

    const mediaRoleRank = {
      MAIN: 0,
      GALLERY: 1,
      DETAIL: 2,
      LOOKBOOK: 3,
    } as const;
    const productMedia = [...(mediaResult.data ?? [])].sort((a, b) => {
      const roleA =
        mediaRoleRank[String(a.media_role) as keyof typeof mediaRoleRank] ?? 99;
      const roleB =
        mediaRoleRank[String(b.media_role) as keyof typeof mediaRoleRank] ?? 99;

      return (
        roleA - roleB ||
        Number(a.display_order ?? 0) - Number(b.display_order ?? 0) ||
        Number(a.media_id) - Number(b.media_id)
      );
    });
    const mediaRows = productMedia.length
      ? await admin
          .schema("catalog")
          .from("media")
          .select("media_id, storage_key, media_type, bucket_name")
          .in(
            "media_id",
            productMedia.map((item) => item.media_id),
          )
      : { data: [], error: null };

    if (mediaRows.error) {
      throw new Error(mediaRows.error.message);
    }

    const mediaMap = new Map(
      (mediaRows.data ?? []).map((item) => [Number(item.media_id), item]),
    );

    const componentIds = (componentsResult.data ?? []).map((item) =>
      Number(item.component_id),
    );
    const variantsResult = componentIds.length
      ? await admin
          .schema("catalog")
          .from("product_variant")
          .select("variant_id, component_id, size_option_id, price, status")
          .in("component_id", componentIds)
      : { data: [], error: null };

    if (variantsResult.error) {
      throw new Error(variantsResult.error.message);
    }

    const variants = variantsResult.data ?? [];
    const variantIds = variants.map((variant) => Number(variant.variant_id));
    const orderItemsResult = variantIds.length
      ? await admin
          .schema("sales")
          .from("order_item")
          .select("order_item_id, variant_id")
          .in("variant_id", variantIds)
      : { data: [], error: null };

    const orderItemsList = orderItemsResult.error ? [] : orderItemsResult.data ?? [];
    const orderItemIds = orderItemsList.map((item) =>
      Number(item.order_item_id),
    );
    const orderItemMap = new Map<number, number>(
      orderItemsList.map((item) => [Number(item.order_item_id), Number(item.variant_id)]),
    );

    const reviewsResult = orderItemIds.length
      ? await admin
          .schema("sales")
          .from("review")
          .select("review_id, customer_id, order_item_id, rating, review_content, created_at")
          .eq("review_status", "DISPLAY")
          .in("order_item_id", orderItemIds)
          .order("rating", { ascending: false })
          .order("created_at", { ascending: false })
      : { data: [], error: null };

    const safeReviewsResult = reviewsResult.error ? { data: [] } : reviewsResult;

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
    const safeInventoryRows =
      (inventoryResult.data as InventoryAvailabilityRow[] | null) ?? [];

    const sizeMap = new Map(
      (sizesResult.data ?? []).map((size) => [
        Number(size.size_option_id),
        String(size.size_name),
      ]),
    );
    const stockMap = new Map<number, number>();
    for (const row of safeInventoryRows) {
      const variantId = Number(row.variant_id);
      stockMap.set(
        variantId,
        (stockMap.get(variantId) ?? 0) + Math.max(0, Number(row.total_quantity ?? 0)),
      );
    }

    const displayReviews = safeReviewsResult.data ?? [];
    const reviewPreview = displayReviews.slice(0, 5);
    const customerIds = reviewPreview.map((review) => Number(review.customer_id));
    const customersResult = customerIds.length
      ? await admin
          .schema("iam")
          .from("customer")
          .select("customer_id, customer_name")
          .in("customer_id", customerIds)
      : { data: [], error: null };

    if (customersResult.error) {
      throw new Error(customersResult.error.message);
    }

    const customerMap = new Map(
      (customersResult.data ?? []).map((customer) => [
        Number(customer.customer_id),
        String(customer.customer_name ?? "Khach hang"),
      ]),
    );
    const avgRating = displayReviews.length
      ? displayReviews.reduce((sum, review) => sum + Number(review.rating), 0) /
        displayReviews.length
      : 0;
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const review of displayReviews) {
      const rating = Math.max(1, Math.min(5, Math.round(Number(review.rating)))) as 1 | 2 | 3 | 4 | 5;
      ratingCounts[rating] += 1;
    }
    const minPrice = variants.length
      ? Math.min(...variants.map((variant) => toNumber(variant.price)))
      : 0;

    const componentsList = componentsResult.data ?? [];
    const mappedComponents = componentsList.map((comp) => {
      const compVariants = variants.filter(v => Number(v.component_id) === Number(comp.component_id));
      const minPrice = compVariants.length > 0 ? Math.min(...compVariants.map(v => toNumber(v.price))) : 0;

      const compSizes = dedupeSizesByName(
        compVariants.map((variant) => {
          const stockQuantity = stockMap.get(Number(variant.variant_id)) ?? 0;
          return {
            variant_id: Number(variant.variant_id),
            size_name: variant.size_option_id
              ? sizeMap.get(Number(variant.size_option_id)) ?? ""
              : "",
            price: toNumber(variant.price),
            is_available: variant.status === "ACTIVE" && stockQuantity > 0,
            stock_quantity: stockQuantity,
          };
        })
      ).sort((a, b) => {
        const rankDifference = sizeRank(a.size_name) - sizeRank(b.size_name);
        return rankDifference || a.size_name.localeCompare(b.size_name, "vi");
      });

      return {
        component_id: Number(comp.component_id),
        component_name: String(comp.component_name),
        component_type: String(comp.component_type),
        is_required: Boolean(comp.is_required),
        display_order: Number(comp.display_order),
        min_price: minPrice,
        variants: compSizes,
      };
    });

    return ok(
      {
        product_line_id: productLineId,
        slug: productLine.slug,
        name: productLine.line_name,
        description: productLine.description,
        design_style: productLine.design_style,
        usage_context: productLine.usage_context,
        features: productLine.features
          ? String(productLine.features)
              .split(/\r?\n|[;•]/)
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        price: minPrice,
        currency: "VND",
        media: productMedia.map((item) => {
          const media = mediaMap.get(Number(item.media_id));
          return {
            url: mediaUrl(media?.storage_key, media?.bucket_name),
            media_type: media?.media_type ?? "IMAGE",
            media_role: item.media_role,
          };
        }),
        color: colorResult.data
          ? {
              color_name: colorResult.data.color_name,
              color_code: colorResult.data.color_code,
            }
          : null,
        sizes: dedupeSizesByName(
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
        }),
        material: materialResult.data,
        reviews_summary: {
          avg_rating: Math.round(avgRating * 10) / 10,
          total: displayReviews.length,
          preview_count: reviewPreview.length,
          has_more: displayReviews.length > reviewPreview.length,
          rating_counts: ratingCounts,
        },
        reviews_preview: reviewPreview.map((review) => {
          const variantId = orderItemMap.get(Number(review.order_item_id));
          const variant = variants.find((v) => Number(v.variant_id) === variantId);
          const sizeName = variant?.size_option_id
            ? sizeMap.get(Number(variant.size_option_id)) ?? "F"
            : "F";
          const colorName = colorResult.data?.color_name ?? "Mặc định";

          return {
            review_id: Number(review.review_id),
            customer_name:
              customerMap.get(Number(review.customer_id)) ?? "Khách hàng",
            rating: Number(review.rating),
            review_content: review.review_content,
            created_at: review.created_at,
            classification: `Màu: ${colorName} | Size: ${sizeName}`,
            media: [],
          };
        }),
        components: mappedComponents,
      },
      "Lay chi tiet san pham thanh cong.",
    );
  } catch (error) {
    console.error("[product-lines/[slug]/GET] failed", {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return fail(
      "Khong the tai chi tiet san pham.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
