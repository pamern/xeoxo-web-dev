# Product, Cart, Checkout API Final Spec

Scope: spec chot de gan API cho product detail, cart, checkout. Khong sua database. Khong sua auth.

Response convention theo code hien tai:

```json
{ "success": true, "message": "Thanh cong", "data": {} }
```

Error:

```json
{ "success": false, "message": "Thong bao loi", "error": null }
```

## Product Detail

### GET `/api/v1/product-lines/{slug}`

Public. Dung cho `/products/[slug]`.

Path:

- `slug` bat buoc.

Data tra ve:

- `product_line_id`
- `slug`
- `name`
- `description`
- `price`
- `currency`
- `media[]`: `url`, `media_type`, `media_role`
- `color`: `color_name`, `color_code`
- `sizes[]`: `variant_id`, `size_name`, `price`, `is_available`, `stock_quantity`
- `material`: `material_name`, `description`, `care_instruction`
- `reviews_summary`: `avg_rating`, `total`, `preview_count`, `has_more`
- `reviews_preview[]`

UI rule:

- Page phai load `ProductDetailDto` that truoc khi render purchase panel; khong fallback mock va khong doi user bam "Chon size nhanh".
- Luon render day du tat ca size API tra ve.
- Size co `is_available = false` hoac `stock_quantity = 0` van hien thi nhung bi disable va gach ngang.
- Mau bi disable/gach ngang khi khong con variant nao cua mau co the mua.
- Add cart chi dung `variant_id` cua size dang chon; khong dung size/color mock de tao cart item.

Backend query `PRODUCT_LINE.slug`, sau do join bang DB bang `product_line_id`.

## Size Chart

### GET `/api/v1/product-lines/{slug}/size-chart`

Public. Chi goi khi user bam "Bang kich thuoc".

Data tra ve:

- `chart_name`
- `description`
- `columns[]`
- `rows[]`

Neu product co size chart rieng thi lay theo `SIZE_CHART.product_line_id`; neu khong co thi fallback category chinh.

## Reviews

### GET `/api/v1/product-lines/{slug}/reviews?page={page}&limit={limit}`

Public. Dung cho nut "Xem them".

### POST `/api/v1/product-lines/{slug}/reviews`

Public, nhung phai chung minh da mua.

Body:

- `order_item_id`
- `rating`
- `review_content`
- `media_ids`
- `contact` neu guest

Backend lay `product_line_id` tu slug de validate order item.

## Cart

Guest va member dung chung toan bo product detail, cart, checkout preview, payment va order flow. Diem khac biet duy nhat tren UI checkout:

- Guest nhap `shipping_address` bang form.
- Member chon `address_id` tu so dia chi hoac chu dong them dia chi moi.

### GET `/api/v1/cart`

Lay cart ACTIVE theo token member hoac guest session.

Data:

- `cart_id`
- `cart_status`
- `items[]`
- `subtotal`
- `total_quantity`

Item:

- `cart_item_id`
- `variant_id`
- `product_line_id`
- `slug`
- `name`
- `thumbnail`
- `color`
- `size`
- `quantity`
- `unit_price`
- `line_total`
- `available_variants[]` de doi size/mau trong cart

### POST `/api/v1/cart-items`

Body:

- `variant_id`
- `quantity`

Khong nhan `unit_price` tu FE. Backend lay gia tu `PRODUCT_VARIANT.price`.

Dieu kien backend truoc khi add:

- `variant_id` la so nguyen duong va ton tai.
- `quantity` la so nguyen duong; mac dinh 1 neu khong truyen.
- `PRODUCT_VARIANT.status = ACTIVE`.
- `PRODUCT_COMPONENT` ton tai va `PRODUCT_LINE.status = ACTIVE`.
- Neu variant da co trong cart, validate tren tong quantity sau khi cong don.
- Tong quantity khong duoc vuot tong `inventory.inventory.quantity` cua variant.

Ghi chu trien khai: schema `inventory` da duoc backend `service_role` doc qua Data API. Frontend khong truy cap truc tiep; API/RPC server-only la nguon su that cho ton kho va khong duoc fail-open.

### PATCH `/api/v1/cart-items/{cart_item_id}`

Body optional:

- `variant_id`
- `quantity`

Dung chung cho doi size/mau/so luong. Neu variant moi da co trong cart thi backend merge quantity va xoa dong cu.

### DELETE `/api/v1/cart-items/{cart_item_id}`

Xoa mot dong gio hang.

### DELETE `/api/v1/cart`

Xoa toan bo item cua cart hien tai, khong xoa row `CART`.

## Addresses

### GET `/api/v1/addresses`

Member only. Lay address active cua customer hien tai.

