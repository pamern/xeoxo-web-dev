# Đặc tả Validation thông tin người nhận hàng & Checkout

Tài liệu này quy định chi tiết các quy tắc xác thực (validation), mã lỗi (error codes) và thông báo tương ứng cho các trường dữ liệu tại trang thanh toán (Checkout).

---

## 1. Họ và tên người nhận

### 1.1. Điều kiện nhập
- **Bắt buộc nhập**.
- Tự động xóa khoảng trắng ở đầu và cuối (Trim).
- **Cho phép**:
  - Chữ tiếng Việt có dấu và không dấu.
  - Khoảng trắng giữa các từ.
  - Dấu gạch nối `-`.
  - Dấu nháy đơn `'`.
- **Độ dài**: Tối thiểu `2` ký tự, tối đa `100` ký tự.
- **Ràng buộc ký tự**:
  - Phải chứa ít nhất 2 chữ cái.
  - Không bắt buộc nhập đầy đủ họ và tên (Ví dụ: "An", "Vy", "Bo" vẫn hợp lệ).
  - Không cho phép trường chỉ gồm số hoặc toàn ký tự đặc biệt.
  - Không chứa chữ số.

### 1.2. Ví dụ thực tế
| Dữ liệu nhập | Kết quả | Ghi chú |
|---|---|---|
| `Nguyễn Văn A` | Hợp lệ | |
| `Nguyen Van A` | Hợp lệ | |
| `An` | Hợp lệ | Tên ngắn |
| `Anne-Marie` | Hợp lệ | Chứa dấu gạch nối |
| `O'Connor` | Hợp lệ | Chứa dấu nháy đơn |
| ` Nguyễn Văn A ` | Hợp lệ | Tự xóa khoảng trắng rìa |
| `A` | Không hợp lệ | Dưới 2 ký tự |
| `123456` | Không hợp lệ | Chỉ chứa số |
| `@#$%` | Không hợp lệ | Chỉ chứa ký tự đặc biệt |
| `Nguyễn 123` | Không hợp lệ | Chứa chữ số |
| `   ` (chỉ có khoảng trắng) | Không hợp lệ | Xem như bỏ trống |

### 1.3. Thông báo lỗi
| Trường hợp | Error Code | Thông báo hiển thị |
|---|---|---|
| Bỏ trống | `REQUIRED` | “Vui lòng nhập họ và tên người nhận.” |
| Dưới 2 ký tự | `TOO_SHORT` | “Họ và tên người nhận phải có ít nhất 2 ký tự.” |
| Trên 100 ký tự | `TOO_LONG` | “Họ và tên người nhận không được vượt quá 100 ký tự.” |
| Chỉ gồm số/ký tự đặc biệt | `INVALID_NAME` | “Họ và tên người nhận phải chứa chữ cái.” |
| Có số hoặc ký tự không hỗ trợ | `INVALID_FORMAT` | “Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu gạch nối hoặc dấu nháy đơn.” |

---

## 2. Số điện thoại người nhận

Chỉ hỗ trợ số điện thoại di động Việt Nam (10 chữ số), không hỗ trợ định dạng số quốc tế.

### 2.1. Điều kiện nhập
- **Bắt buộc nhập**.
- Chỉ gồm các chữ số từ `0–9`.
- **Đúng 10 chữ số**.
- Bắt đầu bằng số `0`.
- Ba số đầu phải thuộc đầu số di động Việt Nam đang hoạt động:
  - Viettel: `032 - 039`
  - MobiFone: `070 - 079`
  - VinaPhone: `081 - 089`
  - Vietnamobile: `056, 058, 052`
  - Gmobile / Itelecom / Wintel: `059, 087, 096 - 099` (hoặc bao quát qua regex: `090 - 099`).
