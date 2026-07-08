# Bảng tra cứu Personal Color & Phân loại màu sắc (XÉO XỌ)

Tài liệu này tổng hợp thông tin ánh xạ phân loại Personal Color cho 37 màu sắc thực tế trong hệ thống dữ liệu của XÉO XỌ (bảng `catalog.color`).

---

## 1. Tóm tắt các nhóm mùa (Season)

| Mùa (Season) | Mô tả bảng màu |
| :--- | :--- |
| **SPRING** (Mùa Xuân) | Rực rỡ và ấm áp, thiên về sắc vàng trong trẻo — tôn làn da rạng rỡ, tràn đầy sức sống. |
| **SUMMER** (Mùa Hạ) | Dịu nhẹ và mát mẻ, thiên về tông pastel loang — tôn vẻ đẹp thanh thoát, nhẹ nhàng, tinh tế. |
| **AUTUMN** (Mùa Thu) | Ấm áp và trầm lắng, thiên về sắc nâu đất, cam cháy — tôn vẻ đẹp sang trọng, cổ điển. |
| **WINTER** (Mùa Đông) | Sắc sảo và tương phản cao, thiên về tông lạnh, đậm — tôn vẻ đẹp cá tính, cuốn hút. |

---

## 2. Bảng phân loại chi tiết 37 màu sắc

Dưới đây là chi tiết phân loại cho từng mã màu (`color_id`):

| ID | Tên màu | Mùa phù hợp (Season) | Nhiệt độ (Temperature) | Độ sáng (Value) | Độ rực (Chroma) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Be | **AUTUMN** | WARM | LIGHT | MUTED |
| 2 | Cam | **SPRING** | WARM | LIGHT | CLEAR |
| 3 | Hồng | **SUMMER** | COOL | LIGHT | SOFT |
| 4 | Hồng cam | **SPRING** | WARM | LIGHT | CLEAR |
| 5 | Hồng nhạt | **SUMMER** | COOL | LIGHT | SOFT |
| 6 | Hồng phấn | **SUMMER** | COOL | LIGHT | SOFT |
| 7 | Hồng phấn nhạt | **SUMMER** | COOL | LIGHT | SOFT |
| 8 | Hồng sen | **WINTER** | COOL | DEEP | CLEAR |
| 9 | Hồng tím | **WINTER** | COOL | DEEP | CLEAR |
| 10 | Hồng đậm | **WINTER** | COOL | DEEP | CLEAR |
| 11 | Hồng đỗ | **WINTER** | COOL | DEEP | MUTED |
| 12 | Kem | **SPRING** | WARM | LIGHT | SOFT |
| 13 | Trắng | **WINTER** | COOL | LIGHT | CLEAR |
| 14 | Trắng kem | **SPRING** | WARM | LIGHT | SOFT |
| 15 | Trắng xám | **SUMMER** | COOL | LIGHT | SOFT |
| 16 | Tím | **WINTER** | COOL | DEEP | CLEAR |
| 17 | Tím nhạt | **SUMMER** | COOL | LIGHT | SOFT |
| 18 | Vàng | **SPRING** | WARM | LIGHT | CLEAR |
| 19 | Vàng kem | **SPRING** | WARM | LIGHT | SOFT |
| 20 | Vàng nhạt | **SPRING** | WARM | LIGHT | CLEAR |
| 21 | Vàng nâu | **AUTUMN** | WARM | DEEP | MUTED |
| 22 | Xanh | **WINTER** | COOL | DEEP | CLEAR |
| 23 | Xanh biển | **WINTER** | COOL | DEEP | CLEAR |
| 24 | Xanh biển nhạt | **SUMMER** | COOL | LIGHT | SOFT |
| 25 | Xanh coban | **WINTER** | COOL | DEEP | CLEAR |
| 26 | Xanh cốm | **SPRING** | WARM | LIGHT | SOFT |
| 27 | Xanh lam | **WINTER** | COOL | DEEP | CLEAR |
| 28 | Xanh lá | **AUTUMN** | WARM | DEEP | MUTED |
| 29 | Xanh lục | **WINTER** | COOL | DEEP | CLEAR |
| 30 | Xanh ngọc | **SUMMER** | COOL | LIGHT | SOFT |
| 31 | Xanh oliu | **AUTUMN** | WARM | DEEP | MUTED |
| 32 | Xanh xám | **SUMMER** | COOL | LIGHT | SOFT |
| 33 | Xám bạc | **SUMMER** | COOL | LIGHT | SOFT |
| 34 | Đen | **WINTER** | COOL | DEEP | CLEAR |
| 35 | Đỏ | **WINTER** | COOL | DEEP | CLEAR |
| 36 | Đỏ mận | **WINTER** | COOL | DEEP | CLEAR |
| 37 | Đỏ đậm | **AUTUMN** | WARM | DEEP | MUTED |

---

## 3. Bản đồ thuộc tính màu

- **Temperature (Nhiệt độ)**: `WARM` (Ấm), `COOL` (Lạnh)
- **Value (Độ sáng)**: `LIGHT` (Sáng), `DEEP` (Đậm)
- **Chroma (Độ rực)**: `CLEAR` (Trong trẻo/Rực rỡ), `SOFT` (Dịu nhẹ), `MUTED` (Trầm/Ấm)
