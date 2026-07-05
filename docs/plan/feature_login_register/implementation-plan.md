# Feature Plan: Login/Register Modal With Supabase Auth

## 1. Mục tiêu

Chuyển 2 màn hình Figma:

- `315:1521` - modal `Đăng nhập`
- `316:1524` - modal `Đăng ký`

thành flow auth dạng modal trong web app, thay cho trải nghiệm page riêng hiện tại ở:

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`

Phạm vi plan này bao gồm:

- chỉnh lại giao diện theo modal
- tách đúng layer UI -> state -> service -> API -> Supabase
- chuẩn bị login/register bằng email/password
- setup đăng nhập/đăng ký bằng Google và Facebook qua Supabase Auth
- định nghĩa cách đồng bộ hồ sơ customer nội bộ sau khi auth thành công

Plan này chỉ mô tả hướng triển khai, chưa sửa code nghiệp vụ.

Quyết định chuẩn hoá của plan này:

- dùng `Supabase Auth native` làm nguồn auth duy nhất
- không dùng `src/lib/auth.ts` cho customer auth
- không tự hash password, không tự phát JWT, không tự giữ auth cookie riêng
- email/password và OAuth Google/Facebook đi qua flow chuẩn của Supabase
- API nội bộ chỉ giữ vai trò `me`, `callback`, `profile sync` và các xử lý nghiệp vụ phụ trợ

Luồng ưu tiên của plan này bám theo `AGENTS.md`, nhưng có một ngoại lệ rõ ràng cho authentication provider:

```text
Page/Modal Host
↓
Component
↓
Hook nếu cần client state/submit/session
↓
Frontend Service
↓
Supabase Auth client flow (chỉ cho auth native)
↓
API Route
↓
Validation
↓
Feature Service
↓
Supabase / Database
```

Giải thích:

- `Supabase Auth` là auth provider, không phải business database access của app.
- Các thao tác đăng nhập/đăng ký/OAuth có thể dùng SDK auth chuẩn của Supabase ở client/service layer.
- Mọi dữ liệu nghiệp vụ của app và mọi đồng bộ `iam.account` / `iam.customer` vẫn đi qua server/API.

---

## 2. Hiện trạng

## 2.1 UI hiện có

- Đã có `AuthShell`, `LoginForm`, `RegisterForm`.
- UI hiện đang render như page toàn màn hình, chưa phải modal overlay.
- Nút Google/Facebook mới là UI tĩnh, chưa có action.
- `LoginForm` và `RegisterForm` đang giữ state cục bộ, chưa có loading/error/server validation.

## 2.2 Layer hiện có

- Repo đã có `src/lib/supabase/client.ts` và `src/lib/supabase/server.ts`.
- Repo chưa có đủ các thư mục layer theo guideline như `src/hooks`, `src/services`, `src/features`, `src/validations`.
- `src/stores/cart.store.ts` đang dùng Zustand, có thể reuse pattern này cho auth modal state.

## 2.3 Auth hiện có

- Có `src/lib/auth.ts` dùng JWT cookie custom (`auth_token`).
- Đồng thời repo đã có Supabase SSR client.
- Hai hướng này nếu cùng tồn tại cho customer auth sẽ dễ xung đột session, middleware và quyền truy cập.

Kết luận chuẩn hoá:

- customer auth chỉ dùng Supabase session/cookie do `@supabase/ssr` quản lý
- `src/lib/auth.ts` và `src/lib/jwt.ts` không tham gia flow customer auth mới

## 2.4 API/docs cần lưu ý

- `src/constants/routes.ts` đang khai báo auth API ở dạng `/api/auth/...`.
- Theo `docs/api/api_documentation.md`, chuẩn endpoint nên đi theo base path `/api/v1`.
- `src/lib/api-response.ts` đang dùng format:

```ts
{ success: true, data?, message? }
{ success: false, message, error? }
```

trong khi `docs/api/api_documentation.md` hiện mô tả body có `code`.

Kết luận:

- Khi triển khai auth mới cần chọn một chuẩn response duy nhất.
- Nên bám helper `src/lib/api-response.ts` vì đây là code đang tồn tại.
- Nếu giữ chuẩn helper, cần cập nhật lại docs API liên quan trong cùng đợt implementation.

---

## 3. Mục tiêu kỹ thuật sau khi hoàn thành

## 3.1 UX

- User có thể mở modal auth từ header hoặc CTA liên quan.
- Modal có 2 mode: `login` và `register`.
- User có thể chuyển mode ngay trong modal mà không reload page.
- `/login` và `/register` không còn là đích trải nghiệm chính.

## 3.2 Auth

- Email/password dùng Supabase Auth.
- Google login dùng Supabase OAuth.
- Facebook login dùng Supabase OAuth.
- Sau khi auth thành công, hệ thống đồng bộ dữ liệu sang hồ sơ customer nội bộ nếu chưa tồn tại.
- Session chuẩn của Supabase được dùng chung cho client, server component và API route.

## 3.3 State

- Có state mở/đóng modal và mode hiện tại.
- Có state submit/loading/error cho từng flow.
- Có trạng thái session người dùng hiện tại để header/account CTA phản ứng đúng.

## 3.4 Kiến trúc

- Component chỉ render UI.
- Hook hoặc store quản lý state client.
- Auth service gọi Supabase Auth SDK cho login/register/logout/OAuth.
- API route làm `me`, callback, validation và orchestration cho profile sync.
- Feature service xử lý logic Supabase và đồng bộ customer profile.

---

## 4. Đề xuất kiến trúc

## 4.1 Quyết định chính

Chọn `Supabase Auth` làm nguồn sự thật duy nhất cho customer authentication.

Lý do:

- Hỗ trợ sẵn email/password + OAuth Google/Facebook.
- Tương thích tốt với `@supabase/ssr` đang có trong repo.
- Phù hợp hơn với RLS và `auth.uid()` trong docs database.
- Tránh duy trì song song custom JWT và session Supabase.
- Giảm khối lượng code auth tự quản, giảm rủi ro sai session/cookie.

## 4.2 Xử lý `src/lib/auth.ts`

Không dùng `src/lib/auth.ts` cho customer login/register mới.

Hướng xử lý trong implementation:

- giữ file tạm thời nếu còn phụ thuộc legacy flow khác
- đánh dấu deprecated cho customer auth
- không gọi `hashPassword`, `comparePassword`, `setAuthCookie`, `getCurrentUser` trong flow auth mới
- sau khi kiểm tra toàn repo không còn dùng, có thể xóa ở task dọn dẹp riêng

## 4.3 Tổ chức layer đề xuất

### UI

- `src/components/organisms/AuthModal/`
- `src/components/organisms/LoginForm/`
- `src/components/organisms/RegisterForm/`
- `src/components/atoms/ModalBackdrop/` hoặc reuse pattern modal hiện có

### State/Hook

- `src/stores/auth-modal.store.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useAuthModal.ts`

### Service

- `src/services/auth.service.ts`

### Validation

- `src/validations/auth/login.schema.ts`
- `src/validations/auth/register.schema.ts`

### Feature

- `src/features/auth/auth.service.ts`
- `src/features/auth/profile-sync.service.ts`

### API route

- `src/app/api/v1/auth/me/route.ts`
- `src/app/api/v1/auth/callback/route.ts`
- `src/app/api/v1/auth/sync-profile/route.ts` hoặc route nội bộ tương đương nếu cần chủ động trigger sync

Ghi chú:

- Với quyết định dùng `Supabase Auth native`, auth service được phép gọi Supabase Auth SDK cho login/register/logout/OAuth.
- API route không còn là nơi thực hiện `login/register` bằng password thủ công.
- Callback route server-side dùng để xử lý redirect và đồng bộ profile ổn định hơn.
- Nếu cần sync profile ngay sau `signUp` hoặc `signIn`, frontend service có thể gọi route sync riêng sau khi Supabase auth thành công.

---

## 5. Workflow triển khai theo bước

## Phase 1 - Chốt design và phạm vi

### Mục tiêu

- chốt modal thay vì page
- map node Figma vào component hiện có
- xác định điểm mở modal trong app

### Việc làm

1. So sánh `315:1521` và `316:1524` với `AuthShell`, `LoginForm`, `RegisterForm`.
2. Xác định phần nào giữ lại được:
   - khối benefits
   - social buttons
   - footer links
   - input/password toggle
3. Quyết định vị trí mount modal:
   - ở `SiteLayout`
   - hoặc ở `SiteHeader` + portal
4. Chốt behavior:
   - click `Đăng nhập` mở mode login
   - click `Đăng ký` mở mode register
   - click footer link trong modal chỉ đổi mode, không navigate page
   - click backdrop/close thì đóng modal
   - ESC đóng modal

### Deliverable

- modal behavior spec
- mapping component theo Figma

## Phase 2 - Refactor UI từ page sang modal

### Mục tiêu

- tạo shell modal mới
- giữ form tách biệt để tái sử dụng
- page `/login` và `/register` chỉ còn là fallback

### Việc làm

1. Tạo `AuthModal` bao gồm:
   - backdrop
   - panel
   - close button
   - mode switch
   - focus trap nếu cần
2. Refactor `AuthShell`:
   - bỏ layout full-screen page
   - tách thành content shell dùng bên trong modal
3. Nâng cấp `LoginForm` và `RegisterForm`:
   - nhận `isLoading`
   - nhận `errorMessage`
   - nhận callback social login
   - không tự giữ toàn bộ business logic submit
4. Cập nhật `/login` và `/register`:
   - phương án ưu tiên: redirect về trang trước hoặc home với query `?auth=login|register`
   - phương án fallback: vẫn render auth shell nếu người dùng truy cập trực tiếp

### Deliverable

- modal auth hoạt động độc lập
- page cũ không còn là UX chính

## Phase 3 - Thêm state modal và session client

### Mục tiêu

- điều khiển modal nhất quán toàn app
- expose trạng thái user hiện tại cho header/UI

### Việc làm

1. Tạo `src/stores/auth-modal.store.ts` theo pattern Zustand hiện có.
2. State tối thiểu:
   - `isOpen`
   - `mode: 'login' | 'register'`
   - `open(mode?)`
   - `close()`
   - `switchMode(mode)`
3. Tạo `useAuthModal()` để tách API store khỏi component.
4. Tạo `useAuth()` để quản lý:
   - session user
   - login submit
   - register submit
   - logout
   - oauth sign-in
5. Đồng bộ state với query param nếu cần deep-link:
   - `?auth=login`
   - `?auth=register`

### Deliverable

- có global modal state
- header và CTA có thể mở modal từ bất kỳ đâu

### Ghi chú kiến trúc

- Store chỉ dùng cho UI state toàn cục như mở/đóng modal.
- Submit auth, loading, error và session fetch nên đi qua hook.
- Component không gọi Supabase trực tiếp; việc gọi Supabase Auth nằm trong auth service.

## Phase 4 - Validation và contract request/response

### Mục tiêu

- thống nhất dữ liệu gửi đi
- tránh validate rải rác trong component

### Việc làm

1. Tạo schema Zod cho login:
   - `account`
   - `password`
2. Tạo schema Zod cho register:
   - `fullName`
   - `account`
   - `password`
   - `confirmPassword`
3. Quyết định rule `account`:
   - phase đầu nên ưu tiên email
   - nếu cần hỗ trợ phone thật sự, phải bổ sung rule xác thực phone và mapping rõ với Supabase
4. Chuẩn hóa lỗi:
   - lỗi field
   - lỗi auth chung
   - lỗi provider
5. Schema validation nằm ở `src/validations/`, không để logic so khớp password chỉ nằm trong component.

### Khuyến nghị

Để giảm rủi ro, phase đầu nên triển khai:

- email/password
- Google OAuth
- Facebook OAuth

và chỉ hiển thị placeholder `Email/SĐT` nếu Supabase phone auth thật sự được bật. Nếu chưa bật phone auth, nên đổi UI về `Email của bạn` để tránh sai kỳ vọng.

### Deliverable

- schema validation
- request/response contract rõ ràng

## Phase 5 - Frontend service

### Mục tiêu

- tách network call khỏi UI/hook

### Việc làm

1. Tạo `src/services/auth.service.ts`.
2. Hàm đề xuất:
   - `login(values)`
   - `register(values)`
   - `logout()`
   - `getMe()`
   - `signInWithProvider(provider)`
   - `syncProfile()`
3. Service auth dùng `src/lib/supabase/client.ts` để gọi Supabase Auth SDK cho:
   - `signInWithPassword`
   - `signUp`
   - `signOut`
   - `signInWithOAuth`
4. Service chỉ gọi API app cho:
   - `GET /api/v1/auth/me`
   - `GET /api/v1/auth/callback`
   - `POST /api/v1/auth/sync-profile` nếu chọn cách sync tường minh từ client sau auth thành công
5. Không dùng frontend service để gọi custom login API xử lý password thủ công.

### Deliverable

- auth service dùng được cho modal forms và các khu vực account sau này

## Phase 6 - API route và feature service

### Mục tiêu

- đưa business logic hồ sơ nội bộ và session read về server layer

### Việc làm

1. Tạo API me:
   - trả thông tin user hiện tại
   - dùng cho header/account badge
2. Tạo API callback:
   - nhận redirect từ Supabase OAuth
   - exchange code/session theo flow SSR đang dùng
   - trigger sync profile nếu cần
   - redirect người dùng về trang phù hợp
3. Tạo API `sync-profile` nếu team muốn tách riêng bước sync:
   - đọc session hiện tại từ Supabase
   - gọi feature sync
   - trả response chuẩn helper `ok/fail`
4. Tạo feature `profile-sync.service.ts`:
   - nếu user đăng nhập lần đầu mà chưa có profile nội bộ, tạo mới
   - map `auth.users.id` -> `iam.account.account_id`
   - map `iam.account` -> `iam.customer`
5. Không tạo custom login route/hash-password route cho customer auth mới.
6. API route không query Supabase trực tiếp nếu logic đã vượt mức đơn giản; phần sync/profile lookup đặt trong feature service.

### Deliverable

- auth API hoàn chỉnh
- profile nội bộ được đồng bộ có kiểm soát

## Phase 7 - Supabase Auth setup

### Mục tiêu

- bật đúng provider
- đảm bảo callback và profile sync hoạt động

### Việc làm

1. Trong Supabase Dashboard:
   - bật Email provider
   - bật Google provider
   - bật Facebook provider
2. Cấu hình redirect URL:
   - local
   - staging
   - production
3. Khai báo env:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` nếu feature sync chạy server-side cần quyền cao
   - `NEXT_PUBLIC_SITE_URL`