- **Regex kiểm tra**: `^(03[2-9]|05[2689]|07[0-9]|08[1-9]|09[0-9])[0-9]{7}$`
- **Chặn dữ liệu giả lập**: Chặn các số điện thoại có toàn bộ chữ số trùng lặp nhau (ví dụ: `0000000000`, `1111111111`,..., `9999999999`).
- *Lưu ý*: Không kiểm tra trùng lặp trên DB (một số điện thoại có thể đặt nhiều đơn hàng).

### 2.2. Ví dụ thực tế
| Dữ liệu nhập | Kết quả | Ghi chú |
|---|---|---|
| `0912345678` | Hợp lệ | |
| `0383389276` | Hợp lệ | |
| `0311111111` | Không hợp lệ | Đầu số `031` không hỗ trợ |
| `0123456789` | Không hợp lệ | Đầu số cũ 11 số cũ không hỗ trợ |
| `0000000000` | Không hợp lệ | Số giả lập |
| `091234567` | Không hợp lệ | Chỉ có 9 chữ số |
| `09123456789` | Không hợp lệ | Có tới 11 chữ số |
| `09123abc78` | Không hợp lệ | Chứa ký tự chữ |
| `0912 345 678` | Không hợp lệ | Chứa khoảng trắng ở giữa |
| `+84912345678` | Không hợp lệ | Chứa mã quốc tế |
| `84912345678` | Không hợp lệ | Không bắt đầu bằng số `0` |

### 2.3. Thông báo lỗi
| Trường hợp | Error Code | Thông báo hiển thị |
|---|---|---|
| Bỏ trống | `REQUIRED` | “Vui lòng nhập số điện thoại người nhận.” |
| Có chữ hoặc ký tự | `INVALID_TYPE` | “Số điện thoại chỉ được chứa chữ số.” |
| Không đủ/thừa số | `INVALID_LENGTH` | “Số điện thoại phải gồm đúng 10 chữ số.” |
| Không bắt đầu bằng 0 | `INVALID_PREFIX` | “Số điện thoại phải bắt đầu bằng số 0.” |
| Đầu số không hợp lệ | `INVALID_PHONE_NUMBER` | “Đầu số điện thoại không hợp lệ. Vui lòng kiểm tra lại.” |
| Toàn bộ chữ số giống nhau | `INVALID_PHONE_NUMBER` | “Số điện thoại không hợp lệ. Vui lòng kiểm tra lại.” |

---

## 3. Email

Yêu cầu đúng định dạng cấu trúc, không chặn email dạng `000000@gmail.com`.

### 3.1. Điều kiện nhập
- **Bắt buộc nhập** (để gửi thông tin xác nhận đơn hàng).
- Tự động xóa khoảng trắng đầu/cuối.
- **Không cho phép khoảng trắng ở giữa**.
- **Cấu trúc bắt buộc**: `phần_trước@tên_miền.đuôi_miền`
  - Phần trước `@`: Cho phép chữ, số, `.`, `_`, `%`, `+`, `-`. Không được để trống.
  - Phần sau `@`: Phải gồm tên miền, dấu chấm và đuôi miền.
- **Độ dài**: Tối đa `254` ký tự.
- **Regex kiểm tra**: `^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`

### 3.2. Ví dụ thực tế
| Dữ liệu nhập | Kết quả |
|---|---|
| `nguyenvana@gmail.com` | Hợp lệ |
| `000000@gmail.com` | Hợp lệ |
| `truc.nguyen+order@gmail.com` | Hợp lệ |
| `abc@gmail.com.vn` | Hợp lệ |
| `abc` | Không hợp lệ |
| `abc@` | Không hợp lệ |
| `@gmail.com` | Không hợp lệ |
| `abc@gmail` | Không hợp lệ |
| `abc gmail@gmail.com` | Không hợp lệ |
| `abc@@gmail.com` | Không hợp lệ |
| `abc@gmail..com` | Không hợp lệ |
| `   ` (chỉ có khoảng trắng) | Không hợp lệ |

