import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail } from "@/lib/api-response";
import { getCustomerReviews, REVIEWS_PAGE_SIZE } from "@/features/review/review.service";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const admin = createAdminClient();

    // 1. Get logged-in user session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return fail("Bạn cần đăng nhập để xem lịch sử đánh giá.", 401);
    }

    // 2. Fetch corresponding customer
    const { data: customer, error: custErr } = await admin
      .schema("iam")
      .from("customer")
      .select("customer_id, customer_name")
      .eq("account_id", user.id)
      .maybeSingle();

    if (custErr) throw new Error(custErr.message);
    if (!customer) {
      return ok({ reviews: [], total: 0, offset: 0, limit: REVIEWS_PAGE_SIZE }, "Chưa có đánh giá.");
    }

    const { searchParams } = new URL(request.url);
    const offsetParam = Number(searchParams.get("offset") ?? "0");
    const limitParam = Number(searchParams.get("limit") ?? REVIEWS_PAGE_SIZE);
    const offset = Number.isFinite(offsetParam) && offsetParam >= 0 ? offsetParam : 0;
    const limit =
      Number.isFinite(limitParam) && limitParam > 0 ? limitParam : REVIEWS_PAGE_SIZE;

    // 3. Fetch reviews from feature service
    const { reviews, total } = await getCustomerReviews(Number(customer.customer_id), {
      offset,
      limit,
    });

    // Return with customer name
    const result = reviews.map((r) => ({
      ...r,
      customer_name: customer.customer_name || "Khách hàng XÉO XỌ",
    }));

    return ok({ reviews: result, total, offset, limit }, "Thành công.");
  } catch (error: any) {
    console.error("Lỗi GET /api/v1/reviews:", error);
    return fail(error.message || "Lỗi máy chủ.", 500);
  }
}
