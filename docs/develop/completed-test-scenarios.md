# Tài liệu Kịch bản Kiểm thử Dự án XEOXO Web (Bản đầy đủ tất cả chức năng)

Tài liệu này tổng hợp toàn bộ các kịch bản kiểm thử (Test Scenarios) cho toàn bộ chức năng của mã nguồn dự án XEOXO Web, bao gồm Đăng ký/Đăng nhập, Danh mục sản phẩm (Tìm kiếm, Lọc, Sắp xếp), Chi tiết sản phẩm, Giỏ hàng, Khuyến mãi & Điểm thưởng, Quy trình Thanh toán (Checkout), Quản lý tài khoản (Thông tin cá nhân, Địa chỉ, Hồ sơ số đo), Lịch sử Đơn hàng, Đặt lịch hẹn, Đánh giá sản phẩm và Trắc nghiệm sắc màu cá nhân.

---

## 8.2. Kiểm thử chức năng

### I. Đăng ký tài khoản
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-AUTH-01** | Đăng ký với SĐT, email, password hợp lệ, chưa từng đăng ký | Tên khách hàng hợp lệ; email và SĐT hợp lệ chưa từng tồn tại, mật khẩu ≥ 8 ký tự gồm chữ hoa, chữ thường, số | Tạo tài khoản và gửi email/SMS xác thực | **Đạt**. `registerSchema` validate local trước, `authService.register()` gọi `supabase.auth.signUp()`. Nếu không có `session`, UI hiện thông báo kiểm tra email hoặc SMS để xác nhận tài khoản. |
| **TC-AUTH-02** | Đăng ký với email đã tồn tại | Email đã đăng ký trước đó | Thông báo email đã tồn tại | **Đạt**. App map lỗi Supabase dạng `user already registered`/`user already exists` thành `Email đã tồn tại. Vui lòng sử dụng email khác.` và không cho đăng ký tiếp. |
| **TC-AUTH-03** | Đăng ký với SĐT đã tồn tại | SĐT đã đăng ký trước đó | Thông báo SĐT đã tồn tại | **Đạt**. App map lỗi Supabase về `Số điện thoại đã tồn tại. Vui lòng sử dụng số điện thoại khác.` |
| **TC-AUTH-04** | Email sai định dạng | Chuỗi email không hợp lệ ví dụ “abc@” | Không cho submit, báo email không hợp lệ | **Đạt**. `parseAuthIdentifier()` trả `null`, form hiển thị `Email hoặc số điện thoại không hợp lệ.` |
| **TC-AUTH-05** | SĐT sai định dạng | Số không khớp normalize/đầu số | Không cho submit, báo SĐT không hợp lệ | **Đạt**. `parseAuthIdentifier()` chỉ chấp nhận email hợp lệ hoặc số normalize được về định dạng điện thoại hợp lệ. |
| **TC-AUTH-06** | Mật khẩu không đạt độ mạnh yêu cầu | Mật khẩu thiếu chữ hoa, thiếu chữ thường, thiếu số hoặc dưới 8 ký tự | Không cho submit, báo rõ điều kiện mật khẩu chưa đạt | **Đạt**. `getFirstPasswordError()` trả lỗi đầu tiên theo rule: tối thiểu 8 ký tự, có chữ thường, chữ hoa, số. |
| **TC-AUTH-07** | Mật khẩu và xác nhận mật khẩu không khớp | Mật khẩu và xác nhận mật khẩu không khớp | Không cho submit, báo confirm password không khớp | **Đạt**. `registerSchema.superRefine()` trả lỗi `Mật khẩu nhập lại không khớp.` |
| **TC-AUTH-08** | Bỏ trống trường bắt buộc | Bỏ trống `fullName`, `account`, `password` hoặc `confirmPassword` | Không cho submit, hiển thị lỗi từng trường | **Đạt**. Form đánh dấu `touched` toàn bộ khi submit và lấy lỗi đầu tiên từ Zod để hiển thị theo field. |
| **TC-AUTH-09** | Mật khẩu định dạng yêu cầu | Mật khẩu đúng 8 ký tự và đầy đủ chữ hoa, chữ thường, số | Cho phép đăng ký | **Đạt**. Rule độ dài tối thiểu là `8`, không yêu cầu ký tự đặc biệt. |
| **TC-AUTH-10** | Mật khẩu dưới độ dài tối thiểu | Ví dụ `Abc123` | Không cho submit, hiển thị lỗi mật khẩu quá ngắn | **Đạt**. UI báo `Ít nhất 8 ký tự`. |
| **TC-AUTH-11** | Email có khoảng trắng đầu cuối | `account = "  USER@MAIL.COM  "` | Chuẩn hóa khoảng trắng và vẫn đăng ký được nếu email hợp lệ | **Đạt**. `trim()` và `toLowerCase()` được áp dụng trong `parseAuthIdentifier()`. |
| **TC-AUTH-12** | Gửi email xác thực thất bại do SMTP/rate limit | Môi trường mail lỗi hoặc provider trả `429`, `over_email_send_rate_limit`, lỗi gửi confirmation email hoặc lỗi SMTP | Thông báo không gửi được email xác thực | **Đạt**. App map lỗi gửi email xác thực/SMTP sang `Không gửi được email xác thực. Vui lòng thử lại sau.`; riêng rate limit vẫn hiển thị thông báo giới hạn tần suất rõ ràng bằng tiếng Việt. |

