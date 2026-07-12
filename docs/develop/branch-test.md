# Branch Test Change Log

## 1. Mục đích

File này dùng để ghi lại các thay đổi đã thực hiện trong nhánh `branch-test` để tránh bị thất lạc khi rebase hoặc resolve conflict với các nhánh khác.

Mục tiêu:

- có một điểm tham chiếu nhanh cho các thay đổi đã chốt
- giúp so lại logic/UI sau rebase
- giảm rủi ro bị đè mất các chỉnh sửa quan trọng

---

## 2. Phạm vi thay đổi đã thực hiện

Các thay đổi dưới đây đã được thực hiện trong code của nhánh hiện tại.

### 2.1 Loyalty reward / voucher trong cart

#### Files chính

- `src/app/api/v1/loyalty-rewards/route.ts`
- `src/features/loyalty/loyalty-reward.service.ts`
- `src/services/loyalty-reward.service.ts`
- `src/hooks/useAvailableLoyaltyRewards.ts`
- `src/components/organisms/CartSummary/CartSummary.tsx`
- `src/constants/routes.ts`

#### Thay đổi

- implement API `GET /api/v1/loyalty-rewards`
- load voucher thật từ `iam.loyalty_reward` thay vì trả mảng rỗng ở hook
- chỉ trả reward:
  - thuộc customer hiện tại
  - `status = AVAILABLE`
  - chưa hết hạn
  - `loyalty_tier_id` khớp với `customer.tier_id` hiện tại
- sửa text voucher sang tiếng Việt có dấu
- đổi phần mô tả điều kiện áp dụng của voucher trong cart modal
- phần condition text của voucher đổi sang chữ nhỏ hơn, không bold

#### Lưu ý khi rebase

- không quay lại bản hook cũ có comment "endpoint chưa implement"
- không bỏ filter theo `tier_id` hiện tại

---

### 2.2 Checkout success / stale cart sau đặt đơn

#### Files chính

- `src/hooks/useCheckout.ts`
- `src/components/organisms/CartSummary/CartSummary.tsx`
- `src/components/organisms/CheckoutForm/CheckoutForm.tsx`

#### Thay đổi

- sau khi tạo đơn thành công, reset form checkout
- reset preview cart/voucher/selected items khi cart đã bị consume
- chặn không hiện lỗi kiểu:
  - `Giỏ hàng không tồn tại`
  - `không thuộc tài khoản`
  - `đã checkout`
- scroll/state của cart sau checkout coi là trạng thái bình thường, không nổi lỗi đỏ

#### Lưu ý khi rebase

- không bỏ logic reset preview và reset form sau order success

---

### 2.3 Giới hạn cart tối đa 300 sản phẩm

#### Files chính

- `src/features/cart/cart-server.service.ts`
- `src/app/api/v1/cart-items/route.ts`
- `src/app/api/v1/cart-items/[cart_item_id]/route.ts`

#### Thay đổi

- thêm hằng `MAX_CART_TOTAL_QUANTITY = 300`
- thêm helper tính `total_quantity` hiện tại của cart
- chặn ở backend cho cả:
  - add item vào cart
  - update quantity
  - merge dòng khi đổi variant/customization
- rule áp dụng theo tổng `quantity` của toàn bộ giỏ, không phải theo từng dòng
- khi vượt giới hạn trả lỗi `409`

#### Lưu ý khi rebase

- giữ cap tổng giỏ hàng 300 ở cả `POST` và `PATCH` cart items

---

### 2.4 Cart item size selector hiển thị tồn kho

#### Files chính

- `src/components/molecules/CartItem/CartItem.tsx`

#### Thay đổi

- option đổi size trong cart hiển thị trạng thái tồn kho ngay trong label:
  - `Còn hàng`
  - `Hết hàng`
- size hết hàng bị disable, không cho chọn
- nếu size hiện tại của item đã hết hàng thì vẫn giữ trong dropdown để người dùng biết trạng thái hiện tại

#### Lưu ý khi rebase

- không quay lại dropdown chỉ render tên size trần

---

### 2.5 Auth modal login/register fit viewport

#### Files chính

- `src/components/organisms/AuthModal/AuthModal.tsx`
- `src/components/templates/AuthShell/AuthShell.tsx`
- `src/components/organisms/LoginForm/LoginForm.tsx`
- `src/components/organisms/RegisterForm/RegisterForm.tsx`

#### Thay đổi

- bỏ scroll nội bộ trong khung modal auth
- nén spacing/padding/icon/input/button để modal gọn hơn
- modal được căn giữa viewport theo cả chiều ngang và chiều dọc
- đã kiểm tra và không còn dùng top margin cố định để đẩy modal xuống

#### Lưu ý khi rebase

- tránh khôi phục lại bản auth modal dùng `overflow-y-auto` trong shell

---

### 2.6 Site header disclaimer marquee

#### Files chính

- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/app/globals.css`

#### Thay đổi

- thêm dòng disclaimer chạy ở chân `SiteHeader`
- nội dung:
  - `Website được xây dựng phục vụ mục đích học tập trong khuôn khổ đồ án môn học. Không phải website chính thức của thương hiệu XÉO XỌ.`
- chỉ hiển thị từ breakpoint lớn (`xl`) để tránh chật header
- tăng `--site-header-height` tương ứng trên màn hình lớn
- typography của dòng chữ:
  - không bold
  - không uppercase
  - chữ mảnh hơn

#### Lưu ý khi rebase

- không bỏ phần tăng `--site-header-height` cho header lớn

---

### 2.7 Reviews section ở product detail

#### Files chính

- `src/components/organisms/ReviewsSection/ReviewsSection.tsx`

#### Thay đổi

- giới hạn `5 review / page`
- bỏ scroll bên trong khung review
- khi đổi trang review, scroll trên page về đầu section review bằng `scrollIntoView`

#### Lưu ý khi rebase

- không quay lại bản fetch `10 review / page`
- không khôi phục `max-h` + `overflow-y-auto` trong review box

---

### 2.8 Auth register auto-login cho số điện thoại

#### Files chính

- `src/app/api/v1/auth/signup/route.ts`
- `src/features/auth/register-phone.service.ts`
- `src/services/auth.service.ts`
- `src/hooks/useAuth.ts`
- `docs/api/api_list.md`
- `docs/report/test_case_auth.md`

#### Thay đổi

- thêm API `POST /api/v1/auth/signup` làm đầu mối đăng ký cho app
- đăng ký bằng số điện thoại được xử lý qua server-side admin client
- user phone mới được tạo với trạng thái `phone_confirm = true`
- sau khi đăng ký thành công, app sẽ thử đăng nhập ngay bằng mật khẩu cho cả email và số điện thoại
- không còn điều hướng người dùng sang bước xác minh SMS trước khi đăng nhập
- chỉ fallback về notice thử đăng nhập lại nếu bước login sau đăng ký vẫn không tạo được session

#### Lưu ý khi rebase

- không khôi phục `supabase.auth.signUp()` trực tiếp cho phone với `channel: "sms"`
- không khôi phục nhánh logic chỉ auto-login cho `email`

---

## 3. Docs đã cập nhật trong nhánh này

### API

- `docs/api/api_documentation.yaml`
- `docs/api/product-cart-checkout-api-final.md`

### Develop log

- `docs/develop/branch-test.md`

---

## 4. Gợi ý khi rebase

Nếu có conflict, nên rà lại tối thiểu các nhóm sau:

- loyalty reward / cart voucher
- checkout success reset
- cart max 300 quantity
- cart size selector stock state
- auth modal viewport fit
- site header disclaimer marquee
- reviews pagination 5 item/page
