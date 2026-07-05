import { fail, ok } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .schema("sales")
      .from("payment_method")
      .select("method_id, method_code, method_name, is_active")
      .eq("is_active", true)
      .order("method_id", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return ok(
      (data ?? []).map((method) => ({
        ...method,
        provider: method.method_code,
        is_online: method.method_code !== "COD",
      })),
      "Lay phuong thuc thanh toan thanh cong.",
    );
  } catch (error) {
    console.error("[payment-methods/GET]", error);
    return fail(
      "Khong the tai phuong thuc thanh toan.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

