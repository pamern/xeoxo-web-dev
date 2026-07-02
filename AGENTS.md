# XEOXO Web - Agent Instructions

## 1. Mục tiêu

File này quy định cách agent định hướng tài liệu và workflow code trước khi thực hiện một tác vụ trong project XEOXO Web.

Mục tiêu:

- Code đồng nhất giữa các thành viên.
- Tách rõ trách nhiệm từng folder/layer.
- Dễ review, dễ debug, dễ mở rộng.
- Mỗi chức năng mới đi đúng layer cần thiết: UI -> Service/API -> Feature -> Database -> Docs. Chỉ thêm Hook khi cần quản lý state phía client.
- Agent phải xác định tác vụ thuộc nhóm nào và đọc đúng tài liệu trong `docs/` trước khi sửa.

Nguyên tắc chung:

- Không bắt đầu sửa code khi chưa đọc tài liệu liên quan trực tiếp.
- Không đọc tất cả docs một cách máy móc nếu tác vụ chỉ liên quan một nhóm nhỏ.
- Nếu tác vụ chạm nhiều lớp, đọc docs theo thứ tự: `database` -> `api` -> `uiux` -> code hiện có.
- Nếu docs và code khác nhau, ưu tiên báo lại sự khác biệt trong câu trả lời hoặc ghi chú trước khi thay đổi hành vi lớn.
- Không tự mở rộng phạm vi sang chức năng ngoài yêu cầu.

---

## 2. Bản đồ tài liệu

### API docs

Dùng khi tác vụ liên quan đến endpoint, route handler, request/response, validation, auth API, service call, frontend service layer.

Tài liệu cần đọc:

- `docs/api/api_documentation.md`
- `docs/api/API_RULES.md`

### Database docs

Dùng khi tác vụ liên quan đến schema, bảng, cột, enum, relation, RLS, view, index, Supabase access, quyền đọc/ghi dữ liệu.

Tài liệu cần đọc:

- `docs/database/database_schema.md`
- `docs/database/schema_access_control.md`
- `docs/database/web_access_spec.md`

### UI/UX docs

Dùng khi tác vụ liên quan đến giao diện, component, layout, page, Figma mapping, atomic design, reusable UI, visual consistency.

Tài liệu cần đọc:

- `docs/uiux/figma-component-architecture.md`

---

## 3. Điều hướng theo loại tác vụ

| Tác vụ | Bắt buộc đọc | Nên đọc thêm |
|---|---|---|
| Tạo/sửa API route | `docs/api/api_documentation.md`, `docs/api/API_RULES.md` | `docs/database/database_schema.md`, `docs/database/schema_access_control.md` |
| Sửa request/response format | `docs/api/api_documentation.md` | `src/lib/api-response.ts`, code route/service hiện có |
| Thêm validation query/body | `docs/api/api_documentation.md` | Database schema của bảng liên quan |
| Làm checkout/cart/order/profile/loyalty | API docs + database docs | UI/UX docs nếu có thay đổi màn hình |
| Sửa Supabase query/view/RLS | `docs/database/schema_access_control.md`, `docs/database/web_access_spec.md` | `docs/database/database_schema.md` |
| Thêm/sửa field database | `docs/database/database_schema.md` | API docs nếu field expose qua endpoint |
| Sửa component UI | `docs/uiux/figma-component-architecture.md` | API docs nếu component dùng data từ API |
| Tạo page mới | `docs/uiux/figma-component-architecture.md` | API docs + database docs nếu page cần data động |
| Sửa listing/product detail/cart UI | UI/UX docs | API docs + database docs |
| Sửa auth/login/register UI | UI/UX docs | API docs nếu có route/session change |
| Sửa quyền truy cập dữ liệu cá nhân | `docs/database/schema_access_control.md` | API docs security section |
| Sửa doc API | `docs/api/api_documentation.md`, `docs/api/API_RULES.md` | Database docs nếu endpoint liên quan bảng/view |
| Sửa doc database | `docs/database/database_schema.md`, `docs/database/schema_access_control.md`, `docs/database/web_access_spec.md` | API docs nếu thay đổi ảnh hưởng endpoint |
| Sửa doc UI/UX | `docs/uiux/figma-component-architecture.md` | Code component/page hiện có |

---

## 4. Luồng code chuẩn

```text
Page
↓
Component
↓
Hook nếu cần client state/fetch/submit/refetch
↓
Frontend Service
↓
API Route
↓
Validation
↓
Feature Service
↓
Supabase / Database
↓
Response
↓
Hook cập nhật state nếu có dùng hook
↓
Component render UI
```

Quy tắc chốt:

```text
Page không chứa business logic.
Component không gọi API/Supabase.
Hook không bắt buộc cho mọi tác vụ.
Hook dùng khi cần gom loading/error/refetch/submit/client state.
Service gọi API.
API gọi feature service.
Feature service gọi Supabase.
Database chỉ được truy cập qua server/API.
Docs phải đi cùng code.
```

