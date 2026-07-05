# Flow develop và hướng xử lý conflict cho nhánh `thuba_framebst`

Ngày cập nhật: 07/07/2026

## 1. Mục tiêu

Tài liệu này ghi lại hướng xử lý conflict khi hợp nhất nhánh `thuba_framebst` vào code hiện tại, đồng thời mô tả nguyên tắc phát triển tiếp theo để tránh lặp lại conflict cùng kiểu.

Phạm vi của lần xử lý này tập trung vào:

- product detail;
- cart;
- checkout;
- header/footer;
- auth shell và register form;
- một số atom/organism liên quan UI;
- `package-lock.json`.

## 2. Nguyên tắc chọn phiên bản khi merge

Khi gặp conflict, không chọn một nhánh duy nhất cho toàn bộ file. Thay vào đó, ưu tiên theo loại thay đổi:

### 2.1. Với flow dữ liệu và nghiệp vụ

Ưu tiên giữ phần đã chạy theo API/Supabase thực tế nếu phần đó:

- đang bám `docs/api/API_RULES.md`;
- dùng đúng endpoint hiện tại;
- không quay về mock data cũ;
- không làm mất validation, ownership hoặc refetch cần thiết.

### 2.2. Với UI/UX và tương tác

Ưu tiên giữ phiên bản có trải nghiệm đầy đủ hơn nếu phần đó:

- đúng cấu trúc component trong `docs/uiux/figma-component-architecture.md`;
- không làm mất modal, dropdown, sidebar, selected state;
- không đơn giản hóa quá mức thành bản tĩnh;
- vẫn tương thích với hooks và props hiện có.

### 2.3. Với lockfile

Không tự suy diễn lại dependency bằng tay. Chỉ:

- bỏ marker conflict;
- giữ phần package đã có thật trong lockfile sau merge;
- kiểm tra lại bằng TypeScript hoặc build nếu cần.

## 3. Quyết định merge đã áp dụng

### 3.1. `src/app/products/[slug]/page.tsx`

Hướng xử lý:

- giữ hướng product page dùng API thật;
- kết hợp cả hai nguồn dữ liệu:
  - `fetchProductBySlugFromApi(slug)` để lấy collection breadcrumb và related products;
  - `GET /api/v1/product-lines/{slug}` để lấy `apiProduct` chi tiết cho variant, material và reviews preview.

Lý do:

- nhánh collections đã đưa product detail sang flow API-backed mới;
- nhánh cart/checkout đang cần `ProductDetailDto` đầy đủ để render size, stock, review và add-to-cart đúng variant;
- nếu chỉ giữ một phía sẽ bị thiếu hoặc collection context, hoặc dữ liệu variant/review.

### 3.2. `src/components/organisms/ProductDetail/ProductDetail.tsx`

Hướng xử lý:

- giữ flow add-to-cart đang dùng `cartService.addItem`;
- giữ `StarRating` thay vì thay bằng chuỗi sao tĩnh.

Lý do:

- component hiện tại đã nối đúng với cart API và event `xeoxo-cart-updated`;
- `StarRating` tái sử dụng tốt hơn và đồng nhất với phần reviews.

### 3.3. `src/components/organisms/CartSummary/CartSummary.tsx`

Hướng xử lý:

- giữ `useCart()` và `useCheckout()` của nhánh hiện tại;
- giữ hidden inputs cho `cart_item_ids`, `payment_method_id`, `voucher_code`;
- giữ logic clear cart thật qua `clearCart()`;
- giữ flow preview checkout theo danh sách item được chọn.

Lý do:

- phiên bản này khớp với flow checkout hiện có;
- bản còn lại dùng biến không tồn tại trong file hiện tại như `clear`, `lines`.

### 3.4. `src/components/organisms/CheckoutForm/CheckoutForm.tsx`

Hướng xử lý:

- giữ `AuthModalLink` cho guest thay vì đổi thành link tĩnh sang `/register`;
- giữ validation form, load provinces, chọn địa chỉ member, tạo địa chỉ mới;
- giữ message lỗi, message loading và message tạo order thành công.

Lý do:

- flow hiện tại tương thích với `useAddresses()` và `useCheckout()`;
- không làm mất behavior đang có cho member/guest.

