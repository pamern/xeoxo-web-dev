import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import type { CustomerAddress } from "@/types/customer.types";
import type { CustomerAddressInput } from "@/validations/customer/address.schema";

type AddressRecord = Omit<CustomerAddress, "province_name">;

type ProvinceRecord = {
  province_id: number;
  province_name: string;
};

export class CustomerAddressServiceError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "CustomerAddressServiceError";
  }
}

function normalizeAddressValues(values: CustomerAddressInput) {
  return {
    recipient_name: values.recipient_name.trim(),
    recipient_phone: values.recipient_phone.trim(),
    province_id: Number(values.province_id),
    district_name: values.district_name.trim(),
    address_detail: values.address_detail.trim(),
    is_default: Boolean(values.is_default),
  };
}

function normalizeCustomerPhone(value: string) {
  const identifier = parseAuthIdentifier(value);
  return identifier?.type === "phone" ? identifier.value : null;
}

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

async function assertProvinceExists(provinceId: number) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("iam")
    .from("province")
    .select("province_id")
    .eq("province_id", provinceId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new CustomerAddressServiceError(
      "Không tìm thấy tỉnh / thành phố đã chọn.",
      404,
    );
  }
}

async function unsetDefaultAddress(
  customerId: number,
  exceptAddressId?: number,
) {
  const admin = createAdminClient();
  let query = admin
    .schema("iam")
    .from("address")
    .update({
      is_default: false,
      updated_at: new Date().toISOString(),
    })
    .eq("customer_id", customerId)
    .eq("is_default", true);

  if (exceptAddressId) {
    query = query.neq("address_id", exceptAddressId);
  }

  const { error } = await query;

  if (error) {
    throw new Error(error.message);
  }
}

async function countActiveAddresses(customerId: number) {
  const admin = createAdminClient();
  const { count, error } = await admin
    .schema("iam")
    .from("address")
    .select("address_id", { count: "exact", head: true })
    .eq("customer_id", customerId)
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}

