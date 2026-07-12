# Rebase `tester` onto `zang3` - Conflict Handling Notes

Ngày thực hiện: `2026-07-12`

## Tài liệu đã đối chiếu

- `docs/develop/2026-07-12-ui-account-catalog-chat-updates.md`
- Lịch sử commit của nhánh `tester`: `6c2d580 chore: sync branch tester updates`

## Ghi chú về tài liệu nhánh `tester`

- File được yêu cầu là `docs/develop/branch-tester.md` hiện **không tồn tại** trong working tree của repo.
- File `docs/develop/branch-test.md` cũng không tồn tại trên nhánh `zang3` trước khi rebase.
- Vì vậy, phần thay đổi của nhánh `tester` được đối chiếu theo chính commit `6c2d580` và danh sách file thay đổi của commit này.

## Hướng rebase đang thực hiện

- Rebase local theo hướng: checkout `tester` rồi chạy `git rebase zang3`
- Commit được replay từ `tester`: `6c2d580`

## Tổng quan phạm vi thay đổi 2 nhánh

### `zang3`

- Catalog hero, catalog tabs, newest/bestseller dùng dữ liệu thật
- Cleanup layout các trang account và FAQ account
- Tối ưu order history, review history, account review UI
- Chat widget demo và mở chat từ chi tiết đơn hàng
- Sửa `ProductReviewModal` cho z-index, chiều cao modal, style sao

### `tester`

- Loyalty reward/voucher load trong cart + API/hook/service tương ứng
- Reset checkout form sau khi tạo đơn thành công, ẩn lỗi cart stale sau checkout
- Giới hạn tối đa 300 sản phẩm trong giỏ hàng
- Size selector trong cart chỉ rõ tồn kho
- Auth modal fit viewport
- Marquee disclaimer ở `SiteHeader`
- Phân trang review product detail 5 review/trang, bỏ scroll riêng trong khung review

## Conflict thực tế khi rebase

### 1. `src/app/globals.css`

Trạng thái: `Đã xử lý`

Hai nhánh sửa vào cùng file CSS gốc nhưng khác khu vực trách nhiệm:

- `zang3` thêm hệ class dùng chung cho account layout, catalog hero và responsive shell
- `tester` thêm style cho disclaimer marquee ở header

Quyết định xử lý:

- Giữ toàn bộ block layout/account/catalog của `zang3`
- Giữ thêm `.site-header-marquee`, `.site-header-marquee__track` và `@keyframes site-header-marquee` từ `tester`

Lý do:

- Không có xung đột nghiệp vụ hay UI cùng một tính năng
- Hai thay đổi bổ sung cho nhau và có thể cùng tồn tại an toàn

### 2. `src/components/organisms/ProductReviewModal/ProductReviewModal.tsx`

Trạng thái: `Đã xử lý`

Đây là conflict cùng một màn hình và cùng một hành vi UI của modal đánh giá sản phẩm.

#### Phía `zang3`

- Overlay: `z-[200]`
- Modal wrapper: `max-h-[90vh]`
- Từ breakpoint `sm`: `sm:max-h-[85vh]`

Ý nghĩa:

- Ưu tiên thêm không gian hiển thị trên mobile
- Vẫn giữ chiều cao gọn hơn trên màn hình từ `sm` trở lên

#### Phía `tester`

- Overlay: `z-[220]`
- Modal wrapper: `max-h-[85vh]` cho mọi kích thước

Ý nghĩa:

- Ưu tiên đẩy modal lên lớp cao hơn để chắc chắn không bị thành phần khác đè
- Giữ modal thấp hơn một chút ở mobile để an toàn theo chiều dọc

#### Điểm đụng nhau

- Cùng sửa `z-index` của overlay modal
- Cùng sửa giới hạn chiều cao modal

#### Quyết định xử lý

- Giữ hướng của nhánh `zang3`
- Cụ thể giữ:
  - overlay `z-[200]`
  - mobile `max-h-[90vh]`
  - từ `sm` trở lên `max-h-[85vh]`

Lý do:

- `z-[200]` đã cao hơn toàn bộ lớp nổi liên quan hiện tại như `SiteHeader` `z-[140]`, overlay mobile header `z-[180]` và các dropdown/panel trong header
- Không cần tăng thêm lên `z-[220]` nếu mục tiêu chỉ là tránh bị header đè
- `90vh` trên mobile tối ưu hơn cho nội dung review dài, upload media và textarea
- `85vh` từ `sm` trở lên vẫn giữ modal gọn và cân đối

## Các file trùng nhau nhưng không phát sinh conflict manual

- Những file còn lại trong commit `tester` đã được Git auto-merge trong quá trình rebase hiện tại
- Tại thời điểm ghi chú này, chưa phát hiện thêm conflict thủ công ngoài 2 file nêu trên

## Trạng thái sau khi chốt conflict

- Conflict `globals.css`: đã resolve
- Conflict `ProductReviewModal.tsx`: đã resolve theo `zang3`
- Bước tiếp theo: `git add` và `git rebase --continue`
