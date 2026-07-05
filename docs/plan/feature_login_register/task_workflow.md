# Task Workflow: Login/Register Theo Trạng Thái Project Hiện Tại

Tài liệu này cập nhật lại workflow cho feature login/register để khớp với code hiện tại của project XEOXO Web.

Tài liệu này không mô tả một hướng triển khai giả định mới từ đầu. Mục tiêu là:

- phản ánh đúng auth flow đang có trong repo
- giữ workflow đúng với `AGENTS.md`
- nêu rõ phần đã làm, phần chưa làm và phần không thuộc scope hiện tại
- giúp dev tiếp tục sửa auth mà không đi lệch kiến trúc đang dùng

---

## 1. Phạm vi hiện tại

Feature auth hiện tại của project bao gồm:

1. Đăng nhập bằng email hoặc số điện thoại + mật khẩu qua Supabase Auth.
2. Đăng ký tài khoản mới bằng email hoặc số điện thoại + mật khẩu qua Supabase Auth.
3. Đăng nhập bằng Google qua Supabase OAuth.
4. Đăng nhập bằng Facebook qua Supabase OAuth.
5. Đồng bộ Supabase Auth user sang hồ sơ nội bộ `iam.customer` qua server flow.
6. Hiển thị auth dưới dạng modal trong header, không dùng page `/login` và `/register` làm luồng chính.

Không thuộc scope hiện tại:

1. Custom JWT auth cho customer.
2. Custom API login/register tự hash password.
3. Client truy cập trực tiếp bảng nghiệp vụ auth/customer.

---

## 2. Kết luận kiến trúc đang dùng

Auth flow hiện tại là một ngoại lệ có kiểm soát so với rule “frontend service chỉ gọi `/api/...`” trong `AGENTS.md`.

Lý do:

- đăng nhập/đăng ký/OAuth đang dùng `Supabase Auth SDK` trực tiếp ở client
- đây là auth provider flow chuẩn, không phải business data flow
- phần dữ liệu nghiệp vụ vẫn đi qua server/API/feature service

Luồng chuẩn hiện tại:

```text
SiteHeader / AuthModal / AuthExperience
↓
useAuth
↓
src/services/auth.service.ts
↓
Supabase Auth SDK (login/register/logout/OAuth)
↓
/api/v1/auth/me
/api/v1/auth/callback
/api/v1/auth/sync-profile
↓
src/features/auth/*
↓
Supabase server/admin client
↓
iam.customer và dữ liệu liên quan
```

---

## 3. Mapping với code hiện tại

### UI

- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/components/organisms/AuthModal/AuthModal.tsx`
- `src/components/organisms/AuthExperience/AuthExperience.tsx`
- `src/components/organisms/LoginForm/LoginForm.tsx`
- `src/components/organisms/RegisterForm/RegisterForm.tsx`
- `src/components/templates/AuthShell/AuthShell.tsx`

### Hook

- `src/hooks/useAuth.ts`

### Frontend service

- `src/services/auth.service.ts`

### Validation

- `src/validations/auth/login.schema.ts`
- `src/validations/auth/register.schema.ts`

### API route

- `src/app/api/v1/auth/me/route.ts`
- `src/app/api/v1/auth/callback/route.ts`
- `src/app/api/v1/auth/sync-profile/route.ts`

### Feature service

- `src/features/auth/auth.service.ts`
- `src/features/auth/profile-sync.service.ts`

### Hạ tầng Supabase SSR

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/middleware.ts`

### File legacy cần tránh dùng cho flow customer mới

- `src/lib/auth.ts`

File này còn tồn tại nhưng không phải nguồn auth chính cho customer flow mới.

---

## 4. Workflow hiện tại theo từng use case

## 4.1 Mở modal auth

1. User click CTA ở header hoặc `AuthModalLink`.
2. Header điều khiển trạng thái modal qua query `?auth=login` hoặc `?auth=register`.
3. `SiteHeader` render `AuthModal`.
4. `AuthModal` mount `AuthExperience` đúng mode.

Lưu ý:

- Project hiện tại không dùng `auth-modal.store.ts` hoặc `useAuthModal.ts`.
- Trạng thái modal đang bám vào URL query để hỗ trợ deep-link đơn giản.

## 4.2 Đăng nhập email hoặc phone/password