---

## 5. Quy định theo layer

### Page

Vị trí:

```text
src/app/
```

Page chỉ làm:

- Gọi hook nếu page là client flow cần state/fetch/submit/refetch.
- Ghép layout.
- Truyền data xuống component.
- Với server-side data đơn giản, page có thể lấy data theo pattern hiện có rồi truyền props xuống component.

Không làm:

- Không gọi Supabase trực tiếp.
- Không viết query database.
- Không xử lý logic nghiệp vụ dài.

### Component

Vị trí:

```text
src/components/
```

Component chỉ làm UI:

- Nhận props.
- Render giao diện.
- Gọi callback.

Không làm:

- Không gọi API trực tiếp.
- Không gọi Supabase.
- Không chứa business logic.

### Hook

Vị trí:

```text
src/hooks/
```

Hook dùng để:

- Gọi frontend service.
- Quản lý loading.
- Quản lý error.
- Quản lý refetch.
- Quản lý submit/mutation phía client.
- Kết nối store nếu cần.

Hook không bắt buộc khi:

- Component chỉ nhận props và render UI.
- Page là Server Component lấy data server-side đơn giản.
- UI tĩnh, không fetch/submit/refetch.
- Logic chỉ dùng một lần và đủ ngắn để đặt ở page/client component mà không làm rối trách nhiệm.

Ví dụ:

```ts
const { data, isLoading, error } = useProducts(filters);
```

### Frontend Service

Vị trí:

```text
src/services/
```

Service dùng để gọi API:

```ts
productService.getProducts();
cartService.addItem();
orderService.createOrder();
```

Quy định:

- Chỉ gọi `/api/...`.
- Không gọi Supabase trực tiếp.
- Không xử lý UI.
- Parse response chuẩn trước khi trả cho hook.

### API Route

Vị trí:

```text
src/app/api/
```

API route chỉ làm:

```text
1. Nhận request
2. Đọc params/body
3. Check auth nếu cần
4. Validate dữ liệu
5. Gọi feature service
6. Trả response chuẩn
```

Không làm:

- Không viết business logic dài.
- Không query database trực tiếp nếu logic phức tạp.
- Không trả response sai format chuẩn.

### Validation

Vị trí:

```text
src/validations/
```

Quy định:

- Request body phải validate bằng Zod.
- Query phức tạp cũng nên validate.
- Không validate thủ công rải rác.

### Feature Service

Vị trí:

```text
src/features/
```

Feature service chứa logic nghiệp vụ:

- Query Supabase.
- Gọi view/RPC/table.
- Kiểm tra owner dữ liệu.
- Xử lý rule nghiệp vụ.
- Trả data sạch cho API route.

Không làm:

- Không render UI.
- Không dùng React hook.
- Không phụ thuộc component.

### Supabase Client

Vị trí:

```text
src/lib/supabase/
```

Quy định:

```text
client.ts      -> browser client
server.ts      -> server/API route
middleware.ts  -> xử lý session
```

- Frontend chỉ được dùng browser client khi thật sự cần và đúng RLS.
- API route/server code dùng server client.
- Các thao tác nhạy cảm phải đi qua server/API, không gọi trực tiếp từ component.

---

## 6. Chuẩn response API

Tất cả API trả về thông qua helper trong `src/lib/api-response.ts`.

Response thành công:

```ts
{
  success: true;
  data?: unknown;
  message?: string;
}
```

Response lỗi:

```ts
{
  success: false;
  message: string;
  error?: unknown;
}
```

Quy định:

- Không trả response mỗi route một kiểu.
- Message lỗi phải rõ nghĩa, không expose stack trace hoặc lỗi database thô ra frontend.
- Status HTTP phải khớp bản chất lỗi/thành công.

---

## 7. Quy trình làm một chức năng mới

Ví dụ làm chức năng Cart:

```text
1. Đọc docs liên quan
2. Tạo type
3. Tạo validation schema
4. Tạo feature service
5. Tạo API route
6. Tạo frontend service
7. Tạo hook nếu cần quản lý client state/loading/error/refetch/submit
8. Gắn vào page/component
9. Test success case
10. Test error case
11. Cập nhật docs
```

Nếu chức năng chỉ là UI tĩnh, không cần ép đi qua API/service/database.

---

## 8. Quy tắc API

Khi làm API:

- Không đưa `UI Ref`, Figma node, hoặc mã màn hình vào API documentation.
- API documentation chỉ mô tả nghiệp vụ, module, endpoint, method, auth, request, response, validation, business rules, database/view liên quan và security.
- Endpoint dùng danh từ số nhiều, không dùng động từ.
- API protected không được tin `customer_id` gửi từ frontend; phải suy ra từ session/token phía server.
- API có body hoặc query phức tạp phải có validation.
- API route phải gọi feature service khi có logic nghiệp vụ hoặc query phức tạp.