4. Tạo callback flow:
   - user click Google/Facebook trong modal
   - hook gọi frontend service
   - service gọi `supabase.auth.signInWithOAuth(...)`
   - user đi qua provider
   - Supabase redirect về callback
   - callback exchange session
   - profile sync
   - redirect về trang trước hoặc home
5. Đồng bộ metadata khi register:
   - `full_name`
   - provider
   - flags cần thiết khác
6. Email/password flow:
   - `supabase.auth.signUp(...)`
   - nếu cần email confirmation thì xử lý trạng thái chờ xác thực
   - sau khi session hợp lệ, trigger sync profile nội bộ

### Lưu ý rất quan trọng

- Không đưa `service_role` lên frontend.
- Nếu dùng `service_role` để sync `iam.account` và `iam.customer`, chỉ dùng trong server route/feature service.
- Facebook OAuth cần app Facebook developer, domain verification và redirect URI đúng tuyệt đối.

### Deliverable

- Supabase auth config checklist
- callback flow hoạt động

## Phase 8 - RLS và dữ liệu nội bộ

### Mục tiêu

- đảm bảo user auth xong có thể truy cập dữ liệu owner-based

### Việc làm

1. Xác nhận `iam.customer.account_id = auth.uid()` được ghi đúng khi register/login social lần đầu.
2. Kiểm tra lại policy đã có trong docs:
   - `iam.customer`
   - `iam.address`
   - `iam.loyalty_reward`
   - `iam.reward_usage`
