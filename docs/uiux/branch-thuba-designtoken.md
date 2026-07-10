# Branch Thuba - Design Token And Responsive Notes

## 1. Mục tiêu tài liệu

Tài liệu này tóm tắt cách nhánh hiện tại đang tổ chức:

- design token
- typography token
- spacing/layout token
- responsive behavior
- các logic UI “thông minh” nên giữ khi tiếp tục phát triển

Phạm vi quan sát dựa trên code trong:

- `src/app/globals.css`
- `tailwind.config.ts`
- các page/component account, product detail, checkout, appointment, collection, listing

---

## 2. Kiến trúc token hiện tại

Nhánh này đang dùng hướng:

```text
CSS variables trong globals.css
→ map vào Tailwind theme
→ component chỉ consume token class / variable
```

Điểm mạnh của cách làm này:

- đổi theme chủ yếu sửa ở `:root`, không phải đi sửa hàng loạt component
- token giữ được ngữ nghĩa nghiệp vụ như `accent`, `action`, `success`, `border-strong`
- responsive có thể dùng token fluid `clamp(...)` thay vì mỗi component tự scale

### 2.1. Token màu

Được khai báo trong `src/app/globals.css` dưới dạng HSL variables:

- nền/chữ cơ bản:
  - `--color-background`
  - `--color-foreground`
- màu hệ thống:
  - `--color-primary`
  - `--color-secondary`
  - `--color-muted`
  - `--color-destructive`
- màu ngữ nghĩa thêm:
  - `--color-accent`
  - `--color-accent-foreground`
  - `--color-accent-muted`
  - `--color-accent-strong`
  - `--color-action`
  - `--color-success`
  - `--color-success-foreground`
  - `--color-success-muted`
- border/input:
  - `--color-border`
  - `--color-border-strong`
  - `--color-input`
  - `--color-ring`

### 2.2. Token bo góc

- `--radius-sm`
- `--radius-md`
- `--radius-lg`
- `--radius-panel`
- `--radius-pill`

Quy ước đang thấy:

- panel lớn: `rounded-[26px]` hoặc token `panel`
- action/button/chip: `rounded-pill`
- card nhỏ: `rounded-md`, `rounded-[14px]`, `rounded-sm`

### 2.3. Token font

- `--font-display`
- `--font-sans`
- `--font-serif`

Map trong Tailwind:

- `font-display`
- `font-sans`
- `font-serif`

Ý đồ:

- `display/sans` đang cùng trục `Unbounded`
- `serif` dùng cho đoạn nhấn cảm xúc, editorial, eyebrow

### 2.4. Token typography

Tailwind đang define khá đầy đủ semantic font size:

- display:
  - `text-display-hero`
  - `text-display-page`
  - `text-display-section`
- heading:
  - `text-heading-section`
  - `text-heading-card`
  - `text-heading-content`
  - `text-heading-content-sm`
  - `text-heading-feature`
- nav/button:
  - `text-nav-utility`
  - `text-nav`
  - `text-button-sm`
  - `text-button`
  - `text-button-lg`
  - `text-button-xl`
  - `text-button-hero`
- body:
  - `text-body-xl`
  - `text-body-lg`
  - `text-body`
  - `text-body-sm`
  - `text-caption`
  - `text-field`
- special:
  - `text-eyebrow`
  - `text-quote`
  - `text-quote-lg`

Điểm đáng giữ:

- typography đã chuyển từ size “chết” sang semantic naming
- nhiều size dùng `clamp(...)`, nên text scale mượt từ mobile tới desktop lớn

---

## 3. Responsive strategy hiện tại

Nhánh này không làm responsive theo kiểu chỉ có:

```text
mobile
→ md
→ lg
→ xl
```

Mà đang kết hợp 2 lớp:

### 3.1. Fluid token bằng `clamp(...)`

Áp dụng cho:

- gutter
- control height
- section gap
- header height/gap
- hero height
- product gallery width/thumb size
- catalog hero spacing
- filter spacing
- footer spacing/icon size

Ví dụ nhóm token:

- `--site-gutter-x-lg`
- `--control-height`
- `--section-gap-y`
- `--header-utility-height`
- `--header-nav-gap`
- `--hero-min-height`
- `--product-gallery-main-width`
- `--product-detail-grid-gap`

Lợi ích:

- UI co giãn tuyến tính, đỡ cảm giác “nhảy layout” mạnh ở breakpoint
- desktop lớn gần Figma hơn mà không cần quá nhiều media query riêng

