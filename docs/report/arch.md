# 7. Kiến trúc và triển khai hệ thống XEOXO Web

Tài liệu này tóm tắt kiến trúc hiện tại của dự án XEOXO Web dựa trên mã nguồn trong `src/`, cấu hình dự án và các tài liệu đang có trong `docs/api/`, `docs/database/`, `docs/uiux/`. Mục tiêu là mô tả đúng hiện trạng triển khai của hệ thống web, không mở rộng sang các thành phần ngoài phạm vi repo này.

## 7.1. Công nghệ sử dụng

Hệ thống XEOXO Web được xây dựng theo mô hình web application hiện đại với frontend và backend cùng nằm trong một dự án Next.js. Bộ công nghệ chính đang được sử dụng gồm:

- `Next.js 15.2.3`: framework chính để xây dựng ứng dụng web, cung cấp App Router, server component, route handler và tối ưu hóa render theo từng trang.
- `React 19`: thư viện xây dựng giao diện người dùng theo hướng component-based.
- `TypeScript 5.7`: ngôn ngữ lập trình chính, giúp chuẩn hóa type giữa page, component, hook, service, API route và feature service.
- `Tailwind CSS 3.4`: dùng để xây dựng giao diện theo utility class, kết hợp với `tailwind-merge` để xử lý class động.
- `Zod`: dùng để validate dữ liệu đầu vào ở các form phía client và ở request body/query phía API.
- `@tanstack/react-query`: dùng cho các luồng fetch, cache, refetch dữ liệu phía client, đặc biệt phù hợp với các màn hình cần đồng bộ trạng thái như cart, order, profile.
- `Zustand`: dùng cho state cục bộ phía client, ví dụ giỏ hàng hoặc trạng thái giao diện cần chia sẻ.
- `Supabase`: là nền tảng backend chính cho dữ liệu và xác thực, bao gồm:
  - `Supabase Auth` cho đăng nhập, session, OAuth, OTP/email flow.
  - `Supabase PostgreSQL` cho cơ sở dữ liệu nghiệp vụ.
  - `Supabase Storage` cho lưu trữ media sản phẩm.
  - `@supabase/ssr` và `@supabase/supabase-js` để kết nối Supabase ở cả browser, server component, middleware và API route.
- `Prisma 6.1`: đã được cấu hình trong repo để hỗ trợ client ORM và script database, tuy nhiên phần luồng nghiệp vụ chính hiện tại đang ưu tiên đi qua Supabase client và các API/feature service.
- `jose`: hỗ trợ các tác vụ liên quan JWT trong môi trường Next.js.
- `bcryptjs`: hỗ trợ các tác vụ mã hóa/so khớp mật khẩu khi cần.
- `ESLint`, `Prettier`, `prettier-plugin-tailwindcss`: phục vụ kiểm soát chất lượng code và chuẩn hóa format.

Về mặt tổ chức giao diện, dự án đang đi theo hướng atomic design, chia thành `atoms`, `molecules`, `organisms`, `templates` trong `src/components/`. Điều này giúp tái sử dụng tốt các thành phần như `Button`, `ProductCard`, `SiteHeader`, `CheckoutForm`, `ProductDetail`, đồng thời bám sát tài liệu `docs/uiux/figma-component-architecture.md`.

## 7.2. Kiến trúc hệ thống

### 7.2.1. Mô hình tổng thể

Kiến trúc hệ thống được tổ chức theo dạng nhiều lớp trong cùng một codebase Next.js. Luồng xử lý chuẩn của dự án được mô tả như sau:

```text
Page
-> Component
-> Hook (khi cần client state/fetch/submit)
-> Frontend Service
-> API Route
-> Validation
-> Feature Service
-> Supabase / Database
-> API Response
-> Hook cập nhật state
-> Component render lại UI
```

Điểm quan trọng của kiến trúc này là tách rõ trách nhiệm:

- `src/app/`: chứa page và API route.
- `src/components/`: chỉ tập trung vào giao diện.
- `src/hooks/`: quản lý loading, error, refetch, submit và state phía client.
- `src/services/`: gọi các endpoint `/api/...` từ frontend.
- `src/features/`: chứa logic nghiệp vụ phía server và truy cập dữ liệu Supabase.
- `src/validations/`: định nghĩa schema validate bằng Zod.
- `src/lib/`: chứa helper chung như auth, response, cache, Supabase client.

### 7.2.2. Kiến trúc frontend

