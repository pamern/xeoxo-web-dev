# Workflow triển khai feature hủy đơn hàng từ trang tra cứu

## 1. Mục tiêu

Thiết kế workflow cho tính năng hủy đơn hàng trong trang `order lookup` với 2 nhánh xác thực:

- Người dùng tra cứu bằng `email`: gửi email xác nhận hủy đơn, chỉ đổi trạng thái sau khi email đã được verify.
- Người dùng tra cứu bằng `số điện thoại`: mở popup nhập OTP, sau 5 giây tự điền OTP mô phỏng và coi như xác thực thành công để phục vụ demo.

Mục tiêu phụ:

- Giữ UI đang dùng ở `OrderLookupExperience`, `OrderDetailContent`, `CancelOrderButton`.
- Không làm vỡ luồng hủy đơn hiện có ở `/account/orders/[id]`.
- Tách rõ logic demo cho số điện thoại để sau này thay bằng OTP thật.

---

## 2. Phạm vi thay đổi

Repo hiện tại chia làm 2 phần:

- `xeoxo_db`: tài liệu, schema, migration, policy.
- `xeoxo-web-dev`: frontend Next.js và API route của web.

Feature này thực tế sẽ cần thay đổi ở `xeoxo-web-dev`, nhưng tài liệu workflow được lưu tại:

- [branch-feature-tracuu.md](/home/ngocmypzg/Projects/xeoxo_db/docs/report/branch-feature-tracuu.md)

Schema được dùng làm ràng buộc cho workflow này là:

- [database_schema.md](/home/ngocmypzg/Projects/xeoxo_db/docs/database_schema.md)

Nguyên tắc của tài liệu này:

- Không tự ý đề xuất thêm bảng mới.
- Chỉ bám vào các bảng/cột đã có trong `database_schema.md`.
- Phần verify email và OTP demo do Supabase Auth quản lý, không coi đó là thay đổi schema chính thức trong branch này.

---

## 3. Luồng nghiệp vụ mong muốn

## 3.1 Luồng email

Điều kiện kích hoạt:

- Người dùng lookup bằng `mã đơn hàng + email`.
- Email nhập vào khớp với email đặt hàng của đơn.

Luồng:

1. Người dùng bấm `Hủy Đơn Hàng`.
2. Hiện popup confirm.
3. Người dùng bấm `Xác nhận hủy`.
4. Backend không hủy ngay.
5. Backend tạo một `cancel request token`.
6. Backend gửi email xác nhận tới email của đơn hàng.
7. Người dùng mở email và bấm link xác nhận.
8. Backend verify token còn hạn và hợp lệ.
9. Backend thực hiện chuyển trạng thái đơn sang `CANCELLED`.
10. Ghi log/audit.
11. Trả về màn hình thành công hoặc landing page xác nhận thành công.

Kết quả:

- Nếu chưa verify email: đơn chưa bị hủy.
- Chỉ sau khi click link hợp lệ: đơn mới đổi trạng thái.

## 3.2 Luồng số điện thoại

Điều kiện kích hoạt:

- Người dùng lookup bằng `mã đơn hàng + số điện thoại`.
- Số điện thoại nhập vào khớp với số điện thoại nhận hàng hoặc số điện thoại của khách hàng gắn với đơn.

Luồng demo:

1. Người dùng bấm `Hủy Đơn Hàng`.
2. Hiện popup confirm.
3. Người dùng bấm `Xác nhận hủy`.
4. Mở popup OTP.
5. Hiển thị trạng thái `đang gửi OTP`.
6. Sau 5 giây, frontend tự fill một mã OTP mô phỏng.
7. Coi như người dùng nhập đúng OTP.
8. Gọi backend finalize hủy đơn.
9. Backend kiểm tra đơn vẫn còn được phép hủy.
10. Backend chuyển trạng thái đơn sang `CANCELLED`.
11. Refresh lại detail trên trang lookup.

Kết quả:

- Đây là flow demo, không phụ thuộc hạ tầng OTP thật.
- Cần cắm cờ rõ ràng trong code để sau này thay bằng dịch vụ OTP thật.