### 3.2. Breakpoint để đổi cấu trúc layout

Fluid token giải quyết size; breakpoint vẫn dùng để đổi cấu trúc:

- stack → grid
- số cột thay đổi
- bật/tắt sticky rail
- horizontal scroll → grid
- mobile nav → desktop nav

Pattern thường gặp:

- `grid-cols-2 md:grid-cols-3 xl:grid-cols-4`
- `flex-col lg:flex-row`
- `overflow-x-auto` trên mobile, `lg:grid` hoặc `lg:flex-col` trên desktop
- `site-container` với `padding-inline` mobile riêng và desktop riêng

---

## 4. Layout token và reusable shell

### 4.1. Container

Nhánh này đã gom container site vào class:

```text
.site-container
```

Ý nghĩa:

- `max-width` chung của site là `var(--site-max-width)`
- mobile dùng `--site-gutter-x`
- desktop lớn dùng `--site-gutter-x-lg`

Khuyến nghị:

- ưu tiên dùng `site-container` hoặc `max-w-site + px token`
- tránh lặp lại `px-6 xl:px-[100px]` ở quá nhiều nơi nếu có thể gom lại

### 4.2. Semantic helper classes

Hiện đã có một số helper classes tốt:

- `.site-container`
- `.page-heading`
- `.eyebrow-text`
- `.content-heading`
- `.content-body`
- `.form-control`
- `.catalog-shell`
- `.listing-shell`
- `.footer-shell`
- `.product-row-shell`
- `.reviews-shell`
- `.catalog-hero-shell`
- `.section-divider-band`

Đây là hướng đúng. Nếu nhánh tiếp tục mở rộng, nên thêm theo cùng triết lý thay vì quay lại hard-code text/spacing từng page.

---

## 5. Pattern responsive nổi bật theo khu vực

### 5.1. Header

Header không nên hard-code chiều cao ở page khác.

Nhánh hiện tại đã có logic:

- `SiteHeader` đo chiều cao thật
- ghi vào CSS variable `--site-header-height`
- các rail sticky khác bám theo biến này

Điểm này quan trọng vì:

- header có utility bar + main bar
- chiều cao thực tế có thể đổi khi content đổi
- product detail có flow follow bar thay thế header

### 5.2. Account pages

Account pages đang chuyển sang pattern:

- toàn trang scroll theo `body`
- sidebar trái dùng `sticky`
- offset sticky tính theo `--site-header-height`

Class dùng chung:

```text
.account-sticky-rail
```

Đây là logic tốt hơn nhiều so với:

- `top-[180px]`
- `h-[calc(100vh-...)]`
- `overflow-y-auto` nhiều lớp

Vì:

- không sinh scrollbar lồng nhau
- không lệ thuộc con số cứng
- vẫn tương thích với header/follow bar logic

### 5.3. Product detail

PDP đang có logic đặc biệt:

- khi đủ điều kiện, follow bar xuất hiện
- `body.pdp-follow-bar-active .site-layout-header` bị ẩn ở desktop

Điều này có nghĩa:

- không được coi header là “luôn fixed với chiều cao cứng”
- mọi sticky offset nên dựa vào biến hoặc logic ngữ cảnh

### 5.4. Horizontal scroll có chủ đích

Nhánh này dùng `overflow-x-auto` khá đúng chỗ:

- rail product
- filter bar
- gallery thumb mobile
- một số bảng/size guide

Đồng thời ẩn scrollbar bằng:

```text
.no-scrollbar
```

Đây là scroll có chủ đích, không phải bug.

Rule ngầm đang dùng:

- mobile: cho phép cuộn ngang nếu danh sách quá dày
- desktop: ưu tiên chuyển thành grid/list đầy đủ

### 5.5. Form/control

Control height đã được token hóa:

- `--control-height`
- `h-control`
- `min-h-control`

Nhiều form mới đã bắt đầu bám token thay vì dùng mỗi nơi một chiều cao.

Khuyến nghị:

- tiếp tục chuẩn hóa input/select/button/action theo `h-control`
- hạn chế thêm các chiều cao cứng mới như `h-[61px]` nếu không thật sự cần

---

## 6. Các quyết định “thông minh logic” nên giữ

Đây là các điểm không chỉ là style, mà là logic UI nên tiếp tục tôn trọng.

### 6.1. Sticky offset phải bám header thật, không bám số cứng

Lý do:

