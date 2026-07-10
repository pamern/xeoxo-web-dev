import { fail, ok } from "@/lib/api-response";
import { getCurrentCustomerId } from "@/features/cart/cart-server.service";
import {
  CustomerAddressServiceError,
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@/features/customers/customer-address.service";
import { customerAddressSchema } from "@/validations/customer/address.schema";

type Params = {
  address_id: string;
};

export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để cập nhật địa chỉ.", 401);
    }

    const { address_id } = await params;
    const addressId = Number(address_id);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return fail("Mã địa chỉ không hợp lệ.", 400);
    }

    const body = await request.json();
    const parsed = customerAddressSchema.safeParse(body);

    if (!parsed.success) {
      return fail(
        parsed.error.issues[0]?.message ?? "Dữ liệu địa chỉ không hợp lệ.",
        422,
      );
    }

    const address = await updateCustomerAddress(customerId, addressId, parsed.data);

    return ok(address, "Cập nhật địa chỉ thành công.");
  } catch (error) {
    console.error("[addresses/PUT]", error);

    if (error instanceof CustomerAddressServiceError) {
      return fail(error.message, error.status);
    }

    return fail(
      "Không thể cập nhật địa chỉ.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  try {
    const customerId = await getCurrentCustomerId();
    if (!customerId) {
      return fail("Bạn cần đăng nhập để xóa địa chỉ.", 401);
    }

    const { address_id } = await params;
    const addressId = Number(address_id);

    if (!Number.isInteger(addressId) || addressId <= 0) {
      return fail("Mã địa chỉ không hợp lệ.", 400);
    }

    const result = await deleteCustomerAddress(customerId, addressId);

    return ok(result, "Xóa địa chỉ thành công.");
  } catch (error) {
    console.error("[addresses/DELETE]", error);

    if (error instanceof CustomerAddressServiceError) {
      return fail(error.message, error.status);
    }

    return fail(
      "Không thể xóa địa chỉ.",
      500,
      error instanceof Error ? error.message : error,
    );
  }
}