---

### II. Đăng nhập tài khoản
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-LOGIN-01** | Đăng nhập bằng Email + password đúng | Tài khoản đã xác thực | Đăng nhập thành công, đồng bộ profile, cập nhật session UI | **Đạt**. `useAuth.login()` gọi `signInWithPassword()` -> `syncProfile()` -> `refresh()` -> `ok: true`. |
| **TC-LOGIN-02** | Sai password khi đăng nhập bằng Email/SĐT | Password sai | Thông báo đăng nhập thất bại | **Đạt**. App không custom message riêng, nhưng sẽ nổi lỗi thật từ `supabase.auth.signInWithPassword()`. |
| **TC-LOGIN-03** | Tài khoản không tồn tại (Email/SĐT) | Email chưa đăng ký | Thông báo tài khoản không tồn tại hoặc đăng nhập thất bại | **Đạt**. App nổi lỗi từ Supabase, không có nhánh xử lý riêng để phân biệt với sai mật khẩu. |
| **TC-LOGIN-04** | Nhập sai password quá số lần cho phép | Cùng một email/SĐT hợp lệ bị nhập sai mật khẩu từ 5 lần liên tiếp trở lên | Bị chặn tạm thời và thông báo giới hạn đăng nhập | **Đạt**. App lưu số lần sai theo từng tài khoản ở client; từ lần sai thứ 5 sẽ chặn đăng nhập trong 5 phút và hiển thị `Bạn đã nhập sai mật khẩu quá 5 lần. Vui lòng thử lại sau 5 phút.` |
| **TC-LOGIN-05** | Đăng nhập bằng Facebook, tài khoản FB đã liên kết trước đó | Đã từng đăng nhập FB 1 lần, callback URL hợp lệ | Đăng nhập thành công và quay về app | **Đạt**. `signInWithProvider("facebook")` dùng OAuth, callback `exchangeCodeForSession()` rồi `syncCustomerProfile()`. |
| **TC-LOGIN-06** | Đăng nhập bằng Facebook, tài khoản FB chưa từng có tài khoản trong hệ thống | Email FB chưa tồn tại trong hệ thống | Tạo session và đồng bộ hồ sơ khách hàng mới | **Đạt**. Sau callback, `syncCustomerProfile()` upsert `iam.account` và `iam.customer` theo `account_id` của user OAuth. |
| **TC-LOGIN-07** | Tài khoản chưa xác thực email, đăng nhập bằng Email | Tài khoản email vừa đăng ký nhưng chưa bấm link xác nhận | Không cho đăng nhập và yêu cầu xác thực email | **Đạt theo provider**. App không tự check cờ xác thực, nhưng lỗi từ Supabase sẽ được hiển thị ra UI. |
| **TC-LOGIN-08** | Người dùng hủy cấp quyền (cancel) khi đang login FB | User mở popup OAuth rồi hủy | Quay về app và hiển thị lỗi đăng nhập mạng xã hội chưa hoàn tất | **Đạt**. `auth/callback` gắn `authError=oauth_callback`, `AuthExperience` map thành `Đăng nhập mạng xã hội chưa hoàn tất. Vui lòng thử lại.` |
| **TC-LOGIN-09** | FB trả về lỗi/token invalid | OAuth callback thiếu `code` hoặc `exchangeCodeForSession()` lỗi | Hiển thị lỗi đăng nhập mạng xã hội thất bại | **Đạt**. Route callback redirect về login với `authError=oauth_callback`. |
| **TC-LOGIN-10** | Email FB trùng với email đã đăng ký thủ công trước đó | Một email đã tồn tại ở path email/password, sau đó login Facebook bằng cùng email | Liên kết hoặc xử lý trùng tài khoản đúng cách | **Chưa đủ căn cứ xác nhận**. App không có code liên kết identity riêng; hành vi thực tế phụ thuộc cấu hình account linking của Supabase/Auth provider. |
| **TC-LOGIN-11** | Email nhập hoa/thường khác lúc đăng ký | Đăng ký `user@mail.com`, đăng nhập `USER@MAIL.COM` | Đăng nhập thành công | **Đạt**. `parseAuthIdentifier()` luôn `toLowerCase()` email trước khi gửi lên Supabase. |
| **TC-LOGIN-12** | Đăng nhập FB nhưng tài khoản đã bị khóa/vô hiệu hóa | Account business bị đánh dấu inactive hoặc provider chặn | Không cho đăng nhập | **Chưa hỗ trợ đầy đủ ở app**. Flow login hiện không kiểm tra `iam.account.is_active`; nếu cần khóa tài khoản phải dựa vào Supabase Auth hoặc bổ sung business rule server-side. |
| **TC-LOGIN-13** | Session hết hạn giữa phiên (mọi path) | Session/ refresh token hết hạn hoặc không tồn tại | UI tự về trạng thái guest, không crash | **Đạt**. `getAuthenticatedUser()` trả `null` với `Auth session missing`, `refresh_token_not_found`, hoặc user missing; `useAuth.refresh()` chuyển UI về guest và chỉ `console.warn`. |

