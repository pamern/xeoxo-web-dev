import { fail, ok } from "@/lib/api-response";
import { createClient } from "@/lib/supabase/server";
import {
  getAuthenticatedUser,
  isIamSchemaUnavailable,
} from "@/features/auth/auth.service";
import { syncCustomerProfile } from "@/features/auth/profile-sync.service";

export async function POST() {
  try {
    const supabase = await createClient();
    const user = await getAuthenticatedUser(supabase);

    if (!user) {
      return fail("Bạn cần đăng nhập để đồng bộ hồ sơ.", 401);
    }

    const customer = await syncCustomerProfile(user);

    return ok(
      {
        customer,
      },
      "Đồng bộ hồ sơ thành công.",
    );
  } catch (error) {
    if (isIamSchemaUnavailable(error)) {
      return ok(
        {
          customer: null,
        },
        "Schema iam chưa được expose trên Supabase Data API, tạm bỏ qua bước đồng bộ hồ sơ.",
      );
    }

    console.error(
      "[auth/sync-profile] Failed to sync customer profile.",
      error,
    );

    return fail(
      "Không thể đồng bộ hồ sơ khách hàng.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
