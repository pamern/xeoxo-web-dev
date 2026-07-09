# Develop Flow Update - Chi tiet V3 Feature Tra cuu

## Pham vi xu ly conflict

Tai thoi diem resolve merge conflict, cac file conflict truc tiep gom:

- `src/app/api/v1/cart-items/route.ts`
- `src/app/api/v1/cart-items/[cart_item_id]/route.ts`
- `src/app/api/v1/measurement-appointments/route.ts`
- `src/app/appointment/page.tsx`
- `src/services/appointment.service.ts`

Can cu chinh de lua chon huong merge la `docs/database/database_schema.md`, tap trung vao 2 cum schema:

- `CART_ITEM`: `item_type = {STANDARD, CUSTOMIZED}`, trong do:
  - `STANDARD` => `variant_id` bat buoc, `customization_id` phai `NULL`
  - `CUSTOMIZED` => `customization_id` bat buoc, `variant_id` phai `NULL`
- `MEASUREMENT_APPOINTMENT`: nghiep vu doc lap voi `customization_request`; co the dat lich truoc khi tao yeu cau may do

## Nguyen tac resolve

### 1. Cart item

Huong merge duoc chon la giu logic ho tro ca 2 loai san pham trong gio hang:

- San pham `STANDARD` di theo `variant_id`
- San pham `CUSTOMIZED` di theo `customization_id`

Ly do:

- Phu hop rang buoc schema `sales.cart_item`
- Tranh lam mat flow `customization` vua duoc them o nhanh `product detail customization flow`
- Van giu duoc logic cart cap nhat/xoa cua nhanh con lai

### 2. Measurement appointment

Huong merge duoc chon la hop nhat 2 use case khac nhau tren dung endpoint:

- `GET /api/v1/measurement-appointments`: danh sach lich hen cua customer da dang nhap
- `POST /api/v1/measurement-appointments`: tao lich hen moi cho guest hoac customer
- `GET /api/v1/measurement-appointments/lookup`: tra cuu cong khai theo `appointment_id + contact` giu nguyen o route rieng

Ly do:

- Phu hop `docs/api/api_documentation.yaml`
- Phu hop schema `measurement_appointment` la nghiep vu doc lap, khong can loai bo mot trong hai flow

## Noi dung da chinh sua

### `src/app/api/v1/cart-items/route.ts`

- Loai bo phan conflict gay validate `variant_id` qua som cho moi truong hop, vi item `CUSTOMIZED` khong dung `variant_id`
- Giu logic phan nhanh theo `item_type`
- Chot `insertData.item_type = itemType` thay vi hard-code `STANDARD`
- Dung `isVariantPurchasableStatus(...)` de dong bo voi helper cart hien tai

Ket qua:

- Flow them vao gio hang cho san pham thuong van dung `variant_id`
- Flow them vao gio hang cho san pham may do dung `customization_id` va khong vi pham schema

### `src/app/api/v1/cart-items/[cart_item_id]/route.ts`

- Resolve conflict phan `PATCH` bang cach giu `nextVariantId` va `nextQuantity`
- Bo sung validate `variant_id` cho nhanh `STANDARD`
- Dung `isVariantPurchasableStatus(...)` thay vi check cung `status === "ACTIVE"`

Ket qua:

- Update cart item cho `STANDARD` khong bi loi bien chua khai bao
- Logic kiem tra variant kha dung nhat quan voi cac route cart khac

### `src/app/api/v1/measurement-appointments/route.ts`

- Hop nhat ca `GET` va `POST` vao cung file route
- `GET` giu chuc nang xem danh sach lich hen cua customer
- `POST` giu chuc nang dat lich moi
- Chot `POST` tra `201` de dung nghia tao moi resource

Ket qua:

- Khong mat chuc nang nao sau khi merge
- Route phu hop ca tai lieu API va schema database

### `src/app/appointment/page.tsx`

- Giu `AppointmentLookupExperience`
- Loai bo phan conflict khong con duoc su dung
- Giu `searchParams` de preload tra cuu tu query string

Ket qua:

- Trang tra cuu lich hen khong bi vo type sau merge

### `src/services/appointment.service.ts`

- Hop nhat 2 huong export:
  - `appointmentService.lookupAppointment(...)`
  - `createAppointment(...)`
- Giu API service dang duoc component/hook hien tai su dung

Ket qua:

- Khong gay regression cho:
  - hook tra cuu lich hen
  - modal dat lich

## Ghi chu kien truc

Qua trinh resolve co 1 diem can luu y:

- `measurement_appointment` va `customization_request` la 2 nghiep vu lien quan nhung khong dong nhat
- Vi vay, neu co them man hinh/endpoint sau nay thi khong nen ep route dat lich va route tao yeu cau may do dung chung mot model du lieu

## Kiem tra sau khi resolve

Da kiem tra lai:

- Conflict markers da duoc loai bo khoi cac file conflict truc tiep
- Logic cart sau merge phu hop rang buoc `item_type`
- Route appointment sau merge khong loai bo flow nao

Chua thuc hien:

- Chua chay test/typecheck toan bo project trong buoc nay
