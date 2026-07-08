# Branch Work Summary

Tài liệu này tổng hợp lại toàn bộ các thay đổi chính đã được thực hiện trong branch hiện tại, theo nhóm chức năng, kiến trúc và file liên quan.

## 1. Mục tiêu chính của branch

Branch này tập trung vào 5 nhóm việc lớn:

1. Hoàn thiện cụm trang `policy` và `faq` theo frame từ Figma.
2. Tách và chuẩn hóa component dùng lại cho policy, FAQ và account.
3. Xây dựng trang `Lịch sử mua hàng` theo data thật từ Supabase thông qua API.
4. Refactor `Sổ địa chỉ` và `Lịch sử mua hàng` sang đúng luồng `page -> component -> hook -> service -> API -> feature service`.
5. Chuẩn hóa typography, spacing, token font size trong `globals.css` và `tailwind.config.ts`.

## 2. Các trang và frame đã làm

### 2.1. Cụm policy

Đã dựng hoặc cập nhật các slug policy theo cùng một khung:

- `Chính sách khách hàng`
- `Chính sách đổi hàng`
- `Chính sách vận chuyển`
- `Chính sách bảo mật`
- `Chính sách kiểm hàng`
- `Chính sách thanh toán`

Các trang này dùng chung cấu trúc:

- `SiteLayout`
- `Breadcrumbs`
- heading lớn
- strip underline bằng ảnh
- nội dung text theo typography token
- `PolicyClosingNote`
- footer site

File liên quan:

- `src/app/policy/page.tsx`
- `src/app/policy/[slug]/page.tsx`

### 2.2. Trang FAQ

Đã tạo route FAQ với 2 cách hiển thị:

- Truy cập public hoặc từ footer: hiển thị kiểu frame policy.
- Truy cập từ account: hiển thị kiểu frame account có sidebar 7 mục.

Route hiện tại:

- `/faq`
- `/faq?view=account`

File liên quan:

- `src/app/faq/page.tsx`
- `src/constants/routes.ts`

### 2.3. Trang account

Đã hoàn thiện và/hoặc refactor các frame:

- `Hồ sơ thông tin`
- `Lịch sử mua hàng`
- `Sổ địa chỉ`
- `FAQ` dạng account view

File liên quan:

- `src/app/account/profile/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/app/account/addresses/page.tsx`

## 3. Component đã tạo mới hoặc tách ra

### 3.1. Atoms

- `Button`
  - refactor để hỗ trợ cả `button` và `Link`
  - dùng cho action trong lịch sử đơn hàng

File:

- `src/components/atoms/Button/Button.tsx`

### 3.2. Molecules

- `PolicyFaqItem`
- `OrderStatusTabs`
- `OrderLineItem`
- `OrderActions`

File:

- `src/components/molecules/PolicyFaqItem/`
- `src/components/molecules/OrderStatusTabs/`
- `src/components/molecules/OrderLineItem/`
- `src/components/molecules/OrderActions/`

### 3.3. Organisms

- `PolicyFaqAccordion`
- `PolicyClosingNote`
- `OrderCard`
- `AccountOrderHistory`
- `AccountAddressBook`

File:

- `src/components/organisms/PolicyFaqAccordion/`
- `src/components/organisms/PolicyClosingNote/`
- `src/components/organisms/OrderCard/`
- `src/components/organisms/AccountOrderHistory/`
- `src/components/organisms/AccountAddressBook/`

### 3.4. Component có chỉnh sửa để khớp Figma hơn

- `AccountNavigation`
  - thêm/tinh chỉnh variant để khớp sidebar account
  - fix hiện tượng text bị rớt dòng ở nav trái
- `Breadcrumbs`
  - chỉnh style nhẹ để sát frame hơn

File:

- `src/components/organisms/AccountNavigation/AccountNavigation.tsx`
- `src/components/molecules/Breadcrumbs/Breadcrumbs.tsx`

## 4. Typography, spacing và design token

Đã rà và áp dụng lại token cho nhiều frame, đặc biệt các trang policy, FAQ và editorial/collection.

### 4.1. Token font size trong Tailwind

Đã chuẩn hóa hoặc bổ sung các token:

- `display-page`
- `display-section`
- `heading-section`
- `heading-card`
- `heading-content-sm`
- `heading-content`
- `nav`
- `button`
- `eyebrow`
- `body-lg`
- `body`
- `quote`
- `body-sm`
- `caption`

File:

- `tailwind.config.ts`

### 4.2. Utility class trong global CSS

Đã bổ sung hoặc dùng lại các class:

- `page-heading`
- `eyebrow-text`
- `content-heading`
- `content-body`

Mục tiêu:

- dùng đúng token thay vì hard-code lặp lại
- cân spacing giữa heading, đoạn văn, bullet list
- giúp các frame policy và FAQ đồng bộ hơn

File:

- `src/app/globals.css`

