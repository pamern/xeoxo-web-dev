# XEOXO Web - API Rules

## 1. Mục tiêu

File này là rule chung để frontend/backend đọc trước khi code API cho XEOXO Web.

Nguồn đặc tả endpoint hiện tại nằm ở:

```text
docs/api/api_documentation.yaml
```

Khi code API, phải đọc `API_RULES.md` trước, sau đó đọc đúng endpoint trong `api_documentation.yaml`.

---

## 2. Cách đọc `api_documentation.yaml`

### `endpoints`

Mỗi item trong `endpoints` là một API cần code hoặc cần FE gọi.

Các field quan trọng:

- `name`: tên nghiệp vụ của API.
- `trigger`: màn hình hoặc thao tác UI gọi API.
- `type`: `STANDARD` hoặc `CUSTOM`.
- `resource`: nhóm tài nguyên chính.
- `method`: HTTP method.
- `endpoint`: path API chính thức.
- `http_request`: ví dụ request đầy đủ có query/path param.
- `authentication`: quyền gọi API.
- `request.path_parameters`: path param cần validate.
- `request.query_parameters`: query param cần validate.
- `request.body`: body cần validate.
- `response.body_fields`: field response bắt buộc trả về.
- `response.success_example`: shape response thành công.
- `response.error_examples`: lỗi cần handle.
- `ui_display`: dữ liệu FE cần để render UI.
- `business_rules`: luồng xử lý nghiệp vụ.
- `validation_rules`: rule validate đầu vào.
- `security`: rule bảo mật riêng của API.
- `dev_notes`: ghi chú cần check trước khi code.

### `not_separate_endpoints`

Các nghiệp vụ ở đây không tạo API riêng.

Ví dụ:

- Mua lại đơn hàng: dùng lại API add-to-cart.
- Thêm địa chỉ: dùng chung API address với checkout.

### `status_only_sheet_rows`

Các dòng trong sheet chỉ để ghi tình trạng, không tạo endpoint.

Hiện tại:

- Row 12: FE đưa ảnh hướng dẫn chọn size, không cần API.
- Row 31: Quản lý sổ địa chỉ chưa làm/chưa chốt API riêng.

---

## 3. Chuẩn endpoint

- Base path luôn là `/api/v1`.
- Endpoint dùng danh từ số nhiều, không dùng động từ.
- Không tạo endpoint mới nếu YAML đã ghi dùng chung API khác.
- Một endpoint có thể có nhiều use case qua query param, ví dụ `GET /product-lines` dùng cho department, category, search, filter. Khi code phải tách rõ logic theo query được truyền.

Nên dùng:

```text
/api/v1/product-lines
/api/v1/collections
/api/v1/orders
/api/v1/customers/me
/api/v1/measurement-appointments
```

Không dùng:

```text
/api/v1/get-products
/api/v1/create-order
/api/v1/update-user
```

---

## 4. Chuẩn HTTP method

| Method | Khi dùng |
|---|---|
| GET | Lấy dữ liệu, không đổi state |
| POST | Tạo mới hoặc chạy nghiệp vụ tạo dữ liệu |
| PUT | Cập nhật toàn bộ resource/body đã chốt |
| PATCH | Cập nhật một phần hoặc action trạng thái |
| DELETE | Xoá hoặc huỷ dữ liệu |

Nếu `HTTP Method` trong sheet và `http_request` lệch nhau, xem `dev_notes` trước. Ví dụ API cập nhật size recommendation có note cột method phải là `PUT`.

---

## 5. Chuẩn Authentication

| Giá trị | Ý nghĩa |
|---|---|
| PUBLIC | Ai cũng gọi được, không cần token |
| GUEST_OR_CUSTOMER | Guest hoặc customer đều gọi được |
| CUSTOMER | Bắt buộc đăng nhập customer |
| STAFF | Chỉ staff/backoffice |
| SERVICE_ONLY | Chỉ server/service role |

Rule bắt buộc:

- Không đưa `service_role` key ra frontend.
- API `CUSTOMER` phải lấy `customer_id` từ token/session, không nhận từ query/body.
- API `PUBLIC` nhưng thao tác dữ liệu cá nhân phải xác thực bằng contact hoặc ownership rule trong YAML.
- Guest order/appointment/review/return phải check contact khớp phone/email của `CUSTOMER` gắn với dữ liệu đó.