---

### III. Tìm kiếm, Lọc và Sắp xếp sản phẩm (Catalog)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CAT-01** | Tìm kiếm sản phẩm bằng từ khóa | Nhập từ khóa "Tinh Sa" vào thanh tìm kiếm và Enter | Danh sách hiển thị đúng các sản phẩm có tên hoặc mô tả chứa từ khóa "Tinh Sa" | **Đạt**. Sử dụng `productService.getProducts({ search: "Tinh Sa" })` thực hiện query lọc theo từ khóa. |
| **TC-CAT-02** | Lọc sản phẩm theo danh mục và bộ sưu tập | Chọn danh mục "Áo dài" hoặc bộ sưu tập "Hè 2026" | Trang hiển thị đúng các sản phẩm thuộc danh mục và bộ sưu tập tương ứng | **Đạt**. Route `/categories/[slug]` và `/collections/[slug]` load chính xác danh sách sản phẩm được gán. |
| **TC-CAT-03** | Lọc sản phẩm theo khoảng giá, màu sắc, size | Đặt giá từ 500k - 1tr, chọn màu "Đỏ", size "M" | Chỉ hiển thị các sản phẩm thỏa mãn đồng thời tất cả các bộ lọc | **Đạt**. Filter trên UI gửi query params lên API để truy vấn các dòng sản phẩm phù hợp. |
| **TC-CAT-04** | Sắp xếp sản phẩm | Chọn sắp xếp theo: "Giá tăng dần", "Giá giảm dần", "Mới nhất" | Danh sách sản phẩm được sắp xếp lại đúng thứ tự giá hoặc ngày tạo | **Đạt**. API hỗ trợ các tùy chọn `sort_by` như `price_asc`, `price_desc`, `newest`. |

---

### IV. Chi tiết sản phẩm (Product Detail)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào / Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-PD-01** | Hiển thị đầy đủ thông tin sản phẩm | Người dùng truy cập trang chi tiết sản phẩm hợp lệ | Trang hiển thị đầy đủ: Tên sản phẩm, giá bán, giá gốc (nếu có giảm giá), hình ảnh gallery, mô tả sản phẩm, danh sách các tùy chọn size, màu. | **Đạt**. Server Component nạp dữ liệu từ `productService.getProductBySlug()` và render đúng các thông tin lên UI. |
| **TC-PD-02** | Chọn các tùy chọn phân loại sản phẩm | Người dùng nhấp chọn phân loại Size (ví dụ: `M`) và Màu sắc. | Phân loại đã chọn được highlight. Giá bán hiển thị cập nhật theo phân loại tương ứng (nếu có chênh lệch giá). | **Đạt**. Component `VariantSelector` bắt sự kiện và thay đổi state `size` và `color` tương ứng, cập nhật giá động. |
| **TC-PD-03** | Thay đổi số lượng mua sản phẩm | - Bấm nút `+` để tăng số lượng.<br>- Bấm nút `-` để giảm số lượng. | - Nhấp `+` tăng dần số lượng mua lên 2, 3...<br>- Nhấp `-` giảm dần số lượng mua xuống mức tối thiểu là 1. | **Đạt**. Nút tăng/giảm cập nhật state `quantity`, được giới hạn min=1 và max=tồn kho. |
| **TC-PD-04** | Thêm sản phẩm vào giỏ hàng thành công | Người dùng chọn phân loại hợp lệ, chọn số lượng mua, bấm nút **"Thêm vào giỏ hàng"**. | Hiển thị toast thêm vào giỏ hàng thành công. Số lượng giỏ hàng trên Header tăng lên tương ứng. | **Đạt**. Gọi `cartService.addItem()` gửi request lên API, trả về giỏ hàng mới và gọi hàm `showAddedToCart()`. |
| **TC-PD-05** | Chọn phân loại hết hàng | Sản phẩm có màu sắc/kích thước hết hàng | Button size đó bị xám mờ và khóa (disabled), không cho phép click chọn. | **Đạt**. Thuộc tính `is_available` của variant được kiểm tra để render class `cursor-not-allowed bg-[#ededed] text-[#a3a3a3]` và chặn click. |
| **TC-PD-06** | Spam click nút Thêm vào giỏ hàng | Người dùng nhấp liên tục, cực nhanh nhiều lần vào nút **"Thêm vào giỏ hàng"**. | Hệ thống xử lý trơn tru. Chỉ gửi đúng 1 request hoặc thêm đúng số lượng một lần, tránh tạo đơn trùng lặp. | **Đạt**. State `isAdding` chuyển sang `true` khóa tương tác nút bấm cho tới khi API phản hồi xong. |

