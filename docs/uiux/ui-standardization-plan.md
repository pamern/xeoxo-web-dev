# UI Standardization Plan

## 1. Mục tiêu

Tài liệu này là kế hoạch chuẩn hóa lại UI của XEOXO Web theo hướng:

- thống nhất design tokens
- giảm hard-code kích thước trong component
- chuẩn hóa pattern giao diện dùng lại
- có chiến lược ảnh rõ ràng cho từng loại block
- audit responsive theo 4 mốc chính: `375`, `768`, `1024`, `1440`

Mục tiêu cuối:

- UI đồng nhất hơn giữa các màn
- responsive ổn định hơn trên mobile, tablet, desktop
- giảm patch style cục bộ
- giúp team sửa một nơi, ảnh hưởng đúng nhiều nơi

---

## 2. Phạm vi

Phạm vi ưu tiên:

- `src/app/globals.css`
- `tailwind.config.ts`
- `src/components/atoms/`
- `src/components/molecules/`
- `src/components/organisms/`
- các page public và account đang có traffic/use case chính

Nhóm màn hình ưu tiên rollout:

1. Header, footer, layout shell
2. Auth
3. Product detail
4. Cart / checkout
5. Collections
6. Account profile / address / appointment
7. Listing / catalog

Ngoài phạm vi giai đoạn 1:

- redesign visual direction mới hoàn toàn
- dark mode
- animation system lớn
- thay đổi nghiệp vụ backend

---

## 3. Vấn đề hiện tại

### 3.1. Design token chưa phủ đủ rộng

- nhiều token đã có trong `globals.css`, nhưng component vẫn dùng nhiều giá trị cứng
- cùng một loại UI nhưng dùng nhiều kích thước khác nhau
- semantic token và class thực tế chưa khớp hoàn toàn

### 3.2. Hard-code layout còn nhiều

- `w-[...]`, `h-[...]`, `max-w-[...]`, `px-[...]`, `gap-[...]` xuất hiện dày
- cùng một pattern nhưng mỗi màn tự scale theo cách riêng
- responsive bị phụ thuộc vào patch theo từng case

### 3.3. Pattern UI chưa đồng nhất

- form chưa cùng hệ input height, radius, label, error state
- modal chưa cùng max-width, padding, close button placement
- card/image frame chưa có rule chung
- empty state / loading state / warning block còn lệch style

### 3.4. Ảnh chưa có chiến lược cắt khung

- nhiều block dùng `object-cover` mặc định
- ảnh dọc người mẫu dễ bị cắt đầu, mất vai, mất focal point
- chưa có quy ước loại block nào dùng `object-top`, `object-center`, hay `contain`

### 3.5. Responsive chưa được audit theo hệ thống

- hiện đang sửa lỗi theo màn hoặc theo bug phát sinh
- chưa có checklist theo breakpoint
- chưa có baseline screenshot/acceptance cho `375`, `768`, `1024`, `1440`

---

## 4. Nguyên tắc chuẩn hóa

### 4.1. Token trước, component sau

- chỉ thêm class cứng khi token không đủ diễn đạt
- mọi primitive lặp lại phải đi qua token hoặc helper class

### 4.2. Ưu tiên semantic thay vì số px rời

Ví dụ:

- dùng `form-control`, `rounded-pill`, `text-body-sm`
- không lặp lại quá nhiều `h-[44px]`, `rounded-[14px]`, `text-[13px]`

### 4.3. Responsive theo 2 lớp

- lớp 1: fluid token bằng `clamp(...)`
- lớp 2: breakpoint để đổi cấu trúc layout

### 4.4. Một pattern chỉ có một rule chính

Ví dụ:

- input text chỉ nên có 1-2 biến thể
- modal chỉ nên có 2-3 size chuẩn
- loading state cùng ngôn ngữ thị giác

### 4.5. Không chuẩn hóa bằng cách rewrite toàn bộ

- rollout theo phase
- ưu tiên primitive và màn có bug nhiều
- tránh big bang refactor

