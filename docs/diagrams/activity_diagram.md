# XEOXO Web - Activity Diagram Notes

## Ghi chú ngắn

- `customization_request.measurement_snapshot` là source of truth cho dữ liệu giao dịch may đo.
- `measurement_profile` và `measurement_profile_detail` chỉ là hồ sơ mặc định của member, chỉ cập nhật khi user chọn lưu.
- `Guest` phải được map vào `iam.customer` với `customer_type = GUEST` để các flow lookup/cancel/return hoạt động ổn định.

## 1. Checkout Preview - Voucher / Reward

Mục tiêu: tính lại tiền checkout trước khi đặt hàng, không tin dữ liệu tính ở frontend.

```mermaid
flowchart TD
  A[Customer chọn cart item, địa chỉ, voucher] --> B[Frontend gọi POST /api/v1/cart/checkout-preview]
  B --> C[API validate request và lấy customer_id nếu có]
  C --> D[Feature service re-query cart, giá, địa chỉ, loyalty_reward]
  D --> E{Voucher hoặc reward hợp lệ?}
  E -->|Không| F[Trả lỗi 404 hoặc 422]
  E -->|Có| G[Tính subtotal, shipping_fee, discount_amount, reward_discount_amount, total_amount]
  G --> H[Trả checkout preview cho UI]
```

## 2. Đặt Hàng - Member và Guest

Mục tiêu: tạo order theo transaction atomic, consume reward và trừ tồn kho cùng một lần xử lý.

```mermaid
flowchart TD
  A[Customer gửi thông tin đặt hàng] --> B{Đã đăng nhập?}
  B -->|Member| C[Lấy customer_id từ session]
  B -->|Guest| D[Tìm hoặc tạo iam.customer customer_type = GUEST theo phone hoặc email]
  C --> E{Dùng địa chỉ đã lưu?}
  D --> F[Tạo iam.address nội bộ từ shipping_address]
  E -->|Có| G[Dùng address_id của member]
  E -->|Không| H[Tạo iam.address mới cho member]
  F --> I[Insert sales_order với customer_id của guest]
  G --> J[Insert shipping với address_id]
  H --> J
  I --> J
  J --> K[Gọi checkout RPC để insert order_item, payment, reward_usage và trừ inventory]
```

## 3. Cập Nhật Hạng Thành Viên

Mục tiêu: cộng hoặc trừ chi tiêu theo trạng thái đơn và đánh giá lại tier thành viên.

```mermaid
flowchart TD
  A[Staff hoặc system đổi order_status] --> B{Order sang COMPLETED?}
  B -->|Có| C[Load sales_order, customer, tier hiện tại]
  C --> D[Update total_spent và spent_in_year]
  D --> E[Query loyalty_tier để đánh giá tier mới]
  E --> F{Có đổi tier không?}
  F -->|Có| G[Update customer.tier_id]
  G --> H[Cấp loyalty_reward mới nếu policy yêu cầu]
  F -->|Không| I[Giữ nguyên tier]
  B -->|Từ COMPLETED sang CANCELLED hoặc RETURNED| J[Trừ ngược total_spent và spent_in_year rồi đánh giá lại tier]
```

## 4. Đặt Lịch May Đo - Member và Guest

Mục tiêu: nhận lịch hẹn, kiểm tra slot và tạo appointment trạng thái chờ xác nhận.

```mermaid
flowchart TD
  A[Customer nhập thông tin đặt lịch] --> B{Đã đăng nhập?}
  B -->|Member| C[Lấy customer_id từ session]
  B -->|Guest| D[Tìm hoặc tạo iam.customer customer_type = GUEST theo phone hoặc email]
  C --> E[Validate branch, slot, product line]
  D --> E
  E --> F{Slot còn trống?}
  F -->|Không| G[Trả lỗi 409]
  F -->|Có| H[Insert measurement_appointment với customer_id, branch_id, appointment_date, start_time, end_time, status = PENDING]
  H --> I[Member quản lý bằng account history]
  H --> J[Guest quản lý bằng appointment_id + contact]
```

## 5. Tạo Customization Request

Mục tiêu: lưu yêu cầu may đo cá nhân, tính giá custom và lưu snapshot số đo bất biến cho giao dịch.

```mermaid
flowchart TD
  A[Customer nhập số đo và ghi chú] --> B[Frontend gọi POST /api/v1/customization-requests]
  B --> C[API validate body và lấy customer_id nếu có]
  C --> D[Feature service query component gốc và variant active]
  D --> E{Sản phẩm active và số đo hợp lệ?}
  E -->|Không| F[Trả lỗi 404 hoặc 422]
  E -->|Có| G[Tạo measurement_snapshot JSON]
  G --> H{Member và save_as_default = true?}
  H -->|Không| I[Bỏ qua measurement_profile]
  H -->|Có| J[Upsert measurement_profile]
  J --> K[Delete detail cũ rồi insert detail mới]
  I --> L[Tính unit_price, surcharge_percent, surcharge_amount, custom_price]
  K --> L
  L --> M[Insert customization_request với measurement_snapshot]
  M --> N[Trả customization_id, measurement_snapshot, custom_price]
```

## 6. Thêm Item Customize Vào Cart Và Checkout

Mục tiêu: đưa customization đã tạo vào cart rồi đi tiếp qua flow checkout/order chuẩn.

```mermaid
flowchart TD
  A[Customer có customization_id] --> B[Frontend gọi API add to cart]
  B --> C[API validate customization_id và ownership]
  C --> D[Load customization_request.measurement_snapshot]
  D --> E{Cart đã tồn tại?}
  E -->|Chưa| F[Insert sales.cart]
  E -->|Rồi| G[Đi tiếp]
  F --> G
  G --> H[Insert sales.cart_item item_type = CUSTOMIZED và copy customization_snapshot]
  H --> I[Customer checkout]
  I --> J[Order flow ghi order_item với customization_id và snapshot]
```

