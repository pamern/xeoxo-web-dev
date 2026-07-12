# Tổng hợp thay đổi nhánh `origin/develop_v2`

Ngày tổng hợp: `2026-07-12`

## 1. Mốc so sánh

- Nhánh gốc so sánh: `develop` (`c95fff3`)
- Nhánh cần đối chiếu: `origin/develop_v2`
- Chênh lệch hiện tại: `origin/develop_v2` đi trước `develop` đúng **1 commit**
  - `b1f5ab9` - `Update code`

## 2. Danh sách file thay đổi

```text
docs/api/API_RULES.md
docs/develop/test-scenarios-product-cart-checkout.md
src/app/cart/page.tsx
src/components/molecules/CartItem/CartItem.tsx
src/components/organisms/AppointmentForm/AppointmentForm.tsx
src/components/organisms/AppointmentModal/AppointmentModal.tsx
src/components/organisms/CartSummary/CartSummary.tsx
src/components/organisms/CheckoutForm/CheckoutForm.tsx
src/components/organisms/ProductDetail/ProductDetail.tsx
src/components/organisms/SizeGuideModal/SizeGuideModal.tsx
src/components/organisms/SizeRecommendationModal/SizeRecommendationModal.tsx
src/components/providers/CartToastProvider.tsx
src/features/cart/cart-server.service.ts
src/types/cart.types.ts
```

## 3. Nhóm thay đổi chính

### 3.1. Docs/API

- `docs/api/API_RULES.md`
  - Bổ sung thêm phần giải thích vì sao dự án chọn **REST API** thay vì GraphQL.
  - Thêm 5 nguyên tắc thiết kế API cốt lõi:
    - resource-oriented endpoint
    - standardized response
    - zero-trust customer_id
    - validate bằng Zod
    - tách lớp route -> feature -> response

- `docs/develop/test-scenarios-product-cart-checkout.md`
  - Thêm mới tài liệu test scenario khá dài cho:
    - Product Detail
    - Cart
    - Checkout
  - Nội dung thiên về checklist kiểm thử nghiệp vụ và UI/UX, chưa phải thay đổi code runtime.

### 3.2. Cart / Checkout layout và UI density

- `src/app/cart/page.tsx`
  - Thu hẹp khung tổng thể từ max width lớn xuống layout gọn hơn.
  - Đổi tỉ lệ cột cart/checkout.
  - Khung `CheckoutForm` và `CartSummary` được ép `max-width` rõ hơn.

- `src/components/molecules/CartItem/CartItem.tsx`
  - Thu nhỏ thumbnail, spacing, font size.
  - Đổi bố cục phần variant / quantity / line total sang grid ngang gọn hơn.
  - Điều này thiên về **compact UI** cho giỏ hàng.

- `src/components/organisms/CartSummary/CartSummary.tsx`
  - Thu nhỏ heading, nút voucher, bảng tổng tiền, checkbox điều khoản, nút thanh toán.
  - Bổ sung `useSharedMeasurements` để tái sử dụng số đo chung khi mở `CustomizeModal` từ giỏ hàng.
  - Nếu item đã có `customization_snapshot`, modal customize ưu tiên nạp snapshot cũ; nếu không có thì fallback sang shared measurements.

- `src/components/organisms/CheckoutForm/CheckoutForm.tsx`
  - Thu nhỏ hầu hết typography, input height, textarea, select, spacing và card address.
  - Chỉnh lại layout form shipping, phần địa chỉ đã lưu, nhãn field, payment section.
  - Nút/khối gia nhập Xéo Hội cũng được thu gọn.
  - Đây là thay đổi nặng về **mật độ hiển thị và compact form**.

### 3.3. Product Detail / Customize / Size flow

