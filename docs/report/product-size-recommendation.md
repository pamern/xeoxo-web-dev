# Product Size Recommendation, Customize & Measurement Appointment Report

## 1. Mục tiêu

Tối giản khu vực chọn size trên trang chi tiết sản phẩm và gom toàn bộ hành trình tư vấn size vào một modal thống nhất:

1. Người dùng xem ảnh hướng dẫn cách đo.
2. Người dùng nhập số đo để nhận size đề xuất.
3. Hệ thống phân biệt size còn hàng, hết hàng và sản phẩm không cung cấp size phù hợp.
4. Người dùng có thể mở flow Customize hoặc đặt lịch may đo miễn phí ngay trên trang chi tiết.

Chức năng gợi ý size chạy hoàn toàn ở client, không tạo API hoặc thay đổi database. Dữ liệu bảng size được khai báo tập trung để phần hiển thị và thuật toán luôn đồng bộ.

## 2. Thay đổi trên trang chi tiết sản phẩm

- Đổi link `Bảng kích thước` thành `Hướng dẫn cách đo` vì asset đang hiển thị là hình hướng dẫn đo cơ thể.
- Giữ link `Hướng dẫn chọn size`.
- Bỏ nút `Chọn size nhanh`.
- Bỏ nút `Đặt lịch may đo` bên ngoài.
- CTA đặt lịch may đo được chuyển vào modal hướng dẫn chọn size.

## 3. Cấu trúc modal

Modal dùng cùng ngôn ngữ thiết kế với Xéo Xọ: nền trắng thuần, chữ đen, đường viền xám mảnh, góc bo và icon đóng màu đen. Không dùng nền kem và không dùng shadow. CTA thao tác dùng nền đen; thanh hành động cuối modal dùng nền hoa Xéo Xọ.

Modal gồm:

1. Header `Hướng dẫn chọn size` và nút đóng.
2. Form số đo.
3. Kết quả đề xuất.
4. Bảng thông số sản phẩm theo giới tính.
5. Lưu ý và CTA đặt lịch may đo.

Tiêu đề phụ và nội dung hướng dẫn phải bám theo giới tính sản phẩm. Sản phẩm Nam hiển thị `Tư vấn size Nam` và bảng Nam; sản phẩm Nữ hiển thị `Tư vấn size Nữ` và bảng Nữ. Không hiển thị văn bản Nữ cho sản phẩm Nam hoặc ngược lại. `tre-em` chưa có bảng riêng nên không nằm trong phạm vi tính toán của phiên bản này.

Giới tính sản phẩm được chuẩn hóa từ `CATEGORY.department` của danh mục chính (`MEN → nam`, `WOMEN → nu`). Loại danh mục con như áo dài, váy, áo hoặc đồ thường không được dùng để quyết định form.

Modal có overlay tối, khóa scroll trang, đóng bằng nút close, click overlay hoặc phím Escape. Nội dung dài được scroll bên trong modal; header luôn dễ tiếp cận.

## 4. Trường dữ liệu

| Trường | Hiển thị | Đơn vị | Quy tắc nhập |
|---|---|---:|---|
| Chiều cao | Nam | cm | Bắt buộc, số dương |
| Cân nặng | Nam | kg | Bắt buộc, số dương |
| Vòng ngực | Nam và Nữ | cm | Bắt buộc, số dương |
| Vòng eo | Nam và Nữ | cm | Bắt buộc, số dương |
| Vòng mông | Nam và Nữ | cm | Bắt buộc, số dương |
| Ngang vai | Nam và Nữ | cm | Bắt buộc, số dương |
| Vòng cổ | Nam và Nữ | cm | Bắt buộc, số dương |
| Dài tay | Nam | cm | Bắt buộc, số dương |
| Vòng bắp tay | Nam | cm | Bắt buộc, số dương |

Form tự điều chỉnh theo bảng size của sản phẩm:

- Sản phẩm Nam: hiển thị đúng 9 trường gồm chiều cao, cân nặng, vòng ngực, vòng eo, vòng mông, ngang vai, vòng cổ, dài tay và vòng bắp tay. Tất cả 9 trường đều bắt buộc.
- Sản phẩm Nữ: chỉ hiển thị đúng 5 trường gồm vòng cổ, ngang vai, vòng ngực, vòng eo và vòng mông. Tất cả 5 trường đều bắt buộc.

Không có trường tùy chọn trong form hiện tại. Mọi field đang hiển thị đều phải có giá trị hợp lệ trước khi chạy thuật toán.

