import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = {
  slug: string;
};

function mediaUrl(storageKey?: string | null, bucketName?: string | null) {
  if (!storageKey) {
    return "/images/placeholder.png";
  }

  if (storageKey.startsWith("http://") || storageKey.startsWith("https://") || storageKey.startsWith("/")) {
    return storageKey;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return "/images/placeholder.png";
  }

  const normalizedKey = storageKey.replace(/^\/+/, "");
  const normalizedBucket = bucketName?.replace(/^\/+|\/+$/g, "");

  if (normalizedBucket && !normalizedKey.startsWith(`${normalizedBucket}/`)) {
    return `${supabaseUrl}/storage/v1/object/public/${normalizedBucket}/${normalizedKey}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${normalizedKey}`;
}

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "5")));
    const offset = (page - 1) * limit;

    const ratingFilter = searchParams.get("rating") ? Number(searchParams.get("rating")) : null;
    const hasImageFilter = searchParams.get("has_image") === "true";
    const componentIdFilter = searchParams.get("component_id") ? Number(searchParams.get("component_id")) : null;

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

    // 2. Get components
    const { data: components, error: compErr } = await supabase
      .schema("catalog")
      .from("product_component")
      .select("component_id, component_name")
      .eq("product_line_id", productLineId);

    if (compErr) throw new Error(compErr.message);
    const componentIds = (components || []).map((c) => Number(c.component_id));
    const componentList = (components || []).map((c) => ({
      component_id: Number(c.component_id),
      component_name: String(c.component_name),
    }));

    if (!componentIds.length) {
      return ok({ reviews: [], total: 0, has_more: false, components: [] }, "Thành công.");
    }

    // Filter component targets based on filterComponentId
    let targetComponentIds = componentIds;
    if (componentIdFilter) {
      targetComponentIds = componentIds.filter((id) => id === componentIdFilter);
    }

    // 3. Get variants for targeted components
    const { data: variants, error: varErr } = await supabase
      .schema("catalog")
      .from("product_variant")
      .select("variant_id, size_option_id")
      .in("component_id", targetComponentIds);

    if (varErr) throw new Error(varErr.message);
    const variantsList = variants || [];
    const variantIds = variantsList.map((v) => Number(v.variant_id));

    // 4. Get order items from standard variants
    const { data: standardOrderItems, error: itemsErr } = variantIds.length
      ? await admin
          .schema("sales")
          .from("order_item")
          .select("order_item_id, variant_id, customization_id, item_type")
          .in("variant_id", variantIds)
      : { data: [], error: null };

    if (itemsErr) {
      return ok({ reviews: [], total: 0, has_more: false, components: componentList }, "Thành công.");
    }

    const { data: customizationRequests, error: customReqErr } = await admin
      .schema("customization")
      .from("customization_request")
      .select("customization_id, component_id")
      .in("component_id", targetComponentIds);

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
      return ok({ reviews: [], total: 0, has_more: false, components: componentList }, "Thành công.");
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

    // Resolve review ids with media
    const { data: mediaReviewsList } = await admin
      .schema("sales")
      .from("review_media")
      .select("review_id");
    const mediaReviewIds = Array.from(new Set((mediaReviewsList || []).map((rm) => Number(rm.review_id))));

    // Calculate total count of reviews under current component filter
    const { count: allCount } = await admin
      .schema("sales")
      .from("review")
      .select("review_id", { count: "exact", head: true })
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds);
    const totalAll = allCount || 0;

    // Calculate total count of reviews with images under current component filter
    let totalImagesCount = 0;
    if (mediaReviewIds.length > 0) {
      const { count: imgCount } = await admin
        .schema("sales")
        .from("review")
        .select("review_id", { count: "exact", head: true })
        .eq("review_status", "DISPLAY")
        .in("order_item_id", orderItemIds)
        .in("review_id", mediaReviewIds);
      totalImagesCount = imgCount || 0;
    }

    // Calculate average rating of all reviews under current component filter
    let avgRating = 0;
    if (totalAll > 0) {
      const { data: allRevRatings } = await admin
        .schema("sales")
        .from("review")
        .select("rating")
        .eq("review_status", "DISPLAY")
        .in("order_item_id", orderItemIds);
      if (allRevRatings && allRevRatings.length > 0) {
        const sum = allRevRatings.reduce((acc: number, curr: any) => acc + Number(curr.rating), 0);
        avgRating = Math.round((sum / allRevRatings.length) * 10) / 10;
      }
    }

    if (hasImageFilter && mediaReviewIds.length === 0) {
      return ok({ reviews: [], total: 0, total_images: 0, avg_rating: 0, has_more: false, components: componentList }, "Thành công.");
    }

    // 5. Get reviews count matching active filters
    let countQuery = admin
      .schema("sales")
      .from("review")
      .select("review_id", { count: "exact", head: true })
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds);

    if (ratingFilter) {
      countQuery = countQuery.eq("rating", ratingFilter);
    }
    if (hasImageFilter) {
      countQuery = countQuery.in("review_id", mediaReviewIds);
    }

    const { count, error: countErr } = await countQuery;
    if (countErr) throw new Error(countErr.message);
    const total = count || 0;

    // 6. Get reviews paginated
    let revQuery = admin
      .schema("sales")
      .from("review")
      .select("review_id, customer_id, order_item_id, rating, review_content, created_at")
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds);

    if (ratingFilter) {
      revQuery = revQuery.eq("rating", ratingFilter);
    }
    if (hasImageFilter) {
      revQuery = revQuery.in("review_id", mediaReviewIds);
    }

    const { data: reviews, error: revErr } = await revQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (revErr) throw new Error(revErr.message);
    const reviewsList = reviews || [];

    // 7. Resolve customer names
    const customerIds = Array.from(new Set(reviewsList.map((r) => Number(r.customer_id))));
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

    // Resolve review media URLs
    const reviewIds = reviewsList.map((r) => Number(r.review_id));
    const { data: reviewMediaList } = reviewIds.length
      ? await admin
          .schema("sales")
          .from("review_media")
          .select("review_id, media_id")
          .in("review_id", reviewIds)
      : { data: [] };

    const reviewMediaIds = Array.from(new Set((reviewMediaList || []).map((rm) => Number(rm.media_id))));
    const { data: mediaItems } = reviewMediaIds.length
      ? await admin
          .schema("catalog")
          .from("media")
          .select("media_id, storage_key, bucket_name")
          .in("media_id", reviewMediaIds)
      : { data: [] };

    const mediaLookupMap = new Map((mediaItems || []).map((m) => [Number(m.media_id), m]));
    const reviewToMediaUrlsMap = new Map<number, string[]>();
    for (const rm of reviewMediaList || []) {
      const revId = Number(rm.review_id);
      const mId = Number(rm.media_id);
      const media = mediaLookupMap.get(mId);
      if (media) {
        const url = mediaUrl(media.storage_key, media.bucket_name);
        const urls = reviewToMediaUrlsMap.get(revId) ?? [];
        urls.push(url);
        reviewToMediaUrlsMap.set(revId, urls);
      }
    }

    // 10. Map everything together
    const formattedReviews = reviewsList.map((rev) => {
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
        media: (reviewToMediaUrlsMap.get(Number(rev.review_id)) ?? []).map((url) => ({
          url,
          media_type: "IMAGE",
        })),
      };
    });

    return ok(
      {
        reviews: formattedReviews,
        total,
        total_all: totalAll,
        total_images: totalImagesCount,
        avg_rating: avgRating,
        page,
        limit,
        has_more: offset + limit < total,
        components: componentList,
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
