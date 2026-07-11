import { createAdminClient } from "@/lib/supabase/admin";
import { ok, fail } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data: branches, error } = await admin
      .schema("iam")
      .from("branch")
      .select("branch_id, branch_name");

    if (error) {
      return fail(error.message, 500);
    }

    const formattedBranches = (branches || []).map((b) => ({
      label: b.branch_name,
      value: String(b.branch_id),
    }));

    return ok(formattedBranches);
  } catch (e: any) {
    return fail(e.message || "Không thể tải danh sách chi nhánh", 500);
  }
}
