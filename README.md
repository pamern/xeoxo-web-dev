# XEOXO Web Redesign

Dự án redesign website thương mại điện tử thời trang Xéo Xọ do nhóm phát triển độc lập thực hiện, sử dụng Next.js, React, TypeScript, Tailwind CSS và Supabase.

Đây là sản phẩm thiết kế và phát triển lại giao diện, trải nghiệm người dùng cùng các luồng chức năng phục vụ mục đích học tập, nghiên cứu và trình bày năng lực của nhóm. Dự án không phải website chính thức và không đại diện cho Xéo Xọ.

Ứng dụng mô phỏng toàn bộ hành trình mua sắm trực tuyến: khám phá sản phẩm và bộ sưu tập, lựa chọn biến thể, quản lý giỏ hàng, thanh toán, theo dõi đơn hàng, quản lý tài khoản và đặt lịch hẹn.

## Tính năng chính

- Duyệt, tìm kiếm, lọc và sắp xếp sản phẩm theo danh mục hoặc bộ sưu tập.
- Xem chi tiết sản phẩm, lựa chọn biến thể, kích thước và tùy chỉnh sản phẩm.
- Quản lý giỏ hàng và xem trước thông tin thanh toán.
- Đăng ký, đăng nhập và xác thực tài khoản bằng Supabase Auth.
- Quản lý hồ sơ khách hàng, địa chỉ nhận hàng và số đo cá nhân.
- Tạo, tra cứu, theo dõi và hủy đơn hàng.
- Đặt lịch hẹn, quản lý đánh giá và chương trình khách hàng thân thiết.
- Trải nghiệm Personal Color và các nội dung giới thiệu thương hiệu.

## Công nghệ sử dụng

- [Next.js 15](https://nextjs.org/) với App Router
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Zustand](https://zustand.docs.pmnd.rs/)
- [Zod](https://zod.dev/)

## Yêu cầu hệ thống

- Node.js 20 trở lên
- npm 10 trở lên
- Một dự án Supabase và các khóa truy cập tương ứng

## Cài đặt

1. Cài đặt các gói phụ thuộc:

   ```bash
   npm install
   ```

2. Sao chép tệp cấu hình môi trường mẫu:

   ```bash
   cp .env.example .env.local
   ```

3. Cập nhật các biến môi trường trong `.env.local`:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

   Không đưa `.env.local` hoặc các khóa bí mật lên hệ thống quản lý phiên bản.

4. Khởi chạy môi trường phát triển:

   ```bash
   npm run dev
   ```

5. Truy cập ứng dụng tại [http://localhost:3000](http://localhost:3000).

## Các lệnh hữu ích

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` | Khởi chạy máy chủ phát triển |
| `npm run build` | Tạo bản dựng production |
| `npm run start` | Chạy bản dựng production |
| `npm run lint` | Kiểm tra mã nguồn bằng ESLint |
| `npm run format` | Định dạng mã nguồn trong thư mục `src` bằng Prettier |

## Cấu trúc thư mục

```text
src/
├── app/          # Trang, layout và API routes theo App Router
├── components/   # Thành phần giao diện theo Atomic Design
├── constants/    # Hằng số và cấu hình dùng chung
├── data/         # Dữ liệu tĩnh và các bảng ánh xạ
├── features/     # Nghiệp vụ và dịch vụ phía máy chủ
├── hooks/        # React hooks dùng phía trình duyệt
├── lib/          # Tiện ích và Supabase clients
├── services/     # Dịch vụ gọi API từ phía trình duyệt
├── stores/       # Quản lý trạng thái toàn cục
├── types/        # Kiểu dữ liệu TypeScript
└── validations/  # Schema kiểm tra dữ liệu bằng Zod
```

## Kiến trúc ứng dụng

Luồng xử lý chính được tổ chức theo các lớp sau:

```text
Page
└── Component
    └── Hook
        └── Frontend Service
            └── API Route
                └── Validation
                    └── Feature Service
                        └── Supabase / Database
```

- **Page** định nghĩa trang và phối hợp các thành phần giao diện.
- **Component** đảm nhiệm hiển thị và tương tác trực tiếp với người dùng.
- **Hook** quản lý trạng thái, tải dữ liệu và gửi biểu mẫu phía trình duyệt.
- **Frontend Service** đóng gói việc giao tiếp với API nội bộ.
- **API Route** tiếp nhận yêu cầu, xác thực dữ liệu và chuẩn hóa phản hồi.
- **Feature Service** xử lý nghiệp vụ và làm việc với cơ sở dữ liệu.

## Quy ước phát triển

- Viết mã mới bằng TypeScript và giữ các kiểu dữ liệu rõ ràng.
- Không đặt nghiệp vụ phức tạp trực tiếp trong page hoặc component.
- Kiểm tra dữ liệu đầu vào bằng Zod trước khi xử lý.
- Không để khóa bí mật hoặc `SUPABASE_SERVICE_ROLE_KEY` xuất hiện trong mã phía trình duyệt.
- Chạy kiểm tra định dạng, lint và build trước khi đưa thay đổi lên môi trường chung.

## Bản quyền, nguồn tài nguyên và tuyên bố miễn trừ

Copyright © 2026 **Nhóm phát triển XEOXO Web Redesign**. Bảo lưu mọi quyền đối với phần mã nguồn và thiết kế do nhóm thực hiện.

Mã nguồn, thiết kế giao diện và các hạng mục redesign do nhóm phát triển thực hiện thuộc quyền sở hữu của nhóm, trừ những thành phần có ghi chú khác. Không được sao chép, chỉnh sửa, phân phối, công bố hoặc sử dụng các nội dung này cho mục đích thương mại nếu chưa có sự cho phép trước bằng văn bản của nhóm.

Tên gọi, nhãn hiệu, logo, hình ảnh sản phẩm và nội dung liên quan đến Xéo Xọ **không thuộc quyền sở hữu của nhóm phát triển**. Các tài nguyên này thuộc quyền sở hữu của Xéo Xọ hoặc chủ sở hữu quyền tương ứng và chỉ được sử dụng trong phạm vi đồ án học tập, phi thương mại nhằm minh họa cho bản redesign.

Dự án không phải website chính thức, không được Xéo Xọ tài trợ, chứng thực hoặc ủy quyền, và không đại diện cho thương hiệu Xéo Xọ. Không sử dụng dự án để bán hàng, nhận thanh toán, quảng cáo hoặc thực hiện bất kỳ hoạt động thương mại nào.