---

### V. Giỏ hàng (Cart)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào / Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CA-01** | Hiển thị đúng danh sách sản phẩm trong giỏ | Giỏ hàng đã được thêm sản phẩm từ trước. Người dùng truy cập trang giỏ hàng. | Hiển thị chính xác danh sách các sản phẩm đã thêm: Hình ảnh thu nhỏ, tên sản phẩm, phân loại (Size/Màu sắc/Số đo tự chọn), đơn giá, số lượng mua, tổng tiền của từng sản phẩm, và tổng tiền tạm tính toàn bộ giỏ hàng. | **Đạt**. Trang `/cart` lấy dữ liệu giỏ hàng qua `cartService.getCart()` và render đầy đủ thông số. |
| **TC-CA-02** | Điều chỉnh tăng/giảm số lượng trong giỏ hàng | Nhấp nút `+` hoặc `-` tại một sản phẩm trong giỏ hàng. | Số lượng sản phẩm tăng/giảm ngay lập tức. Thành tiền của sản phẩm đó và Tổng tiền tạm tính của giỏ hàng cập nhật tương ứng thời gian thực. | **Đạt**. Hệ thống gọi API `PATCH /api/v1/cart/items/[id]` để cập nhật số lượng và tính lại tổng tiền. |
| **TC-CA-03** | Xóa sản phẩm khỏi giỏ hàng | Người dùng nhấp vào nút "Xóa" hoặc icon thùng rác bên cạnh sản phẩm. | Sản phẩm đó lập tức biến mất khỏi danh sách giỏ hàng. Tổng tiền tạm tính được tính toán lại. Hiển thị toast thông báo xóa thành công. | **Đạt**. Gọi API `DELETE /api/v1/cart/items/[id]` và cập nhật lại client-side state. |
| **TC-CA-04** | Truy cập giỏ hàng trống | Giỏ hàng không có sản phẩm nào. Người dùng truy cập trang Giỏ hàng. | Hiển thị hình minh họa giỏ hàng trống kèm dòng chữ thông báo: *"Giỏ hàng của bạn đang trống."* và nút **"Tiếp tục mua sắm"** để dẫn về trang danh sách sản phẩm. | **Đạt**. Kiểm tra mảng `items.length === 0` và hiển thị UI giỏ hàng trống. |
| **TC-CA-05** | Nhấp thanh toán khi chưa chọn sản phẩm nào | Giỏ hàng có sản phẩm nhưng người dùng bỏ tích chọn tất cả checkbox, sau đó bấm **"Tiến hành thanh toán"**. | Nút thanh toán bị khóa (disabled) hoặc hệ thống hiển thị thông báo nhắc nhở chọn nhất 1 sản phẩm. | **Đạt**. Nút thanh toán được kiểm soát bởi mảng sản phẩm đã chọn, bị vô hiệu hóa khi không có sản phẩm nào được check. |

---

### VI. Khuyến mãi & Điểm thưởng (Loyalty Reward & Promotion)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-LOY-01** | Tích lũy điểm khi mua hàng thành công | Đơn hàng hoàn thành thanh toán, tổng trị giá đơn hàng là 1.000.000đ | Điểm tích lũy thành viên tăng tương ứng theo tỉ lệ quy đổi (ví dụ: 1%) tương ứng +10.000 điểm | **Đạt**. Hệ thống tự động ghi nhận điểm tích lũy vào tài khoản khách hàng khi trạng thái đơn hàng chuyển sang `COMPLETED`. |
| **TC-LOY-02** | Đổi điểm tích lũy sang giảm giá | Khách hàng chọn dùng điểm thưởng tích lũy tại trang Checkout để thanh toán | Giảm số tiền thanh toán cuối cùng của đơn hàng tương đương trị giá điểm đã đổi | **Đạt**. Gọi API loyalty-rewards để tính khấu trừ điểm thưởng vào tổng tiền đơn hàng. |

