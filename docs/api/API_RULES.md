# XEOXO Web — API Documentation Standard

## 1. Mục tiêu

Tài liệu này chuẩn hoá cách team thiết kế, ghi chép và cập nhật API cho project XEOXO Web.

Mỗi API mới hoặc API được chỉnh sửa phải được cập nhật vào `docs/api/` theo cùng một format để frontend, backend và người viết báo cáo có thể đọc thống nhất.

---

## 2. Nguyên tắc thiết kế API

- API thiết kế theo **nghiệp vụ/module**, không thiết kế máy móc theo từng bảng database.
- Endpoint dùng danh từ số nhiều, không dùng động từ.
- Request/response phải thống nhất format.
- API có body phải validate bằng Zod.
- API liên quan dữ liệu cá nhân phải kiểm tra auth và quyền sở hữu dữ liệu.
- Không nhận trực tiếp các field nhạy cảm từ frontend nếu có thể suy ra từ session.
- Sau mỗi API mới hoặc thay đổi API, bắt buộc cập nhật tài liệu trong `docs/api/`.

---

## 3. Chuẩn endpoint

### 3.1. Base path

```text
/api/v1
```

Ví dụ:

```text
GET /api/v1/product-lines
GET /api/v1/product-lines/{slug}
POST /api/v1/cart/items
PATCH /api/v1/cart/items/{cart_item_id}
DELETE /api/v1/cart/items/{cart_item_id}
```

### 3.2. Quy tắc đặt tên

Nên dùng:

```text
/product-lines
/categories
/collections
/cart/items
/orders
/addresses
/rewards
/personal-color/results
```

Không dùng:

```text
/get-products
/create-order
/update-user
/delete-cart-item
```

---

## 4. Chuẩn HTTP method

| Method | Mục đích |
|---|---|
| GET | Lấy dữ liệu |
| POST | Tạo mới hoặc thực hiện nghiệp vụ tạo dữ liệu |
| PATCH | Cập nhật một phần |
| PUT | Cập nhật toàn bộ, hạn chế dùng |
| DELETE | Xoá hoặc huỷ dữ liệu |

---

## 5. Chuẩn Authentication

| Giá trị | Ý nghĩa | Ví dụ |
|---|---|---|
| PUBLIC | Ai cũng gọi được, không cần token | Danh sách sản phẩm, danh mục |
| GUEST_OR_CUSTOMER | Khách vãng lai hoặc khách đăng nhập đều gọi được | Cart, checkout guest |
| CUSTOMER | Bắt buộc đăng nhập tài khoản khách hàng | Hồ sơ cá nhân, đơn hàng của tôi |
| STAFF | API dành cho nhân viên, chỉ gọi qua server/backoffice | Xử lý đơn, tồn kho, hỗ trợ |
| SERVICE_ONLY | Chỉ backend/service role được gọi | Thanh toán, cập nhật tồn kho, cấp reward |

**Ghi chú:**

- Frontend public chỉ dùng `anon` hoặc `authenticated` Supabase key.
- Tuyệt đối không đưa `service_role` key vào frontend.
- Không tạo PostgreSQL role riêng cho `CUSTOMER`, `STAFF`; đây là role nghiệp vụ trong bảng `account`.

---

## 6. Chuẩn response chung

