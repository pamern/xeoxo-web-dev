import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = {
  slug: string;
};

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") ?? "5"));
    const offset = (page - 1) * limit;

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
      .select("component_id")
      .eq("product_line_id", productLineId);

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

    // 4. Get order items
    const { data: orderItems, error: itemsErr } = await admin
      .schema("sales")
      .from("order_item")
      .select("order_item_id, variant_id")
      .in("variant_id", variantIds);

    if (itemsErr) {
      // If admin has permission issues, fallback gracefully
      return ok({ reviews: [], total: 0, has_more: false }, "Thành công (Không có quyền đọc đơn hàng).");
    }

    const orderItemIds = (orderItems || []).map((item) => Number(item.order_item_id));
    if (!orderItemIds.length) {
      return ok({ reviews: [], total: 0, has_more: false }, "Thành công.");
    }

    const orderItemMap = new Map(
      (orderItems || []).map((item) => [Number(item.order_item_id), Number(item.variant_id)]),
    );

    // 5. Get reviews count
    const { count, error: countErr } = await admin
      .schema("sales")
      .from("review")
      .select("review_id", { count: "exact", head: true })
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds);

    if (countErr) throw new Error(countErr.message);
    const total = count || 0;

    // 6. Get reviews paginated
    const { data: reviews, error: revErr } = await admin
      .schema("sales")
      .from("review")
      .select("review_id, customer_id, order_item_id, rating, review_content, created_at")
      .eq("review_status", "DISPLAY")
      .in("order_item_id", orderItemIds)
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

    // 10. Map everything together
    const formattedReviews = reviewsList.map((rev) => {
      const variantId = orderItemMap.get(Number(rev.order_item_id));
      const variant = variantsList.find((v) => Number(v.variant_id) === variantId);
      const sizeName = variant?.size_option_id
        ? sizeMap.get(Number(variant.size_option_id)) ?? "F"
        : "F";

      return {
        review_id: Number(rev.review_id),
        customer_name: customerMap.get(Number(rev.customer_id)) ?? "Khách hàng",
        rating: Number(rev.rating),
        review_content: rev.review_content,
        created_at: rev.created_at,
        classification: `Màu: ${colorName} | Size: ${sizeName}`,
        media: [],
      };
    });

    return ok(
      {
        reviews: formattedReviews,
        total,
        page,
        limit,
        has_more: offset + limit < total,
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