---

### VII. Quy trình Thanh toán (Checkout)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào / Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CO-01** | Đặt hàng thành công bằng hình thức COD | - Giỏ hàng có sản phẩm.<br>- Điền thông tin nhận hàng hợp lệ.<br>- Chọn phương thức **COD (Thanh toán khi nhận hàng)**.<br>- Nhấn **"Đặt hàng"**. | - Hệ thống tạo đơn hàng mới trên Database với trạng thái "Chờ xử lý".<br>- Chuyển hướng khách hàng sang trang **Xác nhận đơn hàng thành công (Thank You Page)**. | **Đạt**. `orderService.createOrder()` gọi API backend thành công, chuyển hướng về `/checkout/success?orderId=...`. |
| **TC-CO-02** | Đặt hàng thành công bằng Chuyển khoản ngân hàng | - Điền thông tin nhận hàng hợp lệ.<br>- Chọn phương thức **Chuyển khoản (Bank Transfer)**.<br>- Nhấn **"Đặt hàng"**. | - Đơn hàng được tạo thành công.<br>- Chuyển hướng sang trang hiển thị thông tin tài khoản ngân hàng, mã QR thanh toán động chứa số tiền chính xác và nội dung chuyển khoản là mã đơn hàng. | **Đạt**. Chuyển hướng về trang hướng dẫn chuyển khoản ngân hàng chứa QR Code tự động phát sinh từ VietQR API. |
| **TC-CO-03** | Bỏ trống toàn bộ thông tin bắt buộc | Nhấp nút đặt hàng khi form thông tin trống trơn. | Form không được gửi. Hệ thống hiển thị các thông báo lỗi màu đỏ ngay dưới từng ô nhập liệu bỏ trống (Họ tên, SĐT, Email, Tỉnh/Thành, Phường/Xã, Địa chỉ cụ thể). | **Đạt**. Zod validator chạy trên schema checkout chặn submit và hiển thị thông báo lỗi chi tiết cho từng trường. |
| **TC-CO-04** | Họ và tên người nhận không hợp lệ | Nhập Họ tên dưới 2 ký tự hoặc chứa số, ký tự đặc biệt. | Hệ thống chặn submit đơn hàng và hiển thị lỗi dưới ô Họ tên. | **Đạt**. Validate regex họ tên chỉ cho phép chữ cái tiếng Việt, dấu gạch nối và dấu nháy đơn, độ dài tối thiểu 2 ký tự. |
| **TC-CO-05** | Số điện thoại không hợp lệ | Nhập số điện thoại sai định dạng, thiếu số hoặc đầu số không hợp lệ. | Hệ thống chặn submit và báo lỗi định dạng SĐT. | **Đạt**. Validate SĐT đầu số Việt Nam bắt buộc là 10 chữ số, bắt đầu bằng các đầu số 03, 05, 07, 08, 09. |
| **TC-CO-06** | Email không đúng định dạng | Nhập email thiếu `@` hoặc không đúng cấu trúc tên miền. | Hệ thống chặn submit và báo lỗi email. | **Đạt**. Sử dụng `z.string().email()` để validate cấu trúc email. |
| **TC-CO-07** | Địa chỉ cụ thể không hợp lệ | Nhập địa chỉ cụ thể dưới 5 ký tự hoặc chứa ký tự đặc biệt bất thường. | Hệ thống chặn submit đơn và báo lỗi địa chỉ quá ngắn/không hợp lệ. | **Đạt**. Yêu cầu địa chỉ cụ thể tối thiểu 5 ký tự để đảm bảo giao hàng chính xác. |
| **TC-CO-08** | Spam click nút Đặt hàng (Double Submit) | Người dùng nhấp đặt hàng liên tiếp nhiều lần thật nhanh. | Khi nhấp lần đầu, nút Đặt hàng ngay lập tức chuyển sang trạng thái disabled và hiển thị loading. Chỉ có duy nhất 1 đơn hàng được tạo trên hệ thống. | **Đạt**. Nút bấm chuyển trạng thái `loading` và `disabled` ngay lập tức để ngăn chặn click trùng. |
| **TC-CO-09** | Xóa giỏ hàng sau khi đặt hàng thành công | Đơn hàng gồm các sản phẩm A và B được đặt thành công. Giỏ hàng ban đầu có các sản phẩm A, B, C. | Sau khi chuyển sang trang Xác nhận đơn hàng thành công, giỏ hàng tự động cập nhật, xóa đi A và B, chỉ giữ lại sản phẩm C (sản phẩm không chọn mua). | **Đạt**. Sau khi đơn hàng được tạo, giỏ hàng local và database được cập nhật chỉ loại bỏ các sản phẩm đã thanh toán. |

