# Danh sách API Dự án XEOXO Web

Tài liệu này tổng hợp toàn bộ các điểm cuối API của hệ thống XEOXO Web, được định dạng theo cấu trúc: **Resource, Action, HTTP method, Endpoint**.

---

### 1. Auth (Xác thực tài khoản)

*   **Resource**: Auth
    *   **Action**: Đăng ký tài khoản mới bằng Email/SĐT và mật khẩu
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/auth/signup`
    *   **Ghi chú**: Flow đăng ký bằng SĐT được xử lý qua server để cho phép đăng nhập lại ngay mà không cần xác minh SMS ở phía người dùng.

*   **Resource**: Auth
    *   **Action**: Đăng nhập bằng Email/SĐT và mật khẩu
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/auth/signin`

*   **Resource**: Auth
    *   **Action**: Đăng xuất tài khoản, xóa session
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/auth/signout`

*   **Resource**: Auth
    *   **Action**: Callback xử lý đăng nhập qua mạng xã hội (OAuth)
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/auth/callback`

---

### 2. Products & Collections (Sản phẩm & Bộ sưu tập)

*   **Resource**: Product
    *   **Action**: Lấy danh sách sản phẩm (tìm kiếm, lọc theo giá/size/màu/bộ lọc)
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/products`

*   **Resource**: Product
    *   **Action**: Lấy chi tiết sản phẩm theo đường dẫn thân thiện (slug)
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/products/[slug]`

*   **Resource**: Product Line
    *   **Action**: Lấy thông tin dòng sản phẩm (Product Line) theo ID
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/product-lines/[id]`

*   **Resource**: Collection
    *   **Action**: Lấy danh sách tất cả các bộ sưu tập
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/collections`

*   **Resource**: Collection
    *   **Action**: Lấy thông tin chi tiết bộ sưu tập theo slug
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/collections/[slug]`

---

### 3. Cart & Cart Items (Giỏ hàng)

*   **Resource**: Cart
    *   **Action**: Lấy thông tin giỏ hàng hiện tại của người dùng/session
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/cart`

*   **Resource**: Cart
    *   **Action**: Xóa toàn bộ sản phẩm khỏi giỏ hàng
    *   **HTTP method**: `DELETE`
    *   **Endpoint**: `/api/v1/cart`

*   **Resource**: Cart Item
    *   **Action**: Thêm sản phẩm (hoặc thành phần may đo) vào giỏ hàng
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/cart/items`

*   **Resource**: Cart Item
    *   **Action**: Cập nhật số lượng của một sản phẩm trong giỏ hàng
    *   **HTTP method**: `PATCH`
    *   **Endpoint**: `/api/v1/cart/items/[id]`

*   **Resource**: Cart Item
    *   **Action**: Xóa một sản phẩm khỏi giỏ hàng
    *   **HTTP method**: `DELETE`
    *   **Endpoint**: `/api/v1/cart/items/[id]`

---

### 4. Customization Requests (Yêu cầu May đo)

*   **Resource**: Customization Request
    *   **Action**: Tạo yêu cầu may đo mới (lưu trữ thông số đo cơ thể cho sản phẩm)
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/customization-requests`

*   **Resource**: Customization Request
    *   **Action**: Lấy thông tin chi tiết yêu cầu may đo theo ID
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/customization-requests/[id]`

---

### 5. Orders & Payments (Đơn hàng & Thanh toán)

*   **Resource**: Order
    *   **Action**: Lấy danh sách đơn hàng đã mua của khách hàng đăng nhập
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/orders`

*   **Resource**: Order
    *   **Action**: Tạo đơn hàng mới từ giỏ hàng (Checkout)
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/orders`

*   **Resource**: Order
    *   **Action**: Lấy thông tin chi tiết của một đơn hàng cụ thể theo ID
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/orders/[id]`

*   **Resource**: Order
    *   **Action**: Yêu cầu hủy đơn hàng (khi đơn hàng ở trạng thái Chờ xử lý)
    *   **HTTP method**: `PATCH`
    *   **Endpoint**: `/api/v1/orders/[id]/cancel`

