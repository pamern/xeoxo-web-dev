# Báo cáo triển khai Product Detail, Cart và Checkout

Ngày cập nhật: 06/07/2026

## 1. Phạm vi đã thực hiện

Luồng thương mại hiện tại dùng dữ liệu thật từ Supabase cho trang chi tiết sản phẩm, tồn kho, giỏ hàng, địa chỉ, phương thức thanh toán và tạo đơn hàng.

Luồng chung:

```text
Product detail
→ chọn variant theo size/màu
→ kiểm tra tồn kho
→ thêm vào cart theo guest session hoặc member
→ cập nhật/xóa cart item
→ checkout preview
→ nhập/chọn địa chỉ
→ chọn phương thức thanh toán
→ tạo order bằng RPC atomic
→ trừ inventory
→ consume cart item và reward đã dùng
```

Guest và member dùng chung product detail, variant, inventory, cart, preview và order. Điểm khác nhau:

- Guest được nhận diện bằng cookie `xeoxo_cart_session_id` và nhập form giao hàng.
- Member được nhận diện bằng Supabase Auth, map `auth.uid()` sang `iam.customer.account_id`, sau đó dùng sổ địa chỉ.
- Reward/voucher trong `iam.loyalty_reward` chỉ áp dụng cho đúng member sở hữu reward.

## 2. API trang chi tiết sản phẩm

### `GET /api/v1/product-lines/{slug}`

Được dùng khi mở `/products/{slug}`.

Dữ liệu trả về:

- thông tin product line;
- gallery ảnh;
- màu;
- material;
- toàn bộ size/variant của sản phẩm;
- `stock_quantity` và `is_available` của từng variant;
- thống kê và preview review.

Điều kiện:

- `slug` phải tồn tại.
- Product line phải `ACTIVE`.
- Variant vẫn được trả về khi hết hàng để UI hiển thị đầy đủ size.
- Variant chỉ mua được khi `status = ACTIVE` và tổng `inventory.quantity > 0`.
- Size được sắp xếp theo `XS → S → M → L → XL → CUSTOM`.
- Size hết hàng bị disable và gạch ngang.
- Nút Custom luôn hiển thị nhưng không được dùng làm variant standard cart.
- Product page lấy dữ liệu API trước khi render; không cần bấm “Chọn size nhanh” để tải màu/size.

### `GET /api/v1/product-lines/{slug}/size-chart`

- Chỉ gọi khi người dùng mở bảng kích thước.
- Ưu tiên size chart gắn trực tiếp product line, sau đó mới fallback theo category.

### `GET /api/v1/product-lines/{slug}/reviews`

- Preview ban đầu lấy cùng product detail.
- “Xem thêm” gọi API reviews và hiển thị danh sách đầy đủ.
- Có phân trang và giới hạn số review mỗi request.

## 3. API giỏ hàng

### `GET /api/v1/cart`

- Member: tìm cart `ACTIVE` theo `customer_id`.
- Guest: tìm cart `ACTIVE` theo session cookie.
- Trả item, product slug, ảnh, màu, size, quantity, unit price, line total và các variant có thể đổi.
- Danh sách variant trong cart kiểm tra cả trạng thái variant và tồn kho; S/M hết hàng không còn bị đánh dấu khả dụng.

### `POST /api/v1/cart-items`

Body:

```json
{
  "variant_id": 713,
  "quantity": 1
}
```

Validation và business rules:

- `variant_id` phải là số nguyên dương.
- `quantity` phải là số nguyên dương.
- Product line và variant phải `ACTIVE`.
- Tồn kho phải lớn hơn 0.
- Tổng quantity cũ và quantity thêm không được vượt tồn kho.
- Nếu variant đã có trong cart thì cộng dồn quantity.
- Nếu hết hàng, API trả `409` và không tạo cart rỗng.
- Guest và member dùng chung điều kiện.

### `PATCH /api/v1/cart-items/{cart_item_id}`

- Chỉ được cập nhật item thuộc cart hiện tại.
- Có thể đổi variant hoặc quantity.
- Variant mới phải active và còn hàng.
- Quantity mới không được vượt tổng tồn kho.
- Giá không lấy từ frontend; backend đọc lại giá variant.

### `DELETE /api/v1/cart-items/{cart_item_id}`

- Chỉ xóa item thuộc cart hiện tại.
- Sau khi xóa, frontend refetch cart.

### `DELETE /api/v1/cart`

- Xóa toàn bộ item của active cart hiện tại.
- Không xóa cart của session/customer khác.

## 4. Điều hướng từ cart về product detail

- Toàn bộ vùng thông tin sản phẩm trong cart có thể bấm để về `/products/{slug}`.
- Các control quantity, size, màu và nút xóa không kích hoạt điều hướng ngoài ý muốn.
- Không hiển thị thêm dòng chữ “Xem chi tiết sản phẩm”.

## 5. Checkout preview

### `POST /api/v1/cart/checkout-preview`

Body chính:

```json
{
  "cart_item_ids": [1, 2],
  "voucher_code": "GOLD500-14"
}
```

Logic:

- Bắt buộc chọn ít nhất một cart item.
- Tất cả item phải thuộc active cart hiện tại.
- Re-query trạng thái variant, giá hiện tại và inventory.
- Không tin subtotal hoặc total từ frontend.
- Shipping mặc định hiện tại là `30.000 VND`.
- Reward `FREE_SHIPPING` đưa shipping về 0.
- `BIRTHDAY_VOUCHER` và `TIER_VOUCHER` giảm tối đa bằng `reward_value`, không vượt subtotal.
- Reward phải `AVAILABLE`, chưa hết hạn và thuộc đúng member.
- Guest không được dùng reward cá nhân của member.

## 6. Province và địa chỉ giao hàng

