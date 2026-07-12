# Rebase `develop_v2` into `tester` - Conflict Handling Notes

Ngày thực hiện: `2026-07-12`

## Tài liệu đã đối chiếu

- `docs/develop/merger-zang3-tester.md`
- `docs/develop/branch-develop-v2.md`

## Hướng rebase thực hiện

- Nhánh đang rebase: `tester`
- Nhánh nền dùng để rebase: `truc-develop2`
  - lưu ý: `truc-develop2` đang chứa:
    - code của `origin/develop_v2`
    - thêm 1 commit docs local `60aacd3 docs: summarize develop_v2 branch changes`

Lệnh thực hiện:

- `git rebase truc-develop2`

## Kết quả rebase

- Rebase hoàn tất thành công
- Không phát sinh conflict thủ công khiến Git dừng lại
- Tuy nhiên có nhiều file được **auto-merge trên cùng vùng chức năng/UI**, nên vẫn cần ghi rõ quyết định kiểm tra sau merge

## Commit của `tester` đã được replay sau rebase

1. `81e5369` - `chore: sync branch tester updates`
2. `ab1829a` - `feat: tighten auth validation and login guard`

## Các vùng chức năng đã được kiểm tra sau rebase

### 1. Cart server / cart data mapping

File kiểm tra:

- `src/features/cart/cart-server.service.ts`
- `src/types/cart.types.ts`

Kết quả:

- Giữ được logic của `tester`:
  - `MAX_CART_TOTAL_QUANTITY = 300`
  - helper `getCartTotalQuantity`
  - rule giới hạn tối đa 300 sản phẩm trong giỏ
- Đồng thời giữ được phần của `develop_v2`:
  - thêm `component_name`
  - mapping tên item ưu tiên `component.component_name`

Quyết định xử lý:

- Giữ **cả hai phía**

Lý do:

- Hai thay đổi bổ sung cho nhau
- Không có mâu thuẫn business rule

### 2. Cart item UI

File kiểm tra:

- `src/components/molecules/CartItem/CartItem.tsx`

Kết quả:

- Giữ được compact UI từ `develop_v2`:
  - thumbnail nhỏ hơn
  - spacing gọn hơn
  - grid ngang cho variant / quantity / line total
- Giữ được logic của `tester`:
  - size selector dùng danh sách option tồn kho
  - snapshot customize vẫn còn hiển thị

Quyết định xử lý:

- Giữ **compact UI của `develop_v2`**
- Giữ **logic size còn tồn kho và customize snapshot của `tester`**

Lý do:

- Không có hành vi nào bị mất sau auto-merge

### 3. Cart summary / voucher / customize in cart

File kiểm tra:

- `src/components/organisms/CartSummary/CartSummary.tsx`

Kết quả:

- Giữ được logic `tester`:
  - load loyalty reward thật
  - chọn/ap dụng voucher reward
  - auth modal trong cart
  - reset preview khi cart trống / đổi selection
- Giữ được phần `develop_v2`:
  - compact UI cho summary block
  - `useSharedMeasurements`
  - ưu tiên `customization_snapshot` rồi fallback sang shared measurements khi mở customize modal từ cart

Quyết định xử lý:

- Giữ **cả hai phía**

Lý do:

- Logic reward của `tester` và flow shared measurement của `develop_v2` cùng tồn tại tốt

### 4. Checkout form

File kiểm tra:

- `src/components/organisms/CheckoutForm/CheckoutForm.tsx`

Kết quả:

- Giữ được phần UI compact của `develop_v2`
- Các thay đổi nghiệp vụ đã có từ `tester` ở nhánh cart/checkout tiếp tục tồn tại trong hệ thống sau rebase

Quyết định xử lý:

- Giữ **layout compact của `develop_v2`**
- Giữ **các flow checkout đã chốt từ `tester`**

Lý do:

- Mục tiêu của `develop_v2` ở file này chủ yếu là UI density, không phủ định logic `tester`

Ghi chú:

- Vì file này lớn và thay đổi chủ yếu là spacing/typography, nên vẫn nên test tay lại toàn bộ:
  - member checkout
  - guest checkout
  - chọn địa chỉ có sẵn
  - nhập địa chỉ mới

### 5. Product detail / customize / shared measurements

File kiểm tra:

- `src/components/organisms/ProductDetail/ProductDetail.tsx`
- `src/components/providers/CartToastProvider.tsx`
- `src/components/organisms/SizeGuideModal/SizeGuideModal.tsx`
- `src/components/organisms/SizeRecommendationModal/SizeRecommendationModal.tsx`

Kết quả:

- Giữ được phần `develop_v2`:
  - custom size chỉ được add khi đã confirm dữ liệu
  - shared measurements map theo `component_type`
  - mở lại customize modal không xóa trạng thái quá sớm
  - `CartToastProvider` nhận được mảng item
  - `SizeGuideModal` / `SizeRecommendationModal` theo shell mới
- Không thấy phần logic trước đó của `tester` bị mất ở những vùng đã kiểm tra nhanh

Quyết định xử lý:

- Giữ **product detail customize flow của `develop_v2`**
- Giữ **các thay đổi phụ trợ của `tester` không đụng trực tiếp vào flow này**

