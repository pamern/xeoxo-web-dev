import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail } from "@/lib/api-response";
import { getCustomerReviews } from "@/features/review/review.service";

export async function GET() {
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
      return ok([], "Chưa có đánh giá.");
    }

    // 3. Fetch reviews from feature service
    const reviews = await getCustomerReviews(Number(customer.customer_id));

    // Return with customer name
    const result = reviews.map((r) => ({
      ...r,
      customer_name: customer.customer_name || "Khách hàng XÉO XỌ",
    }));

    return ok(result, "Thành công.");
  } catch (error: any) {
    console.error("Lỗi GET /api/v1/reviews:", error);
    return fail(error.message || "Lỗi máy chủ.", 500);
  }
}