Ở trạng thái ban đầu, UI chỉ hiển thị label, dấu `*`, placeholder và đơn vị. Không hiển thị min–max và không chặn số đo nằm ngoài bảng size. Người dùng có số đo ngoài XS–XL/S–XL vẫn được phép tính để hệ thống xác định rằng không có size tiêu chuẩn phù hợp và chuyển sang gợi ý đặt lịch may đo.

## 5. Validation và trạng thái lỗi

- Không báo lỗi và không hiện min–max trước khi người dùng tương tác.
- Khi người dùng đã nhập một giá trị rồi blur, validate field đó.
- Khi nhấn `Tính size phù hợp`, validate toàn bộ form và báo thiếu đúng các trường bắt buộc của bảng Nam/Nữ hiện tại.
- Trường trống: `Vui lòng nhập {tên trường}`.
- Giá trị chứa chữ, ký tự không hợp lệ, bằng 0 hoặc âm: `Vui lòng nhập số hợp lệ`.
- Input lỗi chuyển label, border và message sang màu đỏ.
- Nếu còn bất kỳ lỗi nào, không chạy thuật toán.
- Khi người dùng sửa giá trị, lỗi field được tính lại và tự biến mất ngay khi hợp lệ.

## 5.1. Quy chuẩn CTA

Nút `Tính size phù hợp` dùng nền đen, chữ trắng. Thanh CTA cuối popup hướng dẫn chọn size và thanh lưu biểu mẫu trong popup đặt lịch dùng chung nền hoa Xéo Xọ, chữ trắng và không có shadow. Kết quả gợi ý không có nút `Chọn size`.

## 6. Logic đề xuất size

1. Chọn bảng theo giới tính của sản phẩm: `nam` dùng bảng Nam, `nu` dùng bảng Nữ.
2. Với bảng Nam, chiều cao và cân nặng tạo điểm nền; với bảng Nữ, ngực, eo và mông là các số đo có trọng số cao nhất.
3. Các số đo bổ sung được đối chiếu với thông số từng size.
4. Ngực, eo, mông có trọng số cao hơn vai, cổ, dài tay và bắp tay.
5. Size có tổng độ lệch chuẩn hóa thấp nhất là size đề xuất nếu độ lệch còn trong ngưỡng phù hợp.
6. Nếu hai size có điểm gần nhau, ưu tiên size lớn hơn để giảm nguy cơ mặc chật.
7. Vì toàn bộ field đang hiển thị đều bắt buộc, thuật toán chỉ chạy sau khi có đủ bộ số đo của đúng giới tính.
8. Nếu số đo nằm quá xa toàn bộ bảng size, size đề xuất không tồn tại hoặc không khả dụng trong danh sách variant hiện tại, hiển thị trạng thái tương ứng để người dùng cân nhắc Customize hoặc đặt lịch may đo.

Bảng Nữ gốc không có chiều cao/cân nặng. Phiên bản UI dùng dải tham khảo riêng cho XS–XL để tạo đề xuất ban đầu; ngực, eo, mông và các số đo từ bảng gốc vẫn là nguồn quyết định ưu tiên khi người dùng cung cấp.

## 7. Kết quả

### Có size phù hợp và khả dụng

- Hiện `Size phù hợp: {size}`.
- Cho biết kết quả tham khảo hay độ phù hợp cao.
- Highlight dòng tương ứng trong bảng.
- Chỉ thông báo size phù hợp và trạng thái còn hàng; không hiển thị nút chọn size trong kết quả.

### Size không khả dụng hoặc ngoài bảng

- Nếu size được gợi ý có trong sản phẩm nhưng hết hàng: hiển thị riêng thông báo `Size {size} hiện đang hết hàng`, không đánh đồng với trường hợp sản phẩm không có size.
- Nếu sản phẩm không cung cấp size được gợi ý hoặc số đo nằm ngoài bảng: hiển thị câu `Sản phẩm chưa có size phù hợp với số đo của bạn. Bạn có thể đặt sản phẩm được Customize theo số đo riêng tại đây.`
- Chỉ cụm `tại đây` được gạch chân và là button tương tác. Button mở cùng `CustomizeModal` với nút `Custom` bên ngoài.

### CTA may đo chủ động

Cuối modal luôn có đúng một CTA `Đặt lịch may đo` với nội dung dành cho người muốn chắc chắn hơn về số đo và độ vừa vặn. CTA này hiện sẵn từ đầu, không phụ thuộc người dùng đã tính size hay chưa. Khi click, popup hướng dẫn chọn size đóng trước rồi mới mở đúng `AppointmentModal`/`AppointmentForm` hiện có. Hai popup không được chồng lên nhau; đóng appointment popup sẽ quay về trang chi tiết sản phẩm. Hai modal dùng cùng max-width, bo góc, padding, font và cỡ tiêu đề.

