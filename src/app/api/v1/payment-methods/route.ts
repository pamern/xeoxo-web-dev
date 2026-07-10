import { unstable_cache } from "next/cache";
import { CACHE_TAGS, CACHE_TTL_SECONDS } from "@/lib/cache-policy";
import { fail, ok } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";

const getCachedPaymentMethods = unstable_cache(
  async () => {
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

    return (data ?? []).map((method) => ({
      ...method,
      provider: method.method_code,
      is_online: method.method_code !== "COD",
    }));
  },
  ["payment-methods"],
  {
    revalidate: CACHE_TTL_SECONDS.paymentMethods,
    tags: [CACHE_TAGS.paymentMethods],
  },
);

export async function GET() {
  try {
    return ok(await getCachedPaymentMethods(), "Lay phuong thuc thanh toan thanh cong.");
  } catch (error) {
    console.error("[payment-methods/GET]", error);
    return fail(
      "Khong the tai phuong thuc thanh toan.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
