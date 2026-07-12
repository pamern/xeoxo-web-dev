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

## 4.2 Cart page shell #! Lấy toàn bộ cấu trúc giao diện của trang giỏ hàng từ nhấnh v7. 

### File

- `src/app/cart/page.tsx`

### Quyết định

- chọn: `v7`

### Giữ

- layout trang cart của `v7`
- wrapper 2 cột với `CheckoutForm` bên trái và `CartSummary` bên phải
- cách tổ chức page đơn giản hơn của `v7`
- không thực hiện merge thêm ở cấp page

### Bỏ

- page shell tách `CartSummaryProvider` / `CartSummaryProducts` / `CartSummaryPayment` ở cấp page của `develop`

### Lý do

- comment `#!` chốt lấy toàn bộ cấu trúc giao diện trang giỏ hàng từ `v7`
- quyết định mới chốt luôn là không chỉnh thêm gì ở nhóm cart

### Comment nếu muốn đổi

- có thể comment nếu muốn trả lại page shell tách panel của `develop`

---

## 4.3 Cart item row #!Trong cartitemrow bỏ thành phần chọn màu.

### File

- `src/components/molecules/CartItem/CartItem.tsx`

### Quyết định

- chọn: `v7`

### Giữ

- selector màu + size của `v7`
- flow chọn `Customize` ngay trên item
- layout row phục vụ cart customize

### Bỏ

- bản row lớn hơn của `develop`

### Lý do

- quyết định mới chốt giữ nguyên toàn bộ cart theo `v7`
- không tách riêng thay đổi màu/size nữa

### Comment nếu muốn đổi

- có thể comment nếu muốn trả lại spacing/thumbnail lớn hơn từ `develop`

---

## 4.4 Cart summary state và payment panel #! Trang cart giữ nguyên giao diện và logic từ nhánh v7, không thực hiện thay đổi thêm. 

### File

- `src/components/organisms/CartSummary/CartSummary.tsx`

### Quyết định

- chọn: `v7`

### Giữ

- toàn bộ `CartSummary` của `v7`
- `CustomizeModal`
- `parseMeasurementValues`
- state `customizingItem`
- submit flow tạo customization request rồi update cart item
- `onCustomize` truyền xuống `CartItem`

### Lý do

- quyết định mới chốt toàn bộ cart giữ nguyên `v7`
- không merge thêm responsive/order từ `develop`

### Comment nếu muốn đổi

- có thể comment nếu muốn quay lại phương án merge tay với `develop`

---

## 4.5 Checkout form #! Lấy logic và giao diện nhánh v7

### File

- `src/components/organisms/CheckoutForm/CheckoutForm.tsx`

### Quyết định

- chọn: `v7`

### Giữ

- giao diện `CheckoutForm` của `v7`
- logic validate và checkout flow của `v7`
- payment method handling của `v7`
- không chỉnh thêm theo `develop`

### Bỏ

- bản `CheckoutForm` lấy từ `develop`

### Lý do

- comment `#!` chốt lấy cả logic lẫn giao diện từ `v7`

### Comment nếu muốn đổi

- có thể comment nếu muốn chỉ giữ logic `v7` nhưng quay lại shell field của `develop`

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

- có thể comment nếu muốn giữ logic `v7` nhưng lấy lại visual token của `develop` ==> Coi lại

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

## 4.9 Appointment form #! giao diện giữ theo nhánh develop, logic giữ từ nhánh v7. Giữ select khung giờ như bên nhánh develop. 

### File

- `src/components/organisms/AppointmentForm/AppointmentForm.tsx`

### Quyết định

- chọn: `manual merge`

### Giữ

- giao diện của `develop`
- custom select khung giờ của `develop`
- date/branch/time picker structure của `develop`

### Bỏ

- phần giao diện compact riêng của `v7`

### Lý do

- comment `#!` chốt:
  - giao diện theo `develop`
  - logic theo `v7`
  - select khung giờ giữ kiểu `develop`

### Sửa tay

- thêm debounce validate của `v7`
- thêm normalize dữ liệu khi blur/submit của `v7`
- giữ nguyên phần select time slot đang dùng ở `develop`

### Comment nếu muốn đổi

- có thể comment nếu muốn trả form về thuần `develop` hoặc thuần `v7`

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

## 4.11 Site header và search #! Header giữ nguyên từ nhánh develop, không thực hiện chỉnh sửa thêm. 

### File

- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/services/product.service.ts`

### Quyết định

- chọn:
  - `SiteHeader`: `develop`
  - `product.service`: giữ nguyên trạng thái hiện tại

### Giữ

- `SiteHeader` đúng theo nhánh `develop`
- không chỉnh thêm UI/header behavior ngoài bản `develop`
- `product.service` không thay đổi thêm trong bước này

### Bỏ

- mọi chỉnh sửa thêm lên `SiteHeader` ngoài bản `develop`

### Lý do

- comment `#!` đã chốt rõ phần `header` phải giữ nguyên từ `develop`

### Comment nếu muốn đổi

- có thể comment nếu muốn tách riêng quyết định của `search service` khỏi `header`

---

## 5. Trạng thái hiện tại sau khi resolve

- code đã được chỉnh lại theo các comment `#!` trong file này
- doc này đã được cập nhật lại để phản ánh đúng hướng resolve mới

## 6. Cách comment lại

Nếu muốn đổi một quyết định, chỉ cần comment theo format ngắn như:

- `4.4 CartSummary: đổi từ manual merge sang giữ nguyên v7`
- `4.7 ProductDetail: giữ logic v7 nhưng lấy style develop`
- `4.11 Header search: quay lại dropdown search của v7`
