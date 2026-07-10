import dotenv from "dotenv";
dotenv.config();
import { createAdminClient } from "./src/lib/supabase/admin";

async function main() {
  const admin = createAdminClient();
  
  // 1. Get all reviews
  const { data: reviews } = await admin
    .schema("sales")
    .from("review")
    .select("review_id, order_item_id, rating, review_content");
  
  console.log("REVIEWS IN DB:", reviews?.length, reviews);

  if (reviews && reviews.length > 0) {
    const orderItemIds = reviews.map((r: any) => Number(r.order_item_id));
    
    // 2. Get order items for these reviews
    const { data: orderItems } = await admin
      .schema("sales")
      .from("order_item")
      .select("order_item_id, variant_id, customization_id")
      .in("order_item_id", orderItemIds);
      
    console.log("ORDER ITEMS FOR REVIEWS:", orderItems);

    if (orderItems && orderItems.length > 0) {
      const variantIds = orderItems.map((oi: any) => oi.variant_id).filter(Boolean);
      
      // 3. Get variants and their product lines
      if (variantIds.length > 0) {
        const { data: variants } = await admin
          .schema("catalog")
          .from("product_variant")
          .select("variant_id, component_id")
          .in("variant_id", variantIds);
          
        console.log("VARIANTS FOR REVIEWS:", variants);
        
        if (variants && variants.length > 0) {
          const componentIds = variants.map((v: any) => v.component_id).filter(Boolean);
          
          const { data: components } = await admin
            .schema("catalog")
            .from("product_component")
            .select("component_id, product_line_id, component_name")
            .in("component_id", componentIds);
            
          console.log("COMPONENTS FOR REVIEWS:", components);

          if (components && components.length > 0) {
            const productLineIds = components.map((c: any) => c.product_line_id).filter(Boolean);
            const { data: productLines } = await admin
              .schema("catalog")
              .from("product_line")
              .select("product_line_id, product_line_name, slug")
              .in("product_line_id", productLineIds);
              
            console.log("PRODUCT LINES FOR REVIEWS:", productLines);
          }
        }
      }
    }
  }
}

main().catch(console.error);
