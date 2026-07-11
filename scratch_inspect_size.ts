import { createAdminClient } from "./src/lib/supabase/admin";

async function main() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("catalog")
    .from("size_chart")
    .select("*");

  if (error) {
    console.error("Error:", error);
    return;
  }
  console.log("RAW SIZE CHARTS:", JSON.stringify(data, null, 2));
}

main().catch(console.error);