async function insertAddressRecord(
  customerId: number,
  values: ReturnType<typeof normalizeAddressValues>,
) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await admin
    .schema("iam")
    .from("address")
    .insert({
      customer_id: customerId,
      recipient_name: values.recipient_name,
      recipient_phone: values.recipient_phone,
      province_id: values.province_id,
      district_name: values.district_name,
      address_detail: values.address_detail,
      is_default: values.is_default,
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

async function getActiveCustomerAddressById(
  customerId: number,
  addressId: number,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("iam")
    .from("address")
    .select(
      "address_id, customer_id, recipient_name, recipient_phone, province_id, district_name, address_detail, is_default, is_active, created_at, updated_at",
    )
    .eq("customer_id", customerId)
    .eq("address_id", addressId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new CustomerAddressServiceError("Không tìm thấy địa chỉ cần cập nhật.", 404);
  }

  return data as AddressRecord;
}

async function hasShippingUsage(addressId: number) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("sales")
    .from("shipping")
    .select("shipping_id")
    .eq("address_id", addressId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

async function findFallbackDefaultAddressId(
  customerId: number,
  excludedAddressId: number,
) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("iam")
    .from("address")
    .select("address_id")
    .eq("customer_id", customerId)
    .eq("is_active", true)
    .neq("address_id", excludedAddressId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? Number(data.address_id) : null;
}

async function syncCustomerPhoneFromDefaultAddressIfMissing(
  customerId: number,
  recipientPhone: string,
) {
  const normalizedPhone = normalizeCustomerPhone(recipientPhone);

  if (!normalizedPhone) {
    return;
  }

  const admin = createAdminClient();
  const { data: customer, error: customerError } = await admin
    .schema("iam")
    .from("customer")
    .select("phone")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (customerError) {
    throw new Error(customerError.message);
  }

  if (typeof customer?.phone === "string" && customer.phone.trim()) {
    return;
  }

  const { error: updateError } = await admin
    .schema("iam")
    .from("customer")
    .update({
      phone: normalizedPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("customer_id", customerId);

  if (updateError) {
    throw new Error(updateError.message);
  }
}

function hasAddressContentChanged(
  existing: AddressRecord,
  next: ReturnType<typeof normalizeAddressValues>,
) {
  return (
    existing.recipient_name !== next.recipient_name ||
    existing.recipient_phone !== next.recipient_phone ||
    Number(existing.province_id) !== Number(next.province_id) ||
    existing.district_name !== next.district_name ||
    existing.address_detail !== next.address_detail
  );
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
  values: CustomerAddressInput,
) {
  const normalizedValues = normalizeAddressValues(values);
  await assertProvinceExists(normalizedValues.province_id);

  const activeAddressCount = await countActiveAddresses(customerId);
  const shouldBeDefault = normalizedValues.is_default || activeAddressCount === 0;

  if (shouldBeDefault) {
    await unsetDefaultAddress(customerId);
  }

  const nextAddress = await insertAddressRecord(customerId, {
    ...normalizedValues,
    is_default: shouldBeDefault,
  });

  if (nextAddress.is_default) {
    await syncCustomerPhoneFromDefaultAddressIfMissing(
      customerId,
      nextAddress.recipient_phone,
    );
  }

  return nextAddress;
}

export async function updateCustomerAddress(
  customerId: number,
  addressId: number,
  values: CustomerAddressInput,
) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const existingAddress = await getActiveCustomerAddressById(customerId, addressId);
  const normalizedValues = normalizeAddressValues(values);

  await assertProvinceExists(normalizedValues.province_id);

  const shippingUsed = await hasShippingUsage(addressId);
  const contentChanged = hasAddressContentChanged(existingAddress, normalizedValues);

  if (shippingUsed && contentChanged) {
    if (normalizedValues.is_default) {
      await unsetDefaultAddress(customerId);
    }

    const nextAddress = await insertAddressRecord(customerId, normalizedValues);

    const { error: deactivateError } = await admin
      .schema("iam")
      .from("address")
      .update({
        is_active: false,
        is_default: false,
        updated_at: now,
      })
      .eq("customer_id", customerId)
      .eq("address_id", addressId);

    if (deactivateError) {
      throw new Error(deactivateError.message);
    }

    if (nextAddress.is_default) {
      await syncCustomerPhoneFromDefaultAddressIfMissing(
        customerId,
        nextAddress.recipient_phone,
      );
    }

    return nextAddress;
  }

  if (normalizedValues.is_default) {
    await unsetDefaultAddress(customerId, addressId);
  }

  const { data, error } = await admin
    .schema("iam")
    .from("address")
    .update({
      recipient_name: normalizedValues.recipient_name,
      recipient_phone: normalizedValues.recipient_phone,
      province_id: normalizedValues.province_id,
      district_name: normalizedValues.district_name,
      address_detail: normalizedValues.address_detail,
      is_default: normalizedValues.is_default,
      updated_at: now,
    })
    .eq("customer_id", customerId)
    .eq("address_id", addressId)
    .select(
      "address_id, customer_id, recipient_name, recipient_phone, province_id, district_name, address_detail, is_default, is_active, created_at, updated_at",
    )
    .single();

  if (error) {
    throw new Error(error.message);
  }

  const provinceMap = await getProvinceMap([Number(data.province_id)]);
  const nextAddress = mapAddresses([data as AddressRecord], provinceMap)[0];

  if (nextAddress.is_default) {
    await syncCustomerPhoneFromDefaultAddressIfMissing(
      customerId,
      nextAddress.recipient_phone,
    );
  }

  return nextAddress;
}

export async function deleteCustomerAddress(
  customerId: number,
  addressId: number,
) {
  const admin = createAdminClient();
  const now = new Date().toISOString();
  const existingAddress = await getActiveCustomerAddressById(customerId, addressId);

  const { error } = await admin
    .schema("iam")
    .from("address")
    .update({
      is_active: false,
      is_default: false,
      updated_at: now,
    })
    .eq("customer_id", customerId)
    .eq("address_id", addressId)
    .eq("is_active", true);

  if (error) {
    throw new Error(error.message);
  }

  if (existingAddress.is_default) {
    const fallbackAddressId = await findFallbackDefaultAddressId(
      customerId,
      addressId,
    );

    if (fallbackAddressId) {
      const { error: fallbackError } = await admin
        .schema("iam")
        .from("address")
        .update({
          is_default: true,
          updated_at: now,
        })
        .eq("customer_id", customerId)
        .eq("address_id", fallbackAddressId)
        .eq("is_active", true);

      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
    }
  }

  return {
    address_id: addressId,
  };
}