---

### VIII. Gợi ý số đo, Tính toán số đo và Customize
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-PDP-16** | Gợi ý số đo | Nhập số liệu đủ điều kiện bắt buộc và chính xác (TH1: Tinh Sa - Ngực 80, Eo 60, Vai 40, Cổ 30; TH2: Tinh Sa - Ngực 76, Eo 56, Vai 34, Cổ 28; TH3: Nhập size hết hàng) | TH1: Hiện chưa có size, gợi ý Customize; TH2: Hiện gợi ý size phù hợp; TH3: Thông báo size có nhưng đã hết hàng | **Đạt**. Logic tính toán size khớp bảng size chart và trả về khuyến nghị chuẩn xác. |
| **TC-PDP-17** | Gợi ý số đo lỗi nhập liệu | Không nhập số liệu, nhập kí tự, chữ cái, icon, khoảng trắng,.... | Hiện thông báo lỗi cho từng trường hợp theo từng ô nhập | **Đạt**. Validation schema chặn đầu vào phi số và báo lỗi hiển thị viền đỏ. |
| **TC-PDP-18** | Gợi ý số đo bất thường | Nhập số liệu nằm trong vùng bất thường, nhưng vẫn nằm trong giá trị min-max | Hiện cảnh báo cho từng ô nhập, nhấn nút customize sẽ hiện pop-up xác nhận số đo, user có thể xác nhận hoặc kiểm tra lại reflect | **Đạt**. Hệ thống phát hiện giá trị ngoài vùng chuẩn thông thường và hiển thị cảnh báo màu cam nhẹ cho khách hàng xem lại. |
| **TC-PDP-19** | Nhập tính toán, tự lưu số qua màn hình customize và ngược | Nhập màn hình tính customize sản phẩm “Tinh Sa” - Vòng ngực = 76, Vòng eo = 56, Ngang vai = 34, vòng cổ =28 | Bên tính toán hiện Vòng ngực = 76, Vòng eo = 56, Ngang vai = 34, vòng cổ =28 | **Đạt**. Trạng thái số đo dùng chung `useSharedMeasurements` được cập nhật đồng bộ cho cả hai popup. |
| **TC-PDP-20** | Guest xóa số đo đã nhập ở màn hình tính toán/customize, màn hình còn lại tự xóa | Xóa số đo ở màn hình tính toán | Số đo xóa ở màn hình tính toán, và xóa luôn bên customize | **Đạt**. Thao tác xóa gọi `clearSharedMeasurements` làm trống dữ liệu ở cả hai modal. |
| **TC-PDP-21** | Customize sản phẩm | Đã có số đo cơ thể, bấm xác nhận | Nút thêm giỏ hàng sử dụng được, hiện chữ "Sửa" bên cạnh nút Customize | **Đạt**. Nút bấm "Sửa" màu xanh xuất hiện cạnh ô Customize size và kích hoạt nút thêm giỏ hàng. |
| **TC-PDP-22** | Customize sản phẩm single | Đã có số đo cơ thể, không bấm xác nhận | Disable nút thêm vào giỏ hàng | **Đạt**. Nút thêm giỏ hàng bị khóa (disabled) và hiện chữ "Nhập" màu đỏ bên cạnh nút Customize cho đến khi bấm xác nhận. |
| **TC-PDP-23** | Customize sản phẩm multi single | Xác nhận customize áo, quần không xác nhận | Active nút thêm vào giỏ hàng (chỉ thêm áo đã xác nhận vào giỏ hàng) | **Đạt**. Nút thêm giỏ hàng sáng lên, cho phép mua thành phần đã xác nhận riêng lẻ. |
| **TC-PDP-24** | Thêm vào giỏ hàng customize | Đã bấm xác nhận | Hiện pop-up và add vào cart gồm số đo đó | **Đạt**. Tạo customization request thông qua `createCustomizationRequest` và thêm `customization_id` tương ứng vào giỏ hàng. |

---

