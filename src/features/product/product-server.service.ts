import { createAdminClient } from "@/lib/supabase/admin";
import type { Product } from "@/types/product.types";

function mediaUrl(storageKey?: string | null, bucketName?: string | null) {
  if (!storageKey) {
    return "/images/placeholder.png";
  }

  if (storageKey.startsWith("http://") || storageKey.startsWith("https://") || storageKey.startsWith("/")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      try {
        const targetHost = new URL(supabaseUrl).host;
        return storageKey
          .replace(/127\.0\.0\.1:15431/g, targetHost)
          .replace(/localhost:15431/g, targetHost);
      } catch (e) {
        // ignore invalid URL
      }
    }
    return storageKey;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return "/images/placeholder.png";
  }

  const normalizedKey = storageKey.replace(/^\/+/, "");
  const normalizedBucket = bucketName?.replace(/^\/+|\/+$/g, "");

  if (normalizedBucket && !normalizedKey.startsWith(`${normalizedBucket}/`)) {
    return `${supabaseUrl}/storage/v1/object/public/${normalizedBucket}/${normalizedKey}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/${normalizedKey}`;
}

export async function getRelatedProducts(slug: string, limit = 5): Promise<Product[]> {
  const admin = createAdminClient();

  // 1. Lấy thông tin sản phẩm hiện tại
  const { data: currentProduct, error: currentError } = await admin
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, collection_id, slug, line_name")
    .eq("slug", slug)
    .eq("status", "ACTIVE")
    .maybeSingle();

  if (currentError || !currentProduct) {
    if (currentError) {
      console.error("[related-products] current product query failed", currentError);
    }
    return [];
  }

  const currentProductId = Number(currentProduct.product_line_id);

  // Lấy các category của sản phẩm hiện tại
  const { data: currentCategories } = await admin
    .schema("catalog")
    .from("line_category")
    .select("category_id")
    .eq("product_line_id", currentProductId);

  const currentCategoryIds = (currentCategories || []).map((c) => Number(c.category_id));

  // Xác định department của sản phẩm hiện tại từ category
  let currentDepartment: string | null = null;
  if (currentCategoryIds.length > 0) {
    const { data: cats } = await admin
      .schema("catalog")
      .from("category")
      .select("department")
      .in("category_id", currentCategoryIds);

    const departments = (cats || []).map((c) => c.department).filter(Boolean);
    if (departments.length > 0) {
      currentDepartment = departments[0];
    }
  }

  // 2. Lấy danh sách tất cả các sản phẩm ACTIVE khác làm ứng viên
  const { data: allActiveProducts, error: activeError } = await admin
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, collection_id, slug, line_name, created_at")
    .eq("status", "ACTIVE")
    .neq("product_line_id", currentProductId);

  if (activeError || !allActiveProducts) {
    if (activeError) {
      console.error("[related-products] active products query failed", activeError);
    }
    return [];
  }

  // Lấy toàn bộ line_category để map cho ứng viên
  const { data: allLineCategories } = await admin
    .schema("catalog")
    .from("line_category")
    .select("product_line_id, category_id");

  const lineCategoryMap = new Map<number, number[]>();
  for (const lc of allLineCategories || []) {
    const pId = Number(lc.product_line_id);
    const cId = Number(lc.category_id);
    const existing = lineCategoryMap.get(pId) ?? [];
    existing.push(cId);
    lineCategoryMap.set(pId, existing);
  }

  // Lấy thông tin các category (bao gồm cả department)
  const { data: allCategories } = await admin
    .schema("catalog")
    .from("category")
    .select("category_id, department");

  const categoryDeptMap = new Map<number, string>();
  for (const cat of allCategories || []) {
    if (cat.department) {
      categoryDeptMap.set(Number(cat.category_id), cat.department);
    }
  }

  // Lấy tồn kho (v_inventory_availability) để xem variant còn hàng hay không
  const { data: inventoryData } = await admin
    .schema("catalog")
    .from("v_inventory_availability")
    .select("variant_id, total_quantity");

  const { data: variants } = await admin
    .schema("catalog")
    .from("product_variant")
    .select("variant_id, component_id, status, price");

  const { data: components } = await admin
    .schema("catalog")
    .from("product_component")
    .select("component_id, product_line_id");

  const componentToProductLineMap = new Map<number, number>();
  for (const c of components || []) {
    componentToProductLineMap.set(Number(c.component_id), Number(c.product_line_id));
  }

  const stockMap = new Map<number, number>();
  for (const inv of inventoryData || []) {
    stockMap.set(Number(inv.variant_id), Math.max(0, Number(inv.total_quantity ?? 0)));
  }

  const productLineHasStockMap = new Map<number, boolean>();
  const productLinePricesMap = new Map<number, number[]>();
  for (const v of variants || []) {
    const pLineId = componentToProductLineMap.get(Number(v.component_id));
    if (pLineId) {
      const prices = productLinePricesMap.get(pLineId) ?? [];
      prices.push(Number(v.price ?? 0));
      productLinePricesMap.set(pLineId, prices);
    }

    if (v.status === "ACTIVE") {
      if (pLineId && stockMap.get(Number(v.variant_id))! > 0) {
        productLineHasStockMap.set(pLineId, true);
      }
    }
  }

  // Lấy media cho toàn bộ sản phẩm
  const { data: allLineMedia } = await admin
    .schema("catalog")
    .from("product_line_media")
    .select("product_line_id, media_id, media_role, display_order")
    .order("display_order", { ascending: true });

  const lineMediaMap = new Map<number, number[]>();
  for (const lm of allLineMedia || []) {
    const pId = Number(lm.product_line_id);
    const mId = Number(lm.media_id);
    const existing = lineMediaMap.get(pId) ?? [];
    existing.push(mId);
    lineMediaMap.set(pId, existing);
  }

  const { data: mediaRows } = await admin
    .schema("catalog")
    .from("media")
    .select("media_id, storage_key, bucket_name");

  const mediaMap = new Map(
    (mediaRows || []).map((item) => [Number(item.media_id), item]),
  );

  // Lấy màu sắc (color) của toàn bộ sản phẩm
  const { data: colors } = await admin
    .schema("catalog")
    .from("color")
    .select("color_id, color_name, color_code");

  const colorMap = new Map(
    (colors || []).map((item) => [Number(item.color_id), item]),
  );

  const { data: allProductLinesRaw } = await admin
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, color_id");

  const productColorsMap = new Map<number, { name: string; hex: string }[]>();
  for (const pl of allProductLinesRaw || []) {
    if (pl.color_id) {
      const c = colorMap.get(Number(pl.color_id));
      if (c) {
        productColorsMap.set(Number(pl.product_line_id), [{ name: c.color_name, hex: c.color_code }]);
      }
    }
  }

  // 3. Tính điểm cho từng ứng viên
  const scoredCandidates = allActiveProducts.map((candidate) => {
    const candidateId = Number(candidate.product_line_id);
    const candidateCategoryIds = lineCategoryMap.get(candidateId) ?? [];

    // Tìm department của candidate
    let candidateDepartment: string | null = null;
    for (const cId of candidateCategoryIds) {
      const dept = categoryDeptMap.get(cId);
      if (dept) {
        candidateDepartment = dept;
        break;
      }
    }

    const matchedCategoryCount = candidateCategoryIds.filter((id) =>
      currentCategoryIds.includes(id),
    ).length;

    const departmentMatch =
      currentDepartment && candidateDepartment === currentDepartment;

    const sameCollection =
      candidate.collection_id === currentProduct.collection_id;

    const hasAvailableVariant = productLineHasStockMap.get(candidateId) ?? false;

    // Freshness score: Điểm nhỏ từ 0-10 dựa trên ngày tạo
    const creationTime = new Date(candidate.created_at).getTime();
    const freshnessScore = Math.min(10, Math.max(0, (creationTime / 1e11) % 10));

    const score =
      (departmentMatch ? 200 : 0) +
      matchedCategoryCount * 80 +
      (sameCollection ? 50 : 0) +
      (hasAvailableVariant ? 20 : 0) +
      freshnessScore;

    return {
      productLine: candidate,
      score,
      departmentMatch,
      matchedCategoryCount,
      sameCollection,
      hasAvailableVariant,
      candidateDepartment,
    };
  });

  // 4. Sắp xếp candidates theo mức độ liên quan
  let sorted = scoredCandidates.sort((a, b) => {
    return (
      Number(b.departmentMatch) - Number(a.departmentMatch) ||
      b.matchedCategoryCount - a.matchedCategoryCount ||
      Number(b.sameCollection) - Number(a.sameCollection) ||
      b.score - a.score ||
      new Date(b.productLine.created_at).getTime() - new Date(a.productLine.created_at).getTime()
    );
  });

  // Lấy ra danh sách các productLine kết quả
  let resultProductLines = sorted.slice(0, limit).map((item) => item.productLine);

  // 5. Fallback logic nếu thiếu 5 sản phẩm
  if (resultProductLines.length < limit) {
    const selectedIds = new Set(resultProductLines.map((p) => Number(p.product_line_id)));

    // Fallback 1: Lấy các sản phẩm cùng department_id
    if (currentDepartment) {
      const fb1 = scoredCandidates
        .filter(
          (item) =>
            item.candidateDepartment === currentDepartment &&
            !selectedIds.has(Number(item.productLine.product_line_id)),
        )
        .map((item) => item.productLine);

      for (const p of fb1) {
        if (resultProductLines.length >= limit) break;
        resultProductLines.push(p);
        selectedIds.add(Number(p.product_line_id));
      }
    }

    // Fallback 2: Lấy các sản phẩm cùng collection_id
    if (resultProductLines.length < limit && currentProduct.collection_id) {
      const fb2 = scoredCandidates
        .filter(
          (item) =>
            item.productLine.collection_id === currentProduct.collection_id &&
            !selectedIds.has(Number(item.productLine.product_line_id)),
        )
        .map((item) => item.productLine);

      for (const p of fb2) {
        if (resultProductLines.length >= limit) break;
        resultProductLines.push(p);
        selectedIds.add(Number(p.product_line_id));
      }
    }

    // Fallback 3: Lấy các sản phẩm ACTIVE mới nhất
    if (resultProductLines.length < limit) {
      const fb3 = scoredCandidates
        .filter((item) => !selectedIds.has(Number(item.productLine.product_line_id)))
        .sort(
          (a, b) =>
            new Date(b.productLine.created_at).getTime() -
            new Date(a.productLine.created_at).getTime(),
        )
        .map((item) => item.productLine);

      for (const p of fb3) {
        if (resultProductLines.length >= limit) break;
        resultProductLines.push(p);
        selectedIds.add(Number(p.product_line_id));
      }
    }
  }

  // Giới hạn lại kết quả cuối cùng ở mức tối đa `limit`
  const finalProductLines = resultProductLines.slice(0, limit);

  // Map productLine database structure to frontend Product type
  return finalProductLines.map((pl) => {
    const pId = Number(pl.product_line_id);
    const mediaIds = lineMediaMap.get(pId) ?? [];
    const images = mediaIds
      .map((mId) => {
        const media = mediaMap.get(mId);
        return media ? mediaUrl(media.storage_key, media.bucket_name) : null;
      })
      .filter((img): img is string => img != null);

    return {
      id: String(pId),
      slug: pl.slug,
      name: pl.line_name,
      price: Math.min(
        ...(productLinePricesMap.get(pId)?.filter((price) => price > 0) ?? [0]),
      ),
      images: images.length > 0 ? images : ["/images/placeholder.png"],
      categorySlug: "api",
      gender: currentDepartment?.toLowerCase() === "men" ? "nam" : "nu",
      description: "",
      sizes: [],
      colors: productColorsMap.get(pId) ?? [{ name: "Mặc định", hex: "#111111" }],
    };
  });
}

