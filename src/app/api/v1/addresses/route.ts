import { fail, ok } from "@/lib/api-response";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";

export async function GET() {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để xem sổ địa chỉ.", 401);
    }

    const admin = createAdminClient();
    const { data: addresses, error } = await admin
      .schema("iam")
      .from("address")
      .select(
        "address_id, customer_id, recipient_name, recipient_phone, province_id, district_name, address_detail, is_default, is_active, created_at, updated_at",
      )
      .eq("customer_id", customerId)
      .eq("is_active", true)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return ok(addresses ?? [], "Lấy sổ địa chỉ thành công.");
  } catch (error) {
    console.error("[addresses/GET]", error);
    return fail(
      "Không thể tải sổ địa chỉ.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function POST(request: Request) {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để tạo địa chỉ.", 401);
    }

    const body = await request.json();
    const admin = createAdminClient();
    const now = new Date().toISOString();

    if (body.is_default) {
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
        recipient_name: body.recipient_name,
        recipient_phone: body.recipient_phone,
        province_id: Number(body.province_id),
        district_name: body.district_name,
        address_detail: body.address_detail,
        is_default: Boolean(body.is_default),
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

    return ok(data, "Thêm địa chỉ thành công.", 201);
  } catch (error) {
    console.error("[addresses/POST]", error);
    return fail(
      "Không thể tạo địa chỉ.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
