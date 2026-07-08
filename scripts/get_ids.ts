import { createAdminClient } from "../src/lib/supabase/admin";

async function main() {
  // Load environment variables manually if tsx doesn't load them
  const dotenv = require("dotenv");
  dotenv.config();

  const supabase = createAdminClient();

  // 1. Get a customer
  const { data: customers, error: custError } = await supabase
    .schema("iam")
    .from("customer")
    .select("customer_id, customer_name, email")
    .limit(5);

  if (custError) {
    console.error("Error fetching customers:", custError);
  } else {
    console.log("Customers:");
    console.log(JSON.stringify(customers, null, 2));
  }

  // 2. Get some active product lines and their variants
  const { data: variants, error: varError } = await supabase
    .schema("catalog")
    .from("product_variant")
    .select(`
      variant_id,
      price,
      component_id,
      product_component!inner (
        component_name,
        product_line!inner (
          product_line_id,
          line_name,
          slug
        )
      )
    `)
    .eq("status", "ACTIVE")
    .limit(10);

  if (varError) {
    console.error("Error fetching variants:", varError);
  } else {
    console.log("Variants:");
    console.log(JSON.stringify(variants, null, 2));
  }
}

main().catch((err) => {
  console.error("Unhandled error:", err);
});
