import { createAdminClient } from "@/lib/supabase/admin";
import type { CustomerAddress } from "@/types/customer.types";

type AddressRecord = Omit<CustomerAddress, "province_name">;

type ProvinceRecord = {
  province_id: number;
  province_name: string;
};

type CreateCustomerAddressValues = {
  address_detail: string;
  district_name: string;
  is_default?: boolean;
  province_id: number;
  recipient_name: string;
  recipient_phone: string;
};

async function getProvinceMap(
  provinceIds: number[],
): Promise<Map<number, string>> {
  const admin = createAdminClient();
  const uniqueProvinceIds = Array.from(new Set(provinceIds)).filter(Boolean);

  if (!uniqueProvinceIds.length) {
    return new Map<number, string>();
  }

  const { data: provinces, error: provincesError } = await admin
    .schema("iam")
    .from("province")
    .select("province_id, province_name")
    .in("province_id", uniqueProvinceIds);

  if (provincesError) {
    throw new Error(provincesError.message);
  }

  return new Map<number, string>(
    ((provinces ?? []) as ProvinceRecord[]).map((province) => [
      province.province_id,
      province.province_name,
    ]),
  );
}

function mapAddresses(
  addresses: AddressRecord[],
  provinceMap: Map<number, string>,
): CustomerAddress[] {
  return addresses.map((address) => ({
    ...address,
    province_name: provinceMap.get(address.province_id) ?? null,
  }));
}

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

  const provinceMap = await getProvinceMap(
    safeAddresses.map((address) => address.province_id),
  );

  return mapAddresses(safeAddresses, provinceMap);
}

export async function createCustomerAddress(
  customerId: number,
  values: CreateCustomerAddressValues,
) {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  if (values.is_default) {
    const { error: unsetError } = await admin
      .schema("iam")
      .from("address")
      .update({ is_default: false, updated_at: now })
      .eq("customer_id", customerId)
      .eq("is_default", true);

    if (unsetError) {
      throw new Error(unsetError.message);
    }
  }

  const { data, error } = await admin
    .schema("iam")
    .from("address")
    .insert({
      customer_id: customerId,
      recipient_name: values.recipient_name,
      recipient_phone: values.recipient_phone,
      province_id: Number(values.province_id),
      district_name: values.district_name,
      address_detail: values.address_detail,
      is_default: Boolean(values.is_default),
      is_active: true,
      created_at: now,
      updated_at: now,
    })
    .select(
      "address_id, customer_id, recipient_name, recipient_phone, province_id, district_name, address_detail, is_default, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const provinceMap = await getProvinceMap([Number(data.province_id)]);

  return mapAddresses([data as AddressRecord], provinceMap)[0];
}
