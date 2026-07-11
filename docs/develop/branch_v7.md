# Conflict Resolution Log: `v7` rebase onto `develop`

## 1. Mục đích

File này ghi lại các quyết định xử lý conflict khi rebase nhánh `v7` lên `develop`.

Mục tiêu:

- chỉ rõ file/nhóm chức năng nào đã conflict
- ghi rõ mình đang ưu tiên phía nào:
  - `develop`
  - `v7`
  - `manual merge`
- mô tả ngắn gọn giữ gì, bỏ gì, sửa tay gì
- chừa chỗ để comment nếu muốn đổi lại quyết định resolve

---

## 2. Quy ước trong đợt rebase này

Do đây là `rebase v7 onto develop`:

- phía `develop` là base mới sau rebase
- phía `v7` là commit đang được replay lại
- khi ghi quyết định trong file này, mình sẽ dùng trực tiếp tên nhánh:
  - `develop`
  - `v7`

---

## 3. Nguyên tắc mình đang dùng

### 3.1 Shared layout, API, search, header

- ưu tiên `develop`
- lý do:
  - đây là các phần dùng chung toàn site
  - `develop` đang có cấu trúc mới hơn, ít rủi ro vỡ flow hơn

### 3.2 Checkout, cart, customize

- ưu tiên giữ logic nghiệp vụ từ `v7` nếu nó bổ sung flow thật
- nhưng không kéo nguyên khối UI cũ nếu `develop` đã tách structure tốt hơn
- nếu cả hai bên đều có giá trị:
  - chọn `manual merge`

---

## 4. Quyết định theo từng nhóm

## 4.1 Review API

### File

- `src/app/api/v1/product-lines/[slug]/reviews/route.ts`

### Quyết định

- chọn: `develop`

### Giữ

- cách load review media đầy đủ hơn của `develop`
- preserve thứ tự media và metadata media

### Bỏ

- bản query media rút gọn của `v7`

### Lý do

- phía `develop` trả dữ liệu review ổn định hơn cho UI review gallery

### Comment nếu muốn đổi

- có thể comment nếu muốn quay lại bản query media gọn hơn của `v7`

---

## 4.2 Cart page shell

### File

- `src/app/cart/page.tsx`

### Quyết định

- chọn: `develop`

### Giữ

- `CartSummaryProvider`
- layout tách `CartSummaryProducts` và `CartSummaryPayment`
- grid shell mới của trang cart

### Bỏ

- wrapper cũ chỉ render `CartSummary` nguyên khối của `v7`

### Lý do

- structure của `develop` rõ hơn, dễ cắm lại logic customize từ `v7`

### Comment nếu muốn đổi

- có thể comment nếu muốn quay lại layout 2 cột cũ của `v7`

---

## 4.3 Cart item row

### File

- `src/components/molecules/CartItem/CartItem.tsx`

### Quyết định

- chọn: `v7`

### Giữ

- selector màu + size
- flow chọn `Customize` ngay trên item
- layout row phục vụ cart customize

### Bỏ

- bản row lớn hơn của `develop`

### Lý do

- đây là file gắn trực tiếp với flow cart/customize của `v7`

### Comment nếu muốn đổi

- có thể comment nếu muốn trả lại spacing/thumbnail lớn hơn từ `develop`

---

## 4.4 Cart summary state và payment panel

### File

- `src/components/organisms/CartSummary/CartSummary.tsx`

### Quyết định

- chọn: `manual merge`

### Giữ từ `develop`

- `CartSummaryProvider`
- tách `CartSummaryProducts` / `CartSummaryPayment`
- `usePaymentMethods`
- hidden field `payment_method_id`
- payment method section của payment panel

### Giữ từ `v7`

- `CustomizeModal`
- `parseMeasurementValues`
- state `customizingItem`
- submit flow tạo customization request rồi update cart item
- `onCustomize` truyền xuống `CartItem`

### Sửa tay

- cấy lại logic customize của `v7` vào structure context/provider của `develop`
- render `CustomizeModal` trong `CartSummaryPayment`

### Lý do

- `develop` mạnh hơn ở cấu trúc checkout/payment
- `v7` lại có logic customize thật, không nên bỏ

### Comment nếu muốn đổi

- có thể comment nếu muốn:
  - bỏ payment method section để quay về flow `v7`
  - hoặc bỏ customize modal để giữ cart gọn như `develop`