1. `LoginForm` nhận dữ liệu UI.
2. `AuthExperience` gọi `useAuth().login(...)`.
3. `useAuth` validate bằng `loginSchema`.
4. `authService.login()` parse `account` để nhận diện `email` hoặc `phone`.
5. `authService.login()` gọi `supabase.auth.signInWithPassword(...)` với đúng nhánh credential tương ứng.
6. Nếu format sai:
   - validation schema chặn ở client
   - UI hiển thị lỗi nhập liệu trước khi gọi auth provider
7. Nếu format đúng nhưng auth sai:
   - lỗi từ Supabase được map lại cho user
   - console vẫn có log debug trong `useAuth` và `authService`
8. Sau login, client gọi `authService.syncProfile()`.
9. `sync-profile` route đọc session server-side.
10. Route gọi feature sync để đảm bảo hồ sơ `iam.customer` tồn tại hoặc được cập nhật tối thiểu.
11. `useAuth.refresh()` gọi `/api/v1/auth/me`.
12. Header và UI account render lại theo session mới.

## 4.3 Đăng ký email hoặc phone/password

1. `RegisterForm` nhận `fullName`, `account`, `password`, `confirmPassword`.
2. `AuthExperience` gọi `useAuth().register(...)`.
3. `useAuth` validate bằng `registerSchema`.
4. `registerSchema` phải check:
   - `account` là email hợp lệ hoặc số điện thoại hợp lệ
   - `password` đạt rule bảo mật hiện hành
   - `confirmPassword` khớp với `password`
5. `authService.register()` parse `account` để nhận diện `email` hoặc `phone`.
6. `authService.register()` gọi `supabase.auth.signUp(...)` với payload tương ứng:
   - email flow dùng `emailRedirectTo`
   - phone flow dùng `phone` và metadata cần thiết
7. Metadata `full_name` được đẩy vào Supabase Auth khi sign up.
8. Nếu Supabase trả session ngay:
   - gọi `syncProfile()`
   - gọi `refresh()`
9. Nếu Supabase yêu cầu email hoặc phone confirmation:
   - UI hiển thị notice
   - chưa coi user là authenticated cho đến khi có session hợp lệ

Ghi chú:

- Customer nội bộ hiện có thể được tạo dù chưa có `email` hoặc `phone`.
- Thông tin liên hệ có thể được bổ sung ở bước sau như checkout hoặc cập nhật hồ sơ.
- Flow phone auth chỉ chạy thực tế nếu Supabase đã bật phone provider/SMS provider tương ứng.

## 4.4 Đăng nhập Google/Facebook

1. User click OAuth button trong `AuthExperience`.
2. `useAuth.signInWithProvider(...)` gọi `authService.signInWithProvider(...)`.
3. Frontend gọi `supabase.auth.signInWithOAuth(...)`.
4. Supabase redirect về `/api/v1/auth/callback`.
5. Callback route exchange code sang session.
6. Callback route gọi `syncCustomerProfile(...)`.
7. Sau đó user được redirect về `next` path hoặc fallback path.

## 4.5 Đọc session hiện tại

1. `useAuth` gọi `authService.getMe()`.
2. `/api/v1/auth/me` đọc session bằng server client.
3. Nếu có user:
   - map về `AuthUser`
   - đọc `iam.customer` tương ứng
4. Nếu chưa có session:
   - trả `isAuthenticated: false`
   - không coi là lỗi hệ thống

## 4.6 Đăng xuất

1. `useAuth.logout()` gọi `authService.logout()`.
2. Frontend gọi `supabase.auth.signOut()`.
3. Sau logout, `refresh()` chạy lại.
4. Header và account UI quay về trạng thái guest.

---

## 5. Những điểm đã khác so với plan cũ

Các giả định sau đây trong bản workflow cũ không còn đúng:

1. Đã có flow account nhận `email hoặc phone` ở implementation hiện tại.
2. `/login` và `/register` không còn là entry chính, chỉ là fallback page.
3. Không có custom route `POST /login` hoặc `POST /register` ở app.
4. Không dùng custom JWT trong `src/lib/auth.ts` cho customer auth mới.
5. Không có `auth-modal.store.ts` hoặc `useAuthModal.ts` trong implementation thật hiện tại.
6. Auth state được quản lý chủ yếu trong `useAuth` và query param, không qua global store riêng.