3. Nếu hiện tại DB chưa tự tạo record `iam.account` và `iam.customer`, cần bổ sung một trong hai hướng:
   - server-side sync sau auth thành công
   - trigger/function ở database
4. Với phạm vi web app hiện tại, ưu tiên server-side sync để dễ kiểm soát và dễ debug hơn.
5. Không lấy email/phone từ bảng nghiệp vụ để làm nguồn auth; nguồn auth chuẩn là `auth.users` của Supabase.
6. Với social login, nếu provider không trả `email` và `phone`, vẫn cho phép tạo `iam.customer` trước rồi yêu cầu người dùng bổ sung thông tin liên hệ ở bước sau như checkout hoặc cập nhật hồ sơ.

### Deliverable

- user auth thành công có thể dùng owner-based RLS hợp lệ

## Phase 9 - Tích hợp vào header và flow điều hướng

### Mục tiêu

- modal auth thật sự đi vào luồng sử dụng chung của site

### Việc làm

1. Thêm CTA `Đăng nhập` / `Tài khoản` trong `SiteHeader`.
2. Nếu chưa đăng nhập:
   - click mở modal login
3. Nếu đã đăng nhập:
   - hiển thị CTA tài khoản, dropdown hoặc link account
4. Các action protected trong tương lai:
   - checkout
   - wishlist
   - account pages