---

## 4. Workflow kỹ thuật đề xuất

## 4.1 Phân tách các bước

Không nên để nút `CancelOrderButton` gọi thẳng API hủy đơn như hiện tại cho luồng lookup.

Cần tách thành 3 pha:

1. `prepare cancellation`
2. `verify ownership`
3. `finalize cancellation`

Lợi ích:

- Hỗ trợ được cả email và phone.
- Không đổi trạng thái quá sớm.
- Dễ audit và dễ thay thế OTP demo sau này.

## 4.2 API contract đề xuất

### API 1: khởi tạo yêu cầu hủy đơn

`POST /api/v1/orders/{orderId}/cancel/request`

Input:

- `order_code`
- `contact`
- `contact_type`: `email` hoặc `phone`
- `source`: `lookup` hoặc `account`

Xử lý:

- Kiểm tra đơn tồn tại.
- Kiểm tra trạng thái đơn có được phép hủy.
- Kiểm tra contact khớp với đơn.
- Nếu `email`:
  - khởi tạo flow verify email qua Supabase Auth
  - gửi email xác nhận qua Supabase Auth
  - trả về `verification_channel = email`
- Nếu `phone`:
  - khởi tạo challenge OTP demo qua Supabase Auth
  - trả về `verification_channel = phone`

Output ví dụ:

- `status: "pending_email_verification"`
- `status: "pending_phone_otp"`
- `cancel_request_id`

### API 2: xác nhận OTP demo

`POST /api/v1/orders/{orderId}/cancel/verify-otp`

Input:

- `cancel_request_id`
- `otp`

Xử lý:

- Ở giai đoạn demo, phần challenge/verify OTP do Supabase Auth quản lý.
- Backend/web chỉ cần check:
  - challenge còn hiệu lực
  - contact thuộc loại `phone`
  - OTP đã được Supabase Auth xác nhận thành công

Output:

- `status: "verified"`

### API 3: finalize hủy đơn

`POST /api/v1/orders/{orderId}/cancel/finalize`

Input:

- `cancel_request_id`

Xử lý:

- Kiểm tra flow verify từ Supabase Auth đã hoàn tất.
- Kiểm tra `sales_order.order_status` vẫn ở trạng thái cho phép hủy.
- Thực hiện update trực tiếp trên bản ghi đơn hàng hiện có.
- Ghi audit log.

Output:

- `success: true`
- `order_status: "CANCELLED"`

### API 4: xác nhận email qua link

`GET /orders/cancel/confirm?token=...`

Xử lý:

- Verify token qua callback/link của Supabase Auth.
- Gọi cùng logic finalize.
- Render trang thông báo thành công/thất bại.

---

## 5. Cách bám sát schema hiện có

Theo `database_schema.md`, workflow này nên tận dụng các thực thể đã có:

- `CUSTOMER`
  - dùng `email`, `phone` để đối soát contact người dùng nhập
- `SALES_ORDER`
  - dùng `order_id`, `order_code`, `order_status`, `created_at`
- `ADDRESS`
  - có thể dùng `recipient_phone` nếu flow lookup hiện đang map theo thông tin giao hàng

Với ràng buộc không thêm bảng mới, dữ liệu tạm cho 2 flow xác minh nên đi theo hướng:

- email token:
  - dùng cơ chế verify email / link payload của Supabase Auth
- OTP demo:
  - dùng challenge/session OTP do Supabase Auth quản lý
  - frontend chỉ mô phỏng bước tự điền OTP sau 5 giây

Nghĩa là:

- database business chỉ nhận update cuối cùng vào `sales_order.order_status`
- phần verify email/OTP do Supabase Auth quản lý, không được xem là thay đổi schema trong task này

---

## 6. Tận dụng Supabase cho email

## 6.1 Cách dùng

Yêu cầu của user nói email có thể cấu hình trên Supabase, nên workflow nên bám theo khả năng này:

- Dùng SMTP/email config của Supabase project.
- Web app gọi flow verify email của Supabase Auth.
- Không yêu cầu thêm bảng mới trong Postgres để gửi email ở phase này.