## 5. Collection và editorial

Đã có các chỉnh sửa liên quan typography/token cho:

- frame collection
- slug collection
- editorial block

Mục tiêu chính là đưa về dùng token hiện có, chỉnh khoảng cách dòng heading, và trả lại một số căn lề theo yêu cầu.

File liên quan:

- `src/app/collections/page.tsx`
- `src/app/collections/[slug]/page.tsx`

## 6. Lịch sử mua hàng

### 6.1. UI

Đã xây dựng frame `Lịch sử mua hàng` với:

- tabs lọc trạng thái
- card đơn hàng
- line item sản phẩm
- action theo từng trạng thái đơn

Trạng thái và hành vi đã xử lý:

- đang vận chuyển: theo dõi đơn, liên hệ hỗ trợ
- đã hủy:
  - đã thanh toán: xem thông tin hoàn tiền, mua lại
  - chưa thanh toán: xem chi tiết đơn hủy, mua lại
- hoàn thành:
  - mua lại
  - đánh giá nếu chưa đánh giá
  - liên hệ đổi hàng

File:

- `src/app/account/orders/page.tsx`
- `src/components/organisms/AccountOrderHistory/`
- `src/components/organisms/OrderCard/`
- `src/components/molecules/OrderLineItem/`
- `src/components/molecules/OrderActions/`
- `src/components/molecules/OrderStatusTabs/`

### 6.2. Logic trạng thái đơn

Đã tách logic hiển thị trạng thái và action đơn hàng thành module riêng.

File:

- `src/features/order/order-history.ts`

### 6.3. Data flow và API

Đã nối trang lịch sử mua hàng với API thay vì query trực tiếp trong component.

Luồng hiện tại:

`page -> AccountOrderHistory -> useOrderHistory -> orderService -> /api/v1/orders -> feature service`

File:

- `src/hooks/useOrderHistory.ts`
- `src/services/order.service.ts`
- `src/app/api/v1/orders/route.ts`
- `src/features/order/account-order.service.ts`
- `src/types/account-order.types.ts`

### 6.4. Tối ưu tải dữ liệu

Đã giảm độ trễ cảm nhận bằng cách:

- lấy `initialOrders` ở server page
- truyền xuống component/hook
- tránh fetch client ngay sau khi mount nếu đã có dữ liệu ban đầu

Điều này giúp trang bớt waterfall kiểu:

1. server render shell
2. client mount
3. client mới fetch orders

File:

- `src/app/account/orders/page.tsx`
- `src/components/organisms/AccountOrderHistory/AccountOrderHistory.tsx`
- `src/hooks/useOrderHistory.ts`

## 7. Sổ địa chỉ

### 7.1. Refactor đúng data flow

Đã chuyển page `Sổ địa chỉ` sang đúng kiến trúc thống nhất với project:

`page -> AccountAddressBook -> useAddresses -> addressService -> /api/v1/addresses -> customer-address.service`

Không query Supabase trực tiếp trong component.

File:

- `src/app/account/addresses/page.tsx`
- `src/components/organisms/AccountAddressBook/`
- `src/hooks/useAddresses.ts`
- `src/services/address.service.ts`
- `src/app/api/v1/addresses/route.ts`
- `src/features/customers/customer-address.service.ts`

### 7.2. Tối ưu tải dữ liệu

Đã thêm `initialAddresses` từ server để tránh fetch lại ngay khi page mount.

File:

- `src/app/account/addresses/page.tsx`
- `src/components/organisms/AccountAddressBook/AccountAddressBook.tsx`
- `src/hooks/useAddresses.ts`

### 7.3. Điều chỉnh UI

Đã chỉnh:

- nếu địa chỉ là mặc định thì không hiển thị nút `Thiết lập mặc định`
- giữ badge `Mặc định`

File:

- `src/components/organisms/AccountAddressBook/AccountAddressBook.tsx`

## 8. Hồ sơ thông tin

Đã chỉnh lại phần profile để:

- đồng bộ sidebar account
- dùng `PolicyClosingNote`
- cập nhật text tiếng Việt có dấu

File:

- `src/app/account/profile/page.tsx`

## 9. FAQ component và nội dung

Đã tạo accordion FAQ dùng cho frame FAQ.

Danh sách FAQ đã được nhập nội dung thực tế gồm các nhóm:

- tìm sản phẩm
- virtual fit
- gợi ý size
- personal color
- custom order
- đặt lịch đo
- đặt hàng
- thanh toán
- theo dõi đơn
- chính sách đổi hàng

File:

- `src/app/faq/page.tsx`
- `src/components/organisms/PolicyFaqAccordion/`
- `src/components/molecules/PolicyFaqItem/`

## 10. API và feature service

### 10.1. Orders API

Đã viết hoặc chỉnh `GET /api/v1/orders` cho lịch sử mua hàng:

- suy ra customer từ session phía server
- lọc theo `status_group`
- trả dữ liệu order history cho account page

