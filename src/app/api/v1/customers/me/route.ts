import { ok, fail } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
} from "@/features/auth/auth.service";
import {
  ensureCustomerProfile,
  updateCustomerProfileByAccountId,
} from "@/features/customers/customer-profile.service";
import {
  updateCustomerProfileSchema,
} from "@/validations/customer/update-customer-profile.schema";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return fail("Bạn cần đăng nhập để xem hồ sơ khách hàng.", 401);
    }

    const customer = await getCustomerProfileByAccountId(user.id);

    return ok(customer, "Lấy hồ sơ khách hàng thành công.");
  } catch (error) {
    console.error("[customers/me] Failed to load customer profile.", error);

    return fail(
      "Không thể tải hồ sơ khách hàng.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return fail("Bạn cần đăng nhập để cập nhật hồ sơ khách hàng.", 401);
    }

    const body = await request.json();
    const parsed = updateCustomerProfileSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu cập nhật không hợp lệ.",
        400,
      );
    }

    await ensureCustomerProfile(user);
    const customer = await updateCustomerProfileByAccountId(user.id, parsed.data);

    return ok(customer, "Cập nhật thông tin thành công.");
  } catch (error) {
    console.error("[customers/me] Failed to update customer profile.", error);

    return fail(
      "Không thể cập nhật hồ sơ khách hàng.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
