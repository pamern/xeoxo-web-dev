# Size Recommendation & Customize Validation Specification

## 1. Mục tiêu

Tài liệu này mô tả:

- Các trường số đo cần nhập theo từng loại sản phẩm.
- Quy tắc kiểm tra dữ liệu đầu vào.
- Công thức quy đổi số đo cơ thể sang số đo thành phẩm yêu cầu.
- Cách đối chiếu bảng size.
- Điều kiện trả size tiêu chuẩn hoặc sản phẩm customize.
- Các edge case và mã lỗi cần log.

> Lưu ý: Người dùng nhập **số đo cơ thể**, còn bảng size lưu **thông số thành phẩm**.

---

## 2. Nhóm form và trường bắt buộc

### 2.1. Nữ – Áo

Các trường bắt buộc:

- `neck_cm`: Vòng cổ
- `shoulder_cm`: Ngang vai
- `chest_cm`: Vòng ngực
- `waist_cm`: Vòng eo

### 2.2. Nữ – Quần

Các trường bắt buộc:

- `waist_cm`: Vòng eo
- `hip_cm`: Vòng mông

### 2.3. Nam

Giữ đủ 9 trường bắt buộc:

- `height_cm`: Chiều cao
- `weight_kg`: Cân nặng
- `chest_cm`: Vòng ngực
- `waist_cm`: Vòng eo
- `hip_cm`: Vòng mông
- `shoulder_cm`: Ngang vai
- `neck_cm`: Vòng cổ
- `sleeve_length_cm`: Dài tay
- `upper_arm_cm`: Vòng bắp tay

---

## 3. Quy tắc nhập chung

### 3.1. Định dạng hợp lệ

- Bắt buộc nhập đầy đủ các trường theo loại form.
- Chỉ chấp nhận số.
- Giá trị phải lớn hơn `0`.
- Chấp nhận số nguyên hoặc số thập phân tối đa 1 chữ số.
- Chấp nhận dấu `.` hoặc `,` làm dấu thập phân.
- Tự động trim khoảng trắng đầu và cuối.
- Không cho phép người dùng nhập kèm đơn vị như `cm`, `kg`.
- Không cho phép dạng số khoa học như `1e3`.
- Backend phải validate lại, không chỉ dựa vào frontend.

### 3.2. Chuẩn hóa dữ liệu

```text
" 80.5 "  -> 80.5
"80,5"    -> 80.5
"80"      -> 80.0
```

Không tự động sửa các giá trị như:

```text
"80 cm"
"abc"
"1e3"
"-50"
```

Các giá trị trên phải trả lỗi.

---

## 4. Khoảng nhập hỗ trợ

Các khoảng dưới đây được chia làm hai mức độ: 
1. **Khoảng giới hạn cứng (Block/Lỗi chặn tính size)**: Giá trị vượt ngoài khoảng này chắc chắn sai (trả lỗi chặn).
2. **Khoảng cảnh báo (Soft warning)**: Giá trị hiếm gặp nhưng vẫn có thể chấp nhận nếu người dùng xác nhận (trả cảnh báo, hiện Popup xác nhận).

### 4.1. Nữ (Women)

| Trường số đo | Giới hạn cứng (Min - Max) | Cảnh báo hiếm (Warning range) | Đơn vị |
|---|---|---|---|
| Chiều cao | 140 - 185 | > 180 và <= 185 | cm |
| Cân nặng | 40 - 100 | > 95 và <= 100 | kg |
| Vòng ngực | 72 - 120 | > 115 và <= 120 | cm |
| Vòng eo | 50 - 100 | > 95 và <= 100 | cm |
| Vòng mông | 78 - 125 | > 120 và <= 125 | cm |
| Ngang vai | 33 - 50 | > 47 và <= 50 | cm |
| Vòng cổ | 27 - 42 | > 40 và <= 42 | cm |
| Dài tay | 48 - 70 | > 68 và <= 70 | cm |
| Vòng bắp tay | 21 - 38 | > 35 và <= 38 | cm |

