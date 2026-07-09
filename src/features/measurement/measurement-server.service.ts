import { createAdminClient } from "@/lib/supabase/admin";
import type { MeasurementProfileDto } from "@/types/measurement.types";

export async function getCurrentProfile(customerId: number): Promise<MeasurementProfileDto | null> {
  const admin = createAdminClient();

  const { data: profile, error: profileError } = await admin
    .schema("customization")
    .from("measurement_profile")
    .select("measurement_profile_id, is_active, updated_at")
    .eq("customer_id", customerId)
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    return null;
  }

  const { data: details, error: detailsError } = await admin
    .schema("customization")
    .from("measurement_profile_detail")
    .select("measurement_type_id, measurement_value")
    .eq("measurement_profile_id", profile.measurement_profile_id);

  if (detailsError) {
    throw new Error(detailsError.message);
  }

  const measurementTypeIds = Array.from(
    new Set((details || []).map((detail: any) => Number(detail.measurement_type_id))),
  );
  const { data: types, error: typesError } = measurementTypeIds.length
    ? await admin
        .schema("catalog")
        .from("measurement_type")
        .select("measurement_type_id, measurement_code, measurement_name")
        .in("measurement_type_id", measurementTypeIds)
    : { data: [], error: null };

  if (typesError) {
    throw new Error(typesError.message);
  }

  const typeMap = new Map(
    (types || []).map((type: any) => [Number(type.measurement_type_id), type]),
  );

  return {
    measurement_profile_id: profile.measurement_profile_id,
    customer_id: customerId,
    is_active: profile.is_active,
    updated_at: profile.updated_at,
    measurements: (details || []).map((d: any) => ({
      measurement_type_id: d.measurement_type_id,
      measurement_code: typeMap.get(Number(d.measurement_type_id))?.measurement_code ?? "",
      measurement_name: typeMap.get(Number(d.measurement_type_id))?.measurement_name ?? "",
      value: Number(d.measurement_value),
    })),
  };
}

export async function upsertProfile(customerId: number, measurements: Record<string, number>): Promise<MeasurementProfileDto> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const existing = await getCurrentProfile(customerId);
  let profileId = existing?.measurement_profile_id;

  if (!profileId) {
    const { data: newProfile, error: createError } = await admin
      .schema("customization")
      .from("measurement_profile")
      .insert({
        customer_id: customerId,
        is_active: true,
        measurement_date: now,
        created_at: now,
        updated_at: now,
      })
      .select("measurement_profile_id")
      .single();

    if (createError) throw new Error(createError.message);
    profileId = newProfile.measurement_profile_id;
  } else {
    await admin
      .schema("customization")
      .from("measurement_profile")
      .update({ updated_at: now, measurement_date: now })
      .eq("measurement_profile_id", profileId);
  }

  const { data: types, error: typesError } = await admin
    .schema("catalog")
    .from("measurement_type")
    .select("measurement_type_id, measurement_code");

  if (typesError) throw new Error(typesError.message);

  const typeMap = new Map(types.map((t: any) => [t.measurement_code.toUpperCase(), t.measurement_type_id]));

  const detailsToUpsert = Object.entries(measurements)
    .filter(([code, _]) => typeMap.has(code.toUpperCase()))
    .map(([code, value]) => ({
      measurement_profile_id: profileId,
      measurement_type_id: typeMap.get(code.toUpperCase())!,
      measurement_value: value,
      updated_at: now,
    }));

  if (profileId) {
    const { error: deleteError } = await admin
      .schema("customization")
      .from("measurement_profile_detail")
      .delete()
      .eq("measurement_profile_id", profileId);

    if (deleteError) throw new Error(deleteError.message);
  }

  if (detailsToUpsert.length > 0) {
    const { error: insertError } = await admin
      .schema("customization")
      .from("measurement_profile_detail")
      .insert(detailsToUpsert);

    if (insertError) throw new Error(insertError.message);
  }

  const updated = await getCurrentProfile(customerId);
  if (!updated) throw new Error("Khong the lay thong tin profile sau khi luu.");

  return updated;
}
