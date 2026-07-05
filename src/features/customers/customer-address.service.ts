import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomerAddress } from "@/types/customer.types";

type AddressRecord = Omit<CustomerAddress, "province_name">;

type ProvinceRecord = {
  province_id: number;
  province_name: string;
};

export async function getCustomerAddressesByCustomerId(customerId: number) {
  const admin = createAdminClient();
  const { data: addresses, error: addressesError } = await admin
    .schema("iam")
    .from("address")
    .select(
      "address_id, customer_id, recipient_name, recipient_phone, province_id, district_name, address_detail, is_default, is_active, created_at, updated_at",
    )
    .eq("customer_id", customerId)
    .eq("is_active", true)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (addressesError) {
    throw new Error(addressesError.message);
  }

  const safeAddresses = (addresses ?? []) as AddressRecord[];

  if (!safeAddresses.length) {
    return [] as CustomerAddress[];
  }

  const provinceIds = Array.from(
    new Set(safeAddresses.map((address) => address.province_id)),
  );

  const { data: provinces, error: provincesError } = await admin
    .schema("iam")
    .from("province")
    .select("province_id, province_name")
    .in("province_id", provinceIds);

  if (provincesError) {
    throw new Error(provincesError.message);
  }

  const provinceMap = new Map<number, string>(
    ((provinces ?? []) as ProvinceRecord[]).map((province) => [
      province.province_id,
      province.province_name,
    ]),
  );

  return safeAddresses.map((address) => ({
    ...address,
    province_name: provinceMap.get(address.province_id) ?? null,
  }));
}