Ví dụ route đúng hướng REST:

```text
GET    /api/v1/products
GET    /api/v1/products/[slug]
POST   /api/v1/cart/items
PATCH  /api/v1/cart/items/[id]
DELETE /api/v1/cart/items/[id]
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/[id]
```

Không dùng:

```text
/api/getProducts
/api/createOrder
/api/updateCart
```

---

## 9. Quy tắc database

Khi làm database/Supabase:

- Kiểm tra bảng/cột/enum trong `docs/database/database_schema.md`.
- Kiểm tra role và RLS trong `docs/database/schema_access_control.md`.
- Kiểm tra view/index/grant đã triển khai trong `docs/database/web_access_spec.md`.
- Không expose trực tiếp bảng nhạy cảm cho frontend nếu docs đang yêu cầu đi qua API/backend.
- Không đưa `service_role` key vào frontend.
- Nếu thêm field được frontend/API sử dụng, cập nhật cả database docs và API docs liên quan.

---

## 10. Quy tắc UI/UX

Khi làm UI:

- Đọc `docs/uiux/figma-component-architecture.md` để chọn đúng component, page template và reuse pattern.
- Ưu tiên component sẵn có trong `src/components/` trước khi tạo component mới.
- Nếu tạo component mới, đặt vào đúng tầng atomic design: `atoms`, `molecules`, `organisms`, `templates`.
- Không trộn logic API/database phức tạp trực tiếp vào component UI nếu project đã có service/feature pattern phù hợp.
- Nếu UI cần data mới, kiểm tra API docs trước khi tự ý query database trực tiếp.

---

## 11. Quy tắc đặt tên

Folder/file dùng kebab-case hoặc camelCase/PascalCase theo loại file và pattern hiện có:

```text
product.service.ts
cart.service.ts
order.type.ts
checkout.schema.ts
useProducts.ts
ProductCard.tsx
```

Quy định:

- Component React dùng PascalCase.
- Hook bắt đầu bằng `use`.
- Service nên có hậu tố `.service.ts`.
- Validation schema nên có hậu tố `.schema.ts`.
- Type nên có hậu tố `.type.ts` hoặc đặt trong `src/types/` theo pattern hiện có.

---

## 12. Quy tắc docs

Sau khi thêm/sửa API, cập nhật:

```text
docs/api/
```

Không được phép sửa database nếu người dùng không yêu cầu rõ.

Sau khi thêm/sửa flow màn hình hoặc component architecture, cập nhật:

```text
docs/uiux/
```

Nếu thay đổi chạm nhiều lớp, cập nhật tất cả nhóm docs liên quan trong cùng lần sửa.

---

## 13. Khi docs thiếu hoặc mâu thuẫn

Nếu docs thiếu thông tin:

- Đọc code hiện có để suy luận theo pattern hiện tại.
- Ghi rõ giả định trong câu trả lời hoặc comment ngắn nếu cần.
- Nếu thay đổi contract quan trọng, cập nhật docs.

Nếu docs mâu thuẫn nhau:

- Database thực tế/trạng thái đã triển khai trong `web_access_spec.md` ưu tiên cho RLS/view/index.
- `database_schema.md` ưu tiên cho tên bảng/cột/enum thiết kế.
- `api_documentation.md` và `API_RULES.md` ưu tiên cho chuẩn endpoint/request/response.
- `figma-component-architecture.md` ưu tiên cho component/page UI.
- Báo lại mâu thuẫn nếu nó có thể ảnh hưởng hành vi sản phẩm.

---

## 14. Checklist trước khi merge/kết thúc

Trước khi sửa:

```text
[ ] Đã xác định tác vụ thuộc API/database/UIUX hay kết hợp
[ ] Đã đọc docs bắt buộc
[ ] Đã tìm code hiện có liên quan
[ ] Đã đối chiếu docs với code
```

Trước khi kết thúc:

```text
[ ] Code đúng folder/layer
[ ] Không gọi Supabase trực tiếp trong component
[ ] Component không chứa business logic
[ ] Nếu có hook, hook gọi service và chỉ quản lý state/client flow
[ ] Service gọi API
[ ] API có response chuẩn
[ ] API protected có check auth
[ ] Request body có validate nếu cần
[ ] Không nhận customer_id nguy hiểm từ frontend
[ ] Có type đầy đủ ở phần code mới hoặc code sửa
[ ] Không hard-code message rải rác
[ ] Đã test success case nếu có thể
[ ] Đã test error case nếu có thể
[ ] Nếu đổi contract, docs liên quan đã được cập nhật
[ ] Nếu không test được, đã nói rõ lý do
[ ] Đã tóm tắt file thay đổi và điểm cần chú ý
```