### 3.5. `src/components/organisms/SiteHeader/SiteHeader.tsx`

Hướng xử lý:

- giữ bản header đầy đủ hơn:
  - query auth modal;
  - account sidebar;
  - guest dropdown;
  - menu mobile có auth action;
  - cart count qua `useCart()`.

Lý do:

- phiên bản này giàu tương tác hơn;
- không làm tụt trải nghiệm từ header động về header tĩnh.

### 3.6. `src/components/organisms/SiteFooter/SiteFooter.tsx`

Hướng xử lý:

- giữ `AuthModalLink` ở mục đăng ký thành viên;
- các link còn lại vẫn dùng `Link`.

Lý do:

- người dùng đang ở public layout có thể mở modal đăng ký ngay, không cần chuyển route.

### 3.7. `src/components/templates/AuthShell/AuthShell.tsx`

Hướng xử lý:

- giữ layout benefit card đầy đủ hơn;
- giữ spacing và typography đang đồng bộ với nhánh hiện tại.

Lý do:

- đúng hướng UI shell của auth modal/page;
- tránh rơi về bản tối giản hơn, thiếu wrapper nội dung benefit.

### 3.8. `src/components/organisms/RegisterForm/RegisterForm.tsx`

Hướng xử lý:

- giữ `errorMessage` và `noticeMessage`;
- bỏ nhánh dùng `error` vì prop đó không khớp interface hiện tại.

### 3.9. `src/components/organisms/VariantSelector/VariantSelector.tsx`

Hướng xử lý:

- giữ kiểu pill selector đang dùng ở nhánh hiện tại;
- không đổi sang `fieldset/legend` nếu chỉ để thay typography mà không thêm giá trị nghiệp vụ.

### 3.10. `src/components/atoms/FilterChipButton/FilterChipButton.tsx`

Hướng xử lý:

- giữ style chip nhỏ, bo tròn, đúng visual hiện dùng ở phần review/filter.

### 3.11. `package-lock.json`

Hướng xử lý:

- bỏ toàn bộ marker conflict;
- giữ các entry đã có trong lockfile sau merge, bao gồm các gói `@supabase/cli-*` dạng optional.

## 4. Thứ tự xử lý conflict nên áp dụng

Khi lần sau gặp conflict tương tự, nên xử lý theo thứ tự:

1. `product page` và data flow trước.
2. `ProductDetail`, `CartSummary`, `CheckoutForm`.
3. `Header`, `Footer`, `AuthShell`, `RegisterForm`.
4. atom nhỏ như `FilterChipButton`, `VariantSelector`.
5. `package-lock.json` sau cùng.

Lý do:

- nếu xử lý UI trước khi chốt data flow, rất dễ phải sửa lại props;
- product detail, cart và checkout là cụm phụ thuộc lẫn nhau mạnh nhất.

## 5. Cách kiểm tra sau khi resolve

Sau khi bỏ marker conflict, cần kiểm tra tối thiểu:

```bash
rg -n "^(<<<<<<<|=======|>>>>>>>)" <danh_sach_file>
npx tsc --noEmit
```

Nếu có thời gian hoặc cần kiểm tra sâu hơn:

```bash
npm run build
```

## 6. Kết quả của lần xử lý này

Đã áp dụng:

- bỏ marker conflict khỏi các file đang `UU`;
- ghép lại `products/[slug]` theo hướng API thật + dữ liệu chi tiết;
- giữ flow cart/checkout hiện tại;
- giữ header/auth/footer có tương tác đầy đủ;
- kiểm tra thành công với `npx tsc --noEmit`.

## 7. Lưu ý để giảm conflict về sau

- Khi đổi data source từ mock sang API, nên gom thay đổi vào `src/data/*`, page và component nhận props rõ ràng, tránh trộn với refactor UI không liên quan.
- Với component lớn như `SiteHeader` hoặc `CheckoutForm`, nên tách bớt phần con ra file riêng nếu tiếp tục mở rộng.
- Nếu một nhánh chỉ đổi typography hoặc spacing, hạn chế sửa cùng lúc với nhánh đang thay đổi logic API/cart/checkout.
- Với tài liệu nội bộ, nên ghi trước “ưu tiên giữ flow nào” để người merge sau không phải suy luận lại từ đầu.
