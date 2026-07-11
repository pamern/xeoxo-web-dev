# Appointment Input Validation

Tài liệu này mô tả logic nhập liệu cho form đặt lịch may đo tại `AppointmentForm`.

## Nguyên tắc hiển thị lỗi

- Không hiển thị lỗi ngay khi người dùng vừa bắt đầu gõ.
- Khi người dùng ngừng nhập khoảng 650ms, field đang nhập được validate và hiển thị lỗi nếu có.
- Khi người dùng blur khỏi field, validate ngay field đó.
- Khi bấm `Lưu Biểu mẫu`, validate toàn bộ form.
- Trong lúc người dùng tiếp tục nhập, lỗi cũ của field đó được ẩn đi, sau đó hiện lại nếu input vẫn sai sau thời gian ngừng nhập.
- Các field `họ và tên`, `số điện thoại`, `email cá nhân` được trim trước khi validate và trước khi submit.
- `họ và tên` được chuẩn hóa nhiều khoảng trắng liên tiếp thành một khoảng trắng.
- `email cá nhân` được chuyển về lowercase trước khi submit.

## Họ Và Tên

Validation rules:

- Bắt buộc nhập.
- Trim khoảng trắng ở đầu và cuối.
- Chuẩn hóa nhiều khoảng trắng liên tiếp thành một khoảng trắng.
- Tối thiểu 2 ký tự.
- Tối đa 100 ký tự.
- Không được chứa chữ số.
- Không được chứa HTML/script.
- Chỉ cho phép chữ cái Unicode, khoảng trắng và dấu gạch nối `-`.
- Cho phép tên tiếng Việt có dấu, tên nước ngoài và tên có dấu gạch nối.
- Không cố đoán tên giả nếu input đúng format, ví dụ `aaaaaa`.

| Input | Kết quả |
|---|---|
| Để trống | `Vui lòng nhập họ và tên.` |
| Chỉ khoảng trắng | `Vui lòng nhập họ và tên.` |
| `A` | `Họ và tên phải có ít nhất 2 ký tự.` |
| Vượt quá 100 ký tự | `Họ và tên không được vượt quá 100 ký tự.` |
| `Nguyễn Văn A123` | `Họ và tên không được chứa chữ số.` |
| `123456` | `Họ và tên không được chứa chữ số.` |
| `Nguyễn @ Văn` | `Họ và tên chỉ được chứa chữ cái, khoảng trắng và dấu gạch nối (-).` |
| `Nguyễn 😊` | `Họ và tên chỉ được chứa chữ cái, khoảng trắng và dấu gạch nối (-).` |
| `<script>alert(1)</script>` | `Họ và tên chứa ký tự không hợp lệ.` |
| ` Nguyễn Văn A ` | Tự trim thành `Nguyễn Văn A`, không lỗi |
| `Nguyễn   Văn   A` | Chuẩn hóa thành `Nguyễn Văn A`, không lỗi |
| `Nguyễn Hoàng Thiên Trúc` | Hợp lệ |
| `John Smith` | Hợp lệ |
| `Anna-Maria Smith` | Hợp lệ |
| `aaaaaa` | Hợp lệ vì hệ thống không xác định tên giả |

## Số Điện Thoại

Hệ thống chỉ chấp nhận số di động Việt Nam gồm đúng 10 chữ số. Đầu số phải thuộc danh sách đầu số đang được hỗ trợ, bao gồm cả các mạng di động ảo như `055` và `087`. Các nhóm đầu số được hỗ trợ gồm Viettel `032-039`, `086`, `096-098`; VinaPhone `081-085`, `088`, `091`, `094`; MobiFone `070`, `076-079`, `089`, `090`, `093`; Vietnamobile `052`, `056`, `058`; Wintel `055`; iTel `087`.

Validation rules:

- Bắt buộc nhập.
- Trim khoảng trắng ở đầu và cuối.
- Chỉ được chứa chữ số.
- Phải gồm đúng 10 chữ số.
- Không nhận định dạng quốc tế `+84`.
- Nếu không bắt đầu bằng `0`, hiển thị lỗi riêng.
- Không nhận chuỗi lặp cùng một chữ số như `0000000000`, `1111111111`, `9999999999`.
- Chỉ chấp nhận đầu số nằm trong danh sách hỗ trợ.
- Cho phép số điện thoại đã từng dùng để đặt lịch, không kiểm tra trùng.
- Regex chỉ xác nhận số đúng cấu trúc và đúng đầu số, không xác nhận thuê bao đang tồn tại hoặc thuộc người đặt lịch.