---

## 5. Deliverables

### 5.1. Foundation layer

- bộ token chuẩn cho typography, spacing, radius, input height, section gap, max-width
- semantic helper class dùng lại
- mapping rõ giữa token và Tailwind theme

### 5.2. Pattern library level code

- form pattern
- card pattern
- image frame pattern
- modal pattern
- empty state pattern
- loading state pattern

### 5.3. Image strategy document

- quy tắc ratio theo loại block
- quy tắc object-position
- quy tắc chọn focal point
- fallback khi ảnh không đúng tỉ lệ

### 5.4. Responsive audit sheet

- checklist theo breakpoint
- danh sách màn đã pass
- danh sách bug còn mở

---

## 6. Kế hoạch triển khai theo phase

## Phase 1. Audit và chốt baseline

Mục tiêu:

- biết chính xác cái gì đang lệch
- gom bug theo pattern thay vì theo màn rời rạc

Việc cần làm:

1. Audit `globals.css`, `tailwind.config.ts`, các helper class hiện có.
2. Thống kê giá trị hard-code lặp nhiều:
   - `rounded-[...]`
   - `h-[...]`
   - `w-[...]`
   - `max-w-[...]`
   - `px-[...]`, `py-[...]`, `gap-[...]`
   - `text-[...]`
3. Chụp baseline 4 breakpoint cho các màn ưu tiên:
   - homepage
   - collections
   - product detail
   - cart / checkout
   - auth modal
   - account profile
   - appointment
4. Tạo bảng mapping:
   - component nào dùng token đúng
   - component nào đang hard-code
   - component nào cần refactor trước

Deliverable:

- report audit ban đầu
- danh sách top 20 component cần chuẩn hóa trước

Definition of done:

- có bảng inventory rõ
- có ảnh/chứng cứ theo 4 breakpoint
- có thứ tự ưu tiên rollout

---

## Phase 2. Chuẩn hóa foundation tokens

Mục tiêu:

- chốt ngôn ngữ chung cho kích thước và spacing

Nhóm token cần chuẩn hóa:

### Typography

- font family
- display scale
- heading scale
- body scale
- caption scale
- input text scale
- font-weight rule theo ngữ nghĩa

### Spacing

- page padding x/y
- section gap
- block gap
- form row gap
- card content padding
- modal padding

### Radius

- radius cho field
- radius cho button/chip
- radius cho card
- radius cho panel/modal

### Control sizing

- input height
- select height
- textarea min-height
- button height
- icon button size

### Layout width

- site max-width
- page content max-width
- modal max-width
- form max-width
- text content max-width

Việc cần làm:

1. Chốt token còn thiếu trong `:root`.
2. Map token vào `tailwind.config.ts` nếu có giá trị dùng lại.
3. Bổ sung helper class semantic trong `globals.css`.
4. Viết rule sử dụng token cho team.

Deliverable:

- token spec hoàn chỉnh
- helper class mới
- bảng “old hard-code -> new semantic token”

Definition of done:

- không thêm token trùng nghĩa
- token đủ để cover ít nhất 80% pattern hiện tại

---

## Phase 3. Giảm hard-code và refactor primitive

Mục tiêu:

- chuyển phần lớn UI lặp lại về primitive/semantic class

Ưu tiên refactor:

1. `Button`
2. `form-control`
3. `IconButton`
4. card wrapper dùng lại
5. modal shell
6. section/container shell

Việc cần làm:

1. Tạo utility class hoặc semantic component prop cho:
   - size
   - radius
   - padding
   - visual variant
2. Thay dần các giá trị cứng lặp nhiều.
3. Không refactor sâu ở một màn nếu primitive chưa chuẩn.

Deliverable:

- primitive layer sạch hơn
- số lượng class hard-code giảm đáng kể ở các màn chính

Definition of done:

- mỗi primitive có API rõ
- component mới không cần copy-paste class dài

---

