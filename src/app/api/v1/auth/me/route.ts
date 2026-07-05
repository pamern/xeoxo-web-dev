import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  getCustomerProfileByAccountId,
  mapAuthUser,
} from "@/features/auth/auth.service";

export async function GET() {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return ok(
        {
          isAuthenticated: false,
          user: null,
          customer: null,
        },
        "Chưa đăng nhập."
      );
    }

    const customer = await getCustomerProfileByAccountId(user.id);

    return ok(
      {
        isAuthenticated: true,
        user: mapAuthUser(user),
        customer,
      },
      "Lấy thông tin người dùng thành công."
    );
  } catch (error) {
    console.error("[auth/me] Failed to load authenticated user.", error);

    return fail(
      "Không thể tải thông tin người dùng.",
      500,
      error instanceof Error ? error.message : error
    );
  }
}