Popup đặt lịch hiển thị badge `Miễn phí may đo` ngay dưới phần mô tả để người dùng nhận biết rõ quyền lợi trước khi đặt lịch.

Thứ tự input phải bám đúng thứ tự cột số đo từ trái sang phải trong bảng hiện tại:

- Nam: Chiều cao → Cân nặng → Ngực → Eo → Mông → Vai → Cổ → Dài tay → Bắp tay.
- Nữ: Cổ → Vai → Ngực → Eo → Mông.

## 7.1. Nội dung hướng dẫn và link cách đo

Không lặp hai đoạn cùng ý ở header và cạnh nút tính. Chỉ dùng một nội dung ngắn:

`Điền càng đầy đủ số đo, kết quả gợi ý càng chính xác.`

Đoạn hướng dẫn này nằm ngay dưới tiêu đề `Hướng dẫn chọn size`, không đặt cạnh nút tính. Popup không chứa link hướng dẫn cách đo; link `Hướng dẫn cách đo` bên ngoài trang chi tiết vẫn mở `SizeGuideModal`.

## 8. Bảng thông số

Bảng được render bằng HTML thay vì ảnh để responsive, có thể highlight size và dùng chung dữ liệu với thuật toán.

- Nam: S–XL; chiều cao, cân nặng, ngực, eo, mông, vai, cổ, dài tay, bắp tay.
- Nữ: XS–XL; cổ, vai, ngực, eo, mông, dài tay lửng, dài tay dài, dài áo, dài quần.

Trên mobile bảng cho phép cuộn ngang; modal vẫn giữ header và CTA rõ ràng.

## 9. Accessibility

- Modal dùng `role="dialog"`, `aria-modal="true"` và nhãn rõ nghĩa.
- Input có label, unit, `aria-invalid` và liên kết tới error message.
- Kết quả dùng vùng `aria-live="polite"`.
- Nút đóng có `aria-label`.
- Hỗ trợ phím Escape.

## 10. Phạm vi kỹ thuật

- UI: `SizeRecommendationModal`, `VariantSelector`, `ProductDetail`.
- Validation: schema/rules riêng trong `src/validations`.
- Logic tính size và dữ liệu bảng: module riêng trong `src/features/size-recommendation`.
- Không gọi Supabase từ component.
- Không tạo endpoint mới.
- CTA may đo tái sử dụng `AppointmentModal` và `AppointmentForm` hiện có dưới dạng popup trên trang chi tiết.

## 11. Popup Customize

Nút `Custom` tại bộ chọn size mở một modal riêng, cùng max-width, header, typography và nền hoa CTA với hai modal hướng dẫn size/đặt lịch.

- Form số đo dùng đúng danh sách field và thứ tự Nam/Nữ của hướng dẫn chọn size.
- Tất cả số đo hiển thị đều bắt buộc và dùng chung validation số dương.
- Có ghi chú tự do tối đa 500 ký tự và bộ đếm ký tự.
- Hiển thị phụ phí Customize bằng 20% giá sản phẩm và giá dự kiến sau phụ phí.
- Chính sách: sản phẩm theo số đo cá nhân không áp dụng đổi trả.
- Thời gian may dự kiến khoảng 15 ngày làm việc, không tính thứ Bảy, Chủ nhật, ngày lễ và thời gian giao hàng.
- Phiên bản hiện tại chỉ hoàn thiện UI và validation client; submit chưa gọi API customization.

## 12. Popup hướng dẫn cách đo

- `SizeGuideModal` chọn ảnh theo giới tính sản phẩm:
  - `nam` → `/images/size_guide_male.png`.
  - `nu` → `/images/size_guide_female.png`.
- Ảnh co theo chiều cao viewport để luôn xem trọn nội dung, không cần scroll bên trong ảnh.
- Modal có overlay tối, khóa scroll body, đóng bằng `close-black.svg`, click overlay hoặc phím Escape.
- Hai icon Figma được lưu tại `public/icons/close-black.svg` và `public/icons/close-white.svg`.

## 13. Popup đặt lịch may đo

### 13.1. Interaction

- CTA `Đặt lịch may đo` luôn hiển thị cuối popup hướng dẫn chọn size.
- Khi mở appointment, popup hướng dẫn size đóng trước; hai popup không chồng nhau.
- Đóng appointment trở về trang chi tiết sản phẩm.
- Popup tái sử dụng `AppointmentModal` và `AppointmentForm`, đồng bộ max-width `1240px`, header, font, divider, close icon và nền hoa CTA.
- Badge `Miễn phí may đo` hiển thị ngay dưới mô tả.