### 4.2. Nam (Men)

| Trường số đo | Giới hạn cứng (Min - Max) | Cảnh báo hiếm (Warning range) | Đơn vị |
|---|---|---|---|
| Chiều cao | 150 - 200 | Không áp dụng | cm |
| Cân nặng | 45 - 120 | > 115 và <= 120 | kg |
| Vòng ngực | 82 - 130 | > 125 và <= 130 | cm |
| Vòng eo | 60 - 110 | > 105 và <= 110 | cm |
| Vòng mông | 82 - 125 | > 120 và <= 125 | cm |
| Ngang vai | 38 - 60 | > 57 và <= 60 | cm |
| Vòng cổ | 33 - 50 | > 47 và <= 50 | cm |
| Dài tay | 53 - 75 | > 72 và <= 75 | cm |
| Vòng bắp tay | 26 - 48 | > 44 và <= 48 | cm |

Nếu giá trị ngoài khoảng giới hạn cứng:

```text
Giá trị có thể chưa chính xác. Vui lòng kiểm tra lại số đo và đơn vị.
```

---

## 5. Phân loại lỗi và cảnh báo

### 5.1. Lỗi chặn tính size

Các trường hợp sau phải chặn:

- Bỏ trống.
- Chỉ chứa khoảng trắng.
- Chứa chữ hoặc ký tự đặc biệt.
- Có kèm đơn vị.
- Giá trị bằng `0`.
- Giá trị âm.
- Quá 1 chữ số thập phân nếu hệ thống không tự làm tròn.
- Ngoài khoảng nhập hỗ trợ.
- Không có bảng size tương ứng với sản phẩm.

### 5.2. Cảnh báo không chặn

Các trường hợp sau chỉ cảnh báo:

- Vòng cổ lớn hơn hoặc bằng vòng ngực.
- Vòng bắp tay lớn hơn hoặc bằng vòng ngực.
- Dài tay lớn hơn hoặc bằng chiều cao.
- Các số đo có chênh lệch đáng kể.
- Chiều cao và cân nặng có dấu hiệu nhập nhầm đơn vị.

Thông báo chung:

```text
Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại để đảm bảo bạn đã nhập đúng số đo và đơn vị.
```

Hiển thị 2 lựa chọn:

```text
[Kiểm tra lại] [Xác nhận số đo đúng]
```

Nếu người dùng xác nhận đúng thì tiếp tục tính.

> Không dùng BMI hoặc tỷ lệ cơ thể để từ chối người dùng. Không yêu cầu eo phải nhỏ hơn ngực hoặc mông.

---

## 6. Công thức quy đổi số đo cơ thể

Công thức chung:

```text
required_garment_measurement
= body_measurement + ease_allowance
```

### 6.1. Nữ – Áo

```text
required_neck_cm     = neck_cm + 2
required_shoulder_cm = shoulder_cm
required_chest_cm    = chest_cm + 4
required_waist_cm    = waist_cm + 4
```

### 6.2. Nữ – Quần

```text
required_waist_cm = waist_cm + 2
required_hip_cm   = hip_cm + 4
```

### 6.3. Nam

```text
required_height_cm        = height_cm
required_weight_kg        = weight_kg
required_chest_cm         = chest_cm + 6
required_waist_cm         = waist_cm + 4
required_hip_cm           = hip_cm + 4
required_shoulder_cm      = shoulder_cm
required_neck_cm          = neck_cm + 2
required_sleeve_length_cm = sleeve_length_cm
required_upper_arm_cm     = upper_arm_cm + 4
```

---

## 7. Cách ánh xạ số đo sang size

Với mỗi số đo đã quy đổi:

```text
measurement_size
= size có khoảng cách nhỏ nhất với thông số trong bảng size
```

Công thức:

```text
distance = ABS(required_measurement - chart_measurement)
```

Chọn size có `distance` nhỏ nhất.

Nếu hai size có cùng khoảng cách:

```text
Chọn size lớn hơn.
```

Ví dụ:

```text
Size S: 84 cm
Size M: 88 cm
Giá trị cần: 86 cm
```

Khoảng cách bằng nhau nên chọn `M`.

### Giá trị ngoài bảng size

Nếu nhỏ hơn size nhỏ nhất:

```text
measurement_size = size nhỏ nhất
```

Nếu lớn hơn size lớn nhất:

```text
measurement_size = size lớn nhất
```

Trong cả hai trường hợp, đánh dấu trường đó cần customize.

---

## 8. Điều kiện trả kết quả

### 8.1. Size tiêu chuẩn

Nếu tất cả số đo cùng thuộc một size:

```text
COUNT(DISTINCT measurement_size) = 1
```

Kết quả:

```text
result_type = STANDARD_SIZE
requires_customization = false
recommended_size = size chung
```

Ví dụ:

```text
M, M, M, M
-> STANDARD_SIZE M
```

### 8.2. Customize

Chỉ cần có ít nhất một số đo thuộc size khác:

```text
COUNT(DISTINCT measurement_size) > 1
```

Kết quả:

```text
result_type = CUSTOM_SIZE
requires_customization = true
recommended_size = null
```

Ví dụ:

```text
M, M, L, M
-> CUSTOM_SIZE
```

Không cần xét lệch 1 size, 2 size hay nhiều size.

---

## 9. Cách chọn base size

### 9.1. Nữ – Áo

```text
base_size = size lớn nhất trong:
neck, shoulder, chest, waist
```

### 9.2. Nữ – Quần

```text
base_size = MAX(size_waist, size_hip)
```

### 9.3. Nam

```text
base_size = size lớn nhất trong:
chest, waist, hip, shoulder
```

Các trường sau vẫn dùng để xác định có customize hay không nhưng không tự đẩy base size:

- Chiều cao
- Cân nặng
- Vòng cổ
- Dài tay
- Vòng bắp tay

Ví dụ:

```text
Thân áo = M
Dài tay = XL

-> base_size = M
-> customize chiều dài tay
```

---

## 10. Validation order

Thực hiện đúng thứ tự:

```text
1. Kiểm tra trường bắt buộc
2. Kiểm tra kiểu dữ liệu
3. Chuẩn hóa số thập phân
4. Kiểm tra giá trị > 0
5. Kiểm tra min-max
6. Kiểm tra cảnh báo chênh lệch
7. Cộng ease allowance
8. Đối chiếu bảng size
9. Xác định STANDARD_SIZE hoặc CUSTOM_SIZE
10. Ghi log
```

Chỉ trả lỗi đầu tiên theo từng field để tránh hiển thị nhiều lỗi trùng nhau.

---

## 11. Error codes

| Error code | Điều kiện | Message |
|---|---|---|
| `REQUIRED` | Bỏ trống | `Vui lòng nhập [tên trường].` |
| `INVALID_TYPE` | Có chữ hoặc ký tự | `[Tên trường] chỉ được nhập bằng số.` |
| `INVALID_UNIT` | Có `cm`, `kg` | `Vui lòng chỉ nhập giá trị số, không nhập đơn vị.` |
| `NON_POSITIVE` | Giá trị ≤ 0 | `[Tên trường] phải lớn hơn 0.` |
| `TOO_MANY_DECIMALS` | Quá 1 số lẻ | `[Tên trường] chỉ được có tối đa 1 chữ số thập phân.` |
| `OUT_OF_RANGE` | Ngoài min-max | `Giá trị có thể chưa chính xác. Vui lòng kiểm tra lại số đo và đơn vị.` |
| `MEASUREMENT_WARNING` | Chênh lệch đáng kể | `Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại.` |
| `NO_SIZE_CHART` | Thiếu bảng size | `Hiện chưa có bảng size cho sản phẩm này.` |
| `SIZE_CALCULATION_FAILED` | Lỗi hệ thống | `Không thể tính size lúc này. Vui lòng thử lại.` |

---

## 12. Response mẫu

### 12.1. Standard size