export async function searchProductLines(query: string, limit = 5): Promise<Product[]> {
  const admin = createAdminClient();

  let matchedLines = null;
  let error = null;
  let attempts = 3;

  while (attempts > 0) {
    const res = await admin
      .schema("catalog")
      .from("product_line")
      .select("product_line_id, slug, line_name, color_id, status")
      .eq("status", "ACTIVE")
      .ilike("line_name", `%${query}%`)
      .limit(limit);

    matchedLines = res.data;
    error = res.error;

    if (
      error &&
      (error.message.includes("schema cache") ||
        error.message.includes("PGRST002") ||
        error.message.includes("connection") ||
        error.message.includes("timeout"))
    ) {
      attempts--;
      await new Promise((resolve) => setTimeout(resolve, 1000));
      continue;
    }
    break;
  }

  if (error || !matchedLines || matchedLines.length === 0) {
    if (error) {
      console.error("[searchProductLines] query failed", error);
    }
    return [];
  }

  const productLineIds = matchedLines.map((pl) => Number(pl.product_line_id));

  // Get media for matched lines
  const { data: allLineMedia } = await admin
    .schema("catalog")
    .from("product_line_media")
    .select("product_line_id, media_id, media_role, display_order")
    .in("product_line_id", productLineIds)
    .order("display_order", { ascending: true });

  const lineMediaMap = new Map<number, number[]>();
  for (const lm of allLineMedia || []) {
    const pId = Number(lm.product_line_id);
    const mId = Number(lm.media_id);
    const existing = lineMediaMap.get(pId) ?? [];
    existing.push(mId);
    lineMediaMap.set(pId, existing);
  }

  const mediaIds = allLineMedia?.map((lm) => Number(lm.media_id)) ?? [];
  let mediaRows: any[] = [];
  if (mediaIds.length) {
    const { data } = await admin
      .schema("catalog")
      .from("media")
      .select("media_id, storage_key, bucket_name")
      .in("media_id", mediaIds);
    mediaRows = data || [];
  }

  const mediaMap = new Map(
    (mediaRows || []).map((item) => [Number(item.media_id), item]),
  );

  // Get colors
  const { data: colors } = await admin
    .schema("catalog")
    .from("color")
    .select("color_id, color_name, color_code");

  const colorMap = new Map(
    (colors || []).map((item) => [Number(item.color_id), item]),
  );

  const productColorsMap = new Map<number, { name: string; hex: string }[]>();
  for (const pl of matchedLines) {
    const pId = Number(pl.product_line_id);
    if (pl.color_id) {
      const c = colorMap.get(Number(pl.color_id));
      if (c) {
        productColorsMap.set(pId, [{ name: c.color_name, hex: c.color_code }]);
      }
    }
  }

  // Get components and variants for pricing
  const { data: components } = await admin
    .schema("catalog")
    .from("product_component")
    .select("component_id, product_line_id")
    .in("product_line_id", productLineIds);

  const componentIds = (components || []).map((c) => Number(c.component_id));
  
  let variants: any[] = [];
  if (componentIds.length) {
    const { data } = await admin
      .schema("catalog")
      .from("product_variant")
      .select("variant_id, component_id, status, price")
      .in("component_id", componentIds);
    variants = data || [];
  }

  const componentToProductLineMap = new Map<number, number>();
  for (const c of components || []) {
    componentToProductLineMap.set(Number(c.component_id), Number(c.product_line_id));
  }

  const productLinePricesMap = new Map<number, number[]>();
  for (const v of variants || []) {
    const pLineId = componentToProductLineMap.get(Number(v.component_id));
    if (pLineId) {
      const prices = productLinePricesMap.get(pLineId) ?? [];
      prices.push(Number(v.price ?? 0));
      productLinePricesMap.set(pLineId, prices);
    }
  }

  // Map to Product Dto
  return matchedLines.map((pl) => {
    const pId = Number(pl.product_line_id);
    const mediaIds = lineMediaMap.get(pId) ?? [];
    const images = mediaIds
      .map((mId) => {
        const media = mediaMap.get(mId);
        return media ? mediaUrl(media.storage_key, media.bucket_name) : null;
      })
      .filter((img): img is string => img != null);

    return {
      id: String(pId),
      slug: pl.slug,
      name: pl.line_name,
      price: Math.min(
        ...(productLinePricesMap.get(pId)?.filter((price) => price > 0) ?? [0]),
      ),
      images: images.length > 0 ? images : ["/images/placeholder.png"],
      categorySlug: "api",
      gender: "nu",
      description: "",
      sizes: [],
      colors: productColorsMap.get(pId) ?? [{ name: "Mặc định", hex: "#111111" }],
    };
  });
}
