import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomizationRequestDto, CreateCustomizationValues } from "@/types/customization.types";
import { upsertProfile } from "../measurement/measurement-server.service";

type CustomizationCheckoutRecord = {
  customization_id: number;
  customer_id: number | null;
  component_id: number;
  surcharge_amount: number | string;
  custom_price: number | string;
  customization_status: string;
  measurement_snapshot: unknown;
};

type ComponentStatusRecord = {
  component_id: number;
  product_line_id: number;
};

type ProductLineStatusRecord = {
  product_line_id: number;
  status: string;
};

export async function createCustomizationRequest(
  customerId: number | null,
  values: CreateCustomizationValues
): Promise<CustomizationRequestDto> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const { data: component, error: componentError } = await admin
    .schema("catalog")
    .from("product_component")
    .select(`
      component_id,
      component_type,
      product_variant (
        variant_id,
        price,
        status
      )
    `)
    .eq("component_id", values.component_id)
    .maybeSingle();

  if (componentError) throw new Error(componentError.message);
  if (!component) throw new Error("Khong tim thay component.");

  const variants = component.product_variant as any[];
  const activeVariants = variants.filter((v: any) => v.status === 'ACTIVE');
  if (activeVariants.length === 0) throw new Error("Component khong co variant kha dung.");

  const basePrice = Math.min(...activeVariants.map((v: any) => Number(v.price)));

  if (customerId && values.save_as_default) {
    await upsertProfile(customerId, values.measurements);
  }

  const surchargePercent = 20;
  const surchargeAmount = basePrice * (surchargePercent / 100);
  const customPrice = basePrice + surchargeAmount;
  const measurementSnapshot = {
    component_id: values.component_id,
    component_type: (component as any).component_type ?? null,
    measurements: values.measurements,
    note: values.customer_note || null,
    source: "CUSTOMIZE_MODAL" as const,
    saved_as_default: Boolean(customerId && values.save_as_default),
    created_at: now,
  };

  const requestData = {
    customer_id: customerId,
    component_id: values.component_id,
    measurement_snapshot: measurementSnapshot,
    unit_price: basePrice,
    surcharge_percent: surchargePercent,
    surcharge_amount: surchargeAmount,
    custom_price: customPrice,
    customization_status: 'REQUESTED',
    customer_note: values.customer_note || null,
    created_at: now,
    updated_at: now,
  };

  const { data: request, error: requestError } = await admin
    .schema("customization")
    .from("customization_request")
    .insert(requestData)
    .select()
    .single();

  if (requestError) throw new Error(requestError.message);

  return {
    customization_id: request.customization_id,
    customer_id: request.customer_id,
    component_id: request.component_id,
    measurement_snapshot: request.measurement_snapshot,
    unit_price: request.unit_price,
    surcharge_percent: request.surcharge_percent,
    surcharge_amount: request.surcharge_amount,
    custom_price: request.custom_price,
    customization_status: request.customization_status,
    customer_note: request.customer_note,
    created_at: request.created_at,
  };
}

export async function getCustomizationForCheckout(
  customizationId: number,
): Promise<CustomizationCheckoutRecord | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("customization")
    .from("customization_request")
    .select(
      "customization_id, customer_id, component_id, surcharge_amount, custom_price, customization_status, measurement_snapshot",
    )
    .eq("customization_id", customizationId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as CustomizationCheckoutRecord | null;
}

export async function assertCustomizationCheckoutReady(
  customizationId: number,
  customerId?: number | null,
) {
  const request = await getCustomizationForCheckout(customizationId);
  if (!request) {
    throw new Error(`Khong tim thay yeu cau may do ${customizationId}.`);
  }

  if (
    typeof customerId === "number" &&
    request.customer_id !== null &&
    Number(request.customer_id) !== Number(customerId)
  ) {
    throw new Error(
      `Yeu cau may do ${customizationId} khong thuoc tai khoan hien tai.`,
    );
  }

  const status = request.customization_status.trim().toUpperCase();
  if (status === "CANCELLED") {
    throw new Error(`Yeu cau may do ${customizationId} da bi huy.`);
  }

  if (status === "COMPLETED") {
    throw new Error(`Yeu cau may do ${customizationId} da hoan tat va khong the checkout lai.`);
  }

  if (!request.measurement_snapshot) {
    throw new Error(
      `Yeu cau may do ${customizationId} chua co thong tin so do hop le.`,
    );
  }

  if (Number(request.custom_price ?? 0) <= 0) {
    throw new Error(
      `Yeu cau may do ${customizationId} chua co gia hop le de checkout.`,
    );
  }

  const admin = createAdminClient();
  const { data: component, error: componentError } = await admin
    .schema("catalog")
    .from("product_component")
    .select("component_id, product_line_id")
    .eq("component_id", request.component_id)
    .maybeSingle();

  if (componentError) {
    throw new Error(componentError.message);
  }

  if (!component) {
    throw new Error(
      `Yeu cau may do ${customizationId} khong con component san pham hop le.`,
    );
  }

  const safeComponent = component as ComponentStatusRecord;
  const { data: productLine, error: productLineError } = await admin
    .schema("catalog")
    .from("product_line")
    .select("product_line_id, status")
    .eq("product_line_id", safeComponent.product_line_id)
    .maybeSingle();

  if (productLineError) {
    throw new Error(productLineError.message);
  }

  if (!productLine || (productLine as ProductLineStatusRecord).status !== "ACTIVE") {
    throw new Error(
      `Yeu cau may do ${customizationId} khong con hop le vi san pham goc da ngung ban.`,
    );
  }

  return request;
}