Vẫn giữ `POST /api/v1/orders` cho luồng checkout/order creation.

File:

- `src/app/api/v1/orders/route.ts`
- `src/services/order.service.ts`
- `src/features/order/account-order.service.ts`

### 10.2. Addresses API

Đã viết hoặc chỉnh `GET /api/v1/addresses` và `POST /api/v1/addresses`:

- lấy danh sách địa chỉ
- tạo địa chỉ mới
- map thêm `province_name`

File:

- `src/app/api/v1/addresses/route.ts`
- `src/features/customers/customer-address.service.ts`

### 10.3. API docs

Đã có thay đổi tài liệu API trong branch này:

- `docs/api/api_documentation.yaml`
- `docs/api/order-history-api-rewrite.yaml`

## 11. Route và constants

Đã cập nhật route constants cho:

- `POLICY(slug)`
- `FAQ`
- `FAQ_ACCOUNT`
- `ACCOUNT_ORDER(SOME_ID)` và các route account liên quan

File:

- `src/constants/routes.ts`

## 12. Asset mới

Đã dùng hoặc thêm các asset sau:

- `public/images/strip-title-underline.png`
- `public/images/button_background.png`
- `public/images/policy.svg`

Mục đích:

- underline heading policy/faq
- nền button action như mockup
- hình policy trong frame customer policy

## 13. Một số quyết định kiến trúc đáng chú ý

### 13.1. Không tách `ACCOUNT_NAV_ITEMS` thành component

Lý do:

- đây là data config, không phải UI độc lập
- component nên là `AccountNavigation`
- `ACCOUNT_NAV_ITEMS` phù hợp hơn nếu để ở constant/helper dùng chung

### 13.2. Không query database trực tiếp trong component

Đã giữ đúng nguyên tắc của `AGENTS.md`:

- component không gọi Supabase
- page không chứa business logic dài
- fetch đi qua service và API

### 13.3. Dùng token thay vì hard-code typography

FAQ, policy, collection/editorial và closing note được kéo về dùng token hiện có nhiều hơn để dễ scale sau này.

## 14. Kiểm thử đã làm

Đã chạy TypeScript check:

```bash
npx tsc --noEmit
```

Kết quả: pass ở các lần kiểm tra sau các thay đổi chính.

## 15. Danh sách file chính đã thay đổi hoặc thêm mới

### File đã chỉnh sửa

- `docs/api/api_documentation.yaml`
- `src/app/account/addresses/page.tsx`
- `src/app/account/profile/page.tsx`
- `src/app/api/v1/addresses/route.ts`
- `src/app/api/v1/orders/route.ts`
- `src/app/collections/[slug]/page.tsx`
- `src/app/collections/page.tsx`
- `src/app/globals.css`
- `src/app/policy/[slug]/page.tsx`
- `src/app/policy/page.tsx`
- `src/components/atoms/Button/Button.tsx`
- `src/components/molecules/Breadcrumbs/Breadcrumbs.tsx`
- `src/components/organisms/AccountNavigation/AccountNavigation.tsx`
- `src/constants/routes.ts`
- `src/features/customers/customer-address.service.ts`
- `src/hooks/useAddresses.ts`
- `src/services/order.service.ts`
- `tailwind.config.ts`

### File mới

- `docs/api/order-history-api-rewrite.yaml`
- `src/app/account/orders/page.tsx`
- `src/app/faq/page.tsx`
- `src/components/molecules/OrderActions/`
- `src/components/molecules/OrderLineItem/`
- `src/components/molecules/OrderStatusTabs/`
- `src/components/molecules/PolicyFaqItem/`
- `src/components/organisms/AccountAddressBook/`
- `src/components/organisms/AccountOrderHistory/`
- `src/components/organisms/OrderCard/`
- `src/components/organisms/PolicyClosingNote/`
- `src/components/organisms/PolicyFaqAccordion/`
- `src/features/order/account-order.service.ts`
- `src/features/order/order-history.ts`
- `src/hooks/useOrderHistory.ts`
- `src/types/account-order.types.ts`
- `public/images/button_background.png`
- `public/images/policy.svg`

## 16. Việc còn có thể làm tiếp

Những việc chưa phải blocker nhưng nên cân nhắc tiếp:

1. Gom shell account thành `src/app/account/layout.tsx` để chuyển frame mượt hơn.
2. Tách `ACCOUNT_NAV_ITEMS` ra constant dùng chung để tránh lặp giữa các page.
3. Tối ưu tiếp data flow của `profile` nếu muốn giảm thêm độ trễ.
4. Bổ sung loading skeleton thay vì text loading đơn giản cho `orders` và `addresses`.
5. Hoàn thiện action thật cho `địa chỉ`, `đánh giá`, `theo dõi đơn`, `chi tiết đơn`, `hoàn tiền` nếu API tương ứng đã sẵn sàng.

