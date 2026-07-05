# Merge Summary: Login/Register + Account Follow-up

Tài liệu này tổng kết phần đã implement trong nhánh hiện tại để team lead review nhanh phạm vi merge.

Mục tiêu của bản summary này:

- liệt kê đúng các page/component đã sửa
- mô tả auth/API flow đang chạy thật trong repo
- chỉ ra phần nào đã có server/API hoàn chỉnh
- chỉ ra phần nào mới dừng ở UI hoặc chưa có API riêng theo docs

---

## 1. Phạm vi đã làm trong nhánh hiện tại

Nhánh hiện tại không chỉ dừng ở login/register modal, mà đã mở rộng sang các màn account dùng chung session sau đăng nhập:

1. Giữ auth chính theo `Supabase Auth native`.
2. Dùng modal auth từ header làm luồng chính cho login/register.
3. Đồng bộ Supabase user sang hồ sơ nội bộ qua `auth/callback` và `auth/sync-profile`.
4. Bổ sung flow xem/cập nhật hồ sơ cá nhân trong khu vực account.
5. Bổ sung page `Sổ địa chỉ` dạng server-rendered, đọc dữ liệu địa chỉ của customer hiện tại.
6. Chuyển logout từ page riêng sang confirm popup ngay trong menu account.

---

## 2. Page và component đã sửa

## 2.1 Auth và header

- `src/components/organisms/SiteHeader/SiteHeader.tsx`
  - tiếp tục là nơi mở auth modal theo query
  - cập nhật link điều hướng account
  - menu account đã trỏ được sang `Hồ sơ thông tin` và `Sổ địa chỉ`

## 2.2 Hồ sơ tài khoản

- `src/app/account/profile/page.tsx`
  - page hồ sơ tài khoản theo layout account
  - dùng server-side session để lấy customer hiện tại
  - render editor để xem/chỉnh sửa thông tin cá nhân

- `src/components/organisms/AccountProfileEditor/AccountProfileEditor.tsx`
  - hiển thị profile hiện tại
  - cho phép chuyển sang mode chỉnh sửa
  - bỏ các field `chiều cao`, `cân nặng`
  - thêm birthday picker custom thay cho date input native

## 2.3 Sổ địa chỉ

- `src/app/account/addresses/page.tsx`
  - page `Sổ địa chỉ` mới
  - đọc danh sách địa chỉ theo customer hiện tại
  - hiển thị layout giống mockup account
  - các nút `Cập nhật`, `Xóa`, `Thiết lập mặc định`, `Thêm địa điểm` hiện đang ở mức UI placeholder

- `src/features/customers/customer-address.service.ts`
  - server-side query `iam.address`
  - join tên tỉnh từ `iam.province`
  - sort mặc định trước, mới nhất sau

## 2.4 Điều hướng account và logout

- `src/components/organisms/AccountNavigation/AccountNavigation.tsx`
  - gom nav trái của account thành reusable client component
  - thêm item `Đăng xuất`
  - click `Đăng xuất` mở popup confirm
  - popup gọi logout client-side, thành công thì redirect về trang chủ

- `src/app/logout/page.tsx`
  - đã bỏ khỏi flow hiện tại
  - route logout page cũ đã bị xóa để tránh trung gian không cần thiết

## 2.5 Route/type dùng chung

- `src/constants/routes.ts`
  - thêm `ACCOUNT_ADDRESSES`
  - bỏ `LOGOUT` route cũ

- `src/types/customer.types.ts`
  - thêm `CustomerAddress`
  - giữ `UpdateCustomerProfileValues` cho flow cập nhật hồ sơ

---

## 3. API và service đã có

## 3.1 Auth API đang chạy thật

Các route auth hiện tại:

- `GET /api/v1/auth/me`
- `GET /api/v1/auth/callback`
- `POST /api/v1/auth/sync-profile`

Vai trò:

- `auth/me`
  - đọc Supabase session bằng server client
  - trả guest state hoặc authenticated state
  - nếu có session thì load thêm `iam.customer`

- `auth/callback`
  - nhận OAuth callback từ Supabase
  - exchange code sang session
  - gọi sync profile server-side
  - redirect về `next` path hoặc fallback path

- `auth/sync-profile`
  - dùng sau login/register khi cần đồng bộ hồ sơ nội bộ
  - đảm bảo map `auth.users.id` sang hồ sơ customer nội bộ

Frontend auth vẫn đi theo pattern:

```text
Auth modal / account CTA
↓
useAuth
↓
src/services/auth.service.ts
↓
Supabase Auth SDK
↓
/api/v1/auth/me
/api/v1/auth/callback
/api/v1/auth/sync-profile
↓
src/features/auth/*
```

## 3.2 API mới cho hồ sơ customer

Route mới:

- `GET /api/v1/customers/me`
- `PUT /api/v1/customers/me`

File liên quan:

- `src/app/api/v1/customers/me/route.ts`
- `src/features/customers/customer-profile.service.ts`
- `src/services/customer.service.ts`
- `src/hooks/useCustomerProfile.ts`
- `src/validations/customer/update-customer-profile.schema.ts`