## Phase 4. Chuẩn hóa pattern giao diện

Mục tiêu:

- những UI cùng loại phải nhìn và hành xử giống nhau

### 4.1. Form pattern

Chuẩn hóa:

- label
- placeholder
- input/select/textarea height
- error text
- helper text
- disabled state
- loading/submitting state

Biến thể chính:

- auth field
- checkout/profile field
- compact field

### 4.2. Card pattern

Chuẩn hóa:

- image card
- content card
- status card
- promotional card

Rule cần chốt:

- padding trong card
- title spacing
- shadow rule
- border rule

### 4.3. Image frame pattern

Chuẩn hóa:

- product thumbnail
- product main image
- collection image
- hero image
- editorial image

### 4.4. Modal pattern

Chuẩn hóa:

- modal width
- modal padding
- close button
- header spacing
- scroll behavior
- mobile top-align vs center-align

### 4.5. Empty state pattern

Chuẩn hóa:

- icon/illustration area
- title
- supporting copy
- CTA

### 4.6. Loading state pattern

Chuẩn hóa:

- skeleton
- inline spinner
- full-section loading
- no-data vs loading separation

Deliverable:

- guideline cho từng pattern
- rollout ưu tiên vào checkout, profile, appointment, collections, PDP

Definition of done:

- cùng loại UI không còn mỗi nơi một kiểu
- design review có thể đối chiếu bằng checklist thay vì cảm tính

---

## Phase 5. Chiến lược ảnh

Mục tiêu:

- giảm crop xấu
- giữ focal point đúng nội dung
- ảnh ổn định hơn giữa các breakpoint

### 5.1. Quy tắc object-position

- `object-top`:
  - ảnh người mẫu dọc
  - collection editorial
  - portrait / upper body focus

- `object-center`:
  - ảnh landscape
  - banner cân đối
  - ảnh product flat-lay trung tâm

- `object-contain`:
  - ảnh kỹ thuật
  - ảnh minh họa cần giữ full shape

### 5.2. Quy tắc ratio theo block

- hero lớn
- collection story image
- product thumbnail
- product main image
- banner category
- editorial portrait

Mỗi loại block phải có:

- ratio mặc định
- ratio mobile
- ratio desktop
- object-position mặc định

### 5.3. Focal point strategy

Phase nhẹ:

- dùng class rule theo loại block

Phase nâng cao:

- cho phép metadata per image:
  - focal x
  - focal y
  - preferred ratio

Deliverable:

- bảng “block type -> ratio -> object-position”
- danh sách component cần áp dụng

Definition of done:

- giảm lỗi “mất đầu”, “mất vai”, “crop sai chủ thể”

---

## Phase 6. Responsive audit 4 breakpoint

Breakpoint chuẩn:

1. `375`
2. `768`
3. `1024`
4. `1440`

### Checklist audit cho mỗi màn

#### Layout

- không tràn ngang
- không có khoảng trắng bất thường
- thứ tự block đúng
- sticky/fixed element không che nội dung

#### Typography

- title không vỡ dòng khó đọc
- body không quá nhỏ
- line-height đủ thoáng

#### Form

- field đủ rộng để nhập
- button không bị đẩy dòng xấu
- error/helper text không lệch

#### Image

- không crop sai focal point
- không kéo méo
- không quá to/nuốt màn hình

#### CTA / action

- dễ bấm trên touch
- không bị chồng lớp
- trạng thái hover/focus hợp lý

### Màn bắt buộc audit

- home
- catalog/listing
- collection list
- collection detail
- product detail
- cart
- checkout
- auth modal
- appointment modal
- account profile
- account address

Deliverable:

- responsive audit matrix
- status: `pass`, `needs-fix`, `blocked`

Definition of done:

- các màn ưu tiên pass đủ 4 breakpoint

---

## 7. Thứ tự rollout đề xuất

### Wave 1. Foundation

- token
- helper class
- button
- form-control
- modal shell

### Wave 2. High pain screens