có thể gọi `open('login')` khi user chưa auth.

### Deliverable

- modal auth gắn với navigation thực tế

## Phase 10 - Test và docs

### Mục tiêu

- xác nhận flow hoạt động end-to-end
- cập nhật docs theo contract thật

### Việc làm

1. Test success case:
   - mở modal login/register
   - switch mode
   - register email thành công
   - login email thành công
   - login Google thành công
   - login Facebook thành công
   - logout thành công
2. Test error case:
   - password không khớp
   - email đã tồn tại
   - provider bị cancel
   - callback lỗi
   - profile sync lỗi
3. Cập nhật docs:
   - `docs/api/`
   - nếu cần, ghi chú vào docs database liên quan auth/profile sync
   - nếu modal auth làm thay đổi architecture UI, cập nhật `docs/uiux/figma-component-architecture.md`

### Deliverable

- test checklist
- docs cập nhật theo implementation thật

---

## 6. Danh sách file dự kiến sẽ thêm/sửa

## Sửa

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/components/templates/AuthShell/AuthShell.tsx`
- `src/components/organisms/LoginForm/LoginForm.tsx`
- `src/components/organisms/RegisterForm/RegisterForm.tsx`
- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/constants/routes.ts`

## Thêm

- `src/components/organisms/AuthModal/AuthModal.tsx`
- `src/stores/auth-modal.store.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useAuthModal.ts`
- `src/services/auth.service.ts`
- `src/validations/auth/login.schema.ts`
- `src/validations/auth/register.schema.ts`
- `src/features/auth/auth.service.ts`
- `src/features/auth/profile-sync.service.ts`
- `src/app/api/v1/auth/me/route.ts`
- `src/app/api/v1/auth/callback/route.ts`
- `src/app/api/v1/auth/sync-profile/route.ts`

