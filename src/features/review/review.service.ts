import { createAdminClient } from "@/lib/supabase/admin";
import { getProductMediaPublicUrl } from "@/lib/supabase/storage";

export async function getCustomerReviews(customerId: number) {
  const admin = createAdminClient();

  const { data: reviews, error: revErr } = await admin
    .schema("sales")
    .from("review")
    .select(`
      review_id,
      order_item_id,
      rating,
      review_content,
      created_at,
      updated_at
    `)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (revErr) {
    throw new Error(revErr.message);
  }

  const safeReviews = reviews || [];
  if (!safeReviews.length) {
    return [];
  }

  const orderItemIds = safeReviews.map((r) => Number(r.order_item_id));

  // Get order items details
  const { data: orderItems, error: oiErr } = await admin
    .schema("sales")
    .from("order_item")
    .select("order_item_id, unit_price, quantity, variant_id")
    .in("order_item_id", orderItemIds);

  if (oiErr) throw new Error(oiErr.message);
  const safeOrderItems = orderItems || [];

  const variantIds = safeOrderItems
    .map((item) => item.variant_id)
    .filter((id): id is number => typeof id === "number");

  // Get variant details
  const { data: variants, error: varErr } = await admin
    .schema("catalog")
    .from("product_variant")
    .select("variant_id, component_id, size_option_id")
    .in("variant_id", variantIds);

  if (varErr) throw new Error(varErr.message);
  const safeVariants = variants || [];

  const componentIds = safeVariants.map((v) => v.component_id);

  // Get component details
  const { data: components, error: compErr } = await admin
    .schema("catalog")
    .from("product_component")
    .select("component_id, product_line_id")
    .in("component_id", componentIds);

  if (compErr) throw new Error(compErr.message);
  const safeComponents = components || [];

  const productLineIds = safeComponents.map((c) => c.product_line_id);

  // Get product line details
  const { data: productLines, error: plErr } = await admin
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, line_name, slug, color_id")
    .in("product_line_id", productLineIds);

  if (plErr) throw new Error(plErr.message);
  const safeProductLines = productLines || [];

  // Get sizes details
  const sizeIds = safeVariants
    .map((v) => v.size_option_id)
    .filter((id): id is number => typeof id === "number");

  const { data: sizes, error: szErr } = sizeIds.length
    ? await admin
        .schema("catalog")
        .from("size_option")
        .select("size_option_id, size_name")
        .in("size_option_id", sizeIds)
    : { data: [], error: null };

  if (szErr) throw new Error(szErr.message);
  const safeSizes = sizes || [];

  // Get colors details
  const colorIds = safeProductLines
    .map((pl) => pl.color_id)
    .filter((id): id is number => typeof id === "number");

  const { data: colors, error: clrErr } = colorIds.length
    ? await admin
        .schema("catalog")
        .from("color")
        .select("color_id, color_name")
        .in("color_id", colorIds)
    : { data: [], error: null };

  if (clrErr) throw new Error(clrErr.message);
  const safeColors = colors || [];

  // Get main images
  const { data: lineMedia, error: lmErr } = await admin
    .schema("catalog")
    .from("product_line_media")
    .select("product_line_id, media_id, media_role, display_order")
    .in("product_line_id", productLineIds);

  if (lmErr) throw new Error(lmErr.message);
  const safeLineMedia = lineMedia || [];

  const mediaIds = safeLineMedia.map((lm) => lm.media_id);
  const { data: mediaItems, error: mErr } = mediaIds.length
    ? await admin
        .schema("catalog")
        .from("media")
        .select("media_id, storage_key, alt_text")
        .in("media_id", mediaIds)
    : { data: [], error: null };

  if (mErr) throw new Error(mErr.message);
  const safeMedia = mediaItems || [];

  // Map helper structures
  const orderItemMap = new Map(safeOrderItems.map((item) => [item.order_item_id, item]));
  const variantMap = new Map(safeVariants.map((v) => [v.variant_id, v]));
  const componentMap = new Map(safeComponents.map((c) => [c.component_id, c]));
  const productLineMap = new Map(safeProductLines.map((pl) => [pl.product_line_id, pl]));
  const sizeMap = new Map(safeSizes.map((s) => [s.size_option_id, s]));
  const colorMap = new Map(safeColors.map((c) => [c.color_id, c]));
  const mediaMap = new Map(safeMedia.map((m) => [m.media_id, m]));
  const mediaByLine = new Map<number, typeof safeLineMedia>();

  for (const lm of safeLineMedia) {
    const list = mediaByLine.get(lm.product_line_id) ?? [];
    list.push(lm);
    mediaByLine.set(lm.product_line_id, list);
  }

  // Get review media
  const reviewIds = safeReviews.map((r) => Number(r.review_id));
  const { data: reviewMediaLinks, error: rmlErr } = reviewIds.length
    ? await admin
        .schema("sales")
        .from("review_media")
        .select("review_id, media_id")
        .in("review_id", reviewIds)
    : { data: [], error: null };

  if (rmlErr) throw new Error(rmlErr.message);
  const safeReviewMediaLinks = reviewMediaLinks || [];

  const reviewMediaIds = safeReviewMediaLinks.map((rml) => rml.media_id);
  const { data: reviewMediaRows, error: rmrErr } = reviewMediaIds.length
    ? await admin
        .schema("catalog")
        .from("media")
        .select("media_id, storage_key, media_type")
        .in("media_id", reviewMediaIds)
    : { data: [], error: null };

  if (rmrErr) throw new Error(rmrErr.message);
  const safeReviewMediaRows = reviewMediaRows || [];

  const reviewMediaMap = new Map(
    safeReviewMediaRows.map((row) => {
      const publicUrl = getProductMediaPublicUrl(admin, row.storage_key);
      return [
        row.media_id,
        {
          media_id: Number(row.media_id),
          public_url: publicUrl || "/images/placeholder.png",
          media_type: row.media_type,
        },
      ];
    })
  );

  const mediaByReview = new Map<number, any[]>();
  for (const link of safeReviewMediaLinks) {
    const mediaObj = reviewMediaMap.get(link.media_id);
    if (mediaObj) {
      const list = mediaByReview.get(Number(link.review_id)) ?? [];
      list.push(mediaObj);
      mediaByReview.set(Number(link.review_id), list);
    }
  }

  const result = [];

  for (const r of safeReviews) {
    const item = orderItemMap.get(r.order_item_id);
    if (!item) continue;

    const variant = item.variant_id ? variantMap.get(item.variant_id) : undefined;
    const component = variant ? componentMap.get(variant.component_id) : undefined;
    const productLine = component ? productLineMap.get(component.product_line_id) : undefined;
    const size = variant?.size_option_id ? sizeMap.get(variant.size_option_id)?.size_name ?? null : null;
    const color = productLine?.color_id ? colorMap.get(productLine.color_id)?.color_name ?? null : null;

    const lineMediaRecords = productLine ? [...(mediaByLine.get(productLine.product_line_id) ?? [])] : [];
    const mainMedia = lineMediaRecords.find((record) => record.media_role === "MAIN") ??
      lineMediaRecords.sort((a, b) => a.display_order - b.display_order)[0];
    const mediaRecord = mainMedia ? mediaMap.get(mainMedia.media_id) : undefined;
    const imageSrc = getProductMediaPublicUrl(admin, mediaRecord?.storage_key) ?? "/images/placeholder.png";

    const parts = [color, size].filter(Boolean);

    result.push({
      review_id: Number(r.review_id),
      order_item_id: Number(r.order_item_id),
      rating: Number(r.rating),
      review_content: r.review_content || "",
      created_at: r.created_at,
      updated_at: r.updated_at,
      is_edited: r.updated_at !== null,
      price: Number(item.unit_price || 0),
      quantity: Number(item.quantity || 1),
      product_slug: productLine?.slug ?? "",
      product_title: productLine?.line_name ?? "Sản phẩm",
      product_subtitle: parts.length ? parts.join(" - ") : "Tùy chọn mặc định",
      image_src: imageSrc,
      media: mediaByReview.get(Number(r.review_id)) ?? [],
    });
  }

  return result;
}