Lý do:

- `develop_v2` là nhánh sửa sâu nhất ở product detail/customize, nên đây là hướng chính cần giữ

Ghi chú:

- Dù Git không báo conflict, đây vẫn là file rủi ro cao nhất sau merge
- Nên test tay các case:
  - single component chọn `CUSTOM`
  - multi-component có item custom + item size thường
  - thêm nhiều item cùng lúc để kiểm tra toast
  - reopen customize modal với dữ liệu cũ

### 6. Appointment UI

File kiểm tra:

- `src/components/organisms/AppointmentForm/AppointmentForm.tsx`
- `src/components/organisms/AppointmentModal/AppointmentModal.tsx`

Kết quả:

- Giữ được shell/modal mới của `develop_v2`
- Không thấy thay đổi nghiệp vụ nào từ `tester` bị loại bỏ trong phần kiểm tra nhanh

Quyết định xử lý:

- Giữ **giao diện appointment modal/form của `develop_v2`**

Lý do:

- `develop_v2` chỉnh lại toàn bộ shell và compact form rõ ràng hơn, còn `tester` không có business rule mới cạnh tranh trực tiếp ở đây

### 7. Auth improvements from `tester`

File kiểm tra:

- `src/hooks/useAuth.ts`
- `src/services/auth.service.ts`
- `src/lib/auth-login-guard.ts`
- `docs/report/test_case_auth.md`

Kết quả:

- Giữ nguyên toàn bộ commit auth của `tester`:
  - chặn tạm thời 5 phút sau 5 lần đăng nhập sai
  - map lỗi email tồn tại
  - map lỗi số điện thoại tồn tại
  - map lỗi không gửi được email xác thực
  - report test case auth

Quyết định xử lý:

- Giữ **toàn bộ**

Lý do:

- `develop_v2` không sửa vào vùng auth này

### 8. Các thay đổi đã có từ rebase `zang3 -> tester`

File/nhóm kiểm tra nhanh:

- `src/app/globals.css`
- `src/components/organisms/ProductReviewModal/ProductReviewModal.tsx`
- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/components/organisms/ReviewsSection/ReviewsSection.tsx`

Kết quả:

- `site-header-marquee` vẫn còn
- `ProductReviewModal` vẫn giữ phương án đã chốt từ lần rebase trước:
  - `z-[200]`
  - mobile `max-h-[90vh]`
  - `sm:max-h-[85vh]`
- `REVIEWS_PER_PAGE = 5` vẫn còn

Quyết định xử lý:

- Giữ nguyên quyết định đã chốt ở `merger-zang3-tester.md`

## Các file cùng vùng chức năng nhưng không phát sinh conflict manual

Git không dừng conflict ở các file sau dù hai nhánh đều có sửa:

- `src/components/molecules/CartItem/CartItem.tsx`
- `src/components/organisms/CartSummary/CartSummary.tsx`
- `src/components/organisms/CheckoutForm/CheckoutForm.tsx`
- `src/components/organisms/ProductDetail/ProductDetail.tsx`
- `src/components/organisms/AppointmentModal/AppointmentModal.tsx`
- `src/components/organisms/AppointmentForm/AppointmentForm.tsx`
- `src/features/cart/cart-server.service.ts`
- `src/types/cart.types.ts`
- `src/components/providers/CartToastProvider.tsx`

Kết luận xử lý:

- Không cần manual resolve thêm ở thời điểm rebase
- Nhưng đây là nhóm file cần ưu tiên test tay vì đều là auto-merge trên cụm nghiệp vụ/UI quan trọng

## Trường hợp cần user chốt hướng xử lý

Tại thời điểm rebase này:

- **Không có conflict nào bắt buộc phải dừng để user chọn một phía**

Lý do:

- Những vùng đụng nhau đã được Git auto-merge theo text
- Kiểm tra nhanh sau rebase cho thấy các thay đổi chính của cả hai nhánh vẫn hiện diện cùng lúc

## Khuyến nghị test sau rebase

Nên kiểm tra lại ít nhất:

1. Cart item đổi size chỉ hiện size còn tồn kho
2. Cart tối đa 300 sản phẩm
3. Voucher loyalty hiển thị đúng theo tier hiện tại
4. Checkout thành công thì reset form/cart preview đúng
5. Product detail custom size:
   - single component
   - multi-component
   - reopen modal với shared measurements
6. Appointment modal mới căn giữa và hoạt động submit bình thường
7. Auth:
   - email tồn tại
   - SĐT tồn tại
   - lỗi gửi email xác thực
   - sai password 5 lần bị khóa 5 phút

## Trạng thái hiện tại

- `tester` đã rebase thành công lên `truc-develop2`
- Lịch sử hiện tại trên `tester`:
  - `ab1829a` `feat: tighten auth validation and login guard`
  - `81e5369` `chore: sync branch tester updates`
  - `c2d4dcb` `feat: catalog real newest/bestseller data, account UI cleanup, chat widget demo`
  - `60aacd3` `docs: summarize develop_v2 branch changes`
  - `b1f5ab9` `Update code`