---

## 6. Quy tắc khi tiếp tục sửa feature này

1. Không thêm lại custom password hashing hoặc custom JWT cho customer auth.
2. Không đưa `service_role` lên frontend.
3. Không để component UI gọi Supabase business tables trực tiếp.
4. Nếu cần đọc/ghi hồ sơ nội bộ, đi qua API route hoặc feature service hiện có.
5. Nếu sửa contract auth API, cập nhật lại docs API liên quan trong cùng lần sửa.
6. Nếu thay đổi trải nghiệm modal/header, cập nhật docs UI/UX liên quan.
7. Phone auth phải dùng chung helper parse account để tránh lệch logic giữa login, register và UI message.
8. Không chặn social login chỉ vì provider chưa trả `email` hoặc `phone`; flow hiện tại cho phép bổ sung contact ở bước sau.
9. Rule password nếu thay đổi phải sửa đồng thời:
   - validation schema
   - UI hint/checklist
   - message lỗi
   - test case tương ứng

---

## 7. Task hoàn thiện còn lại

Ba nhánh dưới đây là phần cần hoàn thiện tiếp để feature login/register đạt trạng thái ổn định hơn cho production.

### 7.1 Thêm nhánh account dùng email hoặc phone

Mục tiêu:

- Một ô `account` dùng chung cho cả email và số điện thoại.
- Login và register cùng dùng chung rule nhận diện input.

Việc cần có:

- [x] Form đổi placeholder sang `Email hoặc số điện thoại`.
- [x] Validation schema chấp nhận email hoặc phone.
- [x] Frontend service parse account để gọi đúng payload Supabase.
- [ ] Chuẩn hoá message lỗi từ Supabase cho case phone chưa bật provider.
- [ ] Cập nhật docs API/auth flow nếu contract hiển thị lỗi thay đổi.
- [ ] Test tay cả 4 case:
  - register bằng email
  - register bằng phone
  - login bằng email
  - login bằng phone

### 7.2 Thêm check và hiển thị lỗi format nhập liệu

Mục tiêu:

- User thấy lỗi sớm ngay khi nhập sai format, không phải chờ submit xong mới biết.

Việc cần có:

- [x] Schema đã có lỗi cho account không hợp lệ.
- [ ] UI hiển thị lỗi theo từng field thay vì dồn một message chung ở cuối form.
- [ ] Thêm rule format phone rõ ràng trong UI hint.
- [ ] Thêm trạng thái `touched` hoặc submit state để chỉ hiện lỗi khi phù hợp.
- [ ] Giữ log kỹ thuật ở console/terminal nhưng message frontend phải rõ và ngắn.

Case cần cover:

- account rỗng
- email sai format
- phone sai format
- confirm password không khớp

### 7.3 Thêm nhánh kiểm tra password theo chuẩn mạnh hơn

Mục tiêu:

- Password không chỉ check độ dài tối thiểu, mà phải đạt rule bảo mật hiện hành.

Rule đề xuất hiện nay:

- ít nhất 8 ký tự
- có ít nhất 1 chữ thường
- có ít nhất 1 chữ hoa
- có ít nhất 1 số
- nên có ít nhất 1 ký tự đặc biệt

Việc cần có:

- [ ] Nâng `registerSchema` từ rule tối thiểu hiện tại lên rule mạnh hơn.
- [ ] Thêm UI checklist realtime dưới field password.
- [ ] Đổi message lỗi để user biết đang thiếu điều kiện nào.
- [ ] Giữ rule confirm password là bước check riêng.
- [ ] Bảo đảm login không tự áp rule mới cho tài khoản cũ, chỉ register và đổi mật khẩu mới dùng rule này.

Khuyến nghị triển khai UI:

- Hiển thị checklist 4-5 dòng ngay dưới input password.
- Mỗi dòng đổi trạng thái khi user nhập.
- Không chờ submit mới cho biết password yếu.

---

## 8. Checklist kiểm tra theo trạng thái hiện tại

### A. Cấu hình Supabase

