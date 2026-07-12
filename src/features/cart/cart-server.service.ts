import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { getAuthenticatedUser } from "@/features/auth/auth.service";
import type { CartDto, CartItemDto, CartVariantOption } from "@/types/cart.types";

const CART_SESSION_COOKIE = "xeoxo_cart_session_id";

type CartOwner = {
  customerId: number | null;
  sessionId: string | null;
};

type CartRecord = {
  cart_id: number;
  customer_id: number | null;
  session_id: string | null;
  cart_status: "ACTIVE" | "CHECKOUT" | "ABANDONED";
  created_at: string | null;
  updated_at: string | null;
};

type CartItemRecord = {
  cart_item_id: number;
  cart_id: number;
  variant_id: number | null;
  quantity: number;
  unit_price: number;
  item_type: string;
  customization_id: number | null;
  customization_snapshot?: unknown;
};

type VariantRecord = {
  variant_id: number;
  component_id: number;
  size_option_id: number | null;
  price: number;
  status: string;
};

type ComponentRecord = {
  component_id: number;
  product_line_id: number;
  component_name?: string | null;
  component_type?: string | null;
};

type ProductLineRecord = {
  product_line_id: number;
  slug: string;
  line_name: string;
  color_id: number | null;
};

type LineCategoryDepartmentRecord = {
  product_line_id: number;
  category_id: number;
};

type CategoryDepartmentRecord = {
  category_id: number;
  department: string | null;
};

type SizeOptionRecord = {
  size_option_id: number;
  size_name: string;
};

type ColorRecord = {
  color_id: number;
  color_name: string;
};

type ProductLineMediaRecord = {
  product_line_id: number;
  media_id: number;
  media_role: string;
  display_order: number;
};

type MediaRecord = {
  media_id: number;
  storage_key: string;
  bucket_name: string | null;
};

type InventoryAvailabilityRecord = {
  variant_id: number;
  total_quantity: number | null;
};

export const MAX_CART_TOTAL_QUANTITY = 300;

const NON_PURCHASABLE_VARIANT_STATUSES = new Set(["INACTIVE", "COMING_SOON"]);

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value ?? 0);
}

function getDisplaySizeName(sizeName: string | null | undefined) {
  const normalized = sizeName?.trim();
  return normalized ? normalized : "Freesize";
}

function mapDepartmentToGender(department: string | null | undefined) {
  const normalized = department?.trim().toUpperCase();
  if (normalized === "MEN") return "nam" as const;
  if (normalized === "KIDS") return "tre-em" as const;
  return "nu" as const;
}

export function isVariantPurchasableStatus(status: string | null | undefined) {
  const normalized = status?.trim().toUpperCase() ?? "";
  return normalized !== "" && !NON_PURCHASABLE_VARIANT_STATUSES.has(normalized);
}

export function isVariantAvailable(
  status: string | null | undefined,
  stockQuantity: number,
) {
  return isVariantPurchasableStatus(status) && stockQuantity > 0;
}