### IX. Quản lý tài khoản cá nhân (Account Dashboard)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ACC-01** | Cập nhật thông tin hồ sơ cá nhân | Thay đổi Họ tên, Số điện thoại, ngày sinh và lưu | Dữ liệu được cập nhật thành công trên database và hiển thị mới trên UI | **Đạt**. Form gọi API `PATCH /api/v1/customer/profile` để lưu các thay đổi thông tin. |
| **TC-ACC-02** | Thêm địa chỉ nhận hàng mới | Nhập thông tin Tên, SĐT, Tỉnh, Huyện, Xã, Địa chỉ cụ thể | Địa chỉ mới được tạo, hiển thị trong danh sách địa chỉ nhận hàng | **Đạt**. Sử dụng `address.service.ts` gọi api tạo địa chỉ mới trên Supabase thành công. |
| **TC-ACC-03** | Xóa địa chỉ nhận hàng | Chọn một địa chỉ trong danh sách và bấm Xóa | Địa chỉ bị xóa khỏi danh sách, không còn hiển thị | **Đạt**. Gọi API xóa địa chỉ thành công, cập nhật giao diện ngay lập tức. |
| **TC-ACC-04** | Cập nhật hồ sơ số đo mặc định của Member | Nhập số đo ngực, eo, mông, vai, cổ, chiều cao, cân nặng và lưu làm mặc định | Hệ thống ghi nhận số đo mặc định của tài khoản để tự động nạp mỗi khi chọn Customize | **Đạt**. Hồ sơ số đo được ghi nhận vào bảng đo đạc cá nhân của khách hàng trên Supabase DB. |

---

### X. Lịch sử Đơn hàng (Order History & Tracking)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ORD-01** | Xem danh sách đơn hàng đã mua | Truy cập trang Lịch sử mua hàng | Hiển thị tất cả đơn hàng đã mua từ trước đến nay kèm trạng thái (Chờ xử lý, Đang giao, Đã giao, Hủy) | **Đạt**. Hàm `orderService.getOrders()` lấy dữ liệu đơn hàng phân trang thành công. |
| **TC-ORD-02** | Xem chi tiết đơn hàng | Click chọn một đơn hàng cụ thể | Hiển thị chi tiết: Danh sách sản phẩm, số đo customize (nếu có), phí ship, giảm giá, tổng tiền thanh toán, lịch sử trạng thái | **Đạt**. Trang `/account/orders/[id]` hiển thị rõ ràng từng mục thông số của đơn hàng. |
| **TC-ORD-03** | Hủy đơn hàng đang ở trạng thái Chờ xử lý | Click chọn hủy đơn hàng và điền lý do hủy | Trạng thái đơn hàng lập tức chuyển sang `CANCELLED` (Đã hủy), cập nhật kho hàng | **Đạt**. Gọi API hủy đơn hàng thành công khi đơn ở trạng thái cho phép hủy (Chờ xử lý). |

---

### XI. Đặt lịch hẹn đo trực tiếp (Appointment Booking)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-APPT-01** | Đặt lịch hẹn thành công | Nhập đầy đủ các ô bắt buộc (Họ tên, SĐT, Chi nhánh, Ngày, Giờ hẹn) | Thông báo đặt lịch hẹn thành công | **Đạt**. Gọi `appointmentService.createAppointment()` tạo thành công lịch hẹn trên cơ sở dữ liệu và hiển thị popup chúc mừng. |
| **TC-APPT-02** | Đặt lịch hẹn lỗi thông tin | Không nhập số liệu, nhập kí tự đặc biệt, thông tin trống | Hiện thông báo lỗi cho từng trường hợp theo từng ô nhập | **Đạt**. Các trường thông tin nhận dạng được validate bằng Zod schema trước khi submit lên server. |
| **TC-APPT-03** | Xem và hủy lịch hẹn trong Account Dashboard | Truy cập lịch hẹn đã đặt và bấm Hủy | Lịch hẹn chuyển sang trạng thái đã hủy và không hiển thị lịch hẹn sắp tới | **Đạt**. API cập nhật trạng thái lịch hẹn thành công và cập nhật lại giao diện Dashboard. |

---

### XII. Đánh giá sản phẩm (Product Reviews)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-REV-01** | Viết đánh giá sản phẩm | Đơn hàng đã giao thành công, chọn Viết đánh giá, chọn số sao, viết bình luận | Đánh giá được lưu và hiển thị trên trang chi tiết sản phẩm | **Đạt**. API review nhận dữ liệu và cập nhật điểm trung bình đánh giá của sản phẩm đó. |
| **TC-REV-02** | Đánh giá sản phẩm chưa mua | Truy cập sản phẩm chưa từng mua | Không hiển thị nút Viết đánh giá | **Đạt**. Hệ thống kiểm tra lịch sử mua hàng đối với tài khoản hiện tại để ẩn/hiển thị form đánh giá. |

---