---

## 6. Chuẩn response

Response thành công:

```json
{
  "code": 200,
  "message": "Thành công",
  "data": {}
}
```

Response danh sách:

```json
{
  "code": 200,
  "message": "Thành công",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

Response lỗi:

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

Rule bắt buộc:

- `code` trong body phải khớp HTTP status thật.
- `message` viết tiếng Việt, có thể hiển thị trực tiếp cho user.
- Không trả stack trace hoặc lỗi database thô.
- Không trả field ngoài `response.body_fields` nếu không cần cho UI.

---

## 7. Chuẩn status code

| Status | Khi dùng |
|---|---|
| 200 | GET/PUT/PATCH/DELETE thành công |
| 201 | POST tạo mới thành công |
| 400 | Request thiếu dữ liệu chung |
| 401 | Chưa đăng nhập hoặc token sai |
| 403 | Không có quyền thao tác dữ liệu |
| 404 | Không tìm thấy dữ liệu |
| 409 | Xung đột nghiệp vụ |
| 422 | Lỗi validate field |
| 500 | Lỗi hệ thống |

---

## 8. STANDARD và CUSTOM

### STANDARD

Dùng cho API query hoặc CRUD đơn giản:

- Lấy danh sách sản phẩm.
- Lấy collection.
- Xem profile.
- Xem lịch hẹn.

### CUSTOM

Dùng khi nghiệp vụ nhiều bước, cần transaction hoặc check ownership phức tạp:

- Checkout/order.
- Tạo yêu cầu đổi trả.
- Review sản phẩm đã mua.
- Customization/measurement profile.
- Gợi ý size.

Rule triển khai:

- `STANDARD`: route handler có thể gọi service query rõ ràng.
- `CUSTOM`: tách logic nghiệp vụ vào service/module riêng, không nhồi hết trong route handler.

---

## 9. Validation bắt buộc

Tất cả API phải validate theo `validation_rules` trong YAML.

Rule chung:

- `page` là số nguyên dương, mặc định `1`.
- `limit` là số nguyên dương, mặc định theo YAML, thường `20`.
- Public list API không cho `limit` vượt quá `50` nếu YAML không ghi khác.
- Search query phải trim, giới hạn độ dài, chống SQL injection.
- Path id phải là số nguyên dương nếu là id numeric.
- Slug phải trim và đúng format URL slug.
- Body có nested array/object phải validate đủ item con.

---

## 10. Security bắt buộc

Không cho frontend cập nhật trực tiếp:

```text
order_status
payment_status
shipping_status
refund_status
inventory.quantity
customer.total_spent
customer.spent_in_year
customer.tier_id
customer.customer_type
```

API protected phải:

- Lấy user từ token/session.
- Map ra `customer_id` phía server.
- Check dữ liệu thuộc đúng customer hiện tại.
- Không nhận `customer_id`, `tier_id`, `total_spent` từ body.
- Có rate limit cho search, lookup, review, return request nếu public.

---

## 11. Checklist trước khi code một API

```text
[ ] Đã đọc endpoint tương ứng trong api_documentation.yaml
[ ] Method và endpoint đúng YAML
[ ] Authentication đúng YAML
[ ] Query/path/body validate đúng validation_rules
[ ] Business rules được code đủ theo thứ tự hợp lý
[ ] Response chỉ trả field trong response.body_fields
[ ] Error response có status code phù hợp
[ ] Không nhận customer_id nhạy cảm từ frontend
[ ] Có ownership/contact check nếu dữ liệu cá nhân
[ ] Không tạo API riêng cho item nằm trong not_separate_endpoints
[ ] Không code status_only_sheet_rows thành endpoint
[ ] Đã test happy path
[ ] Đã test lỗi validate
[ ] Đã test lỗi auth/ownership nếu có
```

---

## 12. Khi nào cần hỏi lại trước khi code

Hỏi lại nếu gặp một trong các trường hợp:

- YAML có `dev_notes` ghi "check lại", "hỏi lại", hoặc chưa chốt sort/status.
- `method` và `http_request` mâu thuẫn.
- Một màn hình có trigger nhưng nằm trong `status_only_sheet_rows`.
- Cần thêm cột DB chưa có trong schema.
- Response UI cần field chưa có trong `response.body_fields`.
