# Tóm tắt ý chính branch `thuba_designtoken`

## 1. Mục tiêu chính

Branch `thuba_designtoken` tập trung vào việc chuẩn hóa giao diện và cải thiện responsive cho website XÉO XỌ. Mục tiêu là giúp giao diện hiển thị ổn định hơn trên nhiều kích thước desktop/laptop khác nhau, đặc biệt các viewport như `1729x1117`, `1537x864`, `1366x768` và `1280x720`.

Các định hướng chính:

- Chuẩn hóa design token trong `globals.css` và `tailwind.config.ts`.
- Giảm hardcode về font-size, spacing, color, radius và shadow.
- Chuyển layout từ kiểu cố định theo Figma desktop lớn sang responsive fluid.
- Dùng semantic typography và token-based styling.
- Giữ cùng lượng nội dung hiển thị trên desktop, thay vì chuyển sang carousel quá sớm.

## 2. Các nhóm việc đã hoàn thành

### 2.1. Chuẩn hóa design token

Đã bổ sung và chuẩn hóa nhiều nhóm token trong:

- `src/app/globals.css`
- `tailwind.config.ts`

Các nhóm token chính gồm:

- màu sắc semantic;
- typography;
- radius;
- spacing;
- shadow;
- control height;
- site gutter;
- token responsive cho header, homepage và product layout.

Một số recipe/token đáng chú ý:

- `page-heading`
- `content-heading`
- `content-body`
- `form-control`
- `site-container`
- `header-utility-shell`
- `header-main-shell`
- `header-search`
- `homepage-shell`
- `homepage-product-grid`
- `product-page-shell`
- `breadcrumb-shell`

### 2.2. Refactor FAQ / Policy / Form

Đã refactor các khu vực:

- `src/app/faq/**`
- `src/app/policy/**`
- `src/components/molecules/TextField/**`
- `src/components/molecules/SelectField/**`

Kết quả:

- giảm class hardcode như `text-*`, `text-[...]`, color, radius, shadow;
- dùng nhiều semantic token hơn;
- giao diện đồng bộ hơn giữa các trang hỗ trợ/chính sách/form.

### 2.3. Refactor SiteHeader

Header đã được chỉnh theo hướng fluid và responsive hơn.

Các thay đổi chính:

- cleanup import/constant/unused code;
- dùng semantic typography cho utility bar, nav, search, account và cart;
- chỉnh breakpoint hiển thị search;
- đồng bộ padding, gap, logo height và search width bằng token.

File chính:

- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/app/globals.css`
- `tailwind.config.ts`

### 2.4. Refactor Homepage

Homepage đã được chuyển từ layout quá phụ thuộc Figma desktop lớn sang layout fluid hơn.

Các thay đổi chính:

- hero và section dùng `homepage-shell`;
- collection rail chuyển sang grid có wrap;
- `ProductRow` chuyển từ rail ngang sang grid responsive;
- `GenderSelect` và `Personal Color` dùng token fluid;
- spacing/gutter đồng bộ hơn.

File chính:

- `src/app/page.tsx`
- `src/components/organisms/HeroCarousel/HeroCarousel.tsx`
- `src/components/organisms/ProductRow/ProductRow.tsx`
- `src/components/organisms/GenderSelect/GenderSelect.tsx`

### 2.5. Refactor Product Ecosystem

Các trang liên quan đến sản phẩm đã được chỉnh để hiển thị ổn định hơn giữa desktop rộng và laptop nhỏ.

#### Listing / Catalog / Collection

Đã chỉnh các component:

- `ProductListingPage`
- `ProductListingResults`
- `ProductGrid`
- `CollectionProducts`
- `ProductFilterSidebar`
- `FilterBar`
- `CatalogHero`
- `CatalogHeroGrid`

Hướng xử lý:

- giữ số cột desktop;
- card co nhỏ theo viewport;
- filter sidebar co theo viewport;
- gap, spacing và image height dùng `clamp()`/token.

#### Product Detail

Đã chỉnh các component:

- `src/app/products/[slug]/page.tsx`
- `ProductDetail`
- `ProductImageGallery`
- `VariantSelector`
- `ReviewsSection`

Hướng xử lý:

- gallery width và thumbnail size fluid;
- side panel có min-height fluid;
- variant pills fluid;
- review cards fluid;
- recommendation grid dùng token chung;
- product description và divider có token riêng.

## 3. Chuẩn hóa Breadcrumb

Đã đồng bộ vị trí breadcrumb ở nhiều trang để có nhịp layout gần giống trang danh sách sản phẩm.

Token/wrapper liên quan:

- `--product-page-top-offset`
- `breadcrumb-shell`

Đã áp dụng cho các trang:

- product detail;
- collections;
- collection detail;
- personal color;
- FAQ;
- policy detail;
- account profile;
- account orders;
- account addresses;
- product listing.

## 4. Các khu vực Account / Auth / Policy / FAQ

Branch này cũng có thay đổi trên nhiều khu vực account, policy và FAQ.

Các nhóm file có chỉnh:

- `src/app/account/profile/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/app/account/addresses/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/policy/page.tsx`
- `src/app/policy/[slug]/page.tsx`
- `AccountOrderHistory`
- `AccountAddressBook`
- `OrderCard`
- `PolicyClosingNote`

Hướng tổng quát:

- giao diện sát Figma hơn;
- giảm hardcode;
- dùng token typography/spacing nhiều hơn;
- giữ cấu trúc page → component → service/API.

## 5. Token quan trọng đã thêm hoặc chuẩn hóa

Một số token nổi bật trong `globals.css`:

- `--site-gutter-x-lg`
- `--header-utility-height`
- `--header-nav-gap`
- `--header-search-width`
- `--header-logo-height`
- `--hero-min-height`
- `--homepage-card-gap-x`
- `--homepage-card-gap-y`
- `--product-page-block-y`
- `--product-page-top-offset`
- `--product-grid-gap-x`
- `--product-grid-gap-y`
- `--product-gallery-main-width`
- `--product-gallery-thumb-width`
- `--product-detail-grid-gap`
- `--catalog-hero-min-height`
- `--filter-bar-gap`
- `--variant-pill-width`
- `--review-card-px`
- `--review-card-py`

## 6. Semantic typography đã dùng nhiều

Các typography token được dùng để thay thế class font-size hardcode:

- `text-display-hero`
- `text-display-page`
- `text-display-section`
- `text-heading-section`
- `text-heading-card`
- `text-heading-content`
- `text-nav`
- `text-nav-utility`
- `text-button`
- `text-body-lg`
- `text-body`
- `text-body-sm`
- `text-caption`
- `text-field`

## 7. File chính đã thay đổi

Các file/nhóm file nổi bật:

- `src/app/globals.css`
- `tailwind.config.ts`
- `src/app/page.tsx`
- `src/app/products/[slug]/page.tsx`
- `src/app/collections/page.tsx`
- `src/app/collections/[slug]/page.tsx`
- `src/app/personal-color/page.tsx`
- `src/app/faq/page.tsx`
- `src/app/policy/[slug]/page.tsx`
- `src/app/account/profile/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/app/account/addresses/page.tsx`
- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/components/organisms/HeroCarousel/HeroCarousel.tsx`
- `src/components/organisms/ProductRow/ProductRow.tsx`
- `src/components/organisms/ProductGrid/ProductGrid.tsx`
- `src/components/organisms/ProductDetail/ProductDetail.tsx`
- `src/components/organisms/ProductImageGallery/ProductImageGallery.tsx`
- `src/components/organisms/VariantSelector/VariantSelector.tsx`
- `src/components/organisms/ReviewsSection/ReviewsSection.tsx`
- `src/components/organisms/CatalogHero/CatalogHero.tsx`
- `src/components/organisms/CatalogHeroGrid/CatalogHeroGrid.tsx`
- `src/components/organisms/FilterBar/FilterBar.tsx`
- `src/components/organisms/CollectionProducts/CollectionProducts.tsx`
- `src/components/molecules/ProductCard/ProductCard.tsx`
- `src/components/molecules/Breadcrumbs/Breadcrumbs.tsx`
- `src/components/molecules/TextField/**`
- `src/components/molecules/SelectField/**`

## 8. Ghi chú build / validation

Đã có nhiều lần kiểm tra bằng:

```bash
npm run build
npx tsc --noEmit
```

Tình trạng ghi nhận:

- `npm run build` đã pass ở nhiều batch responsive chính;
- `npx tsc --noEmit` có lúc fail do cấu hình include `.next/types/**/*.ts` nhưng `.next/types` thiếu file;
- đây được ghi nhận là vấn đề cấu hình/type-check, không nhất thiết là lỗi UI mới;
- build vẫn có warning liên quan đến `supabase-js` trong Edge Runtime ở `src/lib/supabase/middleware.ts`.

## 9. Quy ước đã áp dụng

- Không dùng `zoom`, `transform: scale()` hoặc giảm root font-size để co nhỏ toàn site.
- Ưu tiên `clamp()`, fluid token và grid ổn định.
- Giữ cùng lượng nội dung trên desktop/laptop nếu còn đủ không gian.
- Chỉ ẩn/gom item khi thật sự thiếu chỗ.
- Không token hóa mọi giá trị nhỏ lẻ nếu chỉ dùng một lần.

## 10. Việc nên làm tiếp

Các việc nên ưu tiên nếu tiếp tục branch:

1. Visual QA toàn site ở các viewport:
   - `1729x1117`
   - `1537x864`
   - `1366x768`
   - `1280x720`
2. Dọn tiếp hardcode còn sót trong:
   - `ProductDetail`
   - `ReviewsSection`
   - `Cart/Checkout`
   - `Account`
3. Xử lý dứt điểm lỗi `npx tsc --noEmit` liên quan `.next/types`.
4. Tách thêm recipe local nếu class quá dài hoặc bị lặp nhiều.

## 11. Lưu ý về worktree

Worktree hiện tại còn nhiều file thay đổi và có một số file không thuộc phạm vi summary chính, ví dụ:

- `package-lock.json`
- một số file account/auth/policy từ batch trước;
- một số file tạm hoặc không thuộc source chính.

Vì vậy, tài liệu này nên được xem là bản tóm tắt theo nhóm công việc, không phải changelog chi tiết theo từng commit.