### POST `/api/v1/addresses`

Member only. Dung chung checkout va so dia chi.

Body:

- `recipient_name`
- `recipient_phone`
- `province_id`
- `district_name` (tam luu gia tri Phuong/Xa tu `iam.province.ward[]` vi schema goc chua co `ward_name`)
- `address_detail`
- `is_default`

Guest khong dung API nay vi DB `ADDRESS.customer_id` NOT NULL. Guest gui `shipping_address` trong `POST /orders`.

## Checkout Preview

### POST `/api/v1/cart/checkout-preview`

Body:

- `cart_item_ids`
- `address_id` neu member chon dia chi da luu
- `shipping_address` neu guest hoac dia chi moi
- `voucher_code`

Data:

- `items[]`
- `subtotal`
- `shipping_fee`
- `discount_amount`
- `reward_discount_amount`
- `total_amount`

Chi dung de preview, `POST /orders` van validate va tinh lai.

## Payment Methods

### GET `/api/v1/payment-methods`

Public/member. Lay method active tu `PAYMENT_METHOD`.

Data:

- `method_id`
- `method_code`
- `method_name`
- `provider`
- `is_online`

## Orders

### POST `/api/v1/orders`

Tao order tu cart item da chon.

Body:

- `cart_item_ids`
- `address_id` neu member chon dia chi da luu
- `shipping_address` neu guest hoac dia chi moi
- `payment_method_id`
- `voucher_code`
- `customer_note`

Backend:

- Xac dinh cart theo token/session.
- Validate cart items thuoc cart hien tai.
- Re-query `PRODUCT_VARIANT.price` va tong `inventory.inventory.quantity` khi preview va khi tao order; khong tin `unit_price` trong cart.
- Tinh lai tien, khong tin checkout preview.
- Neu guest thi tao/tim `CUSTOMER` guest theo contact.
- Neu guest/dia chi moi thi tao `ADDRESS` noi bo de gan `SHIPPING`.
- Insert `SALES_ORDER`, `ORDER_ITEM`, `SHIPPING`, `PAYMENT`.
- DB column typo `reward_dicount_amount`: backend map tu API `reward_discount_amount`.
- Delete cart items da checkout hoac update cart status neu checkout toan bo.
- Sau order success, frontend phai refetch cart va reset checkout preview de cap nhat item count/tong tien.

Gap can migration/RPC:

- Tao order, order item, shipping, payment, tru inventory va consume cart can nam trong mot database transaction.
- Can RPC server-only de lock inventory row, check stock va tru stock atomic; neu khong co the oversell khi hai request checkout dong thoi.

Implementation 2026-07-05:

- Migration `supabase/migrations/20260705_atomic_checkout_rewards.sql` chi seed cac bang loyalty goc va tao RPC `sales.checkout_order`; khong tao bang voucher campaign moi.
- `POST /orders` goi RPC bang `service_role`; RPC lock cart/inventory, re-query gia, tru ton kho theo `variant_id`, insert order/items/shipping/payment, consume `iam.loyalty_reward` va consume cart trong mot transaction.
- Theo schema goc, `sales.payment.paid_at` la `NOT NULL`; payment `PENDING` tam luu thoi diem tao ban ghi.
- Checkout preview tinh voucher de hien UI, nhung RPC luon validate lai va la nguon su that cuoi cung.
- `GET /provinces` tra them `ward: string[]`; checkout dung array nay cho dropdown Phuong/Xa thay vi danh sach hard-code.
- `customer_note` la optional, toi da 200 ky tu va duoc validate o ca frontend/backend.

Validation guest:

- Bat buoc co email va so dien thoai.
- Chuan hoa email truoc khi doi chieu.

### POST `/api/v1/orders/{order_id}/payments`

Tao/lap lai payment link cho order online neu can retry.

## Custom / Measurement

### POST `/api/v1/customization-requests`

Tao yeu cau may do voi `measurement_snapshot` la du lieu giao dich chinh. Neu member chon luu mac dinh thi update `measurement_profile` nhu side effect rieng.

### PUT `/api/v1/customization-requests/{customization_id}/measurements`

Cap nhat `measurement_snapshot` cua yeu cau custom. Khong doc nguoc du lieu giao dich tu `measurement_profile`.

### POST `/api/v1/measurement-appointments`

Dat lich do. Vi DB `MEASUREMENT_APPOINTMENT.customization_id` NOT NULL, backend phai auto tao/tim `CUSTOMIZATION_REQUEST` truoc khi insert appointment.

### POST `/api/v1/measurement-profiles`

Tao ho so so do de goi y size.

### PUT `/api/v1/measurement-profiles/{id}/size-recommendation`

Cap nhat so do va goi y lai size.