### 3.3. Thông báo lỗi
| Trường hợp | Error Code | Thông báo hiển thị |
|---|---|---|
| Bỏ trống | `REQUIRED` | “Vui lòng nhập email.” |
| Sai cấu trúc | `INVALID_EMAIL` | “Email không đúng định dạng. Vui lòng nhập theo mẫu: ten@email.com.” |
| Có khoảng trắng ở giữa | `INVALID_EMAIL` | “Email không được chứa khoảng trắng.” |
| Quá 254 ký tự | `TOO_LONG` | “Email không được vượt quá 254 ký tự.” |

---

## 4. Tỉnh/Thành phố

Dạng chọn lựa (Dropdown), không cho nhập tự do.

### 4.1. Điều kiện xác thực
- **Bắt buộc chọn**.
- Giá trị phải thuộc danh sách tỉnh/thành phố hợp lệ và đang hoạt động của hệ thống.
- Backend kiểm duyệt `province_id` tồn tại trong database.

### 4.2. Thông báo lỗi
| Trường hợp | Error Code | Thông báo hiển thị |
|---|---|---|
| Chưa chọn | `REQUIRED` | “Vui lòng chọn Tỉnh/Thành phố.” |
| ID không tồn tại | `INVALID_PROVINCE` | “Tỉnh/Thành phố đã chọn không hợp lệ.” |
| Khu vực ngừng hỗ trợ giao hàng | `DELIVERY_UNAVAILABLE` | “Hiện chưa hỗ trợ giao hàng đến Tỉnh/Thành phố này.” |
| Lỗi hệ thống khi tải danh sách | `LOAD_FAILED` | “Không thể tải danh sách Tỉnh/Thành phố. Vui lòng thử lại.” |

---

## 5. Phường/Xã

Dropdown phụ thuộc động vào Tỉnh/Thành phố đã chọn.

### 5.1. Điều kiện xác thực
- **Bắt buộc chọn**.
- Chỉ cho phép chọn sau khi đã chọn Tỉnh/Thành phố.
- Khi người dùng đổi Tỉnh/Thành phố:
  - Reset / Xóa phường/xã đã chọn trước đó.
  - Tải lại danh sách phường/xã tương ứng.
- Ràng buộc: `ward_id` phải thuộc đúng `province_id` đã chọn (Tránh gửi chéo ID tỉnh khác).

### 5.2. Thông báo lỗi
| Trường hợp | Error Code | Thông báo hiển thị |
|---|---|---|
| Chưa chọn Tỉnh/Thành phố trước | `PROVINCE_REQUIRED` | “Vui lòng chọn Tỉnh/Thành phố trước.” |
| Chưa chọn | `REQUIRED` | “Vui lòng chọn Phường/Xã.” |
| Phường/xã không tồn tại | `INVALID_WARD` | “Phường/Xã đã chọn không hợp lệ.” |
| Lỗi chéo Tỉnh - Phường | `WARD_PROVINCE_MISMATCH` | “Phường/Xã không thuộc Tỉnh/Thành phố đã chọn.” |
| Lỗi tải danh sách | `LOAD_FAILED` | “Không thể tải danh sách Phường/Xã. Vui lòng thử lại.” |

---

## 6. Địa chỉ cụ thể

### 6.1. Điều kiện nhập
- **Bắt buộc nhập**.
- Tự động trim khoảng trắng rìa.
- **Độ dài**: Tối thiểu `5` ký tự, tối đa `255` ký tự.
- **Ràng buộc ký tự**:
  - Phải chứa ít nhất: 1 chữ cái; hoặc 1 chữ cái kèm số nhà/căn hộ.
  - Cho phép: Chữ tiếng Việt, chữ số, khoảng trắng, các dấu `/`, `-`, `.`, `,`, `'`, `(`, `)`.
  - Không chặn địa chỉ không có số nhà (vùng thôn quê chỉ có ấp/thôn).
  - Không cho phép chỉ toàn số hoặc toàn ký tự đặc biệt.

