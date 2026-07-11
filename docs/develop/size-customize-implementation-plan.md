# Kế hoạch triển khai: Size Recommendation & Customize Validation Engine

Tài liệu này mô tả giải pháp kỹ thuật, cấu trúc hàm, regex và thuật toán so khớp để cập nhật hệ thống tính size đề xuất và validate customize theo đúng tài liệu [size-customize-validation-spec.md](file:///d:/xeoxo-web-dev/docs/develop/size-customize-validation-spec.md).

---

## 1. Chi tiết thuật toán & Quy tắc tính toán

Chúng ta xây dựng các hàm tính toán chính trong `src/features/size-recommendation/size-recommendation.ts` để thực hiện:

### 1.1. Cộng Ease Allowance (Độ cử động)
Tùy thuộc vào loại component (`AO`, `DAM`, `QUAN`, `VY`, `NAM`) và giới tính, ta sẽ cộng độ cử động vào số đo cơ thể nhập vào để ra số đo thành phẩm yêu cầu (`required_garment_measurement`):
- **Nữ – Áo/Đầm (`AO` / `DAM`)**:
  - `neck_required = neck_body + 2`
  - `shoulder_required = shoulder_body`
  - `chest_required = chest_body + 4`
  - `waist_required = waist_body + 4`
- **Nữ – Quần/Váy (`QUAN` / `VY`)**:
  - `waist_required = waist_body + 2`
  - `hip_required = hip_body + 4`
- **Nam (`NAM`)**:
  - `height_required = height_body`
  - `weight_required = weight_body`
  - `chest_required = chest_body + 6`
  - `waist_required = waist_body + 4`
  - `hip_required = hip_body + 4`
  - `shoulder_required = shoulder_body`
  - `neck_required = neck_body + 2`
  - `sleeve_required = sleeve_body`
  - `upper_arm_required = upper_arm_body + 4`

### 1.2. Thuật toán so khớp size gần nhất (Nearest Size & Tie-Breaking)
Với mỗi số đo yêu cầu (`required`), ta duyệt qua bảng `size_chart` tải từ database cho `component_type` tương ứng.
- **Tính khoảng cách**:
  - `distance = ABS(required_measurement - chart_measurement)`
- **Chọn size**:
  - Tìm size có `distance` nhỏ nhất.
  - **Quy tắc Tie-breaking (đồng khoảng cách)**: Nếu có 2 size có khoảng cách bằng nhau, hệ thống sẽ chọn size lớn hơn.
- **Ngoài khoảng bảng size**:
  - Nếu `required_measurement < min_value_in_chart`: Áp size nhỏ nhất của bảng, đánh dấu trường đó cần customize.
  - Nếu `required_measurement > max_value_in_chart`: Áp size lớn nhất của bảng, đánh dấu trường đó cần customize.

### 1.3. Phân loại kết quả và Xác định Base Size
- **STANDARD_SIZE**: Nếu tất cả các số đo quy đổi ra cùng 1 size tiêu chuẩn (ví dụ: đều ra `M`).
- **CUSTOM_SIZE**: Chỉ cần có ít nhất 1 số đo thuộc size khác.
- **Cách chọn `base_size` (Size nền)**:
  - Là size lớn nhất (`MAX`) của các trường chính:
    - Nữ – Áo/Đầm: `MAX(neck, shoulder, chest, waist)`
    - Nữ – Quần/Váy: `MAX(waist, hip)`
    - Nam: `MAX(chest, waist, hip, shoulder)`
  - Các trường phụ (Chiều cao, Cân nặng, Dài tay, Vòng bắp tay) **không** dùng để tính size nền nhưng vẫn dùng để phát hiện customize.

---

## 2. Chi tiết Validation Rules & Error Codes (Đã tinh chỉnh Min-Max thực tế)

Chúng ta viết bộ validator trong `src/validations/size-recommendation.schema.ts`:

### 2.1. Cấu trúc Regex & Chuẩn hóa nhập liệu
- **Trim**: Cắt khoảng trắng đầu/cuối.
- **Thay dấu thập phân**: Chuyển đổi `,` thành `.` tự động trước khi validate.
- **Regex kiểm tra số hợp lệ**: `^\d+(?:\.\d{1})?$` (Chỉ cho phép số nguyên hoặc số lẻ tối đa 1 chữ số thập phân).
- **Chặn đơn vị**: Nếu chuỗi kết thúc bằng `cm` hoặc `kg`, trả về lỗi `INVALID_UNIT`.

### 2.2. Khoảng nhập hỗ trợ thực tế (Giới hạn cứng & Cảnh báo)

**Nữ (Women)**:
* **Giới hạn cứng (Chặn nhập)**:
  * Chiều cao: `140 - 185` cm
  * Cân nặng: `40 - 100` kg
  * Vòng ngực: `72 - 120` cm
  * Vòng eo: `50 - 100` cm
  * Vòng mông: `78 - 125` cm
  * Ngang vai: `33 - 50` cm
  * Vòng cổ: `27 - 42` cm
  * Dài tay: `48 - 70` cm
  * Vòng bắp tay: `21 - 38` cm
* **Cảnh báo hiếm (Bật Popup xác nhận)**:
  * Chiều cao: `180 - 185` cm
  * Cân nặng: `95 - 100` kg
  * Vòng ngực: `115 - 120` cm
  * Vòng eo: `95 - 100` cm
  * Vòng mông: `120 - 125` cm
  * Ngang vai: `47 - 50` cm
  * Vòng cổ: `40 - 42` cm
  * Dài tay: `68 - 70` cm
  * Vòng bắp tay: `35 - 38` cm

**Nam (Men)**:
* **Giới hạn cứng (Chặn nhập)**:
  * Chiều cao: `150 - 200` cm
  * Cân nặng: `45 - 120` kg
  * Vòng ngực: `82 - 130` cm
  * Vòng eo: `60 - 110` cm
  * Vòng mông: `82 - 125` cm
  * Ngang vai: `38 - 60` cm
  * Vòng cổ: `33 - 50` cm
  * Dài tay: `53 - 75` cm
  * Vòng bắp tay: `26 - 48` cm
* **Cảnh báo hiếm (Bật Popup xác nhận)**:
  * Cân nặng: `115 - 120` kg
  * Vòng ngực: `125 - 130` cm
  * Vòng eo: `105 - 110` cm
  * Vòng mông: `120 - 125` cm
  * Ngang vai: `57 - 60` cm
  * Vòng cổ: `47 - 50` cm
  * Dài tay: `72 - 75` cm
  * Vòng bắp tay: `44 - 48` cm

### 2.3. Cảnh báo chênh lệch (`MEASUREMENT_WARNING`)
Trả về cảnh báo (không chặn) nếu phát hiện các trường hợp sau:
- Vòng cổ >= Vòng ngực.
- Vòng bắp tay >= Vòng ngực.
- Dài tay >= Chiều cao.
- Chiều cao < Cân nặng.

---

## 3. Các file chỉnh sửa
1. [size-recommendation.ts](file:///d:/xeoxo-web-dev/src/features/size-recommendation/size-recommendation.ts)
2. [size-recommendation.schema.ts](file:///d:/xeoxo-web-dev/src/validations/size-recommendation.schema.ts)
3. [SizeRecommendationModal.tsx](file:///d:/xeoxo-web-dev/src/components/organisms/SizeRecommendationModal/SizeRecommendationModal.tsx)
4. [CustomizeModal.tsx](file:///d:/xeoxo-web-dev/src/components/organisms/CustomizeModal/CustomizeModal.tsx)

---

## 4. Kế hoạch xác minh (Verification Plan)
- Chạy TypeScript compiler: `npx tsc --noEmit`.