Frontend được xây dựng bằng Next.js App Router, trong đó mỗi page tập trung vào điều phối dữ liệu và ghép layout, còn phần hiển thị được tách thành component tái sử dụng. Các màn hình như trang chủ, danh mục, chi tiết sản phẩm, giỏ hàng, đăng nhập, lịch hẹn và hồ sơ khách hàng đều đang đi theo pattern này.

Kiến trúc component hiện tại có các đặc điểm:

- Page không chứa business logic dài.
- Component không gọi Supabase trực tiếp.
- Các component lớn như `ProductDetail`, `CheckoutForm`, `AccountOrderHistory`, `AppointmentForm` nhận dữ liệu qua props hoặc hook.
- Atomic design giúp thống nhất cách tái sử dụng UI giữa nhiều màn hình.

Phía client, các hook như `useCart`, `useCheckout`, `useAuth`, `useOrderHistory`, `useAddresses` đóng vai trò kết nối giữa giao diện và service layer. Cách tổ chức này giúp frontend không phụ thuộc trực tiếp vào chi tiết API route hoặc database schema.

### 7.2.3. Kiến trúc backend trong Next.js

Backend của web được triển khai ngay trong dự án thông qua Next.js Route Handlers tại `src/app/api/`. Các endpoint được đặt dưới base path `/api/v1` theo quy định trong `docs/api/API_RULES.md`.

API route thực hiện các nhiệm vụ chính:

- nhận request và đọc path/query/body;
- xác thực người dùng nếu API là protected;
- validate dữ liệu đầu vào;
- gọi feature service để xử lý nghiệp vụ;
- trả response thống nhất về frontend.

Trong phần cài đặt thực tế, helper `src/lib/api-response.ts` đang chuẩn hóa response theo dạng:

```json
{
  "success": true,
  "data": {},
  "message": "..."
}
```

hoặc:

```json
{
  "success": false,
  "message": "...",
  "error": null
}
```

Như vậy, hệ thống có một lớp chuẩn hóa response riêng để frontend xử lý nhất quán, dù tài liệu API rule tổng quát hiện vẫn còn mô tả một format body khác. Đây là điểm cần lưu ý khi đối chiếu giữa docs và implementation.

### 7.2.4. Tích hợp xác thực và session

Hệ thống dùng Supabase Auth cho các flow xác thực. Cấu trúc hiện tại có ba lớp client Supabase chính:

- `src/lib/supabase/client.ts`: browser client cho client-side flow.
- `src/lib/supabase/server.ts`: server client cho server component và API route.
- `src/lib/supabase/admin.ts`: admin client dùng `SUPABASE_SERVICE_ROLE_KEY` cho các tác vụ backend nhạy cảm.

Ngoài ra, `src/middleware.ts` kết hợp với `src/lib/supabase/middleware.ts` để làm mới session cookie ở tầng middleware. Cách làm này giúp:

- duy trì phiên đăng nhập ổn định giữa browser và server render;
- cho phép route/server component đọc đúng trạng thái auth;
- giảm rủi ro sai lệch session giữa request client và request server.

### 7.2.5. Đặc điểm kiến trúc nghiệp vụ

Một số đặc điểm kiến trúc nổi bật của hệ thống hiện tại gồm:

- Dữ liệu public như collection, product line, color, material có thể được đọc theo hướng public-safe.
- Dữ liệu cá nhân như customer, address, reward, cart, order, measurement profile được bảo vệ bằng RLS và ownership rule.
- Các nghiệp vụ nhiều bước như checkout không xử lý hoàn toàn ở frontend mà được đẩy về backend/service role và transaction trong database.
- Inventory không được frontend truy cập trực tiếp; trạng thái mua được phải đi qua backend.

Nhờ đó, kiến trúc hệ thống cân bằng giữa hiệu năng render của Next.js, tính tái sử dụng của frontend component và tính an toàn dữ liệu ở backend/database.

## 7.3. Xây dựng cơ sở dữ liệu

### 7.3.1. Nền tảng dữ liệu

Cơ sở dữ liệu của hệ thống được triển khai trên PostgreSQL thông qua Supabase. Database không chỉ dùng để lưu trữ dữ liệu sản phẩm và người dùng, mà còn đóng vai trò trung tâm cho các nghiệp vụ thương mại điện tử như giỏ hàng, đơn hàng, thanh toán, địa chỉ giao hàng, loyalty và may đo.

Theo tài liệu `docs/database/schema_access_control.md`, dữ liệu được chia thành nhiều schema nghiệp vụ:

- `iam`: tài khoản, khách hàng, địa chỉ, loyalty, tỉnh thành, nhân viên.
- `catalog`: danh mục, bộ sưu tập, dòng sản phẩm, variant, màu sắc, chất liệu, size chart, media, personal color.
- `inventory`: tồn kho theo biến thể.
- `sales`: cart, cart item, order, payment, shipping, refund, review.
- `customization`: yêu cầu may đo, lịch hẹn, hồ sơ số đo.
- `support`: dữ liệu hỗ trợ khách hàng.
- `metadata`, `util`: metadata kỹ thuật và function dùng chung.

Việc tách schema như vậy giúp chia rõ phạm vi dữ liệu, thuận tiện cho việc đặt quyền, quản lý migration và tổ chức nghiệp vụ.

### 7.3.2. Cấu trúc dữ liệu chính

Database của hệ thống bao phủ các nhóm dữ liệu quan trọng sau:

- Dữ liệu người dùng: `account`, `customer`, `address`, `province`, `loyalty_tier`, `loyalty_reward`, `reward_usage`.
- Dữ liệu catalog: `category`, `collection`, `product_line`, `line_category`, `product_component`, `product_variant`, `color`, `material`, `size_chart`, `size_option`, `size_measurement`, `media`.
- Dữ liệu giao dịch: `cart`, `cart_item`, `sales_order`, `order_item`, `payment`, `payment_method`, `shipping`, `review`.
- Dữ liệu may đo: `customization_request`, `measurement_appointment`, `measurement_profile`, `measurement_profile_detail`.

Thiết kế này phản ánh một hệ thống thương mại điện tử có yếu tố thời trang may đo, trong đó dữ liệu sản phẩm không chỉ dừng ở SKU cơ bản mà còn bao gồm màu sắc, chất liệu, bảng size, thành phần sản phẩm và luồng tư vấn personal color.

### 7.3.3. Kiểm soát truy cập dữ liệu

Một điểm quan trọng trong cách xây dựng database là sử dụng Row Level Security (RLS). Theo `docs/database/web_access_spec.md`, hệ thống đã triển khai:

- RLS cho nhóm catalog public để chỉ expose dữ liệu hợp lệ như sản phẩm `ACTIVE`, collection `ACTIVE`, material `is_active = true`.
- RLS owner-based cho dữ liệu cá nhân:
  - `iam.customer`
  - `iam.address`
  - `iam.loyalty_reward`
  - `iam.reward_usage`
  - `sales.cart`
  - `sales.cart_item`
  - `sales.sales_order`
  - `sales.order_item`
  - `customization.measurement_profile`
  - `customization.measurement_profile_detail`

Hệ thống còn có helper function `util.current_customer_id()` để map `auth.uid()` sang `customer_id`, nhờ đó policy owner-based có thể viết rõ ràng hơn và tái sử dụng được giữa nhiều bảng.

Vai trò dữ liệu được phân theo 4 nhóm chính:

- `postgres`: dùng cho migration và thao tác kỹ thuật cấp cao.
- `service_role`: dùng cho backend nội bộ, có thể bypass RLS.
- `authenticated`: người dùng đã đăng nhập, chỉ được thao tác dữ liệu của chính mình.
- `anon`: người dùng chưa đăng nhập, chỉ được đọc dữ liệu public hoặc thao tác giới hạn.

### 7.3.4. Tối ưu truy vấn và lớp truy cập web

Ngoài schema và policy, lớp truy cập dữ liệu cho web còn được tối ưu bằng:

- index riêng cho frontend ở các bảng như `catalog.category`, `catalog.product_line`, `catalog.product_variant`, `sales.cart`, `sales.sales_order`, `iam.address`;
- view và grant phù hợp cho web client;
- phân biệt rõ dữ liệu frontend có thể đọc trực tiếp và dữ liệu buộc phải đi qua backend.

Ví dụ:

- Inventory không cho frontend truy cập trực tiếp.
- Một số flow auth và customer profile cần quyền `service_role` trên schema `iam`.
- Flow checkout sử dụng hàm `sales.checkout_order(...)` dạng `SECURITY DEFINER`, chỉ cho `service_role` thực thi.

Điều này cho thấy database không chỉ được dùng như nơi lưu bảng dữ liệu, mà còn tham gia trực tiếp vào việc đảm bảo tính nhất quán và an toàn của nghiệp vụ.

### 7.3.5. Transaction trong nghiệp vụ đặt hàng

Luồng checkout là ví dụ rõ nhất cho cách xây dựng database theo hướng nghiệp vụ. Theo tài liệu triển khai checkout, khi tạo đơn hàng hệ thống cần:

1. khóa cart và các bản ghi inventory liên quan;
2. kiểm tra lại giá và khả năng mua của variant;
3. tạo order, order item, shipping, payment;
4. trừ tồn kho;
5. đánh dấu reward đã sử dụng nếu có;
6. xóa hoặc consume cart item;
7. rollback toàn bộ nếu một bước bất kỳ thất bại.

