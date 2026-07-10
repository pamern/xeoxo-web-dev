import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

type Params = {
  slug: string;
};

export async function GET(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const orderItemIdParam = searchParams.get("order_item_id");
    if (orderItemIdParam) {
      const orderItemId = Number(orderItemIdParam);
      if (Number.isNaN(orderItemId)) {
        return fail("Mã dòng đơn hàng không hợp lệ.", 400);
      }

      const supabase = await createClient();
      const admin = createAdminClient();

      // Get authenticated customer
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return fail("Bạn cần đăng nhập để xem đánh giá.", 401);
      }

      const { data: customer } = await admin
        .schema("iam")
        .from("customer")
        .select("customer_id")
        .eq("account_id", user.id)
        .maybeSingle();

      if (!customer) {
        return fail("Khách hàng không tồn tại.", 404);
      }

      // Fetch the review
      const { data: review, error: revErr } = await admin
        .schema("sales")
        .from("review")
        .select("review_id, customer_id, order_item_id, rating, review_content, created_at, updated_at")
        .eq("order_item_id", orderItemId)
        .eq("customer_id", Number(customer.customer_id))
        .maybeSingle();

      if (revErr) throw new Error(revErr.message);
      if (!review) {
        return ok(null, "Chưa có đánh giá.");
      }

      // Fetch review media
      const { data: revMediaLinks } = await admin
        .schema("sales")
        .from("review_media")
        .select("media_id")
        .eq("review_id", review.review_id);

      const mediaIds = (revMediaLinks || []).map((link) => Number(link.media_id));
      let mediaItems: any[] = [];
      if (mediaIds.length > 0) {
        const { data: mediaRows } = await admin
          .schema("catalog")
          .from("media")
          .select("media_id, storage_key, media_type")
          .in("media_id", mediaIds);

        mediaItems = (mediaRows || []).map((row) => {
          const { data: { publicUrl } } = admin.storage
            .from("product-media")
            .getPublicUrl(row.storage_key);
          return {
            media_id: Number(row.media_id),
            public_url: publicUrl,
            media_type: row.media_type,
          };
        });
      }

      return ok(
        {
          ...review,
          media: mediaItems,
          is_edited: review.updated_at !== null,
        },
        "Thành công."
      );
    }

    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "5")));
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
      .order("rating", { ascending: false })
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

    // Fetch media associated with reviews
    const reviewIds = reviewsList.map((r) => Number(r.review_id));
    const { data: allReviewMedia } = reviewIds.length
      ? await admin
          .schema("sales")
          .from("review_media")
          .select("review_id, media_id, display_order")
          .in("review_id", reviewIds)
          .order("display_order", { ascending: true })
      : { data: [] };

    const allMediaIds = Array.from(new Set((allReviewMedia || []).map((m) => Number(m.media_id))));
    const { data: allMediaRows } = allMediaIds.length
      ? await admin
          .schema("catalog")
          .from("media")
          .select("media_id, storage_key, media_type")
          .in("media_id", allMediaIds)
      : { data: [] };

    const mediaMapById = new Map(
      (allMediaRows || []).map((row) => {
        const { data: { publicUrl } } = admin.storage
          .from("product-media")
          .getPublicUrl(row.storage_key);
        return [
          Number(row.media_id),
          {
            media_id: Number(row.media_id),
            public_url: publicUrl,
            media_type: row.media_type,
          },
        ];
      })
    );

    const mediaByReviewId = new Map<number, any[]>();
    (allReviewMedia || []).forEach((link) => {
      const rId = Number(link.review_id);
      const mId = Number(link.media_id);
      const mediaItem = mediaMapById.get(mId);
      if (mediaItem) {
        if (!mediaByReviewId.has(rId)) {
          mediaByReviewId.set(rId, []);
        }
        mediaByReviewId.get(rId)!.push(mediaItem);
      }
    });

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
        media: mediaByReviewId.get(Number(rev.review_id)) ?? [],
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

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { order_item_id, rating, review_content, media_ids } = body;

    if (!order_item_id || !rating) {
      return fail("Thiếu thông tin đánh giá (order_item_id, rating).", 400);
    }

    const ratingVal = Number(rating);
    if (ratingVal < 1 || ratingVal > 5) {
      return fail("Số sao đánh giá phải từ 1 đến 5.", 400);
    }

    const supabase = await createClient();
    const admin = createAdminClient();

    // 1. Get current logged in customer
    const { data: { user } } = await supabase.auth.getUser();
    let customerId: number | null = null;

    if (user) {
      const { data: customer, error: custErr } = await admin
        .schema("iam")
        .from("customer")
        .select("customer_id")
        .eq("account_id", user.id)
        .maybeSingle();

      if (custErr) throw new Error(custErr.message);
      if (customer) {
        customerId = Number(customer.customer_id);
      }
    }

    if (!customerId) {
      return fail("Bạn cần đăng nhập để thực hiện đánh giá.", 401);
    }

    // 2. Verify that this order_item belongs to the customer
    const { data: orderItem, error: itemErr } = await admin
      .schema("sales")
      .from("order_item")
      .select(`
        order_item_id,
        variant_id,
        sales_order!inner(
          order_id,
          customer_id
        )
      `)
      .eq("order_item_id", order_item_id)
      .maybeSingle();

    if (itemErr) throw new Error(itemErr.message);
    if (!orderItem) {
      return fail("Không tìm thấy dòng sản phẩm trong đơn hàng.", 404);
    }

    const orderObj = orderItem.sales_order as any;
    if (Number(orderObj.customer_id) !== customerId) {
      return fail("Bạn không có quyền đánh giá sản phẩm này.", 403);
    }

    // 3. Verify product slug matches the variant's product line
    const { data: productLine, error: pLineErr } = await supabase
      .schema("catalog")
      .from("product_line")
      .select("product_line_id")
      .eq("slug", slug)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (pLineErr) throw new Error(pLineErr.message);
    if (!productLine) {
      return fail("Sản phẩm không khả dụng.", 404);
    }

    const productLineId = Number(productLine.product_line_id);

    // Get variant component
    const { data: variant, error: varErr } = await supabase
      .schema("catalog")
      .from("product_variant")
      .select(`
        variant_id,
        component_id,
        product_component!inner(
          product_line_id
        )
      `)
      .eq("variant_id", Number(orderItem.variant_id))
      .maybeSingle();

    if (varErr) throw new Error(varErr.message);
    if (!variant || Number((variant.product_component as any).product_line_id) !== productLineId) {
      return fail("Sản phẩm đánh giá không thuộc dòng sản phẩm này.", 400);
    }

    // 4. Check if review already exists to support edit/upsert
    const { data: existingReview, error: revErr } = await admin
      .schema("sales")
      .from("review")
      .select("review_id, updated_at")
      .eq("order_item_id", order_item_id)
      .maybeSingle();

    if (revErr) throw new Error(revErr.message);

    let resultId: number;
    if (existingReview) {
      if (existingReview.updated_at !== null) {
        return fail("Bạn đã chỉnh sửa đánh giá này rồi và không thể chỉnh sửa thêm nữa.", 400);
      }
      // Update existing review
      const { data: updated, error: updErr } = await admin
        .schema("sales")
        .from("review")
        .update({
          rating: ratingVal,
          review_content: review_content || "",
          review_status: "DISPLAY",
          updated_at: new Date().toISOString(),
        })
        .eq("review_id", existingReview.review_id)
        .select("review_id")
        .single();

      if (updErr) throw new Error(updErr.message);
      resultId = Number(updated.review_id);
    } else {
      // Insert new review
      const { data: inserted, error: insErr } = await admin
        .schema("sales")
        .from("review")
        .insert({
          customer_id: customerId,
          order_item_id: order_item_id,
          rating: ratingVal,
          review_content: review_content || "",
          review_status: "DISPLAY",
          created_at: new Date().toISOString(),
        })
        .select("review_id")
        .single();

      if (insErr) throw new Error(insErr.message);
      resultId = Number(inserted.review_id);
    }

    // Sync media links in sales.review_media
    const { error: delMediaErr } = await admin
      .schema("sales")
      .from("review_media")
      .delete()
      .eq("review_id", resultId);

    if (delMediaErr) throw new Error(delMediaErr.message);

    if (media_ids && Array.isArray(media_ids) && media_ids.length > 0) {
      const mediaInserts = media_ids.map((mediaId, idx) => ({
        review_id: resultId,
        media_id: Number(mediaId),
        display_order: idx,
        created_at: new Date().toISOString(),
      }));

      const { error: insMediaErr } = await admin
        .schema("sales")
        .from("review_media")
        .insert(mediaInserts);

      if (insMediaErr) throw new Error(insMediaErr.message);
    }

    // Invalidate caches to refresh data on purchase history, specific order detail, & review list
    revalidatePath("/account/orders");
    const salesOrder = Array.isArray(orderItem?.sales_order)
      ? orderItem.sales_order[0]
      : (orderItem?.sales_order as any);
    const orderId = salesOrder?.order_id;
    if (orderId) {
      revalidatePath(`/account/orders/${orderId}`);
    }
    revalidatePath("/account/reviews");

    return ok({ review_id: resultId }, "Đánh giá sản phẩm thành công.");
  } catch (error: any) {
    console.error("[reviews/POST]", error);
    return fail(
      "Không thể lưu đánh giá.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