### 6.1. Response thành công

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {}
}
```

### 6.2. Response danh sách có phân trang

```json
{
  "code": 200,
  "message": "Thành công",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### 6.3. Response lỗi

```json
{
  "code": 400,
  "message": "Dữ liệu không hợp lệ"
}
```

### 6.4. Response lỗi validate

```json
{
  "code": 422,
  "message": "Dữ liệu không hợp lệ",
  "errors": [
    {
      "field": "quantity",
      "reason": "Số lượng phải lớn hơn 0"
    }
  ]
}
```

**Quy tắc:**

- `code` trong body phải khớp HTTP status thật.
- `message` viết tiếng Việt, có thể hiển thị trực tiếp cho user.
- `errors` chỉ dùng khi lỗi validate field.
- Không trả stack trace hoặc lỗi database thô ra frontend.

---

## 7. Chuẩn status code

| Status | Khi dùng |
|---|---|
| 200 | GET/PATCH/DELETE thành công |
| 201 | POST tạo mới thành công |
| 400 | Request sai hoặc thiếu dữ liệu chung |
| 401 | Chưa đăng nhập |
| 403 | Không có quyền truy cập |
| 404 | Không tìm thấy dữ liệu |
| 409 | Xung đột dữ liệu, ví dụ trùng SKU, trùng item |
| 422 | Lỗi validate field |
| 500 | Lỗi server |

---

## 8. Format chuẩn cho mỗi API trong docs

Mỗi endpoint trong `docs/api/*.md` phải có đủ các mục sau:

```markdown
## GET /api/v1/product-lines

### Mục đích

Mô tả ngắn API này phục vụ nghiệp vụ nào.

### Module

Catalog / Cart / Order / Profile / Loyalty / Personal Color / ...

### Authentication

PUBLIC / GUEST_OR_CUSTOMER / CUSTOMER / STAFF / SERVICE_ONLY

### Request

#### Path parameters

| Tên | Kiểu | Bắt buộc | Mô tả |
|---|---|---|---|
| slug | string | Yes | Slug sản phẩm |

#### Query parameters

| Tên | Kiểu | Bắt buộc | Mặc định | Mô tả |
|---|---|---|---|---|
| page | number | No | 1 | Trang hiện tại |
| limit | number | No | 20 | Số item mỗi trang |

#### Request body

Không có.

### Response thành công

```json
{
  "code": 200,
  "message": "Thành công",
  "data": []
}
```

### Response lỗi

```json
{
  "code": 404,
  "message": "Không tìm thấy dữ liệu"
}
```

### Business rules

- Rule 1.
- Rule 2.

### Validation rules

- Rule validate 1.
- Rule validate 2.

### Database liên quan

- catalog.product_line
- catalog.product_variant
- catalog.product_line_media

### Security

- Chỉ đọc dữ liệu public/active.
- Không trả dữ liệu nhạy cảm.

### Ghi chú cho dev

- Ghi chú kỹ thuật nếu có.
```

---


## 9. Phân loại STANDARD và CUSTOM

### STANDARD

Dùng cho API CRUD hoặc query đơn giản:

- Lấy danh sách category.
- Lấy danh sách collection.
- Lấy product card từ view.
- Thêm/xoá cart item đơn giản.

### CUSTOM

Dùng khi API có nghiệp vụ nhiều bước hoặc cần transaction:

- Checkout.
- Merge guest cart sau login.
- Áp dụng reward/voucher.
- Tính personal color và lưu danh sách màu đề xuất.
- Tạo đơn hàng + order item + payment pending.
- Cập nhật tồn kho.

**Quy tắc:**

- `STANDARD`: route handler có thể gọi service query đơn giản.
- `CUSTOM`: bắt buộc tách logic vào `src/features/<module>/`.

---

## 11. Chuẩn query parameter phổ biến

| Tên | Kiểu | Mặc định | Quy tắc |
|---|---|---|---|
| page | number | 1 | >= 1 |
| limit | number | 20 | 1–100 |
| sort | string | created_at_desc | Chỉ nhận giá trị whitelist |
| search | string | null | Trim, giới hạn độ dài |
| category | string | null | Dùng slug nếu có thể |
| collection | string | null | Dùng slug nếu có thể |
| department | string | null | WOMEN/MEN/KIDS hoặc giá trị đã chốt |

---

## 12. Quy tắc bảo mật API

Không cho frontend cập nhật trực tiếp các field sau:

```text
order_status
payment_status
shipping_status
refund_status
reward.status
inventory.quantity
customer.total_spent
customer.spent_in_year
customer.tier_id
```

Các API protected phải:

- Lấy user từ session/token.
- Map ra `customer_id` phía server.
- Không tin `customer_id` do frontend gửi lên.
- Kiểm tra dữ liệu có thuộc customer hiện tại hay không.

---

## 13. Quy trình tạo API mới

```text
1. Xác định nghiệp vụ cần API
2. Chọn endpoint và method
3. Ghi nháp request/response vào docs/api
4. Tạo Zod validation schema nếu có body/query phức tạp
5. Viết service xử lý nghiệp vụ
6. Viết route handler
7. Test API bằng Postman/Thunder Client
8. Cập nhật docs/api chính thức
9. Cập nhật frontend service trong src/services hoặc src/features
10. Commit code và docs cùng nhau
```

---

## 14. Checklist hoàn thành API

```text
[ ] Endpoint đúng chuẩn REST
[ ] Method đúng mục đích
[ ] Có authentication đúng yêu cầu
[ ] Có validate query/body
[ ] Không nhận customer_id nhạy cảm từ frontend
[ ] Không expose dữ liệu người khác
[ ] Response đúng format chung
[ ] Error response có status code phù hợp
[ ] Có business rules rõ ràng
[ ] Có security note
[ ] Đã test case thành công
[ ] Đã test case lỗi
[ ] Đã cập nhật docs/api
[ ] Đã cập nhật frontend service nếu cần
```

---

## 15. Đề xuất tổ chức file docs/api

```text
docs/api/
├── API_RULES.md
├── api-documentation-standard.md
├── auth.md
├── catalog.md
├── cart.md
├── orders.md
├── profile.md
├── loyalty.md
├── personal-color.md
├── customization.md
└── reviews.md
```

---

## 16. Thứ tự ưu tiên chuẩn hoá API hiện tại

```text
1. Catalog: product-lines, categories, collections
2. Product detail: media, size chart, variants
3. Cart: cart, cart items, merge guest cart
4. Profile: customer, addresses
5. Order: checkout, order history, order detail
6. Loyalty: rewards, reward usage
7. Personal color: result, result colors, recommended products
8. Review
9. Customization/measurement
10. Support/chat
```