## 7. Hủy Đơn Trước Giao Hàng Và Refund

Mục tiêu: hủy đơn hợp lệ, hủy shipping và tạo refund nếu khách đã thanh toán trước.

```mermaid
flowchart TD
  A[Customer hoặc guest lookup bấm Hủy đơn] --> B[UI hiển thị modal xác nhận]
  B --> C{User xác nhận hủy?}
  C -->|Không| D[Dừng flow]
  C -->|Có| E[POST /api/v1/orders/:order_id/cancel]
  E --> F[Xác thực bằng session hoặc order_code + contact]
  F --> G[Load sales_order]
  G --> H{Order còn cancellable?}
  H -->|Không| I[Trả lỗi không thể hủy]
  H -->|Có| J[Update sales_order.order_status = CANCELLED]
  J --> K[Update shipping.shipping_status = CANCELLED]
  K --> L{payment_status = PAID?}
  L -->|Không| M[Kết thúc không tạo refund]
  L -->|Có| N[Load payment PAID gần nhất và refund gần nhất]
  N --> O{Đã có refund pending hay terminal chưa?}
  O -->|Chưa| P[Insert sales.refund status = PENDING]
  O -->|Rồi| Q[Tái sử dụng trạng thái refund hiện có]
  P --> R{Refund hoàn tất?}
  Q --> R
  R -->|Có| S[Update refund COMPLETED, payment_status = REFUNDED, order.payment_status = REFUNDED]
  R -->|Chưa| T[Trả trạng thái refund PENDING hoặc PROCESSING]
```

## 8. Return Request Và Hoàn Tiền Sau Giao Hàng

Mục tiêu: tiếp nhận yêu cầu đổi trả sau giao hàng, staff duyệt và hoàn tiền nếu đủ điều kiện.

```mermaid
flowchart TD
  A[Customer gửi yêu cầu đổi trả] --> B[POST /api/v1/orders/:order_id/return-requests]
  B --> C[Xác thực ownership bằng session hoặc contact]
  C --> D[Validate order COMPLETED, còn hạn, item hợp lệ]
  D --> E{Đủ điều kiện?}
  E -->|Không| F[Trả lỗi 403 hoặc 409 hoặc 422]
  E -->|Có| G[Insert return_request status = REQUESTED]
  G --> H[Insert return_item]
  H --> I[Staff review]
  I --> J{APPROVED?}
  J -->|Không| K[Update return_status = REJECTED]
  J -->|Có| L[Update return_status = APPROVED]
  L --> M[Nhận hàng trả về]
  M --> N[Update return_status = RECEIVED]
  N --> O{Có cần hoàn tiền?}
  O -->|Không| P[Đóng yêu cầu COMPLETED]
  O -->|Có| Q[Insert sales.refund gắn return_id]
  Q --> R[Update refund PENDING to PROCESSING to COMPLETED or FAILED]
  R --> S[Update return_request = COMPLETED khi xử lý xong]
```

## 9. Lấy Hồ Sơ Số Đo Hiện Tại

Mục tiêu: lấy profile số đo active mới nhất của member để prefill form.

```mermaid
flowchart TD
  A[Frontend gọi GET /api/v1/measurement-profiles/current] --> B[API lấy customer_id từ session]
  B --> C{Đã đăng nhập?}
  C -->|Không| D[Trả 401]
  C -->|Có| E[Load measurement_profile active mới nhất]
  E --> F{Có profile?}
  F -->|Không| G[Trả null]
  F -->|Có| H[Load measurement_profile_detail]
  H --> I[Join catalog.measurement_type]
  I --> J[Trả DTO profile cho UI]
```

## 10. Upsert Hồ Sơ Số Đo Mặc Định

Mục tiêu: lưu lại profile số đo mặc định của member để dùng lại ở các lần sau.

```mermaid
flowchart TD
  A[Frontend gọi PUT /api/v1/measurement-profiles/current] --> B[API validate measurements]
  B --> C[API lấy customer_id từ session]
  C --> D{Đã đăng nhập?}
  D -->|Không| E[Trả 401]
  D -->|Có| F[Load profile active hiện tại]
  F --> G{Đã có profile?}
  G -->|Chưa| H[Insert measurement_profile]
  G -->|Rồi| I[Update measurement_profile.updated_at và measurement_date]
  H --> J[Load measurement_type]
  I --> J
  J --> K[Delete toàn bộ measurement_profile_detail cũ]
  K --> L[Insert lại measurement_profile_detail mới]
  L --> M[Query lại profile và trả kết quả]
```

## 11. Update Số Đo Cho Customization Request

Mục tiêu: cập nhật số đo của yêu cầu may đo bằng cách sửa `measurement_snapshot`; nếu member muốn lưu mặc định thì cập nhật profile như side effect riêng.

```mermaid
flowchart TD
  A[Customer sửa số đo của customization request] --> B[PUT /api/v1/customization-requests/:customization_id/measurements]
  B --> C[Load customization_request]
  C --> D{Có quyền sửa?}
  D -->|Không| E[Trả 403]
  D -->|Có| F[Update measurement_snapshot trong customization_request]
  F --> G{Member va save_as_default = true?}
  G -->|Không| H[Khong ghi profile mac dinh]
  G -->|Có| I[Upsert measurement_profile]
  I --> J[Delete detail cũ rồi insert detail mới]
  H --> K[Update customer_note nếu có]
  J --> K
  K --> L[Trả dữ liệu mới nhất]
```