- `src/components/organisms/ProductDetail/ProductDetail.tsx`
  - Đây là file đổi nhiều nhất trong commit này.
  - Bổ sung logic hỗ trợ giữ tạm customization theo từng component:
    - thêm kiểu `TemporaryCustomization`
    - kiểm tra bộ số đo đã nhập có đầy đủ hay chưa
    - map shared measurements sang bộ field thực sự dùng cho từng `component_type`
  - Luồng customize trong product detail được đổi theo hướng:
    - nếu đã có số đo dùng được thì mở/customize với dữ liệu có sẵn
    - không xóa `CUSTOM` ngay khi bấm mở lại modal
    - chỉ cho add-to-cart khi custom size đã được xác nhận thực sự
  - Với multi-component product:
    - tính item “đủ điều kiện add” dựa trên `variantId`, `customizationId`, hoặc custom đã có dữ liệu xác nhận
    - nút add-to-cart bị disable nếu chỉ chọn `CUSTOM` nhưng chưa confirm số đo
  - `CartToastProvider` cũng được nâng cấp để hiển thị toast cho **nhiều item cùng lúc**, phục vụ add nhiều component.

- `src/components/providers/CartToastProvider.tsx`
  - `showAddedToCart` nhận `CartItemDto | CartItemDto[]` thay vì 1 item.
  - Toast render danh sách nhiều item trong một lần add.

- `src/components/organisms/SizeGuideModal.tsx`
  - Làm lại modal hướng dẫn size theo kiểu ảnh full-fit, căn giữa, ít chrome hơn.
  - Bỏ header cũ, giữ chủ yếu ảnh + nút đóng lớn hơn.
  - `genderLabel` hiển thị đúng dấu tiếng Việt (`nữ`).

- `src/components/organisms/SizeRecommendationModal.tsx`
  - Nút xóa (`handleClear`) không còn bị phụ thuộc hoàn toàn vào `canPersistMeasurements`.
  - Save button vẫn chỉ hiện khi cho phép persist measurements.

### 3.4. Appointment UI

- `src/components/organisms/AppointmentForm/AppointmentForm.tsx`
  - Refactor mạnh giao diện form:
    - input bo góc vuông mềm hơn thay vì pill cũ
    - font nhỏ hơn, đậm hơn
    - dropdown branch/date/time thu nhỏ và đổi style selection
    - button submit và khối footer đổi sang card nền ảnh compact
  - Một số placeholder/label bị chỉnh lại để dễ đọc hơn.

- `src/components/organisms/AppointmentModal/AppointmentModal.tsx`
  - Modal chuyển sang dạng full-screen overlay cố định với backdrop riêng.
  - Thu nhỏ chiều rộng modal, đổi header, title, close button.
  - Kết cấu modal mới thiên về dialog chuẩn hơn (`role="dialog"`, `aria-modal`).

### 3.5. Cart data mapping

- `src/features/cart/cart-server.service.ts`
  - Lấy thêm `component_name` từ `catalog.product_component`.
  - `CartItemDto.name` ưu tiên `component.component_name` thay vì luôn dùng `product_line.line_name`.
  - Hữu ích với sản phẩm nhiều component/may đo, giúp tên item trong cart cụ thể hơn.

- `src/types/cart.types.ts`
  - Bổ sung field `component_name?: string | null`.

## 4. Ý nghĩa nghiệp vụ tổng quát của `develop_v2`

Nhánh này không tạo module mới hoàn toàn, mà chủ yếu:

- thu gọn và tinh chỉnh giao diện `cart`, `checkout`, `appointment`
- cải thiện luồng **custom size / shared measurements** ở `ProductDetail` và `CartSummary`
- cải thiện khả năng hiển thị nhiều item khi add-to-cart
- làm tên item trong giỏ hàng sát component thực hơn
- thêm tài liệu test scenario và guideline API

## 5. Các vùng rất dễ conflict khi rebase vào `tester`

### Mức độ cao

- `src/components/molecules/CartItem/CartItem.tsx`
  - `tester` đã sửa logic option size chỉ hiển thị còn tồn kho.
  - `develop_v2` lại sửa mạnh layout compact của cùng component.
  - Rebase cần giữ cả:
    - logic option size còn tồn kho của `tester`
    - UI compact của `develop_v2` nếu muốn theo hướng mới

- `src/components/organisms/CartSummary/CartSummary.tsx`
  - `tester` đã thêm load voucher/loyalty reward, reset checkout state sau đặt hàng, auth modal trong cart, điều chỉnh text voucher.
  - `develop_v2` sửa spacing, heading, voucher button style, total block, terms block, và thêm shared measurements cho customize.
  - Đây là vùng conflict lớn nhất trong cart.

