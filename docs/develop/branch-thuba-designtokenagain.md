# Conflict Resolution Log: `thuba_designtokenagain` rebase onto `develop`

## 1. Mục đích

Tài liệu này tổng hợp lại toàn bộ các quyết định xử lý conflict khi rebase nhánh `thuba_designtokenagain` lên `develop`.

Mục tiêu của file:

- ghi rõ từng nhóm chức năng/giao diện đã conflict
- nêu rõ ở mỗi nhóm đã ưu tiên:
  - `current (thuba)`
  - `incoming (develop)`
  - `both`
  - `manual merge`
- mô tả cụ thể mình đã giữ gì, bỏ gì, và sửa tay như thế nào
- giúp review lại quyết định merge nếu cần làm lại hoặc chỉnh lại chiến lược resolve

---

## 2. Bối cảnh conflict

Conflict tập trung chủ yếu ở commit:

- `f601acc` / `4ed4fb9`
- message: `Refine UI layouts and modal sizing`

Đặc điểm của đợt conflict này:

- không phải conflict kiểu đổi API/data contract
- phần lớn là conflict UI shell, spacing, typography, card/panel styling, responsive layout
- `develop` đã có một số cấu trúc layout/page shell mới
- `thuba` có nhiều tinh chỉnh UI trực tiếp trong component
- một vài hunk từ `thuba` kéo theo logic mở rộng chứ không chỉ là UI, ví dụ OTP flow trong `CancelOrderButton`

---

## 3. Quy ước ghi quyết định

### `current (thuba)`

Giữ gần như toàn bộ phần của nhánh đang rebase (`thuba_designtokenagain`).

### `incoming (develop)`

Giữ phần từ nhánh đích rebase là `develop`.

### `both`

Giữ cả hai phía, thường là:

- giữ shell/layout mới của `develop`
- hấp thụ className/spacing/visual tuning từ `thuba`

### `manual merge`

Không chọn nguyên khối một bên nào; sửa tay để tạo ra phiên bản thứ ba.

---

## 4. Nguyên tắc tổng quát đã dùng khi resolve

### 4.1 Ưu tiên logic đang hoạt động

Nếu `develop` có logic mới hơn hoặc flow hiện tại đang chạy ổn:

- ưu tiên `incoming (develop)`
- không kéo UI của `thuba` nếu việc đó làm đổi flow hoặc thêm state mới

### 4.2 Ưu tiên shell/layout chuẩn hoá

Nếu `develop` đã chuẩn hoá page shell:

- giữ `account-page-shell`
- giữ `account-page-grid`
- giữ `account-sticky-rail`
- giữ `account-content-panel`

Sau đó mới hấp thụ tinh chỉnh UI an toàn từ `thuba`.

### 4.3 Không nhập logic mở rộng ngoài phạm vi resolve

Nếu `thuba` mang theo thay đổi vượt quá mục tiêu “refine UI”:

- không nhập nguyên trạng
- chỉ lấy phần visual nếu tách rời được
- nếu không tách rời được thì giữ `develop`

Ví dụ:

- OTP flow trong `CancelOrderButton`

### 4.4 Với CSS/Tailwind token

- nếu `globals.css` dùng token typography nhưng `tailwind.config.ts` chưa có
- ưu tiên bổ sung token vào config để đồng bộ naming
- chỉ fallback sang utility mặc định nếu cần unblock nhanh build

---

## 5. Quyết định theo từng nhóm chức năng

## 5.1 Account shell và account pages

### File

- `src/app/account/orders/[id]/page.tsx`
- `src/app/account/orders/page.tsx`
- liên quan gián tiếp:
  - `src/app/account/layout.tsx`
  - `src/app/account/account.css`
  - `src/app/globals.css`
  - `src/components/organisms/AccountNavigation/AccountNavigation.tsx`

### Quyết định

- lựa chọn chính: `incoming (develop)`
- kiểu merge: `giữ nguyên develop`, không chỉnh sửa thêm

### Đã giữ từ `incoming (develop)`

- toàn bộ shell/layout của `src/app/account/orders/[id]/page.tsx`
- toàn bộ shell/layout của `src/app/account/orders/page.tsx`
- breadcrumb, wrapper, content panel, spacing, shadow đúng bản `develop`

