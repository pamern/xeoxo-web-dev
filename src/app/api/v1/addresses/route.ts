import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import {
  createCustomerAddress,
  getCustomerAddressesByCustomerId,
} from "@/features/customers/customer-address.service";

export async function GET() {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để xem sổ địa chỉ.", 401);
    }

    const addresses = await getCustomerAddressesByCustomerId(customerId);
    return ok(addresses, "Lấy sổ địa chỉ thành công.");
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
    const address = await createCustomerAddress(customerId, {
      address_detail: body.address_detail,
      district_name: body.district_name,
      is_default: Boolean(body.is_default),
      province_id: Number(body.province_id),
      recipient_name: body.recipient_name,
      recipient_phone: body.recipient_phone,
    });

    return ok(address, "Thêm địa chỉ thành công.", 201);
  } catch (error) {
    console.error("[addresses/POST]", error);
    return fail(
      "Không thể tạo địa chỉ.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