- `src/components/organisms/CheckoutForm/CheckoutForm.tsx`
  - `tester` đã sửa flow reset form khi cart stale sau checkout và một số hành vi liên quan cart/checkout.
  - `develop_v2` lại thay đổi rất mạnh UI compact.
  - Nếu rebase, cần giữ:
    - hành vi nghiệp vụ của `tester`
    - style/layout compact nếu muốn theo `develop_v2`

- `src/features/cart/cart-server.service.ts`
  - `tester` đã thêm giới hạn tối đa 300 sản phẩm trong giỏ.
  - `develop_v2` thêm `component_name` và đổi mapping tên item.
  - Rebase phải gộp cả 2, tránh mất rule giới hạn giỏ hàng.

- `src/components/organisms/ProductDetail/ProductDetail.tsx`
  - `tester` có sửa review/purchase/cart liên quan product detail ở một số nhánh trước.
  - `develop_v2` đổi rất sâu logic customize/custom size/shared measurements.
  - Khi merge vào `tester`, file này cần review kỹ từng hunk, không nên auto-resolve.

### Mức độ trung bình

- `src/components/organisms/AppointmentModal/AppointmentModal.tsx`
  - `tester` trước đó cũng đã chạm modal appointment.
  - `develop_v2` đổi hẳn modal shell.
  - Cần chọn rõ giữ shell/dialog nào.

- `src/components/organisms/AppointmentForm/AppointmentForm.tsx`
  - Nếu `tester` có thay validation/label/form spacing trước đó thì sẽ đụng tiếp.
  - `develop_v2` nghiêng về UI refresh hơn là đổi nghiệp vụ.

- `src/components/providers/CartToastProvider.tsx`
  - Nếu `tester` chưa sửa file này thì thường merge được.
  - Nhưng cần nhớ: `develop_v2` kỳ vọng `showAddedToCart` có thể nhận mảng item.

- `src/types/cart.types.ts`
  - Ít conflict nhưng cần giữ field mới `component_name` nếu cart UI cần tên component.

### Mức độ thấp

- `docs/api/API_RULES.md`
- `docs/develop/test-scenarios-product-cart-checkout.md`
- `src/app/cart/page.tsx`
- `src/components/organisms/SizeGuideModal/SizeGuideModal.tsx`
- `src/components/organisms/SizeRecommendationModal.tsx`

Các file này chủ yếu là docs hoặc UI shell; conflict nếu có thường dễ xử lý hơn.

## 6. Gợi ý khi rebase `tester` với `develop_v2`

Nên kiểm tra theo thứ tự:

1. `src/features/cart/cart-server.service.ts`
2. `src/types/cart.types.ts`
3. `src/components/organisms/CartSummary/CartSummary.tsx`
4. `src/components/organisms/CheckoutForm/CheckoutForm.tsx`
5. `src/components/molecules/CartItem/CartItem.tsx`
6. `src/components/organisms/ProductDetail/ProductDetail.tsx`
7. `src/components/organisms/AppointmentModal/AppointmentModal.tsx`
8. `src/components/organisms/AppointmentForm/AppointmentForm.tsx`
9. `src/components/providers/CartToastProvider.tsx`

Ưu tiên merge theo nguyên tắc:

- Giữ **logic nghiệp vụ** của `tester` nếu nó là thay đổi tính năng đã chốt
- Lấy **compact UI / shared measurement flow** của `develop_v2` nếu không phá hành vi `tester`
- Với `ProductDetail`, cần đối chiếu thủ công vì `develop_v2` thay đổi cả UI lẫn business flow cho customize

## 7. Kết luận ngắn

`origin/develop_v2` thực chất là một nhánh **compact UI + custom-size flow refinement** nằm trên nền `develop`. Nó không quá rộng về số commit, nhưng do tập trung vào đúng các file `cart/checkout/product detail/appointment`, nên khi nhập vào `tester` sẽ có khả năng conflict cao ở các màn hình mà `tester` cũng đã sửa trước đó.
