# XEOXO Web - Activity Diagram Notes

## Ghi chú ngắn

- Ưu tiên vẽ theo nghiệp vụ mục tiêu.
- Có vài điểm docs và code hiện tại chưa khớp hoàn toàn:
  - `customization request`: chốt theo hướng `measurement_snapshot` là source of truth; profile mặc định chỉ là side effect khi user muốn lưu
  - `measurement appointment`: docs có branch check slot/guest customer rõ hơn code hiện tại
  - `measurement profile`: code hiện tại đang dùng flow `GET/PUT /api/v1/measurement-profiles/current`
  - `refund`: nên tách riêng `hủy đơn trước giao hàng` và `hoàn tiền sau return request`

## 1. Checkout Preview - Voucher / Reward

Mục tiêu: tính lại tiền checkout trước khi đặt hàng, không tin dữ liệu tính ở frontend.

```mermaid
flowchart TD
  A[Customer chọn cart item, địa chỉ, voucher] --> B[Frontend gọi POST /api/v1/cart/checkout-preview]
  B --> C[API validate request và lấy customer_id nếu có]
  C --> D[Feature service re-query cart, giá, địa chỉ, loyalty_reward]
  D --> E{Voucher / reward hợp lệ?}
  E -->|Không| F[Trả lỗi 404 hoặc 422]
  E -->|Có| G[Tính subtotal, shipping_fee, discount_amount, reward_discount_amount, total_amount]
  G --> H[Trả checkout preview cho UI]
```

## 2. Đặt Hàng - Consume Reward - Ghi Dữ Liệu Bán Hàng

Mục tiêu: tạo order theo transaction atomic, consume reward và trừ tồn kho cùng một lần xử lý.

Xử lý member và guest:
- `Member`: lấy `customer_id` từ session, dùng `address_id` hoặc địa chỉ mới, đơn nằm trong lịch sử tài khoản.
- `Guest`: không tin `customer_id` từ client; backend phải tìm hoặc tạo `iam.customer` với `customer_type = GUEST` theo phone/email, rồi gắn `sales_order.customer_id` vào row guest đó.
- DB lưu:
  - `iam.customer`: 1 row `GUEST` hoặc `MEMBER`
  - `iam.address`: tạo row địa chỉ nội bộ nếu guest checkout hoặc member nhập địa chỉ mới
  - `sales.sales_order.customer_id`: luôn trỏ về một `customer_id`, kể cả guest
  - `sales.shipping.address_id`: luôn có địa chỉ đã lưu để phục vụ giao hàng
- Quản lý về sau:
  - `Member`: xem lịch sử bằng tài khoản
  - `Guest`: tra cứu bằng `order_code + contact`
  - các flow `lookup`, `cancel`, `return`, `review` đều dựa vào `sales_order.customer_id` + đối chiếu `CUSTOMER.phone/email`

```mermaid
flowchart TD
  A[Customer bấm Thanh toán] --> B[Frontend gọi POST /api/v1/orders]
  B --> C[API validate body]
  C --> D[API gọi RPC sales.checkout_order bằng service_role]
  D --> E[RPC lock cart, cart_item, inventory]
  E --> F[Re-query giá, tồn kho, voucher, shipping fee]
  F --> G{Cart hợp lệ, tồn kho đủ, reward AVAILABLE?}
  G -->|Không| H[Rollback transaction và trả lỗi 409/422]
  G -->|Có| I[Insert sales_order]
  I --> J[Insert order_item]
  J --> K[Insert shipping]
  K --> L[Insert payment]
  L --> M[Update loyalty_reward AVAILABLE to USED]
  M --> N[Insert reward_usage]
  N --> O[Delete or consume cart_item]
  O --> P[Trừ inventory]
  P --> Q[Trả order thành công]
```

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
  J --> K[Tra cứu và quản lý đơn bằng customer_id + contact hoặc session]
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

## 4. Đặt Lịch May Đo

Mục tiêu: nhận lịch hẹn, kiểm tra slot và tạo appointment trạng thái chờ xác nhận.

Xử lý member và guest:
- `Member`: lấy `customer_id` từ session rồi gắn thẳng vào lịch hẹn.
- `Guest`: backend nên tìm hoặc tạo `iam.customer` với `customer_type = GUEST` theo phone/email, rồi gắn `measurement_appointment.customer_id` vào row guest đó.
- DB lưu:
  - `customization.measurement_appointment.customer_id`: nên luôn có giá trị để support `lookup`, `cancel`, `confirm`
  - `iam.customer.phone/email`: là dữ liệu đối chiếu cho guest
