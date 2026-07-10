# Loyalty Rewards API

## GET `/api/v1/loyalty-rewards`

- Mục đích: lấy danh sách mã ưu đãi/quyền lợi còn khả dụng của customer đang đăng nhập để hiển thị ở checkout/cart.
- Auth: `CUSTOMER`
- Response thành công:

```json
{
  "success": true,
  "data": [
    {
      "reward_id": 101,
      "reward_name": "Voucher sinh nhật",
      "reward_type": "BIRTHDAY_VOUCHER",
      "reward_value": 500000,
      "voucher_code": "BIRTHDAY500",
      "expired_at": "2026-08-01T00:00:00+07:00",
      "tier_id": "GOLD"
    }
  ],
  "message": "Lấy danh sách mã ưu đãi thành công."
}
```

- Rule:
  - Chỉ trả reward thuộc đúng customer của session hiện tại.
  - Chỉ trả reward `status = AVAILABLE`.
  - Không trả reward đã hết hạn.
  - Chỉ trả reward có `voucher_code` để frontend dùng cho flow nhập/chọn mã.
