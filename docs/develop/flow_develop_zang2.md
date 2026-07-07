# Hướng xử lý conflict nhánh zang2

## Mục tiêu

Tài liệu này ghi lại cách xử lý conflict để nhánh `zang2` giữ được giao diện mới hơn nhưng không làm mất các hành vi đang có sẵn trong codebase.

## Nguyên tắc merge

- Ưu tiên bản có cấu trúc UI hoàn chỉnh hơn nếu cùng một màn hình có hai phiên bản.
- Không bỏ các trạng thái nghiệp vụ đã tồn tại như `isNew`, `salePrice`, badge hoặc CTA quan trọng.
- Với cấu hình môi trường, ưu tiên cách đọc từ biến môi trường thay vì hard-code.
- Sau khi merge, phải xóa sạch marker conflict và `git add` lại file để Git đánh dấu đã resolve.

## Các lựa chọn đã giữ

### 1. `src/app/about/page.tsx`

- Giữ bản giao diện mới hơn, sát layout hiện tại hơn.
- Lý do:
  - Hero, manifesto, story, principles, process và closing CTA được dàn khối tốt hơn.
  - Typography, spacing và background đồng bộ hơn với hướng UI đang dùng.

### 2. `src/app/layout.tsx`

- Giữ cả hai font `Unbounded` và `Crimson Pro`.
- Giữ thêm `suppressHydrationWarning` từ nhánh còn lại.
- Không giữ phần import thừa kiểu `ts-ignore` cho CSS vì file CSS đã import trực tiếp bình thường.

Kết quả mong muốn:

- Toàn app vẫn dùng đủ biến font đang khai báo trong CSS.
- Tránh cảnh báo hydration không cần thiết ở root layout.

### 3. `src/components/molecules/ProductCard/ProductCard.tsx`

- Giữ hiệu ứng hover preview ảnh phụ và khối quick-add size của nhánh mới.
- Đồng thời khôi phục:
  - badge `NEW`
  - badge `SALE`
  - logic hiển thị `salePrice`
  - giá gạch ngang khi đang giảm giá

Lý do:

- Nhánh mới cải thiện trải nghiệm card ở homepage/catalog.
- Nhánh cũ vẫn chứa logic nghiệp vụ hiển thị trạng thái sản phẩm, không nên làm mất.

### 4. `next.config.ts`

- Giữ cấu hình `remotePatterns` đọc từ `NEXT_PUBLIC_SUPABASE_URL`.
- Không giữ hostname hard-code.

Lý do:

- Linh hoạt theo từng môi trường.
- Tránh phải sửa code khi đổi project Supabase.

## Cách kiểm tra sau merge

Chạy lần lượt:

```bash
git diff --name-only --diff-filter=U
rg -n "^(<<<<<<<|=======|>>>>>>>)" src docs package-lock.json
git status --short
```

Nếu file đã hết marker nhưng vẫn còn trạng thái `UU` hoặc `AA`:

```bash
git add <ten-file>
```

## Ghi chú

- `ProductCard` là nơi dễ bị mất logic khi merge vì một nhánh tập trung UI hover, nhánh còn lại tập trung badge và giá sale.
- `layout` và `next.config` nên ưu tiên phương án tổng quát, không khóa cứng theo một môi trường chạy cụ thể.