| Input / trường hợp | Kết quả | Lỗi hiển thị |
|---|---|---|
| Để trống | Không hợp lệ | `Vui lòng nhập số điện thoại.` |
| Chỉ nhập khoảng trắng | Trim thành rỗng, không hợp lệ | `Vui lòng nhập số điện thoại.` |
| `0383389276` | Hợp lệ | Không báo lỗi |
| `0912345678` | Hợp lệ | Không báo lỗi |
| `0551234567` | Hợp lệ | Không báo lỗi |
| `0871234567` | Hợp lệ | Không báo lỗi |
| `0311111111` | Đúng 10 số nhưng đầu số `031` không được hỗ trợ | `Đầu số điện thoại không hợp lệ.` |
| `0512345678` | Đầu số `051` không được hỗ trợ | `Đầu số điện thoại không hợp lệ.` |
| `0612345678` | Đầu số `061` không được hỗ trợ | `Đầu số điện thoại không hợp lệ.` |
| `0123456789` | Đầu số không hợp lệ | `Đầu số điện thoại không hợp lệ.` |
| `0000000000` | Đầu số không hợp lệ, chuỗi số vô nghĩa | `Số điện thoại không hợp lệ.` |
| `1111111111` | Không bắt đầu bằng đầu số Việt Nam hợp lệ, chuỗi số vô nghĩa | `Số điện thoại không hợp lệ.` |
| `9999999999` | Không bắt đầu bằng đầu số Việt Nam hợp lệ, chuỗi số vô nghĩa | `Số điện thoại không hợp lệ.` |
| `9123456789` | Không bắt đầu bằng `0` | `Số điện thoại phải bắt đầu bằng số 0.` |
| `091234567` | Chỉ có 9 chữ số | `Số điện thoại phải gồm đúng 10 chữ số.` |
| `09123456789` | Có 11 chữ số | `Số điện thoại phải gồm đúng 10 chữ số.` |
| `+84912345678` | Dạng quốc tế không được hỗ trợ | `Vui lòng nhập số điện thoại Việt Nam gồm 10 chữ số.` |
| `0912 345 678` | Chứa khoảng trắng bên trong | `Số điện thoại chỉ được chứa chữ số.` |
| `0912-345-678` | Chứa dấu `-` | `Số điện thoại chỉ được chứa chữ số.` |
| `0912abc678` | Chứa chữ cái | `Số điện thoại chỉ được chứa chữ số.` |
| `0912@345678` | Chứa ký tự đặc biệt | `Số điện thoại chỉ được chứa chữ số.` |
| `0900000000` | Đúng cấu trúc và đầu số | Cho phép; chỉ OTP mới xác minh được số có thật |
| Số đã từng dùng để đặt lịch | Được sử dụng lại | Không báo lỗi |

Danh sách đầu số được chấp nhận:

```txt
032, 033, 034, 035, 036, 037, 038, 039
052, 055, 056, 058, 059
070, 076, 077, 078, 079
081, 082, 083, 084, 085, 086, 087, 088, 089
090, 091, 092, 093, 094, 096, 097, 098, 099
```

Regex kiểm tra:

```regex
^(?:03[2-9]|05[25689]|07[06789]|08[1-9]|09[0-46-9])\d{7}$
```

Regex này:

- Cho phép `0383389276`.
- Cho phép `0551234567`.
- Cho phép `0871234567`.
- Không cho phép `0311111111`.
- Không cho phép `0512345678`.
- Không cho phép `0951234567`.

## Email Cá Nhân

Validation rules:

- Bắt buộc nhập.
- Trim khoảng trắng ở đầu và cuối.
- Chuyển lowercase trước khi submit.
- Không được chứa khoảng trắng bên trong.
- Không được chứa hai dấu chấm liên tiếp.
- Tối đa 254 ký tự.
- Phải có đúng một ký tự `@`, có phần trước `@`, có domain hợp lệ và domain có phần mở rộng.
- Cho phép local-part toàn chữ số.
- Cho phép local-part chứa `.`, `_`, `-`, `+`.
- Cho phép email đã từng dùng để đặt lịch, không kiểm tra trùng.

| Input | Kết quả |
|---|---|
| Để trống | `Vui lòng nhập email cá nhân.` |
| Chỉ khoảng trắng | `Vui lòng nhập email cá nhân.` |
| ` nguyenvana@gmail.com ` | Trim thành `nguyenvana@gmail.com`, không lỗi |
| `nguyenvana@gmail.com` | Hợp lệ |
| `NGUYENVANA@GMAIL.COM` | Hợp lệ, submit dạng `nguyenvana@gmail.com` |
| `000000@gmail.com` | Hợp lệ |
| `123456@gmail.com` | Hợp lệ |
| `abc@gmail.com` | Hợp lệ |
| `asdjfhskjdf@gmail.com` | Hợp lệ vì đúng format |
| `nguyen.van@gmail.com` | Hợp lệ |
| `nguyen_van@gmail.com` | Hợp lệ |
| `nguyen-van@gmail.com` | Hợp lệ |
| `nguyen+test@gmail.com` | Hợp lệ |
| `nguyenvangmail.com` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `@gmail.com` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `nguyenvana@` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `abc@@gmail.com` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `abc gmail@gmail.com` | `Email không được chứa khoảng trắng.` |
| `.abc@gmail.com` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `abc.@gmail.com` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `ab..cd@gmail.com` | `Email không được chứa hai dấu chấm liên tiếp.` |
| `abc@gmail` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `abc@.com` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| `abc@gmail..com` | `Email không được chứa hai dấu chấm liên tiếp.` |
| `abc@-gmail.com` | `Email phải có định dạng hợp lệ, ví dụ: example@gmail.com.` |
| Vượt quá 254 ký tự | `Email không được vượt quá 254 ký tự.` |
| Email đã từng dùng để đặt lịch | Hợp lệ |

## Ghi Chú

Validation rules:

- Không bắt buộc nhập.
- Tối đa 200 từ.
- Không giới hạn theo ký tự vì tiếng Việt có dấu và khoảng trắng có thể làm giới hạn ký tự khó đoán.
- Nếu vượt quá 200 từ, hiển thị `Ghi chú không được vượt quá 200 từ.`

## Server Validation

Endpoint `POST /api/v1/measurement-appointments` phải dùng cùng bộ validation với UI cho các field:

- `full_name`
- `phone`
- `email`
- `customer_note`

Nếu gọi API trực tiếp và dữ liệu sai, response lỗi phải ưu tiên trả message cụ thể đầu tiên từ schema để UI có thể hiển thị đúng lỗi.