### `GET /api/v1/provinces`

API đọc trực tiếp `iam.province` và trả:

- `province_id`;
- `province_name`;
- `region`;
- `ward: string[]`.

Checkout dùng trực tiếp `ward[]` cho dropdown “Phường / Xã”, không còn dùng danh sách district hard-code.

Do schema `iam.address` hiện chỉ có `district_name` và chưa có `ward_name`, giá trị phường/xã được lưu tạm vào `district_name`. Không thay đổi cấu trúc database.

### Member

- `GET /api/v1/addresses` tải sổ địa chỉ của customer hiện tại.
- Địa chỉ mặc định được chọn trước.
- UI gộp lựa chọn và thông tin địa chỉ trong cùng card.
- Nút “Thay đổi” mở danh sách địa chỉ.
- Member có thể thêm địa chỉ mới và đặt làm mặc định.
- `address_id` gửi lên order phải thuộc đúng member và còn active.

### Guest

- Không hiển thị sổ địa chỉ.
- Guest nhập tên, số điện thoại, email, tỉnh/thành, phường/xã và địa chỉ cụ thể.
- Backend tạo/tái sử dụng `iam.customer` loại `GUEST`, sau đó tạo address phục vụ shipping.

## 7. Phương thức thanh toán

### `GET /api/v1/payment-methods`

- Chỉ trả payment method `is_active = true`.
- Dữ liệu nằm trong bảng gốc `sales.payment_method`.
- Các code được hỗ trợ: `COD`, `BANK_TRANSFER`, `MOMO`, `VNPAY`, `CARD`.
- UI có fallback option để checkout không vỡ giao diện khi master data tạm thời rỗng, nhưng backend vẫn yêu cầu method thực sự tồn tại và active.

## 8. Tạo đơn hàng và trừ tồn kho

### `POST /api/v1/orders`

Backend không nhận `customer_id` từ frontend.

Trước khi tạo order:

- xác định owner từ auth/session;
- kiểm tra cart item ownership;
- đọc lại giá;
- kiểm tra variant/product active;
- kiểm tra inventory;
- kiểm tra địa chỉ và payment method;
- kiểm tra reward;
- giới hạn `customer_note` tối đa 200 ký tự.

RPC `sales.checkout_order` thực hiện trong một transaction:

1. Lock active cart.
2. Kiểm tra đủ số cart item được chọn.
3. Kiểm tra tất cả item vẫn còn mua được.
4. Lock variant và inventory liên quan.
5. Kiểm tra tổng tồn kho cho từng variant.
6. Tính subtotal, shipping, discount và total.
7. Insert `sales.sales_order`.
8. Insert `sales.order_item`.
9. Trừ `inventory.inventory.quantity` đúng variant size/màu.
10. Insert `sales.shipping`.
11. Insert `sales.payment` trạng thái `PENDING`.
12. Nếu dùng reward: chuyển reward sang `USED` và insert `iam.reward_usage`.
13. Xóa cart item đã checkout.
14. Chuyển cart sang `CHECKOUT` nếu không còn item.

Guest và member đều bị trừ tồn kho khi order được tạo thành công. Thêm vào cart không trừ tồn kho để tránh giữ hàng vô thời hạn. Nếu bất kỳ bước nào lỗi, transaction rollback và inventory không bị trừ oan.

## 9. Đồng bộ cart UI sau order

- Sau khi order thành công, frontend phát event `xeoxo-cart-updated`.
- Header/cart hook refetch cart.
- Các item đã đặt biến mất khỏi cart.
- Quantity badge và subtotal được cập nhật.
- Checkout preview được reset khi không còn item được chọn.

## 10. Ghi chú đơn hàng

- Textarea được đặt cách phần “Gọi người khác nhận hàng” để giao diện dễ đọc hơn.
- Placeholder ghi rõ giới hạn 200 ký tự.
- HTML dùng `maxLength={200}`.
- Frontend kiểm tra trước khi submit.
- Backend kiểm tra lại trước khi tạo customer/address/order.

## 11. Loyalty và reward

Chỉ dùng các bảng gốc:

- `iam.loyalty_tier`;
- `iam.loyalty_reward`;
- `iam.reward_usage`.

Không dùng `sales.voucher` hoặc `sales.voucher_usage`.

Các quyền lợi checkout standard hỗ trợ:

- `BIRTHDAY_VOUCHER`;
- `TIER_VOUCHER`;
- `FREE_SHIPPING`.

`FREE_TAILOR` và `SPECIAL_GIFT` không áp dụng cho standard cart order.

## 12. Kết quả smoke test

Guest flow đã chạy thành công với dữ liệu thật:

- product page: `200`;
- product API: `200`;
- add cart: `200`;
- load cart: `200`;
- tăng quantity từ 1 lên 2: `200`;
- checkout preview: `200`;
- subtotal `3.300.000 VND`;
- shipping `30.000 VND`;
- total `3.330.000 VND`;
- delete cart item: `200`;
- cart sau delete: rỗng.

Test inventory Đầm Chi Huỳnh:

- XS/L/XL còn hàng và chọn được;
- S/M hết hàng, hiển thị nhưng disable/gạch ngang.

## 13. Quyền truy cập Supabase cần thiết

- Frontend không chứa `service_role` key.
- `authenticated` chỉ cần `SELECT` owner-based trên `iam.customer` để map member.
- Backend `service_role` cần quyền trên `iam`, `sales`, `catalog`, `inventory` và quyền execute RPC checkout.
- RLS tiếp tục giới hạn dữ liệu member theo `account_id = auth.uid()`.

Không cấp quyền update trực tiếp các field nhạy cảm như `tier_id`, `total_spent`, `spent_in_year`, inventory hoặc trạng thái order cho frontend.