## 6.2 Nội dung email

Email xác nhận nên có:

- tiêu đề: `Xác nhận hủy đơn hàng {order_code}`
- nội dung:
  - mã đơn hàng
  - thời gian yêu cầu
  - nút `Xác nhận hủy đơn`
  - thời hạn link

Link trong email:

- trỏ tới route confirm của web app
- không hủy đơn trực tiếp bằng dữ liệu thô
- token/link verify nằm trong flow Supabase Auth

## 6.3 Các rule an toàn

- Không đưa email/số điện thoại raw vào URL.
- Token phải có expiry.
- Token chỉ dùng một lần.
- Nếu email verify xong mà đơn đã đổi trạng thái sang trạng thái không cho hủy nữa, phải báo thất bại an toàn.

---

## 7. Luồng OTP phone demo

## 7.1 Mục tiêu demo

Vì chưa có hạ tầng OTP thật, mục tiêu là mô phỏng trải nghiệm:

- có popup OTP
- có countdown/chờ gửi
- có auto fill sau 5 giây
- vẫn đi qua backend theo các bước verify/finalize
- không thêm bảng OTP riêng trong schema business hiện tại

## 7.2 Workflow UI

1. Confirm popup đóng.
2. Mở OTP modal.
3. Hiển thị text kiểu:
   - `Đang gửi mã xác nhận tới số điện thoại của bạn`
4. Sau 5 giây:
   - auto fill OTP demo vào input
   - auto submit verify qua Supabase Auth
5. Nếu thành công:
   - đóng modal
   - refresh data
   - hiển thị toast/thông báo thành công

## 7.3 Cờ kỹ thuật

Nên có cờ rõ ràng để phân biệt demo:

- `NEXT_PUBLIC_ENABLE_DEMO_PHONE_OTP=true`

Hoặc response backend trả về:

- `otp_mode: "demo_auto_fill"`

Để sau này thay flow thật mà không phải viết lại UI từ đầu. Phần challenge/verify vẫn để Supabase Auth giữ.

---

## 8. Thay đổi frontend cụ thể

## 8.1 `CancelOrderButton`

Hiện tại component này đang:

- mở modal confirm
- bấm xác nhận là gọi hủy đơn ngay

Cần đổi thành state machine nhỏ:

- `idle`
- `confirming`
- `sending_email`
- `otp_pending`
- `verifying_otp`
- `success`
- `error`

## 8.2 Input context từ lookup

`CancelOrderButton` trong lookup cần biết thêm:

- contact người dùng đã nhập
- contact type là email hay phone
- source = `lookup`

Do đó có thể cần truyền thêm props từ `OrderLookupExperience` xuống `OrderDetailContent`, rồi xuống `CancelOrderButton`.

Props gợi ý:

- `cancelContext?: {`
- `orderCode: string`
- `contact: string`
- `contactType: "email" | "phone"`
- `source: "lookup" | "account"`
- `}`

## 8.3 Với trang account

Trang `/account/orders/[id]` có thể giữ flow đơn giản hơn:

- nếu business muốn account page vẫn hủy trực tiếp: giữ logic cũ
- nếu muốn đồng bộ hoàn toàn: cũng dùng chung flow request/verify/finalize

Khuyến nghị:

- đồng bộ cả 2 nơi về cùng một backend flow
- nhưng `account` source có thể được đánh dấu là already trusted nếu business cho phép

---

## 9. Thay đổi backend cụ thể

## 9.1 Validate ownership trong lookup

Cần thêm hàm phân loại contact:

- nếu chứa `@` và qua regex cơ bản: `email`
- nếu là chuỗi số hợp lệ: `phone`

Sau đó match với dữ liệu đơn:

- email: match `CUSTOMER.email`
- phone: match `CUSTOMER.phone`, hoặc nếu service lookup hiện đang trả thông tin giao hàng thì có thể match thêm `ADDRESS.recipient_phone` / phone ở shipping snapshot đang có trong web layer

Sau khi match xong:

- email flow chuyển sang verify qua Supabase Auth
- phone flow chuyển sang OTP demo qua Supabase Auth

