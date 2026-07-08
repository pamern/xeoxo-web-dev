# Personal Color Result API

## POST `/api/v1/personal-color/result`

Mục đích: lưu một lần hoàn thành quiz personal color và trả dữ liệu hiển thị kết quả.

Authentication: guest hoặc customer.

Request body:

```json
{
  "temperature": "WARM",
  "value": "LIGHT",
  "season": "SPRING"
}
```

Validation:

- `temperature`: `WARM` hoặc `COOL`
- `value`: `LIGHT` hoặc `DEEP`
- `season`: `SPRING`, `SUMMER`, `AUTUMN`, `WINTER`

Business rules:

- Nếu đã đăng nhập, lưu `customer_id`.
- Nếu là khách vãng lai, lưu `guest_session_id` từ session cookie web hiện có.
- Insert `catalog.personal_color_result`.
- Insert các màu palette vào `catalog.personal_color_result_color`.
- Không lưu sản phẩm gợi ý cố định; sản phẩm vẫn được query động theo màu/season.
- `match_score` chưa dùng trong logic hiện tại.
- `display_order` lưu thứ tự hiển thị màu trong palette.

Response success:

```json
{
  "success": true,
  "data": {
    "resultId": 1,
    "palette": [],
    "products": [],
    "description": "..."
  },
  "message": "Lưu kết quả personal color thành công."
}
```

## GET `/api/v1/personal-color/result?season={season}`

Mục đích: endpoint đọc cũ, chỉ trả palette/sản phẩm/description theo season, không lưu kết quả.
