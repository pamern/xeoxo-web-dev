# XEOXO Design System

## 1. Mục tiêu

Tài liệu này chuẩn hoá design system hiện tại của XEOXO dựa trên:

- `docs/uiux/branch-thuba-designtoken.md`
- `src/app/globals.css`
- `tailwind.config.ts`
- các component/page đang chạy thực tế trong `src/app` và `src/components`

Mục tiêu:

- dùng chung một ngôn ngữ thị giác cho toàn hệ thống
- giảm hard-code kích thước, màu sắc, spacing trong component
- giữ code UI responsive, dễ mở rộng, ít phá vỡ layout
- không làm thay đổi logic nghiệp vụ hiện có

---

## 2. Kiến trúc hệ thống

Design system của project được tổ chức theo luồng:

```text
CSS variables trong globals.css
→ map sang Tailwind theme trong tailwind.config.ts
→ component consume semantic class
→ page ghép layout từ component đã token hoá
```

Nguyên tắc:

- token gốc nằm ở `:root`
- component ưu tiên dùng class semantic thay vì số px rời rạc
- breakpoint chỉ dùng để đổi cấu trúc layout
- scale kích thước ưu tiên `clamp(...)`

---

## 3. Foundation Tokens

### 3.1. Color tokens

Nguồn: `src/app/globals.css`

Nhóm màu nền và chữ:

- `--color-background`
- `--color-foreground`
- `--color-card`
- `--color-card-foreground`

Nhóm màu hệ thống:

- `--color-primary`
- `--color-primary-foreground`
- `--color-secondary`
- `--color-secondary-foreground`
- `--color-muted`
- `--color-muted-foreground`
- `--color-destructive`
- `--color-destructive-foreground`

Nhóm màu thương hiệu và trạng thái:

- `--color-accent`
- `--color-accent-foreground`
- `--color-accent-muted`
- `--color-accent-strong`
- `--color-action`
- `--color-success`
- `--color-success-foreground`
- `--color-success-muted`

Nhóm viền và input:

- `--color-border`
- `--color-border-strong`
- `--color-input`
- `--color-ring`

Quy ước sử dụng:

- `accent`: CTA, badge, trạng thái thương hiệu
- `action`: link/action nhẹ
- `success`: thông báo thành công, tồn kho dương
- `destructive`: lỗi, validation, cảnh báo
- `muted`: nền phụ, text phụ, surface trung tính

### 3.2. Radius tokens

- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-panel`
- `--radius-pill`

Mapping trong Tailwind:

- `rounded-sm`
- `rounded-md`
- `rounded-lg`
- `rounded-panel`
- `rounded-pill`
- `rounded-card`

Quy ước:

- pill/button/chip: `rounded-pill`
- dialog/panel lớn: `rounded-panel` hoặc `rounded-lg`
- card nhỏ/form field: `rounded-md`, `rounded-card`

### 3.3. Typography tokens

Font family:

- `--font-display`
- `--font-sans`
- `--font-serif`

Semantic font size đã map trong `tailwind.config.ts`:

- display: `text-display-hero`, `text-display-page`, `text-display-section`
- heading: `text-heading-section`, `text-heading-card`, `text-heading-content`, `text-heading-content-sm`, `text-heading-feature`
- navigation/button: `text-nav-utility`, `text-nav`, `text-button-sm`, `text-button`, `text-button-lg`, `text-button-xl`, `text-button-hero`
- body/content: `text-body-xl`, `text-body-lg`, `text-body`, `text-body-sm`, `text-caption`, `text-field`
- editorial: `text-eyebrow`, `text-quote`, `text-quote-lg`

Quy ước:

- không dùng font-size “chết” nếu đã có semantic token tương đương
- display dành cho page hero, title chính, section lớn
- body dành cho đoạn văn dài, form text, supporting copy
- serif chỉ dùng cho eyebrow/editorial emphasis, không dùng đại trà

### 3.4. Layout and spacing tokens

Các token layout quan trọng:

- `--site-max-width`
- `--site-gutter-x`
- `--site-gutter-x-lg`
- `--section-gap-y`
- `--control-height`
- `--site-header-height`

Các token theo khu vực:

- header: `--header-*`
- hero/homepage: `--hero-*`, `--homepage-*`
- PDP: `--product-*`
- catalog/filter: `--catalog-*`, `--filter-*`
- footer: `--footer-*`

Quy tắc:

- spacing và chiều cao control ưu tiên dùng token
- không hard-code lại gutter desktop nếu đã có `gutter`
- các block lớn nên scale theo token thay vì tự thêm nhiều media query

---

## 4. Tailwind Mapping

Tailwind là lớp consume token, không phải nơi định nghĩa brand value mới.

Các extension chính đã chuẩn hoá:

- `colors`
- `borderRadius`
- `spacing`
- `height`
- `minHeight`
- `fontFamily`
- `fontSize`
- `maxWidth`
- `boxShadow`

Nguyên tắc mở rộng mới:

- thêm token vào `globals.css` trước
- chỉ map vào Tailwind khi token có ý nghĩa dùng lại
- không thêm utility ngẫu nhiên nếu chưa có nhu cầu lặp

---

## 5. Reusable Layout Primitives

### 5.1. Shared shells

Các class dùng chung cần ưu tiên:

- `.site-container`
- `.site-layout-header`
- `.homepage-shell`
- `.catalog-shell`
- `.listing-shell`
- `.product-page-shell`
- `.breadcrumb-shell`
- `.footer-shell`
- `.footer-hero-grid`
- `.footer-link-grid`
- `.footer-meta-grid`
- `.product-row-shell`
- `.reviews-shell`
- `.review-list-shell`
- `.value-proposition-shell`
- `.account-sticky-rail`

### 5.2. Shared semantic helpers

- `.page-heading`
- `.eyebrow-text`
- `.content-heading`
- `.content-body`
- `.form-control`
- `.header-utility-shell`
- `.header-main-shell`
- `.header-search`
- `.header-nav-link`
- `.header-dropdown-link`
- `.floral-divider`
- `.section-divider-band`
- `.category-banner-shell`
- `.catalog-hero-shell`
- `.catalog-hero-content`
- `.catalog-hero-title`
- `.catalog-hero-cta`
- `.catalog-hero-grid-shell`
- `.catalog-hero-grid-card`
- `.catalog-hero-grid-label`
- `.value-proposition-list`
- `.value-proposition-item`

Quy tắc:

- nếu pattern đã lặp từ 3 nơi trở lên, ưu tiên nâng thành helper class hoặc reusable component
- page không nên tự dựng lại spacing shell nếu đã có helper tương ứng

---

## 6. Responsive Strategy

### 6.1. Nguyên tắc chung

Responsive của hệ thống được tổ chức theo 2 lớp:

```text
fluid sizing bằng clamp(...)
+ breakpoint để đổi cấu trúc layout
```

### 6.2. Fluid sizing

Áp dụng cho:

- gutter
- control height
- header gap
- hero height
- card gap
- PDP gallery width
- spacing của footer

Mục tiêu:

- desktop lớn gần Figma hơn
- mobile không bị scale gắt
- giảm cảm giác nhảy layout giữa breakpoint

### 6.3. Breakpoint structural changes

Chỉ dùng breakpoint khi cần:

- stack → grid
- đổi số cột
- bật sticky rail
- đổi nav mobile/desktop
- đổi horizontal scroll thành grid

Pattern ưu tiên:

- `flex-col lg:flex-row`
- `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`
- mobile scroll rail + desktop grid

---

## 7. Component System Rules

### 7.1. Atomic structure

Tuân theo cấu trúc:

```text
atoms
→ molecules
→ organisms
→ templates
→ pages
```

Quy tắc:

- atom không chứa business logic
- molecule ghép atom cho một interaction nhỏ
- organism là khối UI hoàn chỉnh theo section
- template chỉ dựng khung trang
- page chỉ nối data/layout, không gánh business logic dài

### 7.2. Khi tạo component mới

Ưu tiên:

1. tái dùng component hiện có
2. nếu chỉ thiếu biến thể, thêm prop/variant
3. chỉ tạo component mới khi khác trách nhiệm rõ ràng

Không nên:

- clone component chỉ để đổi spacing nhẹ
- gắn trực tiếp query/business rule vào UI component
- hard-code design token trong nhiều file khác nhau

---

## 8. Behavioral UI Rules

### 8.1. Header and global chrome

Header là phần chrome dùng chung của site và có rule riêng:

- header phải cố định ở toàn bộ public page
- riêng trang chi tiết sản phẩm, header không được ép fixed cứng
- PDP cần chừa chỗ cho follow bar thay thế khi đủ điều kiện hiển thị
- chiều cao header phải được đo runtime và ghi vào `--site-header-height`

Ý nghĩa kỹ thuật:

- account sticky rail, shell spacing và các sticky block khác không được hard-code theo số px
- mọi offset liên quan header phải bám theo `--site-header-height`
- `SiteLayout` phải giữ phần chừa chỗ cho header thông qua `.site-layout-header`
- `SiteHeader` phải consume helper classes của design system thay vì hard-code spacing nếu không có lý do đặc biệt

### 8.1.1. Shared shell adoption hiện tại

Các vùng đã được chuẩn hoá consume token/helper:

- `SiteHeader`
- `SiteFooter`
- homepage shell chính
- catalog top filter shell
- product listing shell

Nguyên tắc rollout:

- ưu tiên shared chrome và page shell trước
- sau đó mới token-hoá tiếp component section-level
- không rewrite markup lớn nếu chỉ cần đổi layer spacing/typography

### 8.2. Account pages

Pattern chuẩn:

- body là scroll container chính
- left navigation dùng `.account-sticky-rail`
- top offset của sticky rail tính từ `--site-header-height`

Không tạo scrollbar lồng nhiều tầng nếu không thật sự cần.

### 8.3. Form and modal surfaces

Pattern chuẩn:

- field ưu tiên semantic typography + token radius
- modal dùng panel bo góc lớn, khoảng thở rộng, overlay rõ
- success modal và action modal phải thống nhất visual shell, chỉ đổi nội dung

### 8.4. Product detail pages

PDP là ngoại lệ của global chrome:

- không ép fixed header giống toàn site
- follow bar là mechanism ưu tiên khi state/viewport đủ điều kiện
- sticky/floating behavior của PDP không được làm hỏng flow scroll tự nhiên của trang

---

## 9. Smart Logic To Preserve

Các logic UI thông minh hiện có cần giữ khi refactor:

- `SiteHeader` đo chiều cao thật và sync vào `--site-header-height`
- sticky rail account bám theo biến header height
- token semantic trong Tailwind giúp đổi theme mà không sửa hàng loạt component
- responsive dùng `clamp(...)` để scale mượt thay vì nhảy size mạnh
- modal success cho checkout/appointment tách khỏi business flow, chỉ consume kết quả submit

---

## 10. Quy tắc implementation về sau

Khi sửa UI:

- ưu tiên semantic token trước khi thêm class số px
- nếu một size/màu/gap lặp nhiều nơi, nâng thành token
- nếu một layout shell lặp nhiều nơi, nâng thành helper class hoặc template
- không đổi logic service/api/feature khi chỉ đang chuẩn hoá design system

Khi review code UI:

- có đang dùng token không
- có hard-code spacing lặp vô nghĩa không
- có tạo nested scroll không
- có phá rule fixed header và PDP exception không
- có thêm business logic vào component trình bày không

---

## 11. File nguồn chuẩn để đối chiếu

- `src/app/globals.css`
- `tailwind.config.ts`
- `src/components/templates/SiteLayout/SiteLayout.tsx`
- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `docs/uiux/branch-thuba-designtoken.md`

Tài liệu này là chuẩn UI/UX vận hành hiện tại của branch sau khi đã chuẩn hoá theo design token và responsive behavior thực tế.