- [ ] `NEXT_PUBLIC_SUPABASE_URL` có giá trị đúng.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` có giá trị đúng.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` có giá trị đúng nếu `profile-sync` dùng admin client.
- [ ] `NEXT_PUBLIC_SITE_URL` đúng với môi trường đang test.
- [ ] Google provider đã bật trong Supabase Dashboard.
- [ ] Facebook provider đã bật trong Supabase Dashboard.
- [ ] OAuth redirect URL trỏ đúng về `/api/v1/auth/callback`.
- [ ] Middleware Supabase đang chạy cho các route cần đọc session.

### B. UI và điều hướng

- [ ] Click `Đăng nhập` mở modal mode `login`.
- [ ] Click `Đăng ký` mở modal mode `register`.
- [ ] Chuyển mode trong modal không reload page.
- [ ] Đóng modal hoạt động đúng.
- [ ] `/login` và `/register` vẫn dùng được như fallback page.
- [ ] Header phản ánh đúng trạng thái guest / authenticated.

### C. Email hoặc phone/password

- [ ] Login email/password thành công.
- [ ] Login phone/password thành công.
- [ ] Register email/password thành công.
- [ ] Register phone/password thành công.
- [ ] Lỗi validate format account hiển thị đúng.
- [ ] Lỗi validate password hiển thị đúng.
- [ ] Lỗi auth từ Supabase hiển thị cho user và có log để debug.
- [ ] Nếu bật email/SMS confirmation, UI hiển thị notice phù hợp.

### D. OAuth

- [ ] Google OAuth redirect đúng.
- [ ] Facebook OAuth redirect đúng.
- [ ] Callback route exchange session thành công.
- [ ] Callback route redirect lại đúng trang.

### E. Đồng bộ hồ sơ nội bộ

- [ ] Sau auth thành công, `sync-profile` không tạo trùng hồ sơ.
- [ ] `iam.customer.account_id` map đúng với `auth.users.id`.
- [ ] `/api/v1/auth/me` đọc được `customer` khi hồ sơ đã tồn tại.
- [ ] Trường hợp chưa có session không trả `500`.

### F. Debug và log

- [ ] Lỗi ở `useAuth` có log ra browser console.
- [ ] Lỗi ở `authService` có log status/payload để debug.
- [ ] Lỗi ở `auth/me`, `auth/callback`, `auth/sync-profile` có log ra terminal.
- [ ] Không log token nhạy cảm hoặc secret key.

---

## 8. Test cases phù hợp với implementation hiện tại

### Test success

- [ ] Mở modal login từ header thành công.
- [ ] Mở modal register từ header thành công.
- [ ] Đăng ký email/password thành công.
- [ ] Đăng nhập email/password thành công.
- [ ] Đăng nhập Google thành công.
- [ ] Đăng nhập Facebook thành công.
- [ ] Logout thành công.
- [ ] Refresh page vẫn nhận đúng session.

### Test error

- [ ] Email sai format bị chặn bởi validation.
- [ ] Confirm password không khớp bị chặn bởi validation.
- [ ] Password sai hiển thị lỗi auth.
- [ ] OAuth cancel hiển thị lỗi hợp lý.
- [ ] Callback lỗi có log server.
- [ ] Profile sync lỗi có log server và log client nếu request đó đi từ client.
- [ ] `auth/me` khi chưa đăng nhập trả guest state, không nổ `500`.

### Ngoài scope hiện tại

- [ ] Không test phone/password như một requirement mặc định.

Nếu team muốn làm phone auth sau này, phải mở task riêng và cập nhật lại tài liệu này.

---

## 9. Biến môi trường và dependency cần nhớ

Biến môi trường cần có:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Provider cần bật:

- Email
- Google
- Facebook

---

## 10. Definition of Done cho feature ở trạng thái hiện tại

- Modal auth hoạt động từ header theo đúng mode.
- Email/password login hoạt động qua Supabase Auth.
- Email/password register hoạt động qua Supabase Auth.
- Google login hoạt động qua Supabase OAuth.
- Facebook login hoạt động qua Supabase OAuth.
- `/api/v1/auth/me` trả đúng guest state hoặc authenticated state.
- `/api/v1/auth/callback` exchange session và redirect ổn định.
- `/api/v1/auth/sync-profile` đồng bộ hồ sơ nội bộ theo session hiện tại.
- Header hiển thị đúng trạng thái tài khoản.
- Lỗi quan trọng có log ra console/terminal để debug.
- Tài liệu này không còn mô tả phone auth hoặc custom auth flow ngoài implementation thật.