### Lý do

Nhóm này được chốt lại là không giữ bất kỳ chỉnh sửa nào từ nhánh hiện tại. Mục tiêu là khôi phục nguyên cấu trúc account pages của `develop` để tránh sai khác UI giữa doc và code.

---

## 5.2 Account navigation

### File

- `src/components/organisms/AccountNavigation/AccountNavigation.tsx`

### Quyết định

- lựa chọn chính: `incoming (develop)`
- kiểu merge: `giữ nguyên develop`, không chỉnh sửa thêm

### Đã giữ từ `incoming (develop)`

- card nav variant `account`
- spacing, kích thước icon, typography của nav
- logout confirmation modal đúng sizing/spacings của `develop`

### Lý do

Theo quyết định mới, phần navigation của account cũng phải đồng nhất tuyệt đối với `develop`, nên không giữ lại tinh chỉnh visual nào của nhánh hiện tại.

---

## 5.3 Order history list #! Giữ nguyên toàn bộ từ nhánh develop

### File

- `src/components/organisms/AccountOrderHistory/AccountOrderHistory.tsx`
- `src/components/molecules/OrderStatusTabs/OrderStatusTabs.tsx`
- `src/components/organisms/OrderCard/OrderCard.tsx`
- `src/components/molecules/OrderLineItem/OrderLineItem.tsx`
- `src/components/molecules/OrderActions/OrderActions.tsx`

### Quyết định tổng

- lựa chọn chính: `incoming (develop)`
- kiểu merge: `giữ nguyên develop`, không chỉnh sửa thêm

### Đã giữ từ `incoming (develop)`

- layout tổng thể của `AccountOrderHistory`
- trạng thái not-auth `mt-8`, padding lớn hơn
- tab wrapper gọn của `develop`
- khoảng cách danh sách `mt-8 space-y-6`
- empty state, loading, error và `Pagination`
- review modal flow và mapping `actions`

### File chi tiết

#### `AccountOrderHistory.tsx`

- chọn: `incoming (develop)`
- giữ:
  - layout/spacing đúng bản `develop`
  - `summaryLabel`
  - pagination, empty state, loading/error như `develop`

#### `OrderStatusTabs.tsx`

- chọn: nghiêng `incoming (develop)`
- giữ:
  - spacing compact hơn
  - font size tab lớn hơn vừa phải
- lý do:
  - thay đổi chỉ là visual
  - phía `develop` rõ ràng ổn hơn cho responsive

#### `OrderCard.tsx`

- chọn: `both`
- giữ:
  - card responsive structure của `develop`
  - hover shadow mạnh hơn
  - bố cục mobile-first của `develop`
- bỏ:
  - các spacing cứng theo desktop-only từ `thuba`

#### `OrderLineItem.tsx`

- chọn: `incoming (develop)`
- lý do:
  - responsive tốt hơn
  - layout mobile an toàn hơn

#### `OrderActions.tsx`

- chọn: nghiêng `incoming (develop)`
- giữ:
  - button pill hiện đại hơn
  - shadow/hover states mới

### Lý do nhóm này

Nhóm order history được chốt là không merge tay nữa. Code hiện đã trả về nguyên trạng `develop`.

---

## 5.4 Order detail page #! Giữ nguyên toàn bộ từ nhánh develop

### File

- `src/components/organisms/OrderDetailContent/OrderDetailContent.tsx`

### Quyết định

- lựa chọn chính: `incoming (develop)`
- kiểu merge: `giữ nguyên develop`, không chỉnh sửa thêm

### Đã giữ từ `incoming (develop)`

- toàn bộ `OrderDetailContent.tsx` của `develop`
- timeline, CTA, refund message, review modal, item list, shipping/address summary đúng bản `develop`

### Lý do

Theo quyết định mới, trang chi tiết đơn hàng cũng không giữ phần chỉnh sửa nào từ nhánh hiện tại. Mục tiêu là bám hoàn toàn theo `develop`.

---

## 5.5 Cancel order flow #! Giữ nguyên logic huỷ đơn giản ở trường hợp người dùng là membe. Lựa chọn huỷ phức tạp có xác nhận OTP, mail ở trường hợp người dùng là Guest

