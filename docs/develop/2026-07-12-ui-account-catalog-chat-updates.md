# Tổng hợp thay đổi ngày 2026-07-12

Nhánh làm việc: `zang3`

## 1. Đồng bộ code với develop

- Xóa các thay đổi chưa stage, fetch + fast-forward merge `develop` vào `zang3` (10 commit mới, không conflict).

## 2. Trang Catalog (`/categories/[slug]`)

- **`CatalogHeroGrid.tsx`**: grid 5 collection card giờ luôn đủ 5 cột từ breakpoint `md` (768px) thay vì đợi tới `xl` (1280px), tránh bị "phóng to" quá mức trên tablet/laptop.
- **`CatalogTabs.tsx`**: làm lại style nút tab "Sản phẩm mới"/"Bán chạy nhất" cho responsive hơn, bổ sung nút **"Xem đầy đủ"** còn thiếu (link đúng theo `?sort=newest`/`?sort=best-selling`), thêm khoảng cách với hàng sản phẩm bên dưới.
- **`CatalogHero.tsx` / `globals.css`**: phát hiện và bổ sung 3 biến CSS `--catalog-hero-min-height`, `--catalog-hero-grid-py`, `--catalog-hero-band-height` bị thiếu hoàn toàn trong `:root` — nguyên nhân khiến banner hero bị co lại chỉ bằng chiều cao dòng chữ, làm ảnh bị crop sai tỉ lệ.

## 3. Logic "Sản phẩm mới" / "Bán chạy nhất" dùng dữ liệu thật

Trước đây "Mới nhất" sort theo `id` giảm dần (suy đoán) và "Bán chạy nhất" thực chất sort theo **giá cao nhất** — hoàn toàn không phản ánh dữ liệu thật.

- **`supabase/create_v_product_line_sales.sql`**: tạo view `catalog.v_product_line_sales` tổng hợp số lượng đã bán (`SUM(quantity)`) theo `product_line_id`, chỉ tính đơn `COMPLETED`, kèm `GRANT SELECT` cho `anon/authenticated/service_role` (thiếu phần này sẽ bị lỗi `permission denied for view`).
- **`supabase/seed_bestselling_sales_data.sql`**: script seed idempotent, tạo 1 đơn `COMPLETED` cho mỗi dòng sản phẩm đang active với số lượng giảm dần, phục vụ test "Bán chạy nhất" có đủ dữ liệu đa dạng.
- **`homepage.service.ts`**: thêm `getCatalogNewestProducts` (sort theo `product_line.created_at` thật) và `getCatalogBestSellingProducts` (join view sales, lọc `sold_quantity > 0`), quét toàn bộ department/category thay vì giới hạn trong tập đã cắt sẵn.
- **`CatalogPage.tsx`**: gọi 2 hàm trên thay cho logic sort giả trên `uniqueProducts`.
- **`product-filtering.ts` + `product.types.ts`**: áp dụng tương tự cho dropdown "Phân loại" ở trang danh sách sản phẩm — thêm field `createdAt`/`soldQuantity` vào `Product`, enrich trong `fetchCategoryListing`, sort thật thay vì giả theo `id`/giá.

## 4. Bug lỗi hiển thị "Requested range not satisfiable"

Khi 1 tab lọc (VD "Đã hủy") không có dữ liệu, Supabase trả lỗi Postgres thay vì mảng rỗng khi `.range()` trên tập 0 dòng, khiến lỗi kỹ thuật lộ ra UI. Đã bắt lỗi `PGRST103`/"range not satisfiable" và trả về rỗng ở:

- `account-order.service.ts` (lịch sử đơn hàng)
- `review.service.ts` (đánh giá của tôi)
- `account-appointment-history.ts` (lịch sử lịch hẹn)
- `reviews/route.ts` (review sản phẩm trang chi tiết)

## 5. Trang chi tiết đơn hàng (`OrderDetailContent.tsx`)

