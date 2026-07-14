# XEOXO Web

Website thương mại điện tử thời trang XEOXO được xây dựng với `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Supabase` và `Prisma`.

Dự án này tập trung vào các luồng chính:

- duyệt sản phẩm, bộ sưu tập, danh mục
- chi tiết sản phẩm, chọn biến thể, thêm giỏ hàng
- đăng ký, đăng nhập, quản lý hồ sơ khách hàng
- checkout, đơn hàng, lịch sử đơn hàng
- đặt lịch hẹn và các trải nghiệm liên quan

## 1. Công nghệ sử dụng

- `Next.js 15`
- `React 19`
- `TypeScript`
- `Tailwind CSS`
- `Supabase`
- `Prisma`
- `Zod`
- `TanStack React Query`
- `Zustand`

## 2. Cấu trúc dự án

```txt
src/
├── app/            # App Router pages, layouts, API routes
├── components/     # UI components theo atomic design
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── constants/      # hằng số dùng chung
├── data/           # dữ liệu tĩnh, mapping, helper data
├── features/       # business logic phía server / domain services
├── hooks/          # custom hooks phía client
├── lib/            # helper, utils, supabase clients
├── services/       # frontend services gọi API
├── stores/         # state management
├── types/          # type definitions
└── validations/    # schema validate bằng Zod
```

## 3. Kiến trúc luồng code

Project đi theo hướng tách lớp rõ ràng:

```txt
Page
-> Component
-> Hook (nếu cần state/fetch/submit phía client)
-> Frontend Service
-> API Route
-> Validation
-> Feature Service
-> Supabase / Database
```

Nguyên tắc chính:

- `Page` không chứa business logic dài.
- `Component` chỉ tập trung render UI và callback.
- `Hook` quản lý loading, error, submit, refetch phía client.
- `Service` chỉ gọi API nội bộ.
- `API Route` nhận request, validate, gọi feature service, trả response chuẩn.
- `Feature` xử lý nghiệp vụ và làm việc với database.

## 4. Các module chính

- `auth`: đăng ký, đăng nhập, đồng bộ hồ sơ khách hàng
- `cart`: giỏ hàng, cập nhật số lượng, chọn biến thể
- `checkout`: thông tin giao hàng, tạo đơn hàng, thanh toán
- `order`: lịch sử đơn hàng, chi tiết đơn hàng
- `appointment`: đặt lịch hẹn và tra cứu lịch hẹn
- `collections`: trang bộ sưu tập, hero media, story blocks
- `catalog` / `category` / `product`: listing, filter, sort, product detail
- `customers`: hồ sơ cá nhân, sổ địa chỉ
- `review`: đánh giá sản phẩm

## 5. Yêu cầu môi trường

Khuyến nghị:

- `Node.js >= 20`
- `npm >= 10`

## 6. Cài đặt và chạy dự án

### Cài dependency

```bash
npm install
```

### Tạo file môi trường

Tạo file `.env.local` từ `.env.example` và điền các giá trị cần thiết.

Biến môi trường tối thiểu:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Các biến Figma trong `.env.example` chỉ phục vụ một số workflow nội bộ liên quan đến thiết kế:

```env
FIGMA_ACCESS_TOKEN=your_figma_access_token
FIGMA_FILE_KEY=your_figma_file_key
FIGMA_NODE_IDS=1:92
FIGMA_OUTPUT_PATH=figma-node.json
```

### Chạy môi trường development

```bash
npm run dev
```

Mặc định ứng dụng chạy tại:

```txt
http://localhost:3000
```

### Build production

```bash
npm run build
npm run start
```

## 7. Các script đang có

```bash
npm run dev           # chạy local
npm run build         # build production
npm run start         # chạy bản build
npm run lint          # lint code
npm run format        # format code trong src/

npm run db:generate   # prisma generate
npm run db:migrate    # prisma migrate dev
npm run db:push       # prisma db push
npm run db:seed       # seed dữ liệu
npm run db:studio     # mở Prisma Studio

npm run order:status  # script cập nhật trạng thái đơn hàng
```