## 9.2 Validate quyền hủy

Chỉ cho phép nếu order status nằm trong tập như hiện tại:

- `PENDING`
- `CONFIRMED`
- `PACKING`

Nếu không còn hợp lệ:

- trả lỗi business rõ ràng

## 9.3 Update trạng thái

Finalize phải:

- transaction-safe
- check trạng thái hiện tại ngay trước lúc update
- update đúng `sales_order.order_status`
- nếu schema hiện tại chưa có cột audit/cancel riêng trong `database_schema.md`, chưa đưa vào phạm vi migration của task này

---

## 10. Trình tự triển khai đề xuất

### Phase 1: chuẩn bị API và logic tạm

1. Chốt cách dùng Supabase Auth cho:
   - email verify
   - OTP phone demo
2. Không tạo migration schema business mới.
3. Viết backend service:
   - create request
   - verify email token
   - verify phone OTP demo
   - finalize cancellation

### Phase 2: email flow

1. Tạo mail template.
2. Cấu hình Supabase SMTP/email.
3. Tạo route confirm qua token.
4. Test các case:
   - token đúng
   - token hết hạn
   - token dùng lại
   - đơn không còn được phép hủy

### Phase 3: phone OTP demo

1. Tạo OTP modal.
2. Tạo response mode `demo_auto_fill`.
3. Sau 5s auto fill + auto verify.
4. Test lại toàn bộ luồng refresh UI.

### Phase 4: nối vào UI hiện tại

1. Truyền `cancelContext` từ lookup page.
2. Cập nhật `CancelOrderButton`.
3. Giữ popup confirm hiện tại, sau đó rẽ nhánh:
   - email
   - phone

### Phase 5: hardening

1. Throttle request theo order/contact.
2. Mask email/phone ở response UI.
3. Add audit log.
4. Thêm cleanup job cho request hết hạn.

---

## 11. Test cases bắt buộc

### Email

- Đúng email, click confirm hợp lệ, đơn bị hủy.
- Đúng email nhưng không click email, đơn không bị hủy.
- Sai email, không tạo request.
- Link hết hạn, không hủy.
- Link đã dùng, không hủy lần 2.

### Phone demo

- Đúng phone, hiện OTP modal, sau 5s auto fill, đơn bị hủy.
- Sai phone, không mở OTP flow thành công.
- Đơn không còn ở trạng thái cho hủy, verify xong vẫn không update.

### Chung

- Sau khi hủy thành công, UI refresh đúng.
- Nút hủy biến mất nếu trạng thái đổi sang không còn cho hủy.
- Không tạo được nhiều request finalize song song cho cùng một đơn.

---

## 12. Rủi ro và lưu ý

- `iam.customer.email` và `phone` theo tài liệu schema có thể không unique, nên không được dùng contact một mình để xác định order; luôn phải đi cùng `order_code` hoặc `order_id`.
- Supabase Auth quản lý phần verify email và OTP; backend business chỉ nên quyết định khi nào được phép finalize hủy đơn.
- OTP phone hiện chỉ là demo, cần tách riêng bằng config để không bị hiểu nhầm là flow production-ready.
- Nếu giữ 2 logic khác nhau giữa `lookup` và `account`, về sau sẽ dễ lệch behavior. Nên gom chung service backend càng sớm càng tốt.
- Vì không thêm bảng mới, expiry/challenge/session nên tận dụng cơ chế sẵn có của Supabase Auth.

---

## 13. Kết luận đề xuất

Workflow nên triển khai theo hướng:

- `lookup cancel` không hủy trực tiếp
- luôn đi qua bước request/verify/finalize
- `email` thì verify bằng link mail rồi mới finalize
- `phone` thì verify bằng OTP modal demo rồi finalize
- cả 2 bước verify đều để Supabase Auth quản lý

Hướng này đáp ứng đúng yêu cầu demo hiện tại, đồng thời vẫn bám sát các bảng đã có trong [database_schema.md](/home/ngocmypzg/Projects/xeoxo_db/docs/database_schema.md) mà không mở thêm bảng mới ngoài phạm vi task.
