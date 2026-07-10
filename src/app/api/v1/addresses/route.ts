import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import {
  CustomerAddressServiceError,
  createCustomerAddress,
  getCustomerAddressesByCustomerId,
} from "@/features/customers/customer-address.service";
import { customerAddressSchema } from "@/validations/customer/address.schema";

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
    const parsed = customerAddressSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu địa chỉ không hợp lệ.",
        422,
      );
    }

    const address = await createCustomerAddress(customerId, parsed.data);

    return ok(address, "Thêm địa chỉ thành công.", 201);
  } catch (error) {
    console.error("[addresses/POST]", error);

    if (error instanceof CustomerAddressServiceError) {
      return fail(error.message, error.status);
    }

    return fail(
      "Không thể tạo địa chỉ.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
