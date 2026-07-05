import { createClient } from "@supabase/supabase-js";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET() {
  try {
    // Sử dụng service role admin client để có thể đọc vượt qua RLS của bảng province
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await adminClient
      .schema("iam")
      .from("province")
      .select("province_id, province_name, region, ward")
      .order("province_name", { ascending: true });

    if (error) {
      return fail(error.message, 500);
    }

    return ok(data);
  } catch (err) {
    return fail(
      err instanceof Error ? err.message : "Internal Server Error",
      500
    );
  }
}