*   **Resource**: Payment Method
    *   **Action**: Lấy danh sách các phương thức thanh toán khả dụng (COD, Chuyển khoản...)
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/payment-methods`

---

### 6. Customer Profile & Addresses (Hồ sơ & Địa chỉ khách hàng)

*   **Resource**: Customer Profile
    *   **Action**: Lấy thông tin cá nhân của khách hàng đăng nhập
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/customers/profile`

*   **Resource**: Customer Profile
    *   **Action**: Cập nhật thông tin cá nhân của khách hàng đăng nhập
    *   **HTTP method**: `PATCH`
    *   **Endpoint**: `/api/v1/customers/profile`

*   **Resource**: Address
    *   **Action**: Lấy danh sách địa chỉ nhận hàng của khách hàng đăng nhập
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/addresses`

*   **Resource**: Address
    *   **Action**: Thêm mới một địa chỉ nhận hàng
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/addresses`

*   **Resource**: Address
    *   **Action**: Cập nhật thông tin một địa chỉ nhận hàng cụ thể theo ID
    *   **HTTP method**: `PATCH`
    *   **Endpoint**: `/api/v1/addresses/[id]`

*   **Resource**: Address
    *   **Action**: Xóa một địa chỉ nhận hàng cụ thể theo ID
    *   **HTTP method**: `DELETE`
    *   **Endpoint**: `/api/v1/addresses/[id]`

---

### 7. Measurement Profiles (Hồ sơ Số đo mặc định)

*   **Resource**: Measurement Profile
    *   **Action**: Lấy thông tin hồ sơ số đo mặc định của thành viên đăng nhập
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/measurement-profiles`

*   **Resource**: Measurement Profile
    *   **Action**: Lưu hoặc cập nhật hồ sơ số đo mặc định của thành viên đăng nhập
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/measurement-profiles`

---

### 8. Measurement Appointments (Đặt lịch hẹn đo đạc)

*   **Resource**: Appointment Branch
    *   **Action**: Lấy danh sách các chi nhánh của cửa hàng
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/branches`

*   **Resource**: Measurement Appointment
    *   **Action**: Lấy danh sách lịch hẹn đo đạc của khách hàng đăng nhập
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/measurement-appointments`

*   **Resource**: Measurement Appointment
    *   **Action**: Đăng ký đặt lịch hẹn đo đạc trực tiếp mới
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/measurement-appointments`

*   **Resource**: Measurement Appointment
    *   **Action**: Hủy lịch hẹn đo đạc đã đặt theo ID
    *   **HTTP method**: `PATCH`
    *   **Endpoint**: `/api/v1/measurement-appointments/[id]/cancel`

---

### 9. Provinces & Localities (Đơn vị Hành chính)

*   **Resource**: Province
    *   **Action**: Lấy danh sách các Tỉnh/Thành phố
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/provinces`

*   **Resource**: District
    *   **Action**: Lấy danh sách các Quận/Huyện của một Tỉnh/Thành phố
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/provinces/[province_id]/districts`

*   **Resource**: Ward
    *   **Action**: Lấy danh sách các Phường/Xã của một Quận/Huyện
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/provinces/[province_id]/districts/[district_id]/wards`

---

### 10. Reviews (Đánh giá & Phản hồi)

*   **Resource**: Review
    *   **Action**: Lấy danh sách các đánh giá của một sản phẩm
    *   **HTTP method**: `GET`
    *   **Endpoint**: `/api/v1/reviews`

*   **Resource**: Review
    *   **Action**: Gửi đánh giá (số sao & nội dung) cho sản phẩm đã mua thành công
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/reviews`

---

### 11. Personal Color Analysis (Trắc nghiệm Sắc màu Cá nhân)

*   **Resource**: Personal Color Result
    *   **Action**: Gửi kết quả trắc nghiệm và lấy gợi ý trang phục phù hợp sắc da
    *   **HTTP method**: `POST`
    *   **Endpoint**: `/api/v1/personal-color`