Việc gom các bước này vào transaction ở tầng database giúp tránh lỗi lệch dữ liệu giữa order, payment, inventory và loyalty reward.

## 7.4. Triển khai hệ thống

### 7.4.1. Mô hình triển khai hiện tại

Dựa trên cấu hình repo, hệ thống đang được chuẩn bị để triển khai dưới dạng một ứng dụng Next.js kết nối tới dịch vụ Supabase ở bên ngoài. Kiến trúc triển khai thực tế có thể mô tả như sau:

```text
Người dùng
-> Trình duyệt
-> Next.js Web App
-> API Route / Server Components / Middleware
-> Supabase Auth + PostgreSQL + Storage
```

Trong mô hình này:

- frontend và backend web cùng nằm trong một ứng dụng Next.js;
- database, auth và storage được đặt trên Supabase;
- các API route nội bộ đóng vai trò trung gian giữa UI và dữ liệu nhạy cảm;
- middleware xử lý duy trì session trước khi request đi sâu vào page hoặc API.

### 7.4.2. Cấu hình môi trường

Từ cấu hình hiện tại, các biến môi trường quan trọng gồm:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Trong đó:

- `NEXT_PUBLIC_*` được dùng cho browser client và server client SSR.
- `SUPABASE_SERVICE_ROLE_KEY` chỉ dùng cho backend nội bộ và tuyệt đối không được đưa ra frontend.

`next.config.ts` cũng đã cấu hình `images.remotePatterns` để cho phép `next/image` đọc ảnh từ Supabase Storage, bao gồm:

- môi trường local storage giả lập tại `localhost:15431` hoặc `127.0.0.1:15431`;
- bucket cloud có đường dẫn `/storage/v1/object/public/product-media/**` lấy theo `NEXT_PUBLIC_SUPABASE_URL`.

Điều này cho thấy dự án đã tính đến cả môi trường phát triển cục bộ lẫn môi trường sử dụng Supabase cloud.

### 7.4.3. Quy trình build và chạy

Theo `package.json`, dự án đang hỗ trợ các lệnh chính:

- `npm run dev`: chạy môi trường phát triển.
- `npm run build`: build production.
- `npm run start`: chạy ứng dụng đã build.
- `npm run lint`: kiểm tra code style và rule.

Ngoài ra còn có nhóm lệnh Prisma như `db:generate`, `db:migrate`, `db:push`, `db:seed`, `db:studio`, phục vụ nhu cầu thao tác schema hoặc dữ liệu phụ trợ nếu cần. Tuy nhiên, dữ liệu vận hành chính của web hiện vẫn bám chặt vào Supabase.

### 7.4.4. Session, auth và bảo mật khi triển khai

Khi triển khai, middleware của Next.js sẽ gọi `updateSession()` để đồng bộ cookie session của Supabase. Cách triển khai này mang lại một số lợi ích:

- request SSR và request từ client nhìn thấy cùng trạng thái đăng nhập;
- route protected có thể kiểm tra auth trước khi xử lý nghiệp vụ;
- giảm lỗi do session hết hạn nhưng cookie chưa được refresh đúng lúc.

Mặt khác, dự án cũng phân tách rõ quyền khi triển khai:

- client chỉ dùng anon key/public-safe access;
- server route có thể dùng server client theo cookie;
- tác vụ đặc quyền như checkout atomic hoặc xử lý nghiệp vụ nhạy cảm dùng service role ở backend.

### 7.4.5. Nhận xét về mức độ hoàn thiện triển khai

Từ repo hiện tại có thể kết luận:

- hệ thống đã sẵn sàng cho mô hình triển khai web app hiện đại với Next.js và Supabase;
- phần kết nối ảnh, auth, session và truy cập database đã được thiết kế tương đối đầy đủ;
- lớp database access cho web đã có RLS, index, grant và function hỗ trợ;
- chưa thấy trong repo này các file manifest triển khai riêng như `Dockerfile`, `docker-compose.yml`, `vercel.json` hoặc workflow CI/CD, nên quá trình deploy hiện tại nhiều khả năng đang phụ thuộc vào nền tảng host và cấu hình môi trường bên ngoài.

Vì vậy, có thể xem hệ thống đã hoàn thiện tốt ở mức kiến trúc ứng dụng và tích hợp dữ liệu, nhưng tài liệu hóa hoặc tự động hóa quy trình triển khai hạ tầng vẫn còn có thể bổ sung thêm nếu cần mở rộng về vận hành.
