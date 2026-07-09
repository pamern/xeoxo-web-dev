import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomizationRequestDto, CreateCustomizationValues } from "@/types/customization.types";
import { upsertProfile } from "../measurement/measurement-server.service";

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

  let profileId = null;
  if (customerId && values.save_as_default) {
    const profile = await upsertProfile(customerId, values.measurements);
    profileId = profile.measurement_profile_id;
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
    measurement_profile_id: profileId,
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
    measurement_profile_id: request.measurement_profile_id,
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