- Xóa dòng text "Chưa bàn giao đơn vị vận chuyển" khi đơn chưa sang trạng thái vận chuyển.
- Thêm nút **"Liên hệ hỗ trợ"** (mở `ChatWidget` kèm ngữ cảnh đơn hàng) — hiện với mọi trạng thái trừ "Đã hủy"/"Đã hoàn trả".
- Đổi nhãn nút đổi trả cũ: "Liên hệ đổi trả" → **"Chính sách đổi trả"** (khi chưa hoàn thành) / **"Đổi trả"** (khi đã hoàn thành), tránh trùng tên với nút mới.
- Sắp xếp lại thứ tự nút: **"Đánh giá"** lên đầu.
- `CancelOrderButton.tsx`: đồng bộ style nút "Hủy Đơn Hàng" theo đúng kiểu vuông (`rounded-[2px]`, viền đen, nền pattern cam) giống các nút khác cùng khối, thay vì kiểu pill riêng.

## 6. `ProductReviewModal.tsx`

- Sửa z-index modal `120 → 200` (cao hơn `SiteHeader` z-140) — trước đó bị header đè lên phần tiêu đề/nút đóng.
- Responsive chiều cao `max-h-90vh` (mobile) / `max-h-85vh` (≥ sm).
- Xóa label "Chất lượng sản phẩm:" ở cả khối xem lại và khối đang chỉnh sửa, chỉ giữ hàng sao.
- Đổi màu sao `amber-400` (vàng) → `black` ở cả 2 khối.

## 7. `AccountReviewsContent.tsx` (trang "Đánh giá và phản hồi")

- Xóa khối "Chất lượng sản phẩm: {mapping theo số sao}" + hàm `getQualityText` không còn dùng.
- Đổi màu sao sang đen.
- Giảm cỡ card, avatar (40→32px), sao (14→12px), ảnh/video đính kèm (80→64px), nút hành động nhỏ lại — đồng bộ với trang Lịch sử đơn hàng.

## 8. Đồng bộ layout các trang tài khoản (`/account/*`, `/faq`)

Phát hiện **2 bản định nghĩa trùng lặp** cho `.account-page-grid`/`.account-sticky-rail`: một bản gọn trong `account.css` (chỉ áp dụng cho route nằm trong `/account/*` qua `layout.tsx`), một bản cũ rộng hơn còn sót lại trong `globals.css` (cột sidebar `25%` thay vì `minmax(260px, 0.22fr)`, breakpoint `1024px` thay vì `768px`). Trang `/faq` nằm ngoài `/account/*` nên bị dính bản cũ, khiến sidebar/nội dung to bất thường.

- Đồng bộ `globals.css` khớp với `account.css` (breakpoint + độ rộng cột).
- Viết lại 6 trang tài khoản (`orders`, `reviews`, `addresses`, `appointments`, `profile`, `faq?view=account`) dùng chung 1 khung gọn: section `px-6 pb-10 pt-6 xl:pb-16`, panel `rounded-[14px] px-5/7/8 py-6/7/8`, h1 `19px/26px`.
- `AccountNavigation.tsx`: thu nhỏ nav sidebar (`min-h 46/56px → 36/42px`, gap, font `13/15px → 12/13px`, icon mũi tên nhỏ lại) để vừa 1 màn hình không cần cuộn.
- `PolicyFaqItem.tsx` / `PolicyFaqAccordion.tsx`: thêm prop `size="compact"` chỉ dùng cho FAQ bản account, không ảnh hưởng trang FAQ công khai (marketing, vẫn giữ cỡ chữ lớn).

## 9. `OrderCard` / `OrderActions` / `OrderLineItem` / `OrderStatusTabs`