- Quản lý về sau:
  - `Member`: xem danh sách qua `GET /api/v1/measurement-appointments`
  - `Guest`: tra cứu qua `appointment_id + contact`
  - huỷ lịch hoặc xác thực lịch guest đều check contact khớp với `CUSTOMER` gắn vào appointment

```mermaid
flowchart TD
  A[Customer nhập thông tin lịch hẹn] --> B[Frontend gọi POST /api/v1/measurement-appointments]
  B --> C[API validate body và lấy customer_id nếu có]
  C --> D[Feature service kiểm tra product line, branch, ngày, start_time]
  D --> E[Tính end_time = start_time + 30 phút]
  E --> F{Slot còn trống?}
  F -->|Không| G[Trả lỗi 409 slot đã được đặt]
  F -->|Có| H[Insert customization.measurement_appointment status = PENDING]
  H --> I[Trả appointment_id, ngày, giờ, status]
```

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

Mục tiêu: lưu yêu cầu may đo cá nhân, tính giá custom và gắn số đo cho yêu cầu đó.

DB lưu số đo:
- `Code hiện tại` lưu thêm `customization_request.measurement_snapshot` dạng JSON, ví dụ:
```json
{
  "component_id": 123,
  "component_type": "AO",
  "measurements": {
    "height": 165,
    "weight": 52,
    "chest": 84,
    "waist": 68
  },
  "note": "May ôm vừa",
  "source": "CUSTOMIZE_MODAL",
  "saved_as_default": true,
  "created_at": "2026-07-09T10:00:00Z"
}
```
- JSON này là `snapshot tại thời điểm tạo request`, dùng để giữ nguyên số đo gắn với đơn/customization đó, kể cả sau này profile mặc định của khách thay đổi.

`measurement_profile` và `measurement_profile_detail`:
- `measurement_snapshot` là source of truth cho giao dịch customize.
- `measurement_profile` và `measurement_profile_detail` chỉ dùng cho hồ sơ mặc định của member.
- nếu `customerId` có và `save_as_default = true` thì gọi `upsertProfile(...)`
- `measurement_profile`: không tạo profile mới mỗi lần; nếu đã có profile active thì `update` profile đó
- `measurement_profile_detail`: không update từng dòng; code đang `delete toàn bộ detail cũ` rồi `insert lại toàn bộ detail mới`
- nếu guest hoặc không chọn `save_as_default` thì không bắt buộc ghi `measurement_profile/detail`; dữ liệu số đo chính chỉ nằm trong `measurement_snapshot`

```mermaid
flowchart TD
  A[Customer nhập số đo và ghi chú] --> B[Frontend gọi POST /api/v1/customization-requests]
  B --> C[API validate body và lấy customer_id nếu có]
  C --> D[Feature service query sản phẩm hoặc component gốc]
  D --> E{Sản phẩm active và số đo hợp lệ?}
  E -->|Không| F[Trả lỗi 404 hoặc 422]
  E -->|Có| G[Insert measurement_snapshot JSON vào customization_request]
  G --> H{Member và save_as_default = true?}
  H -->|Không| I[Bỏ qua measurement_profile]
  H -->|Có| J[Upsert measurement_profile]
  J --> K[Delete detail cũ rồi insert detail mới]
  I --> L[Tính unit_price, surcharge_percent, surcharge_amount, custom_price]
  K --> L
  L --> M[Insert customization_request status = REQUESTED]
  M --> N[Trả customization_id, measurement_snapshot, custom_price]
```

## 6. Thêm Item Customize Vào Cart Và Checkout

Mục tiêu: đưa customization đã tạo vào cart rồi đi tiếp qua flow checkout/order chuẩn.

```mermaid
flowchart TD
  A[Customer có customization_id] --> B[Frontend gọi API add to cart]
  B --> C[API validate customization_id và ownership]
  C --> D{Cart đã tồn tại?}
  D -->|Chưa| E[Insert sales.cart]
  D -->|Rồi| F[Đi tiếp]
  E --> F
  F --> G[Insert sales.cart_item item_type = CUSTOMIZED]
  G --> H[Customer checkout]
  H --> I[Order flow ghi order_item với customization_id]
```

## 7. Hủy Đơn Trước Giao Hàng Và Refund

Mục tiêu: hủy đơn hợp lệ, hủy shipping và tạo refund nếu khách đã thanh toán trước.

```mermaid
flowchart TD
  A[Customer hoặc guest lookup bấm Huỷ đơn] --> B[UI hiển thị modal xác nhận]
  B --> C{User xác nhận huỷ?}
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
  E -->|Không| F[Trả lỗi 403/409/422]
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
