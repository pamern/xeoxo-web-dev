# Change Log — 2026-07-06

## Trang chủ (`/`)

- `src/components/molecules/CollectionCard/CollectionCard.tsx`
  Thêm prop `revealOnHover`: mặc định thẻ bộ sưu tập mờ (`blur-sm brightness-75`), khi hover thì phóng to nhẹ (`scale-105`), nét lại và hiện tên. Đổi `object-cover` sang `object-top` để ảnh neo theo phần đầu người thay vì crop giữa.
- `src/app/page.tsx`
  - Dải bộ sưu tập nổi bật: bật `revealOnHover` cho `CollectionCard`, thêm `py-10` cho container để tránh bị cắt khi thẻ phóng to lúc hover.
  - Thay dữ liệu mock `COLLECTIONS` bằng dữ liệu thật từ `getHomepageCollections` (5 BST mới nhất theo `launch_date`), fallback về mock nếu DB lỗi/rỗng.
  - Gọi song song `getHomePageProductSections` + `getHomePageCollections` bằng `Promise.all`.

## Lớp dữ liệu dùng chung (homepage + catalog)

- `src/features/homepage/homepage.service.ts` (mới)
  - `getHomepageProductSections`: query view `catalog.product_card_homepage`, trả sản phẩm theo từng category, dùng cho các dải sản phẩm trang chủ.
  - `getHomepageCollections`: query `catalog.collection` join `catalog.media` qua `media_id`, lọc `status = 'ACTIVE'`, sort `launch_date DESC` rồi `created_at DESC`, giới hạn 5 — dùng cho dải BST trang chủ và khối hero-grid ở catalog.
  - `getNewestDepartmentProducts` (mới thêm trong phiên làm việc catalog): lấy `category_id` theo `department` (WOMEN/MEN/KIDS) từ `catalog.category`, sau đó query `product_card_homepage` theo các `category_id` đó, khử trùng lặp `product_line_id` (vì 1 sản phẩm có thể thuộc nhiều category), trả về N sản phẩm mới nhất — dùng cho hàng sản phẩm đầu tiên ở trang catalog nữ/nam.
- `src/types/homepage.types.ts` (mới)
  Kiểu `HomepageProductCardRow`, `HomepageProductSection`, `HomepageCollectionRow`.
- `src/lib/supabase/storage.ts` (mới)
  Helper `getProductMediaPublicUrl` — build public URL ảnh từ bucket `product-media` theo `storage_key`.
- `src/app/api/homepage/route.ts` (mới)
  Gộp 2 route con `products/homepage` + `collections/homepage` (đã xoá) thành 1 endpoint `GET /api/homepage?category_slugs=&product_limit=&collection_limit=` trả về `{ productSections, collections }` trong 1 response. Route này hiện không được `page.tsx` gọi trực tiếp (page gọi thẳng service), chỉ phục vụ nhu cầu API public/ứng dụng khác.

## Catalog (`/catalog/nu`, `/catalog/nam`, `/catalog/tre-em`, `/catalog/ao-dai`)

- `src/components/organisms/CatalogHeroGrid/CatalogHeroGrid.tsx`
  - Hiện 5 thẻ bộ sưu tập thay vì 3 (`collections.slice(0, 5)`).
  - Đổi layout từ `w-[330px]` cố định + `flex-wrap` sang `flex-1` chia đều trong `max-w-site` với `aspect-[3/4]` — luôn nằm trên 1 hàng, không xuống dòng.
  - Áp cùng hiệu ứng mờ → hover phóng nhẹ + hiện tên như `CollectionCard`.
- `src/components/templates/CatalogPage/CatalogPage.tsx`
  - Thêm field `department: "WOMEN" | "MEN" | "KIDS" | null` cho từng `CatalogSlug` trong `CATALOG_CONTENT` (nu→WOMEN, nam→MEN, tre-em→KIDS, ao-dai→null vì không map 1-1 theo department).
  - `CatalogPage` chuyển thành async component: gọi song song `getCatalogHeroCollections` (5 BST mới nhất, fallback mock) và `getCatalogNewestProducts` (dùng `getNewestDepartmentProducts`, fallback mảng rỗng nếu `department = null` hoặc lỗi).
  - Hàng sản phẩm đầu tiên (`index === 0`) ưu tiên dùng `newestProducts` (dữ liệu thật) thay vì `getProductsByCategory` (mock) nếu có dữ liệu; các hàng còn lại theo category vẫn dùng mock (**chưa làm — "1 nửa" theo yêu cầu**, vì DB category chưa đủ dữ liệu cho từng category con).
  - Bật `quickAddOnHover` cho toàn bộ `ProductRow` trong trang catalog — tận dụng hiệu ứng hover hiện size đã có sẵn ở `ProductCard`/`ProductRow` (được dùng ở trang chủ), không cần code mới.

## Personal Color — giao diện + logic quiz (chưa nối API)

- `src/app/personal-color/page.tsx` (mới)
  Trang `/personal-color`: dùng lại `SiteLayout` + `Breadcrumbs` có sẵn, banner ảnh `homepage_personal_color.png` với tiêu đề đè lên.
- `src/components/organisms/PersonalColorQuiz/PersonalColorQuiz.tsx` (mới)
  Client component, state `answers[]`. Mỗi câu hiện 2 lựa chọn (ảnh mock `canh-giang.png` / `hero-hakhue.png`, sẽ thay khi có ảnh thật riêng từng câu). Bấm chọn → ghi nhận `{questionNumber, tag, weight}` → tự chuyển câu kế tiếp. Hết 5 câu → hiện màn kết quả mock đơn giản: text "Personal color của bạn là {season label}".
- `src/features/personal-color/personal-color-quiz.ts` (mới)
  - `QUIZ_QUESTIONS`: 5 câu hỏi đúng thứ tự + text + trọng số theo bảng câu hỏi thật (Q1×2, Q2×1, Q3×1, Q4×2, Q5×1).
  - `computeQuizResult`: Q1–Q3 cộng điểm nhánh `WARM` (tối đa 4) → `>=2` là `WARM` ngược lại `COOL`; Q4–Q5 cộng điểm nhánh `LIGHT` (tối đa 3) → `>=2` là `LIGHT` ngược lại `DEEP`; map `(temperature, value)` → season theo đúng quy tắc trong `docs/database/database_schema.md` (`WARM+LIGHT=SPRING`, `WARM+DEEP=AUTUMN`, `COOL+LIGHT=SUMMER`, `COOL+DEEP=WINTER`).
  - **Chưa làm**: không gọi API/insert `catalog.personal_color_result`, không tính màu đề xuất (`personal_color_result_color`), không có danh sách sản phẩm gợi ý ở màn kết quả — chờ resource DB đủ mới nối logic thật.

## Khác

- `src/app/layout.tsx`
  Thêm `suppressHydrationWarning` vào thẻ `<html>` — chặn cảnh báo hydration mismatch do yếu tố ngoài code (extension trình duyệt tự gắn thêm class `mdl-js` vào `<html>` trước khi React hydrate).
- `public/images/bg-gia-nhap-btn.png`
  Export lại từ Figma (node `BTS-list`, `53:20`, frame Homepage) — lấy đúng ảnh nền cam thuần (image fill của frame, không dính 5 card BST). File cũ trước đó bị "nướng" luôn 5 card ảnh vào nền. Dùng `sharp` để crop đúng vùng theo ma trận `imageTransform` của Figma rồi resize về đúng kích thước cũ (1728×263) trước khi ghi đè.