## Có thể thêm nếu cần

- `src/middleware.ts`
- `src/types/auth.types.ts`
- `src/components/atoms/OAuthButton/OAuthButton.tsx`

---

## 7. Đề xuất contract API sơ bộ

## GET `/api/v1/auth/me`

### Response success

```json
{
  "success": true,
  "data": {
    "user": {},
    "customer": {}
  }
}
```

## POST `/api/v1/auth/sync-profile`

### Mục đích

- đồng bộ `auth.users` hiện tại sang `iam.account` và `iam.customer`
- dùng sau `signUp`, `signIn` hoặc callback OAuth nếu cần trigger tường minh

### Response success

```json
{
  "success": true,
  "message": "Đồng bộ hồ sơ thành công",
  "data": {
    "customer": {}
  }
}
```

Ghi chú:

- Login/register/logout bằng password và OAuth đi qua `Supabase Auth SDK`, không đi qua custom auth API của app.
- API nội bộ chỉ đọc session hiện tại và đồng bộ dữ liệu nghiệp vụ phụ trợ.

---

## 8. Rủi ro và điểm cần chốt sớm

1. `Email/SĐT` trong Figma chưa tương ứng rõ với Supabase Auth.
2. Facebook OAuth thường tốn thời gian setup hơn Google vì cần cấu hình app và redirect nghiêm ngặt.
3. Nếu `iam.account` và `iam.customer` chưa có luồng auto-create ổn định, social login có thể thành công nhưng app vẫn không đọc được dữ liệu owner-based.
4. Nếu tiếp tục giữ cả custom JWT lẫn Supabase session, sẽ rất dễ phát sinh bug đăng nhập giả thành công nhưng RLS không hoạt động.
5. Nếu chưa chốt rõ email-only hay email+phone trong Supabase Auth, UI placeholder và validation sẽ dễ lệch nhau.

---

## 9. Thứ tự thực hiện khuyến nghị

1. Refactor UI modal và modal state trước.
2. Chốt một nguồn auth duy nhất là Supabase Auth.
3. Làm email/password trước để hoàn tất luồng cơ bản.
4. Làm `me`, logout và header session state.
5. Bổ sung Google OAuth.
6. Bổ sung Facebook OAuth.
7. Hoàn tất profile sync và kiểm tra RLS owner-based.
8. Cuối cùng cập nhật docs API/UI theo contract thật.

---

## 10. Definition of Done

- Login/register hiển thị dưới dạng modal đúng theo Figma node `315:1521` và `316:1524`.
- User có thể mở, đóng, chuyển mode mà không rời trang hiện tại.
- Email/password login hoạt động.
- Email/password register hoạt động.
- Google login hoạt động.
- Facebook login hoạt động.
- Session Supabase được nhận diện đúng ở client và server.
- `iam.account` và `iam.customer` được đồng bộ để hỗ trợ RLS theo `auth.uid()`.
- Header phản ánh đúng trạng thái đăng nhập.
- Không còn phụ thuộc vào page `/login` và `/register` như luồng chính.
- Docs liên quan được cập nhật đồng bộ với implementation thật.