### 13.2. Trường dữ liệu và validation

| Trường | Quy tắc |
|---|---|
| Họ và tên | Bắt buộc, tối thiểu 2 ký tự |
| Số điện thoại | Bắt buộc, định dạng Việt Nam bắt đầu bằng `0` hoặc `+84` |
| Email | Không bắt buộc; nếu nhập phải đúng định dạng email |
| Giới tính | Chọn Nam/Nữ |
| Chi nhánh | Bắt buộc |
| Ngày hẹn | Date picker, bắt buộc, không chọn ngày quá khứ |
| Giờ hẹn | Bắt buộc |
| Ghi chú | Không bắt buộc, tối đa 500 ký tự |

- Form dùng `noValidate`, không hiện tooltip validation mặc định của trình duyệt.
- Lỗi hiển thị dưới field; border và text lỗi chuyển đỏ.
- Placeholder được cung cấp cho text field và textarea.
- Border mặc định dùng `black/30`, không dùng đường đen đặc.
- Date picker cho phép chọn ngày trực tiếp thay vì danh sách 14 ngày cố định.
- Submit hiện chỉ ghi nhận trạng thái UI; chưa gọi `POST /api/v1/measurement-appointments`.

## 14. Logic xác định giới tính sản phẩm

- `catalog.product_line` không có cột gender.
- API `/api/products/[slug]` đọc danh mục chính từ `catalog.line_category`, sau đó đọc `catalog.category.department`.
- Chuẩn hóa `MEN → nam`, `WOMEN → nu`; mapper cũng chấp nhận `nam/men/male`.
- Loại sản phẩm như áo dài, váy hay đồ thường không quyết định form.
- Query gender là enrichment không bắt buộc: nếu query category lỗi, endpoint sản phẩm vẫn trả dữ liệu thay vì lỗi 500.

## 15. Chi tiết thuật toán

Với mỗi size, thuật toán tính điểm lệch trên từng số đo đã nhập:

1. Nếu số đo nằm trong khoảng của size, độ lệch bằng `0`.
2. Nếu nhỏ hơn min hoặc lớn hơn max, lấy khoảng cách tới biên gần nhất.
3. Chuẩn hóa khoảng cách theo độ rộng khoảng đo, tối thiểu `5` với cân nặng và `4` với số đo khác.
4. Nhân trọng số: ngực/eo/mông `2`, cân nặng `1.2`, vai `1.2`, chiều cao `1`, cổ/dài tay/bắp tay `0.8`.
5. Chọn size có điểm trung bình thấp nhất; nếu bằng điểm, ưu tiên size lớn hơn.
6. Nếu điểm tốt nhất lớn hơn `1.75`, kết luận không có size tiêu chuẩn phù hợp.

Không dùng min/max để chặn nhập. Giá trị ngoài bảng vẫn được tính nhằm đưa người dùng tới Customize khi cần.

## 16. Trạng thái kết quả và tồn kho

| Trạng thái | UI |
|---|---|
| Có size và variant còn hàng | Thông báo size phù hợp/còn hàng, highlight dòng bảng |
| Có size nhưng variant hết hàng | Thông báo riêng `Size {size} hiện đang hết hàng` |
| Sản phẩm không cung cấp size hoặc số đo ngoài bảng | Thông báo không có size và link `tại đây` mở Customize |

Không có nút chọn size trong kết quả; popup chỉ tư vấn và thông báo trạng thái.

## 17. File triển khai

- `src/components/organisms/SizeGuideModal/SizeGuideModal.tsx`
- `src/components/organisms/SizeRecommendationModal/SizeRecommendationModal.tsx`
- `src/components/organisms/CustomizeModal/CustomizeModal.tsx`
- `src/components/organisms/AppointmentModal/AppointmentModal.tsx`
- `src/components/organisms/AppointmentForm/AppointmentForm.tsx`
- `src/components/organisms/ProductDetail/ProductDetail.tsx`
- `src/components/organisms/VariantSelector/VariantSelector.tsx`
- `src/features/size-recommendation/size-recommendation.ts`
- `src/validations/size-recommendation.schema.ts`
- `src/data/collections.api.ts`
- `src/app/api/products/[slug]/route.ts`

## 18. Phạm vi chưa triển khai

- Customize submit chưa gọi API và chưa tạo `CUSTOMIZATION_REQUEST`.
- Appointment submit chưa gọi `POST /api/v1/measurement-appointments`.
- Chưa persist hồ sơ số đo vào database.
- Chưa có bảng size riêng cho `tre-em`.
- Cần chạy typecheck/build khi môi trường Node khả dụng.