function mediaUrl(storageKey?: string | null, bucketName?: string | null) {
  if (!storageKey) {
    return "/images/placeholder.png";
  }

  if (storageKey.startsWith("http://") || storageKey.startsWith("https://")) {
    return storageKey;
  }

  if (storageKey.startsWith("/")) {
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

function emptyCart(): CartDto {
  return {
    cart_id: null,
    cart_status: "ACTIVE",
    items: [],
    subtotal: 0,
    total_quantity: 0,
  };
}

export async function getCurrentCustomerId() {
  const supabase = await createClient();
  const user = await getAuthenticatedUser(supabase);

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .schema("iam")
    .from("customer")
    .select("customer_id")
    .eq("account_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.customer_id ? Number(data.customer_id) : null;
}

export async function getCartOwner(): Promise<CartOwner> {
  const customerId = await getCurrentCustomerId();
  const cookieStore = await cookies();
  const existingSessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  const sessionId = existingSessionId ?? randomUUID();

  if (!existingSessionId) {
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return {
    customerId,
    sessionId,
  };
}

async function listActiveCartsByColumn(
  column: "customer_id" | "session_id",
  value: number | string | null,
) {
  if (value === null) {
    return [] as CartRecord[];
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("sales")
    .from("cart")
    .select("cart_id, customer_id, session_id, cart_status, created_at, updated_at")
    .eq("cart_status", "ACTIVE")
    .eq(column, value)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false, nullsFirst: false })
    .limit(10);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CartRecord[];
}

async function getCartItemCountMap(cartIds: number[]) {
  if (!cartIds.length) {
    return new Map<number, number>();
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("sales")
    .from("cart_item")
    .select("cart_id")
    .in("cart_id", cartIds);

  if (error) {
    throw new Error(error.message);
  }

  const counts = new Map<number, number>();

  for (const row of data ?? []) {
    const cartId = Number(row.cart_id);
    counts.set(cartId, (counts.get(cartId) ?? 0) + 1);
  }

  return counts;
}

function getCartTimestamp(cart: CartRecord) {
  return Date.parse(cart.updated_at ?? cart.created_at ?? "") || 0;
}

export async function findActiveCart(owner: CartOwner) {
  const customerCarts = owner.customerId
    ? await listActiveCartsByColumn("customer_id", owner.customerId)
    : [];
  const sessionCarts = owner.sessionId
    ? await listActiveCartsByColumn("session_id", owner.sessionId)
    : [];

  const candidates = Array.from(
    new Map(
      [...customerCarts, ...sessionCarts].map((cart) => [cart.cart_id, cart]),
    ).values(),
  );

  if (!candidates.length) {
    return null;
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const itemCountMap = await getCartItemCountMap(
    candidates.map((cart) => cart.cart_id),
  );

  candidates.sort((left, right) => {
    const leftHasItems = (itemCountMap.get(left.cart_id) ?? 0) > 0 ? 1 : 0;
    const rightHasItems = (itemCountMap.get(right.cart_id) ?? 0) > 0 ? 1 : 0;

    if (leftHasItems !== rightHasItems) {
      return rightHasItems - leftHasItems;
    }

    const leftMatchesCustomer =
      owner.customerId !== null && left.customer_id === owner.customerId ? 1 : 0;
    const rightMatchesCustomer =
      owner.customerId !== null && right.customer_id === owner.customerId ? 1 : 0;

    if (leftMatchesCustomer !== rightMatchesCustomer) {
      return rightMatchesCustomer - leftMatchesCustomer;
    }

    return getCartTimestamp(right) - getCartTimestamp(left);
  });

  return candidates[0];
}

export async function getOrCreateActiveCart(owner: CartOwner) {
  const existing = await findActiveCart(owner);

  if (existing) {
    return existing;
  }

  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .schema("sales")
    .from("cart")
    .insert({
      customer_id: owner.customerId,
      session_id: owner.sessionId,
      cart_status: "ACTIVE",
      created_at: now,
      updated_at: now,
    })
    .select("cart_id, customer_id, session_id, cart_status, created_at, updated_at")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CartRecord;
}

async function fetchRecordsByIds<T extends Record<string, unknown>>(
  admin: SupabaseClient,
  schema: string,
  table: string,
  select: string,
  column: string,
  ids: Array<number | string>,
) {
  if (!ids.length) {
    return [] as T[];
  }

  const { data, error } = await admin
    .schema(schema)
    .from(table)
    .select(select)
    .in(column, Array.from(new Set(ids)));

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as T[];
}

async function fetchVariantAvailability(
  admin: SupabaseClient,
  variantIds: number[],
) {
  if (!variantIds.length) {
    return [] as InventoryAvailabilityRecord[];
  }

  const { data, error } = await admin
    .schema("catalog")
    .from("v_inventory_availability")
    .select("variant_id, total_quantity")
    .in("variant_id", Array.from(new Set(variantIds)));

  if (error) {
    throw new Error(`Khong the kiem tra ton kho: ${error.message}`);
  }

  return (data ?? []) as InventoryAvailabilityRecord[];
}

export async function getVariantById(variantId: number) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("catalog")
    .from("product_variant")
    .select("variant_id, component_id, size_option_id, price, status")
    .eq("variant_id", variantId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as VariantRecord | null;
}

export async function getVariantStock(variantId: number) {
  const admin = createAdminClient();
  const availability = await fetchVariantAvailability(admin, [variantId]);
  return Math.max(0, Number(availability[0]?.total_quantity ?? 0));
}

export async function getCartTotalQuantity(cartId: number) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("sales")
    .from("cart_item")
    .select("quantity")
    .eq("cart_id", cartId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).reduce(
    (sum, item) => sum + Math.max(0, Number(item.quantity ?? 0)),
    0,
  );
}

export async function assertCartItemOwnership(cartItemId: number, owner: CartOwner) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("sales")
    .from("cart_item")
    .select("cart_item_id, cart_id, variant_id, quantity, unit_price, item_type, customization_id, customization_snapshot")
    .eq("cart_item_id", cartItemId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const cart = await findActiveCart(owner);
  if (!cart || Number(data.cart_id) !== Number(cart.cart_id)) {
    throw new Error("Khong co quyen thao tac tren dong gio hang nay.");
  }

  return data as CartItemRecord;
}

export async function buildCartDto(cart: CartRecord | null): Promise<CartDto> {
  if (!cart) {
    return emptyCart();
  }

  const admin = createAdminClient();
  const { data: cartItems, error: cartItemsError } = await admin
    .schema("sales")
    .from("cart_item")
    .select("cart_item_id, cart_id, variant_id, quantity, unit_price, item_type, customization_id, customization_snapshot")
    .eq("cart_id", cart.cart_id)
    .order("created_at", { ascending: true });

  if (cartItemsError) {
    throw new Error(cartItemsError.message);
  }

  const items = (cartItems ?? []) as CartItemRecord[];
  if (!items.length) {
    return {
      cart_id: cart.cart_id,
      cart_status: cart.cart_status,
      items: [],
      subtotal: 0,
      total_quantity: 0,
    };
  }

  const variants = await fetchRecordsByIds<VariantRecord>(
    admin,
    "catalog",
    "product_variant",
    "variant_id, component_id, size_option_id, price, status",
    "variant_id",
    items.map((item) => item.variant_id).filter((id): id is number => id !== null),
  );
  const customizationIds = items
    .map((item) => item.customization_id)
    .filter((id): id is number => id !== null);

  let customizations: any[] = [];
  if (customizationIds.length > 0) {
    const { data } = await admin
      .schema("customization")
      .from("customization_request")
      .select("customization_id, component_id, surcharge_percent, surcharge_amount, custom_price")
      .in("customization_id", customizationIds);
    customizations = data || [];
  }
  const customizationMap = new Map(customizations.map((c) => [Number(c.customization_id), c]));

  const componentIdsFromVariants = variants.map((variant) => variant.component_id);
  const componentIdsFromCustomizations = customizations.map((c) => c.component_id);
  const allComponentIds = Array.from(new Set([...componentIdsFromVariants, ...componentIdsFromCustomizations]));

  const components = await fetchRecordsByIds<ComponentRecord>(
    admin,
    "catalog",
    "product_component",
    "component_id, product_line_id, component_name, component_type",
    "component_id",
    allComponentIds,
  );
  const productLines = await fetchRecordsByIds<ProductLineRecord>(
    admin,
    "catalog",
    "product_line",
    "product_line_id, slug, line_name, color_id",
    "product_line_id",
    components.map((component) => component.product_line_id),
  );
  const sizes = await fetchRecordsByIds<SizeOptionRecord>(
    admin,
    "catalog",
    "size_option",
    "size_option_id, size_name",
    "size_option_id",
    variants
      .map((variant) => variant.size_option_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const colors = await fetchRecordsByIds<ColorRecord>(
    admin,
    "catalog",
    "color",
    "color_id, color_name",
    "color_id",
    productLines
      .map((line) => line.color_id)
      .filter((id): id is number => typeof id === "number"),
  );
  const lineMedia = await fetchRecordsByIds<ProductLineMediaRecord>(
    admin,
    "catalog",
    "product_line_media",
    "product_line_id, media_id, media_role, display_order",
    "product_line_id",
    productLines.map((line) => line.product_line_id),
  );
  const media = await fetchRecordsByIds<MediaRecord>(
    admin,
    "catalog",
    "media",
    "media_id, storage_key, bucket_name",
    "media_id",
    lineMedia.map((record) => record.media_id),
  );

  const { data: lineCategories, error: lineCategoryError } = productLines.length
    ? await admin
      .schema("catalog")
      .from("line_category")
      .select("product_line_id, category_id")
      .in("product_line_id", productLines.map((line) => line.product_line_id))
    : { data: [], error: null };

  if (lineCategoryError) {
    throw new Error(lineCategoryError.message);
  }

  const categoryIds = Array.from(
    new Set(
      ((lineCategories ?? []) as LineCategoryDepartmentRecord[])
        .map((record) => record.category_id)
        .filter((id): id is number => typeof id === "number"),
    ),
  );
  const categories = await fetchRecordsByIds<CategoryDepartmentRecord>(
    admin,
    "catalog",
    "category",
    "category_id, department",
    "category_id",
    categoryIds,
  );

  const variantMap = new Map(variants.map((variant) => [variant.variant_id, variant]));
  const componentMap = new Map(
    components.map((component) => [component.component_id, component]),
  );
  const productLineMap = new Map(
    productLines.map((line) => [line.product_line_id, line]),
  );
  const sizeMap = new Map(sizes.map((size) => [size.size_option_id, size]));
  const colorMap = new Map(colors.map((color) => [color.color_id, color]));
  const mediaMap = new Map(media.map((item) => [item.media_id, item]));
  const categoryMap = new Map(categories.map((category) => [category.category_id, category]));
  const genderByLine = new Map<number, "nam" | "nu" | "tre-em">();
  const mediaByLine = new Map<number, ProductLineMediaRecord[]>();

  for (const record of (lineCategories ?? []) as LineCategoryDepartmentRecord[]) {
    if (!genderByLine.has(record.product_line_id)) {
      genderByLine.set(
        record.product_line_id,
        mapDepartmentToGender(categoryMap.get(record.category_id)?.department),
      );
    }
  }

  for (const record of lineMedia) {
    const list = mediaByLine.get(record.product_line_id) ?? [];
    list.push(record);
    mediaByLine.set(record.product_line_id, list);
  }

  // Load all sibling components and variants for these product lines to get all size options
  const productLineIds = productLines.map((line) => line.product_line_id);
  let allVariants: VariantRecord[] = [];
  let allComponentsData: ComponentRecord[] = [];
  let allSizeMap = new Map<number, string>();
  let allStockMap = new Map<number, number>();

  if (productLineIds.length) {
    const { data: allComps, error: compsErr } = await admin
      .schema("catalog")
      .from("product_component")
      .select("component_id, product_line_id, component_name, component_type")
      .in("product_line_id", productLineIds);

    if (compsErr) {
      throw new Error(compsErr.message);
    }
    allComponentsData = (allComps ?? []) as ComponentRecord[];
    const allComponentIds = allComponentsData.map((c) => c.component_id);

    if (allComponentIds.length) {
      const { data: allVars, error: varsErr } = await admin
        .schema("catalog")
        .from("product_variant")
        .select("variant_id, component_id, size_option_id, price, status")
        .in("component_id", allComponentIds);

      if (varsErr) {
        throw new Error(varsErr.message);
      }
      allVariants = (allVars ?? []) as VariantRecord[];

      const allVariantIds = allVariants.map((variant) => variant.variant_id);
      if (allVariantIds.length) {
        const inventoryRows = await fetchVariantAvailability(admin, allVariantIds);

        for (const row of inventoryRows) {
          const variantId = Number(row.variant_id);
          allStockMap.set(
            variantId,
            Math.max(0, Number(row.total_quantity ?? 0)),
          );
        }
      }

      const allSizeIds = allVariants
        .map((v) => v.size_option_id)
        .filter((id): id is number => typeof id === "number");

      if (allSizeIds.length) {
        const allSizes = await fetchRecordsByIds<SizeOptionRecord>(
          admin,
          "catalog",
          "size_option",
          "size_option_id, size_name",
          "size_option_id",
          allSizeIds,
        );
        allSizeMap = new Map(allSizes.map((s) => [Number(s.size_option_id), String(s.size_name)]));
      }
    }
  }

  const cartDtoItems: CartItemDto[] = items.map((item) => {
    const variant = item.variant_id ? variantMap.get(item.variant_id) : undefined;
    const customization = item.customization_id ? customizationMap.get(item.customization_id) : undefined;

    let componentId: number | undefined;
    if (variant) componentId = variant.component_id;
    else if (customization) componentId = customization.component_id;

    const component = componentId ? componentMap.get(componentId) : undefined;
    const productLine = component
      ? productLineMap.get(component.product_line_id)
      : undefined;
    const lineMediaRecords = productLine
      ? mediaByLine.get(productLine.product_line_id) ?? []
      : [];
    const mainMedia =
      lineMediaRecords.find((record) => record.media_role === "MAIN") ??
      lineMediaRecords.sort((a, b) => a.display_order - b.display_order)[0];
    const thumbnail = mainMedia
      ? mediaUrl(
        mediaMap.get(mainMedia.media_id)?.storage_key,
        mediaMap.get(mainMedia.media_id)?.bucket_name,
      )
      : "/images/placeholder.png";
    const color = productLine?.color_id
      ? colorMap.get(productLine.color_id)?.color_name ?? ""
      : "";
    const itemType = (item.item_type as "STANDARD" | "CUSTOMIZED") || "STANDARD";
    const size = itemType === "CUSTOMIZED"
      ? "Customize"
      : variant?.size_option_id
        ? getDisplaySizeName(sizeMap.get(variant.size_option_id)?.size_name)
        : getDisplaySizeName(null);
    const unitPrice = toNumber(item.unit_price);
    const quantity = toNumber(item.quantity);

    // Filter available variants for this specific product line
    const itemProductLineId = productLine?.product_line_id;
    const siblingComponentIds = componentId ? [componentId] : [];

    const availableVariants = allVariants
      .filter((v) => siblingComponentIds.includes(v.component_id))
      .filter((v) => isVariantAvailable(
        v.status,
        allStockMap.get(Number(v.variant_id)) ?? 0,
      ))
      .map((v) => {
        const sizeName = v.size_option_id
          ? getDisplaySizeName(allSizeMap.get(v.size_option_id))
          : getDisplaySizeName(null);
        return {
          variant_id: Number(v.variant_id),
          size_name: sizeName,
          color_name: color,
          price: toNumber(v.price),
          is_available: true,
        };
      });

    return {
      cart_item_id: item.cart_item_id,
      variant_id: item.variant_id,
      product_line_id: productLine?.product_line_id ?? 0,
      component_id: componentId ?? null,
      component_name: component?.component_name ?? null,
      component_type: component?.component_type ?? null,
      gender: productLine ? genderByLine.get(productLine.product_line_id) ?? "nu" : "nu",
      slug: productLine?.slug ?? "",
      name: component?.component_name ?? productLine?.line_name ?? "",
      thumbnail,
      color,
      size,
      quantity,
      unit_price: unitPrice,
      line_total: unitPrice * quantity,
      available_variants: availableVariants,
      item_type: itemType,
      customization_id: item.customization_id,
      surcharge_percent: customization?.surcharge_percent,
      surcharge_amount: customization?.surcharge_amount,
      custom_price: customization?.custom_price,
      customization_snapshot: item.customization_snapshot ?? null,
    };
  });

  return {
    cart_id: cart.cart_id,
    cart_status: cart.cart_status,
    items: cartDtoItems,
    subtotal: cartDtoItems.reduce((sum, item) => sum + item.line_total, 0),
    total_quantity: cartDtoItems.reduce((sum, item) => sum + item.quantity, 0),
  };
}