- Giảm cỡ chữ, padding, ảnh sản phẩm đồng loạt cho gọn (chi tiết xem diff từng file).
- Thêm cơ chế **thu gọn danh sách sản phẩm trong đơn**: mặc định hiện 2 sản phẩm đầu, có nút "Xem thêm N sản phẩm" / "Thu gọn" nếu đơn có nhiều hơn 2 sản phẩm.
- `OrderActions.tsx`: đổi style nút "Mua lại"/"Đánh giá"/"Xem chi tiết đơn hủy" từ dạng pill sang vuông (`!rounded-[2px]`), phải dùng `!important` vì `Button` atom dùng chung hard-code `rounded-pill` mặc định; đồng thời ép `!h-auto !min-w-0` vì preset `size="custom"` của `Button` có `h-[43px] min-w-[126px]` cứng đè lên.

## 10. Trạng thái đơn hàng chi tiết hơn (`order-history.ts`)

Trước đây `PENDING/CONFIRMED/PACKING/SHIPPING` gộp chung 1 tab "Đang vận chuyển". Giờ tách thành:

- **"Chờ xác nhận"** → `PENDING`
- **"Đã xác nhận"** → `CONFIRMED` + `PACKING` (gồm cả "Đang chuẩn bị hàng")
- **"Đang vận chuyển"** → chỉ còn `SHIPPING`

Cập nhật đồng bộ `getOrderStatusesForFilter` (query DB đúng theo tab), `getOrderActions` (nút "Theo dõi đơn" áp dụng cho cả 3 trạng thái), và `OrderDetailContent.tsx` (giữ màu cam cho trạng thái pending/confirmed).

## 11. Module Chat demo (FE only, chưa nối backend thật)

DB đã có sẵn đủ bảng phục vụ chat (`CHAT_CONVERSATION`, `CHAT_MESSAGE`, `CHAT_MESSAGE_MEDIA`, `CHAT_ASSIGNMENT_HISTORY`, `CHAT_TAG`, `CHAT_MESSAGE_READ`) nhưng lần này chỉ build phần giao diện.

- **`src/components/organisms/ChatWidget/ChatWidget.tsx`** (mới): nút chat nổi góc màn hình, gắn vào `SiteLayout` nên hiện xuyên suốt các trang public.
  - Khách vãng lai: mở popup → hiện form Tên*/Email/SĐT*/Xưng hô (Anh/Chị/Khác) → bấm "Bắt đầu trò chuyện" → lời chào cá nhân hóa theo tên + xưng hô vừa nhập.
  - Đã đăng nhập: mở popup → bỏ qua form, hiện thẳng lời chào lấy `customer.customer_name` + xưng hô suy ra từ `customer.gender`.
  - Xưng hô ("anh"/"chị"/"bạn") được lưu vào state và dùng nhất quán xuyên suốt toàn bộ đoạn chat (kể cả các tin nhắn nối thêm sau), không còn lẫn "bạn" giữa các câu.
  - Auto-scroll xuống tin nhắn mới nhất khi gửi.
  - Ô nhập tin nhắn/form: override `!outline-none` vì rule `:focus-visible` toàn site (nằm ngoài `@layer`) luôn thắng `outline-none` thường của Tailwind do thứ tự ưu tiên cascade layer.
  - Thông báo lỗi validate (tên/email/SĐT) dùng `setCustomValidity` để hiện tiếng Việt thay vì thông báo mặc định tiếng Anh của trình duyệt.
- **`src/lib/chat-events.ts`** (mới): cầu nối `CustomEvent` (`xeoxo:chat-open-order`) để trang chi tiết đơn hàng mở `ChatWidget` toàn cục kèm ngữ cảnh đơn (mã đơn, trạng thái, tổng tiền) — hiển thị dưới dạng thẻ trong đoạn chat + câu hỏi hỗ trợ theo đúng đơn.

## Ghi chú

- Toàn bộ thay đổi đã chạy `tsc --noEmit` sau mỗi bước, không phát sinh lỗi type.
- Các file SQL (`create_v_product_line_sales.sql`, `seed_bestselling_sales_data.sql`) cần chạy thủ công trên Supabase SQL editor, không tự động migrate.
