import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = {
  slug: string;
};

function mediaUrl(storageKey?: string | null, bucketName?: string | null) {
  if (!storageKey) return "/images/placeholder.png";
  if (storageKey.startsWith("http://") || storageKey.startsWith("https://") || storageKey.startsWith("/")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      try {
        const targetHost = new URL(supabaseUrl).host;
        return storageKey
          .replace(/127\.0\.0\.1:15431/g, targetHost)
          .replace(/localhost:15431/g, targetHost);
      } catch (e) {}
    }
    return storageKey;
  }
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:15431";
  const normalizedKey = storageKey.replace(/^\/+/, "");
  const normalizedBucket = bucketName?.replace(/^\/+|\/+$/g, "") || "product-media";
  return `${supabaseUrl}/storage/v1/object/public/${normalizedBucket}/${normalizedKey}`;
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "5")));
    const offset = (page - 1) * limit;

    const ratingVal = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;
    const hasImageVal = searchParams.get("has_image") === "true";
    const componentIdVal = searchParams.get("component_id") ? Number(searchParams.get("component_id")) : null;

    const supabase = await createClient();
    const admin = createAdminClient();

    // 1. Get product line
    const { data: productLine, error: pLineErr } = await supabase
      .schema("catalog")
      .from("product_line")
      .select("product_line_id, color_id")
      .eq("slug", slug)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (pLineErr) throw new Error(pLineErr.message);
    if (!productLine) {
      return fail("Khong tim thay san pham.", 404);
    }

    const productLineId = Number(productLine.product_line_id);

    // 2. Get components (filtered by componentIdVal if provided)
    let compQuery = supabase
      .schema("catalog")
      .from("product_component")
      .select("component_id, component_name")
      .eq("product_line_id", productLineId);

    if (componentIdVal !== null) {
      compQuery = compQuery.eq("component_id", componentIdVal);
    }

    const { data: components, error: compErr } = await compQuery;
    if (compErr) throw new Error(compErr.message);
    const componentIds = (components || []).map((c) => Number(c.component_id));

    if (!componentIds.length) {
      return ok({ reviews: [], total: 0, has_more: false }, "Thành công.");
    }

    // 3. Get variants
    const { data: variants, error: varErr } = await supabase
      .schema("catalog")
      .from("product_variant")
      .select("variant_id, size_option_id")
      .in("component_id", componentIds);

    if (varErr) throw new Error(varErr.message);
    const variantsList = variants || [];
    const variantIds = variantsList.map((v) => Number(v.variant_id));

    if (!variantIds.length) {
      return ok({ reviews: [], total: 0, has_more: false }, "Thành công.");
    }

    // 4. Get order items from both standard variants and customized requests.
    const { data: standardOrderItems, error: itemsErr } = await admin
      .schema("sales")
      .from("order_item")
      .select("order_item_id, variant_id, customization_id, item_type")
      .in("variant_id", variantIds);

    if (itemsErr) {
      return ok({ reviews: [], total: 0, has_more: false }, "Thành công (Không có quyền đọc đơn hàng).");
    }

    const { data: customizationRequests, error: customReqErr } = await admin
      .schema("customization")
      .from("customization_request")
      .select("customization_id, component_id")
      .in("component_id", componentIds);

    if (customReqErr) throw new Error(customReqErr.message);

    const customizationIds = (customizationRequests || []).map((item) =>
      Number(item.customization_id),
    );
    const { data: customOrderItems, error: customItemsErr } = customizationIds.length
      ? await admin
        .schema("sales")
        .from("order_item")
        .select("order_item_id, variant_id, customization_id, item_type")
        .in("customization_id", customizationIds)
      : { data: [], error: null };

    if (customItemsErr) throw new Error(customItemsErr.message);

    const orderItemsById = new Map<number, {
      order_item_id: number;
      variant_id: number | null;
      customization_id: number | null;
      item_type: string | null;
    }>();
    for (const item of [...(standardOrderItems || []), ...(customOrderItems || [])]) {
      orderItemsById.set(Number(item.order_item_id), {
        order_item_id: Number(item.order_item_id),
        variant_id: item.variant_id == null ? null : Number(item.variant_id),
        customization_id:
          item.customization_id == null ? null : Number(item.customization_id),
        item_type: item.item_type == null ? null : String(item.item_type),
      });
    }

    const orderItems = [...orderItemsById.values()];
    const orderItemIds = orderItems.map((item) => Number(item.order_item_id));
    if (!orderItemIds.length) {
      return ok({ reviews: [], total: 0, has_more: false }, "Thành công.");
    }

    const orderItemMap = new Map(
      orderItems
        .filter((item) => item.variant_id != null)
        .map((item) => [Number(item.order_item_id), Number(item.variant_id)]),
    );
    const orderItemCustomizationMap = new Map(
      orderItems
        .filter((item) => item.customization_id != null)
        .map((item) => [
          Number(item.order_item_id),
          Number(item.customization_id),
        ]),
    );

    // 5. Query ALL reviews for statistics (total_all, avg_rating, total_images)
    const { data: allReviewsForStats, error: statsErr } = await admin
      .schema("sales")
      .from("review")
      .select("review_id, rating")
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds);

    if (statsErr) throw new Error(statsErr.message);

    const total_all = allReviewsForStats.length;
    const avg_rating = total_all > 0
      ? Number((allReviewsForStats.reduce((sum, r) => sum + Number(r.rating), 0) / total_all).toFixed(1))
      : 0;

    const allReviewIds = allReviewsForStats.map((r) => Number(r.review_id));
    const { data: allMediaAssoc } = allReviewIds.length
      ? await admin
          .schema("sales")
          .from("review_media")
          .select("review_id")
          .in("review_id", allReviewIds)
      : { data: [] };

    const reviewsWithMediaSet = new Set((allMediaAssoc || []).map((m) => Number(m.review_id)));
    const total_images = reviewsWithMediaSet.size;

    // 6. Build the filtered queries for count and data separately
    let countQuery = admin
      .schema("sales")
      .from("review")
      .select("review_id", { count: "exact", head: true })
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds);

    let dataQuery = admin
      .schema("sales")
      .from("review")
      .select("review_id, customer_id, order_item_id, rating, review_content, created_at")
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds);

    if (ratingVal !== null) {
      countQuery = countQuery.eq("rating", ratingVal);
      dataQuery = dataQuery.eq("rating", ratingVal);
    }

    if (hasImageVal) {
      countQuery = countQuery.in("review_id", Array.from(reviewsWithMediaSet));
      dataQuery = dataQuery.in("review_id", Array.from(reviewsWithMediaSet));
    }

    // Get exact count and reviews page safely
    let filteredCount = 0;
    let reviewsListRaw: any[] = [];

    if (hasImageVal && reviewsWithMediaSet.size === 0) {
      filteredCount = 0;
      reviewsListRaw = [];
    } else {
      const { count: countVal, error: countErr } = await countQuery;
      if (countErr) throw new Error(countErr.message);
      filteredCount = countVal || 0;

      const { data: dataVal, error: revListErr } = await dataQuery
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);
      if (revListErr) throw new Error(revListErr.message);
      reviewsListRaw = dataVal || [];
    }

    const total = Math.min(filteredCount, 500); // Cap at 500 reviews (50 pages max)
    const reviewsList = reviewsListRaw;

    // 7. Resolve customer names
    const customerIds = Array.from(new Set(reviewsList.map((r: any) => Number(r.customer_id))));
    const { data: customers } = customerIds.length
      ? await admin
        .schema("iam")
        .from("customer")
        .select("customer_id, customer_name")
        .in("customer_id", customerIds)
      : { data: [] };

    const customerMap = new Map(
      (customers || []).map((c) => [Number(c.customer_id), String(c.customer_name ?? "Khách hàng")]),
    );

    // 8. Resolve size options
    const sizeIds = Array.from(
      new Set(
        variantsList
          .map((v) => v.size_option_id)
          .filter((id): id is number => typeof id === "number"),
      ),
    );
    const { data: sizes } = sizeIds.length
      ? await supabase
        .schema("catalog")
        .from("size_option")
        .select("size_option_id, size_name")
        .in("size_option_id", sizeIds)
      : { data: [] };

    const sizeMap = new Map(
      (sizes || []).map((s) => [Number(s.size_option_id), String(s.size_name)]),
    );

    // 9. Resolve product line color
    let colorName = "Mặc định";
    if (productLine.color_id) {
      const { data: color } = await supabase
        .schema("catalog")
        .from("color")
        .select("color_name")
        .eq("color_id", Number(productLine.color_id))
        .maybeSingle();
      if (color?.color_name) colorName = color.color_name;
    }

    // 10. Fetch review media for this page's reviews
    const pageReviewIds = reviewsList.map((r: any) => Number(r.review_id));
    const { data: pageMediaRows } = pageReviewIds.length
      ? await admin
          .schema("sales")
          .from("review_media")
          .select("review_id, media_id")
          .in("review_id", pageReviewIds)
      : { data: [] };

    const pageMediaIds = (pageMediaRows || []).map((mr: any) => Number(mr.media_id));
    const { data: mediaFiles } = pageMediaIds.length
      ? await admin
          .schema("catalog")
          .from("media")
          .select("media_id, storage_key, bucket_name")
          .in("media_id", pageMediaIds)
      : { data: [] };

    const reviewMediaMap = new Map(
      (mediaFiles || []).map((m) => [Number(m.media_id), m])
    );

    const mediaByReviewId = new Map<number, { url: string }[]>();
    for (const assoc of pageMediaRows || []) {
      const rId = Number(assoc.review_id);
      const mId = Number(assoc.media_id);
      const mediaFile = reviewMediaMap.get(mId);
      if (mediaFile) {
        const list = mediaByReviewId.get(rId) ?? [];
        list.push({ url: mediaUrl(mediaFile.storage_key, mediaFile.bucket_name) });
        mediaByReviewId.set(rId, list);
      }
    }

    // 11. Map everything together
    const formattedReviews = reviewsList.map((rev: any) => {
      const variantId = orderItemMap.get(Number(rev.order_item_id));
      const variant = variantsList.find((v) => Number(v.variant_id) === variantId);
      const sizeName = orderItemCustomizationMap.has(Number(rev.order_item_id))
        ? "Custom"
        : variant?.size_option_id
          ? sizeMap.get(Number(variant.size_option_id)) ?? "F"
          : "F";

      return {
        review_id: Number(rev.review_id),
        customer_name: customerMap.get(Number(rev.customer_id)) ?? "Khách hàng",
        rating: Number(rev.rating),
        review_content: rev.review_content,
        created_at: rev.created_at,
        classification: `Màu: ${colorName} | Size: ${sizeName}`,
        media: mediaByReviewId.get(Number(rev.review_id)) ?? [],
      };
    });

    // Get all components belonging to the product line (for the dropdown component filter selection)
    const { data: allComponentsForDropdown } = await supabase
      .schema("catalog")
      .from("product_component")
      .select("component_id, component_name")
      .eq("product_line_id", productLineId);

    const componentsList = (allComponentsForDropdown || []).map((c) => ({
      component_id: Number(c.component_id),
      component_name: String(c.component_name)
    }));

    return ok(
      {
        reviews: formattedReviews,
        total,
        page,
        limit,
        has_more: offset + limit < total,
        total_all,
        total_images,
        avg_rating,
        components: componentsList
      },
      "Thành công.",
    );
  } catch (error: any) {
    console.error("[reviews/GET]", error);
    return fail(
      "Không thể tải đánh giá.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