### File

- `src/components/molecules/CancelOrderButton/CancelOrderButton.tsx`

### Quyết định

- lựa chọn chính: `incoming (develop)` cho logic
- trạng thái áp dụng thực tế: `member simple cancel`, `guest lookup có OTP flow`

### Đã giữ từ `incoming (develop)`

- flow hủy đơn đơn giản hiện có
- `fetch` hủy đơn trực tiếp
- callback `onCancelled`
- `router.refresh()` fallback

### Đã khôi phục từ nhánh tra cứu guest

- guest lookup với `CancelOrderButton` có bước OTP riêng
- guest email:
  - gửi OTP email qua `/api/v1/auth/email-otp/send`
  - verify OTP qua `/api/v1/auth/email-otp/verify`
  - server set marker ngắn hạn trước khi cho phép hủy
- guest phone:
  - giữ OTP demo `482774` như flow conflict cũ
  - route hủy đơn chỉ chấp nhận guest phone nếu có OTP demo này

### Lý do

Ban đầu route hủy đơn chỉ hỗ trợ member có session, nên guest OTP flow bị đứt ở backend. Để khôi phục đúng comment `#!`, mình đã mở rộng lại contract:

- member/account:
  - giữ simple cancel như `develop`
- guest lookup:
  - verify quyền sở hữu theo `order_code + contact`
  - email phải xác thực OTP thành công trước khi hủy
  - phone giữ OTP demo của flow cũ để khớp branch tra cứu

Như vậy phần guest OTP không còn bị bỏ qua ở mức doc lẫn code.

---

## 5.6 Homepage / catalog / listing

### File

- `src/app/page.tsx`
- `src/components/organisms/CatalogHero/CatalogHero.tsx`
- `src/components/organisms/ProductFilterSidebar/ProductFilterSidebar.tsx`
- `src/components/organisms/ProductRow/ProductRow.tsx`
- `src/components/templates/CatalogPage/CatalogPage.tsx`
- `src/components/templates/ProductListingPage/ProductListingPage.tsx`
- `src/components/templates/ProductListingPage/ProductListingResults.tsx`
- `src/components/organisms/StarsBanner/StarsBanner.tsx`

### Quyết định tổng

- phần lớn: `incoming (develop)` hoặc `both`
- ít file chọn hẳn `current`

### Chi tiết

#### `src/app/page.tsx`

- chọn: `current (thuba)`
- giữ:
  - banner personal color dùng `aspect-[1728/615]` + `min-h-[160px]`
- bỏ:
  - phiên bản min-height lớn hơn của `develop`

#### `CatalogHero.tsx`

- chọn: `current (thuba)`
- giữ:
  - dùng `Link` bao toàn hero
  - dùng class hệ thống `catalog-hero-shell` / `catalog-hero-cta`
- bỏ:
  - version section + nested CTA riêng của `develop`

#### `ProductFilterSidebar.tsx`

- chọn: `current (thuba)`
- giữ:
  - details accordion có open state
  - filter group phong phú hơn
  - giá / kích thước / radio vs checkbox
- bỏ:
  - sidebar đơn giản hơn từ `develop`

#### `ProductRow.tsx`

- chọn: `current (thuba)`
- giữ:
  - `product-row-shell`
  - `product-row-track`
- bỏ:
  - layout grid/auto-cols của `develop`

#### `CatalogPage.tsx` #! Giữ logic phân chia seciton của category từ develop và các thành phần trong giao diện theo nhánh develop, chỉ giữ phần token, chỉnh sửa css của nhánh thuba.

- chọn: `both`
- giữ:
  - `CatalogTabs`
  - logic `productSections` và section mapping từ `develop`
  - `FilterPill` section của `develop`
- sửa tay:
  - đặt `FilterPill` dưới `CatalogTabs`
  - `FilterPill` dùng token `--filter-chip-*` và `text-button`
  - `EmptyCatalogState` dùng token typography `text-display-section`, `text-display-page`, `text-body-lg`
  - không giữ hard-code size/font cũ của `thuba` ở phần chip và empty state

#### `ProductListingPage.tsx`