- header có thể đổi chiều cao theo responsive/content
- PDP có follow bar thay header
- hard-code dễ sai khi UI chỉnh nhẹ

Áp dụng tốt cho:

- account sidebar
- các rail/filter/anchor sticky tương lai

### 6.2. Một page chỉ nên có một luồng scroll chính khi không có lý do mạnh

Không nên:

- page wrapper `overflow-hidden`
- aside `overflow-y-auto`
- content `overflow-y-auto`
- cộng thêm body scroll

Nên:

- để body scroll chính
- chỉ tạo inner scroll khi đó thật sự là panel/modal/list có chủ đích

### 6.3. Mobile first, desktop refine

Pattern của nhánh này đang hợp lý:

- mobile hiển thị trước
- desktop chỉ nâng cấp layout
- không tách hai code path khác nhau quá mạnh

Ví dụ:

- stack thành 1 cột trước
- lên `md/lg/xl` mới chia grid
- danh sách dài có thể scroll ngang ở mobile rồi đổi sang grid ở desktop

### 6.4. Dùng semantic typography token thay cho “font-size theo cảm tính”

Thay vì:

```text
text-[17px]
text-[21px]
text-[33px]
```

Nên ưu tiên:

- `text-display-page`
- `text-heading-section`
- `text-heading-card`
- `text-body-lg`
- `text-button`

Điều này giúp:

- scale nhất quán
- dễ thay đổi theme/type ramp toàn nhánh

### 6.5. Reuse nền/strip/ornament qua asset pattern

Nhánh này dùng khá rõ một số ornament lặp:

- `header-line-up.png`
- `strip-title-underline.png`
- `strip-cart-section.png`
- `bg-gia-nhap-btn.png`

Rule nên giữ:

- dùng asset nền như token thị giác
- không thay bằng màu ngẫu nhiên ở page khác
- CTA, panel divider, accent strip nên bám cùng bộ asset này

### 6.6. Token màu đang đi theo semantic state, không chỉ brand color

Ví dụ:

- `accent` cho badge/CTA/nhấn cam
- `action` cho link và secondary action xanh
- `success` cho trạng thái thành công
- `destructive` cho lỗi/cảnh báo mạnh
- `border-strong` cho divider/placeholder đậm hơn

Nên tiếp tục theo semantic state để component tái dùng dễ hơn.

---

## 7. Những điểm nên tiếp tục chuẩn hóa thêm

Nhánh hiện tại đã đi đúng hướng nhưng vẫn còn chỗ chưa đều.

### 7.1. Còn trộn token và hard-coded utility

Ví dụ vẫn còn các dạng:

- `px-6`
- `xl:px-[100px]`
- `rounded-[26px]`
- `h-[61px]`

Khuyến nghị:

- nơi nào lặp nhiều thì nâng thành token/helper class
- nơi thật sự one-off thì giữ utility cứng cũng được

### 7.2. Nên gom thêm shell cho account page

Hiện account pages khá giống nhau:

- breadcrumb
- sidebar trái
- panel phải
- floral divider

Về lâu dài nên cân nhắc một `AccountPageShell` để:

- giảm lặp code
- giữ đồng nhất layout/sticky logic
- tránh page nào đó quay lại hard-code overflow/top

### 7.3. Nên rà dần control sizing ở checkout/account form

Hiện có nơi đã dùng `h-control`, nhưng cũng có nơi còn:

- `h-[61px]`
- `h-11`
- `min-h-[50px]`

Nếu muốn đồng nhất hơn, nên thống nhất bộ:

- input tiêu chuẩn
- button tiêu chuẩn
- pill tiêu chuẩn
- modal action tiêu chuẩn

---

## 8. Kết luận ngắn

Triết lý UI của nhánh này có thể tóm gọn là:

```text
semantic token
+ fluid responsive
+ mobile-first structure
+ sticky/layout logic theo ngữ cảnh thật
+ reuse visual ornament của brand
```

Nếu tiếp tục phát triển trên nhánh này, nên ưu tiên:

1. thêm token mới vào `globals.css` và `tailwind.config.ts` trước khi hard-code
2. dùng semantic typography class trước khi chọn size pixel mới
3. chỉ tạo scroll nội bộ khi đó là chủ đích UX rõ ràng
4. mọi sticky offset nên bám header/layout thật, không dùng số cứng
5. giữ tương thích với product detail follow bar vì đó là ngoại lệ layout quan trọng của project