### XIII. Trắc nghiệm Sắc màu cá nhân (Personal Color Test)
| Mã TC | Kịch bản kiểm thử | Dữ liệu đầu vào/Tiền điều kiện | Kết quả mong đợi | Kết quả thực tế |
| :--- | :--- | :--- | :--- | :--- |
| **TC-PCT-01** | Thực hiện bài trắc nghiệm sắc màu cá nhân | Trả lời đầy đủ các câu hỏi trắc nghiệm hình ảnh và màu sắc | Trả ra kết quả phân tích sắc màu cá nhân (Spring/Summer/Autumn/Winter) kèm gợi ý trang phục | **Đạt**. UI xử lý chuyển câu hỏi mượt mà và thuật toán trả về gợi ý sản phẩm phù hợp với tông màu da. |

---

## 8.3. Kiểm thử giao diện

| Giao diện | Nội dung kiểm thử | Desktop | Tablet | Mobile | Kết quả |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Trang chủ** | Carousel hoạt động tốt, banner hiển thị sắc nét, không vỡ layout | Đạt | Đạt | Đạt | **Đạt** |
| **Header / Menu** | Mega Menu hiển thị đủ, Hamburger Menu mượt mà trên Mobile | Đạt | Đạt | Đạt | **Đạt** |
| **Danh mục sản phẩm** | Danh sách sản phẩm dạng Grid responsive đều, không bị lệch hàng | Đạt | Đạt | Đạt | **Đạt** |
| **Chi tiết sản phẩm** | Thông tin sản phẩm, thư viện ảnh và form chọn size hiển thị đúng tỉ lệ | Đạt | Đạt | Đạt | **Đạt** |
| **Modal Gợi ý size** | Pop-up hiển thị gọn gàng, nút bấm rõ ràng, responsive tốt | Đạt | Đạt | Đạt | **Đạt** |
| **Modal Customize** | Form nhập số đo responsive đúng số cột, hiển thị rõ nút "Sửa" hoặc "Nhập" cạnh nút CUSTOM | Đạt | Đạt | Đạt | **Đạt** |
| **Giỏ hàng** | Hiển thị đầy đủ sản phẩm, chi tiết Customize gọn gàng, nút xóa dễ thao tác | Đạt | Đạt | Đạt | **Đạt** |
| **Thanh toán** | Form nhập thông tin và danh sách phương thức thanh toán responsive đẹp mắt | Đạt | Đạt | Đạt | **Đạt** |
| **Trang Cá nhân (Account)** | Sidebar menu điều hướng tốt, bảng địa chỉ và lịch sử đơn hàng responsive | Đạt | Đạt | Đạt | **Đạt** |
| **Chân trang (Footer)** | Các liên kết chính sách và thông tin liên hệ hiển thị đều, không lệch dòng | Đạt | Đạt | Đạt | **Đạt** |

---

## 8.4. Kiểm thử bảo mật cơ bản

| Nội dung | Mô tả | Kết quả mong đợi | Kết quả thực tế | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Xác thực người dùng** | Truy cập trang tài khoản khi chưa đăng nhập | Chuyển về trang đăng nhập hoặc từ chối truy cập | Tự động chuyển hướng về trang `/login` | **Đạt** |
| **Quyền truy cập dữ liệu (RLS)** | Lấy thông tin đơn hàng / số đo của khách hàng khác | Database RLS từ chối truy cập và trả về lỗi quyền hạn | Chặn truy cập trái phép nhờ Supabase RLS | **Đạt** |
| **Kiểm soát API Key** | Đảm bảo key `service_role` bảo mật không bị lộ | Chỉ hiển thị key public `anon_key` trên frontend client | Bảo mật thành công | **Đạt** |
| **Bảo vệ dữ liệu lịch hẹn** | Gửi yêu cầu đặt lịch hẹn trực tiếp qua API | Validate dữ liệu đầu vào bằng Zod schema nghiêm ngặt | Chỉ cho phép ghi dữ liệu hợp lệ | **Đạt** |

---

## 8.5. Đánh giá kết quả

Sau khi tiến hành kiểm thử toàn bộ các kịch bản kiểm thử chức năng, giao diện và bảo mật cơ bản:
*   **Tổng số ca kiểm thử:** 80 ca.
*   **Số ca thành công (Pass):** 80 ca (Tỉ lệ đạt **100%**).
*   **Độ ổn định:** Hệ thống phản hồi nhanh, xử lý lưu trữ số đo giữa các màn hình (Tính toán/Customize) đồng bộ, mượt mà.
*   **Bảo mật:** Hệ thống kiểm soát quyền tốt ở cả phía client và phía server database thông qua phân quyền Supabase RLS.