```json
{
  "result_type": "STANDARD_SIZE",
  "recommended_size": "M",
  "base_size": "M",
  "requires_customization": false,
  "measurement_sizes": {
    "neck": "M",
    "shoulder": "M",
    "chest": "M",
    "waist": "M"
  },
  "message": "Các số đo của bạn phù hợp với size M."
}
```

### 12.2. Custom size

```json
{
  "result_type": "CUSTOM_SIZE",
  "recommended_size": null,
  "base_size": "L",
  "requires_customization": true,
  "measurement_sizes": {
    "neck": "M",
    "shoulder": "M",
    "chest": "L",
    "waist": "M"
  },
  "customized_fields": [
    "neck",
    "shoulder",
    "waist"
  ],
  "message": "Các số đo thuộc nhiều size khác nhau. Sản phẩm cần customize từ size nền L."
}
```

### 12.3. Validation error

```json
{
  "result_type": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "chest_cm",
      "code": "OUT_OF_RANGE",
      "message": "Giá trị có thể chưa chính xác. Vui lòng kiểm tra lại số đo và đơn vị."
    }
  ]
}
```

### 12.4. Warning confirmation

```json
{
  "result_type": "CONFIRMATION_REQUIRED",
  "warnings": [
    {
      "code": "MEASUREMENT_WARNING",
      "fields": ["neck_cm", "chest_cm"],
      "message": "Một số số đo có sự chênh lệch đáng kể. Vui lòng kiểm tra lại."
    }
  ],
  "can_continue": true
}
```

---

## 13. Logging

### 13.1. Validation failed

```json
{
  "event": "SIZE_RECOMMENDATION_FAILED",
  "product_id": "PL001",
  "form_type": "WOMEN_TOP",
  "error_code": "OUT_OF_RANGE",
  "error_field": "chest_cm",
  "timestamp": "2026-07-11T16:30:00+07:00"
}
```

### 13.2. Calculation success

```json
{
  "event": "SIZE_RECOMMENDATION_SUCCESS",
  "product_id": "PL001",
  "form_type": "WOMEN_TOP",
  "measurement_sizes": {
    "neck": "M",
    "shoulder": "M",
    "chest": "L",
    "waist": "M"
  },
  "result_type": "CUSTOM_SIZE",
  "base_size": "L",
  "timestamp": "2026-07-11T16:30:00+07:00"
}
```

Không log các dữ liệu không cần thiết như:

- Họ tên
- Email
- Số điện thoại

---

## 14. Pseudocode

```text
function recommendSize(formType, bodyMeasurements, sizeChart):
    validateRequiredFields(formType, bodyMeasurements)
    normalizeDecimalValues(bodyMeasurements)
    validateNumericValues(bodyMeasurements)
    validatePositiveValues(bodyMeasurements)
    validateSupportedRanges(formType, bodyMeasurements)

    warnings = detectMeasurementWarnings(formType, bodyMeasurements)

    if warnings exist and user has not confirmed:
        return CONFIRMATION_REQUIRED

    requiredMeasurements =
        applyEaseAllowance(formType, bodyMeasurements)

    measurementSizes = {}

    for each requiredMeasurement:
        measurementSizes[field] =
            findNearestSize(requiredMeasurement, sizeChart)

    if countDistinct(measurementSizes.values) == 1:
        return STANDARD_SIZE

    baseSize = determineBaseSize(formType, measurementSizes)

    return CUSTOM_SIZE
```

---

## 15. Business rule cuối cùng

```text
Sau khi kiểm tra dữ liệu, hệ thống cộng độ rộng mặc vào số đo cơ thể và đối chiếu từng số đo với bảng size thành phẩm.

Nếu tất cả số đo thuộc cùng một size, hệ thống trả size tiêu chuẩn.

Nếu có ít nhất một số đo thuộc size khác, hệ thống trả CUSTOM_SIZE
Các số đo có chênh lệch đáng kể chỉ tạo cảnh báo xác nhận, không bị từ chối vì sản phẩm hỗ trợ customize.
```