---

## 4.5 Checkout form

### File

- `src/components/organisms/CheckoutForm/CheckoutForm.tsx`

### Quyết định

- chọn: `develop`

### Giữ

- layout form, spacing, address flow và field sizing của `develop`

### Bỏ

- phần style compact cũ của `v7`

### Lý do

- logic checkout hiện đã ăn với shell mới của `develop`

### Comment nếu muốn đổi

- có thể comment nếu muốn lấy lại density nhỏ hơn từ `v7`

---

## 4.6 Product card

### File

- `src/components/molecules/ProductCard/ProductCard.tsx`

### Quyết định

- chọn: `develop`

### Giữ

- quick add on hover
- prefetch/search-path behavior của `develop`

### Lý do

- đây là shared component, nên ưu tiên bản đang đồng bộ với các hook hiện tại

### Comment nếu muốn đổi

- có thể comment nếu muốn đổi lại chi tiết spacing/href handling

---

## 4.7 Product detail customize area

### File

- `src/components/organisms/ProductDetail/ProductDetail.tsx`

### Quyết định

- chọn: `v7`

### Giữ

- cụm UI customize/component purchase của `v7`
- cách hiển thị màu ở component card
- block notice dạng expand/collapse

### Bỏ

- styling/tokenized variant mới của `develop` ở các hunk conflict

### Lý do

- `v7` gắn chặt với customize flow của PDP, ít nguy cơ lệch hành vi hơn nếu giữ nguyên

### Comment nếu muốn đổi

- có thể comment nếu muốn giữ logic `v7` nhưng lấy lại visual token của `develop`

---

## 4.8 Size recommendation modal

### File

- `src/components/organisms/SizeRecommendationModal/SizeRecommendationModal.tsx`

### Quyết định

- chọn: `v7`

### Giữ

- warning confirm số đo
- `warningMessage`
- nhánh xác nhận lại trước khi tính size tiếp

### Lý do

- đây là bổ sung flow thật chứ không chỉ đổi CSS

### Comment nếu muốn đổi

- có thể comment nếu muốn bỏ warning modal để quay lại flow thẳng của `develop`

---

## 4.9 Appointment form

### File

- `src/components/organisms/AppointmentForm/AppointmentForm.tsx`

### Quyết định

- chọn: `develop`

### Giữ

- version form mới hơn của `develop`
- structure import/state đang khớp với code hiện tại

### Bỏ

- style compact và debounce validation của `v7` tại các hunk conflict

### Lý do

- `develop` an toàn hơn về tính đồng bộ với phần còn lại của booking form

### Comment nếu muốn đổi

- có thể comment nếu muốn merge lại debounce validate từ `v7`

---

## 4.10 Appointment service

### File

- `src/services/appointment.service.ts`

### Quyết định

- chọn: `manual merge`

### Giữ từ `develop`

- `cancelAppointment`

### Giữ từ `v7`

- `getBranches`

### Sửa tay

- thêm lại import `SelectOption`
- giữ cả hai method trong cùng `appointmentService`

### Lý do

- hai bên bổ sung hai năng lực khác nhau, không có lý do bỏ một trong hai

### Comment nếu muốn đổi

- có thể comment nếu muốn chuyển `getBranches` sang service khác

---

## 4.11 Site header và search

### File

- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/services/product.service.ts`

### Quyết định

- chọn: `develop`

### Giữ

- search suggestion flow của `develop`
- state search/header mới
- API `getSearchSuggestions` và `getSearchResults`

### Bỏ

- flow `searchProducts` cũ của `v7`
- dropdown search cũ trong header

### Lý do

- header là shared entry point toàn site, nên ưu tiên bản đã đồng bộ với hook/service hiện tại

### Comment nếu muốn đổi

- có thể comment nếu muốn quay lại search dropdown kiểu `v7`

---

## 5. Trạng thái hiện tại sau khi resolve

- rebase đang được resolve theo chiến lược trên
- doc này là bản ghi để có thể comment và đổi lại từng quyết định nếu cần

## 6. Cách comment lại

Nếu muốn đổi một quyết định, chỉ cần comment theo format ngắn như:

- `4.4 CartSummary: đổi từ manual merge sang giữ nguyên v7`
- `4.7 ProductDetail: giữ logic v7 nhưng lấy style develop`
- `4.11 Header search: quay lại dropdown search của v7`