- checkout
- cart
- appointment
- account profile
- product detail

### Wave 3. Brand/editorial screens

- collections
- homepage collections
- catalog hero
- value proposition

### Wave 4. Full responsive audit

- sweep toàn bộ 4 breakpoint
- chốt bug còn lại

---

## 8. Rủi ro và cách giảm rủi ro

### Rủi ro 1. Refactor token làm lệch UI cũ

Giảm rủi ro:

- rollout theo primitive
- test visual theo từng wave
- không đổi nhiều pattern trong cùng một PR

### Rủi ro 2. Component cũ phụ thuộc class cứng

Giảm rủi ro:

- tạo bridge class tạm thời
- migrate dần thay vì đổi một lần

### Rủi ro 3. Responsive fix chồng chéo

Giảm rủi ro:

- audit theo breakpoint cố định
- không sửa “cảm giác”, phải có screenshot đối chiếu

### Rủi ro 4. Ảnh không đồng nhất nguồn

Giảm rủi ro:

- quy định rõ object-position fallback
- về lâu dài bổ sung metadata focal point

---

## 9. Checklist implementation

Trước khi sửa:

- [ ] Xác định component thuộc pattern nào
- [ ] Kiểm tra đã có token tương ứng chưa
- [ ] Kiểm tra có helper class dùng lại được chưa
- [ ] Xác định ảnh thuộc loại block nào
- [ ] Kiểm tra ở 4 breakpoint chính

Trước khi merge:

- [ ] Không thêm hard-code nếu đã có token semantic
- [ ] Không tạo variant mới nếu chỉ khác rất nhỏ
- [ ] Form/card/modal/image follow đúng pattern
- [ ] Đã test `375`, `768`, `1024`, `1440`
- [ ] Không làm vỡ layout màn khác
- [ ] Nếu thêm token mới, đã cập nhật docs liên quan

---

## 10. Kết quả kỳ vọng

Sau khi hoàn thành plan này, project cần đạt được:

- CSS có hệ thống hơn, ít vá cục bộ
- UI đồng nhất giữa các flow chính
- responsive ổn định hơn trên 4 mốc chuẩn
- ảnh hiển thị có chủ đích hơn
- việc phát triển màn mới nhanh hơn vì đã có primitive rõ ràng

---

## 11. File liên quan

- `docs/uiux/design_system.md`
- `docs/uiux/branch-thuba-designtoken.md`
- `docs/uiux/figma-component-architecture.md`
- `src/app/globals.css`
- `tailwind.config.ts`

---

## 12. Rollout Notes

### Rollout 1. Panel account lặp nhiều

Mục tiêu:

- giảm copy-paste ở các màn account/faq
- không thay đổi visual lớn của layout hiện có
- chỉ đưa vào global pattern đã lặp đủ nhiều

Đã chuẩn hóa:

- `account-panel-soft`
  - dùng cho panel nền trắng, radius vừa, shadow mềm
  - áp dụng cho:
    - account profile
    - account addresses
    - account reviews
    - account appointments
    - account FAQ

- `account-panel-heading`
  - dùng cho heading chính trong các panel account soft
  - gom size heading `19px -> 26px` về một rule semantic

Chưa đưa vào global:

- panel đơn hàng có radius/shadow khác rõ ràng
- modal shell
- product detail panel
- review modal
- appointment modal

Lý do chưa đưa vào global:

- các block này đang có khác biệt thị giác có chủ đích
- nếu ép gộp sớm dễ làm vỡ bố cục hoặc flatten visual hierarchy
- cần audit thêm trước khi hợp nhất thành primitive chung

Nguyên tắc áp dụng tiếp theo:

- chỉ global hóa khi một pattern lặp ít nhất ở 3-4 nơi và có cùng:
  - radius
  - padding
  - shadow
  - heading rhythm

- nếu chỉ giống 70-80% nhưng khác role thị giác:
  - giữ local
  - hoặc tạo variant riêng sau khi audit đủ