- chọn: `incoming (develop)`
- giữ:
  - `breadcrumb-shell`
- bỏ:
  - wrapper cũ `listing-shell pb-12 pt-3`

#### `ProductListingResults.tsx`

- chọn: `incoming (develop)` cho behavior
- giữ:
  - `Pagination`
- bỏ:
  - dòng text summary “Hiển thị x trên tổng số y sản phẩm”

#### `StarsBanner.tsx`

- chọn: `incoming (develop)`
- kiểu merge: dựng lại file theo phía `develop`
- giữ:
  - section nền đầy đủ
  - heading trắng trong banner
  - marquee card lớn hơn
  - cấu trúc JSX sạch, dễ compile
- bỏ:
  - bản compact hơn của `thuba`

### Lý do nhóm này

Ở nhóm catalog/listing, `develop` đang có xu hướng cấu trúc component ổn định hơn ở một số chỗ, nhưng `thuba` lại có vài component chi tiết hơn. Vì vậy mình chọn theo từng component thay vì một nguyên tắc cứng cho cả nhóm.

---

## 5.7 Site header #!==> Thực hiện lấy logic tự group categories thành parent/childeen logic tự group categories thành parent/children
- tạo cột “Khác”
- custom width theo số lượng group
- mega-menu phức tạp hơn

### File

- `src/components/organisms/SiteHeader/SiteHeader.tsx`

### Quyết định

- lựa chọn chính: `both`

### Đã giữ từ `incoming (develop)`

- toàn bộ shell/header/search/account/sidebar hiện tại
- alignment logic theo `ROUTES.CATALOG_WOMEN` / `ROUTES.CATALOG_MEN`

### Đã giữ lại theo comment `#!` từ `current (thuba)`

- logic tự group categories thành parent/children
- tạo cột `Khác` cho root không có con
- custom width theo số lượng group
- grouped mega-menu block
- link “Xem tất cả sản phẩm →”

### Lý do

Sau khi đọc lại comment `#!`, phần này phải đổi quyết định so với bản doc cũ. Mình không thay toàn file về `thuba`, mà chỉ graft lại đúng block mega-menu được group category vào nền header/search/sidebar của `develop` để giảm phạm vi rủi ro.

---

## 5.8 Global style và design token

### File

- `src/app/globals.css`
- `tailwind.config.ts`

### Quyết định

- lựa chọn chính: `both`
- kiểu merge: `manual merge`

### Đã giữ từ `develop`

- các lớp shell phục vụ account pages
- nhiều utility class hệ thống đang được component mới dùng

### Đã giữ từ `current (thuba)`

- một số naming/token và class helper được CSS hiện tại tham chiếu

### Đã sửa tay

#### `globals.css`

- giữ lại:
  - `.account-page-shell`
  - `.account-page-section`
  - `.account-page-grid`
  - `.account-content-panel`
  - `.account-panel-title`
  - `.account-panel-subtitle`

#### `tailwind.config.ts`

- bổ sung lại typography token bị `globals.css` dùng nhưng config thiếu:
  - `display-page`
  - `body-lg`
  - `heading-card`
  - `button`
  - `button-lg`
  - `nav`
  - `nav-utility`

### Lý do

Đây là conflict kiểu “CSS đang dùng token mà config không còn khai báo”. Nếu chỉ sửa CSS tạm thời:

- sẽ hết 1 lỗi nhưng dễ phát sinh lỗi token tiếp theo

Nên chiến lược được dùng là:

- đồng bộ lại token ở config
- giữ naming hệ thống nhất quán

---

---

## 8. Kết luận

Chiến lược resolve thực tế đã dùng là:

- ưu tiên `develop` cho shell, structure, flow đang chạy
- ưu tiên `thuba` cho visual/component detail khi không kéo theo logic mới
- dùng `manual merge` ở các file conflict dày hoặc khó chọn nguyên một bên
- bổ sung lại design token trong `tailwind.config.ts` để tránh lỗi Tailwind/PostCSS dây chuyền

Nếu cần làm lại conflict theo chiến lược khác, file này có thể dùng như bản đồ quyết định để chọn lại theo từng nhóm thay vì phải đọc lại toàn bộ hunk conflict từ đầu.