Vai trò:

- `GET /api/v1/customers/me`
  - yêu cầu đã đăng nhập
  - đọc session bằng server client
  - lấy hồ sơ customer theo `account_id = auth.uid()`

- `PUT /api/v1/customers/me`
  - yêu cầu đã đăng nhập
  - validate body bằng `updateCustomerProfileSchema`
  - gọi `ensureCustomerProfile(user)` trước khi update
  - update các field:
    - `customer_name`
    - `email`
    - `phone`
    - `gender`
    - `birthday`
  - trả response theo helper `ok/fail`

Luồng cập nhật hồ sơ:

```text
AccountProfileEditor
↓
useCustomerProfile
↓
customerService.updateProfile()
↓
PUT /api/v1/customers/me
↓
updateCustomerProfileSchema
↓
ensureCustomerProfile()
+ updateCustomerProfileByAccountId()
↓
iam.customer
```

## 3.3 Logout flow hiện tại

Không còn route page riêng cho logout.

Luồng hiện tại:

```text
AccountNavigation
↓
popup confirm logout
↓
useAuth.logout()
↓
authService.logout()
↓
supabase.auth.signOut()
↓
refresh auth state
↓
router.replace(ROUTES.HOME)
```

---

## 4. Database / quyền truy cập đang dùng

Flow account hiện tại đang bám các điểm sau trong docs database:

- `iam.customer`
  - map với `auth.uid()` qua `account_id`
  - cho phép owner đọc/cập nhật hồ sơ của chính mình

- `iam.address`
  - owner-based theo `customer_id = util.current_customer_id()`
  - page `Sổ địa chỉ` hiện chỉ đọc các address active của user hiện tại

- `iam.province`
  - dùng để map `province_id` sang `province_name` khi render sổ địa chỉ

Server/API side đang dùng:

- `createClient()` cho đọc session hiện tại
- `createAdminClient()` cho sync profile và query server-side cần quyền ổn định hơn

---

## 5. Những phần đã xong vs phần chưa chốt

## 5.1 Đã xong

- auth modal login/register theo Supabase Auth flow
- OAuth callback và profile sync
- route `auth/me` để đọc session hiện tại
- profile account page
- cập nhật hồ sơ cá nhân qua `PUT /api/v1/customers/me`
- birthday picker custom đẹp hơn date input native
- page `Sổ địa chỉ` đọc dữ liệu thật từ DB
- logout confirm popup trong menu account

## 5.2 Chưa chốt / chưa nên merge như API đầy đủ

- address management CRUD riêng cho màn `Sổ địa chỉ`
  - hiện docs API nói rõ chưa chốt API riêng cho màn này
  - vì vậy các nút thao tác trên page address mới là UI placeholder

- review/feedback page
  - nav có item nhưng chưa được implement ở nhánh này

- policy/account content page riêng cho account context
  - hiện đang trỏ về route policy chung

---

## 6. Gợi ý review / merge theo nhóm

## Nhóm 1: Auth core

- `src/services/auth.service.ts`
- `src/hooks/useAuth.ts`
- `src/app/api/v1/auth/me/route.ts`
- `src/app/api/v1/auth/callback/route.ts`
- `src/app/api/v1/auth/sync-profile/route.ts`
- `src/features/auth/auth.service.ts`
- `src/features/auth/profile-sync.service.ts`

Review chính:

- session có được refresh đúng sau login/register/logout không
- callback có sync profile ổn định không
- guest/authenticated state có rõ ràng không

## Nhóm 2: Account profile

- `src/app/account/profile/page.tsx`
- `src/components/organisms/AccountProfileEditor/AccountProfileEditor.tsx`
- `src/hooks/useCustomerProfile.ts`
- `src/services/customer.service.ts`
- `src/app/api/v1/customers/me/route.ts`
- `src/features/customers/customer-profile.service.ts`
- `src/validations/customer/update-customer-profile.schema.ts`

Review chính:

- validation profile update
- ownership theo session
- data customer update có sạch và không nhận `customer_id` từ client

## Nhóm 3: Account navigation + address page

- `src/components/organisms/AccountNavigation/AccountNavigation.tsx`
- `src/app/account/addresses/page.tsx`
- `src/features/customers/customer-address.service.ts`
- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/constants/routes.ts`

Review chính:

- logout popup/redirect
- page address có đúng scope read-only hiện tại không
- nav account có ổn định giữa profile/address/header không

---

## 7. Ghi chú cho team lead trước khi merge

1. Đây là một nhánh gộp cả auth follow-up và account area follow-up, không chỉ riêng modal login/register.
2. `Sổ địa chỉ` hiện phù hợp để merge ở mức page đọc dữ liệu thật + placeholder action, nhưng chưa nên hiểu là CRUD address đã hoàn thành.
3. Logout flow mới đã thay thế page `/logout`; nếu còn code cũ trỏ sang route này ở nhánh khác thì cần rebase/chỉnh lại.
4. Nếu muốn tách PR cho dễ review, nên tách tối thiểu thành:
   - auth core
   - account profile update
   - address page + account navigation/logout popup