### 6.2. Ví dụ thực tế
| Dữ liệu nhập | Kết quả | Ghi chú |
|---|---|---|
| `123 Đường Lê Lợi` | Hợp lệ | |
| `25/7 Nguyễn Trãi` | Hợp lệ | |
| `Chung cư ABC, Block A, căn 502` | Hợp lệ | |
| `Thôn Bình An` | Hợp lệ | Không số nhà |
| `Ấp 3` | Hợp lệ | Không số nhà |
| `123456` | Không hợp lệ | Chỉ toàn số |
| `@@@@@` | Không hợp lệ | Chỉ toàn ký tự đặc biệt |
| `abc` | Không hợp lệ | Dưới 5 ký tự |
| `   ` (chỉ có khoảng trắng) | Không hợp lệ | |

### 6.3. Thông báo lỗi
| Trường hợp | Error Code | Thông báo hiển thị |
|---|---|---|
| Bỏ trống | `REQUIRED` | “Vui lòng nhập địa chỉ cụ thể.” |
| Dưới 5 ký tự | `TOO_SHORT` | “Địa chỉ cụ thể phải có ít nhất 5 ký tự.” |
| Trên 255 ký tự | `TOO_LONG` | “Địa chỉ cụ thể không được vượt quá 255 ký tự.” |
| Chỉ gồm số/ký tự đặc biệt | `INVALID_ADDRESS` | “Vui lòng nhập địa chỉ cụ thể hợp lệ.” |
| Chứa ký tự không hỗ trợ | `INVALID_FORMAT` | “Địa chỉ chứa ký tự không được hỗ trợ.” |

---

## 7. Ghi chú đơn hàng

### 7.1. Điều kiện nhập
- **Không bắt buộc** (Có thể để trống).
- **Độ dài**: Tối đa `200` ký tự (hiển thị bộ đếm chữ `X/200` trên UI).
- Cho phép chữ, số, dấu câu và xuống dòng.
- Tự động trim khoảng trắng rìa. Nếu chỉ nhập khoảng trắng -> lưu thành rỗng/null.
- **Không cho nhập HTML/Script** (Tránh XSS, Backend sẽ escape/sanitize).

### 7.2. Thông báo lỗi
| Trường hợp | Error Code | Thông báo hiển thị |
|---|---|---|
| Vượt quá 200 ký tự | `TOO_LONG` | “Ghi chú đơn hàng không được vượt quá 200 ký tự.” |

---

## 8. Checkbox “Gọi người khác nhận hàng”

- **Nếu không chọn**: Sử dụng trực tiếp họ tên, số điện thoại và email của người đặt hàng làm thông tin nhận hàng.
- **Nếu chọn**:
  - Hiển thị thêm 2 trường: **Họ và tên người nhận khác** & **Số điện thoại người nhận khác**.
  - Hai trường này lập tức trở thành **Bắt buộc**.
  - Áp dụng chính xác cùng quy tắc xác thực (Validation) của Họ tên và Số điện thoại nêu trên.
  - Không bắt buộc nhập Email cho người nhận khác.
  - *Lưu ý*: Cho phép trùng lặp họ tên/sđt với người đặt hàng.

---

## 9. Thứ tự validate & Xử lý khi có lỗi

Khi người dùng bấm nút **Tiếp tục** hoặc **Thanh toán**, hệ thống kiểm tra lần lượt theo thứ tự:
1. Họ và tên người đặt hàng
2. Số điện thoại người đặt hàng
3. Email
4. Tỉnh/Thành phố
5. Phường/Xã
6. Địa chỉ cụ thể
7. Ghi chú đơn hàng
8. Thông tin người nhận khác (Họ tên, Sđt) nếu checkbox được chọn

**Khi có lỗi**:
- Ngăn không cho chuyển sang bước tiếp theo hoặc Submit.
- Viền đỏ các ô nhập liệu bị lỗi.
- Hiển thị thông báo lỗi ngay bên dưới ô nhập tương ứng.
- **Tự động scroll và focus** vào ô nhập liệu lỗi đầu tiên trong form.
- Giữ nguyên các dữ liệu hợp lệ khác người dùng đã nhập.
