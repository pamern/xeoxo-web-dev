# Supabase Permissions For Catalog

Tài liệu này mô tả cách cấp quyền đọc public cho dữ liệu catalog bán hàng trong Supabase. Mục tiêu là frontend có thể đọc các danh mục, bộ sưu tập, dòng sản phẩm, biến thể, chất liệu, màu sắc và media đang được phép hiển thị, nhưng không có quyền ghi hoặc đọc dữ liệu chưa public.

## Nguyên Tắc

- App bán hàng public dùng `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Không dùng `service_role` trong code frontend hoặc route bán hàng thông thường.
- Schema `catalog` phải được expose trong Supabase Data API trước khi client query được.
- `GRANT` chỉ mở quyền SQL cơ bản cho role.
- `RLS policy` mới quyết định row nào được đọc.
- Dữ liệu public nên lọc bằng trạng thái như `ACTIVE` hoặc `is_active = true`.

## Role Đang Dùng

`anon` là role dành cho người dùng chưa đăng nhập. Đây là role chính cho website bán hàng public.

Team chỉ cấp `SELECT` cho `anon` trên các bảng cần hiển thị ở storefront. Không cấp `INSERT`, `UPDATE`, `DELETE` cho `anon`.

Khi sau này có đăng nhập khách hàng, dùng thêm role `authenticated` và policy riêng cho dữ liệu tài khoản, đơn hàng, địa chỉ, giỏ hàng server-side.

## Bật Data API Cho Schema Catalog

Trong Supabase Dashboard:

```txt
Project Settings -> Data API -> Exposed schemas
```

Thêm schema:

```txt
catalog
```

Nếu chưa expose `catalog`, API sẽ trả lỗi dạng:

```txt
Invalid schema: catalog
Only the following schemas are exposed: public, graphql_public
```

## SQL Cấu Hình Quyền Public Catalog

Chạy script này trong Supabase SQL Editor. Chạy rồi

```sql
-- 1. Bật RLS
ALTER TABLE catalog.category ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_component ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_variant ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.material ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.color ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog.product_line_media ENABLE ROW LEVEL SECURITY;

-- 2. Grant quyền đọc cho anon
GRANT USAGE ON SCHEMA catalog TO anon;

GRANT SELECT ON TABLE catalog.category TO anon;
GRANT SELECT ON TABLE catalog.collection TO anon;
GRANT SELECT ON TABLE catalog.product_line TO anon;
GRANT SELECT ON TABLE catalog.product_component TO anon;
GRANT SELECT ON TABLE catalog.product_variant TO anon;
GRANT SELECT ON TABLE catalog.material TO anon;
GRANT SELECT ON TABLE catalog.color TO anon;
GRANT SELECT ON TABLE catalog.media TO anon;
GRANT SELECT ON TABLE catalog.product_line_media TO anon;

-- 3. Policy đọc public
CREATE POLICY "anon can read active categories"
ON catalog.category
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "anon can read active collections"
ON catalog.collection
FOR SELECT
TO anon
USING (status = 'ACTIVE');

CREATE POLICY "anon can read active product lines"
ON catalog.product_line
FOR SELECT
TO anon
USING (status = 'ACTIVE');

CREATE POLICY "anon can read active variants"
ON catalog.product_variant
FOR SELECT
TO anon
USING (status = 'ACTIVE');

CREATE POLICY "anon can read materials"
ON catalog.material
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "anon can read colors"
ON catalog.color
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon can read media"
ON catalog.media
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon can read product components"
ON catalog.product_component
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM catalog.product_line pl
    WHERE pl.product_line_id = product_component.product_line_id
      AND pl.status = 'ACTIVE'
  )
);

CREATE POLICY "anon can read product line media"
ON catalog.product_line_media
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM catalog.product_line pl
    WHERE pl.product_line_id = product_line_media.product_line_id
      AND pl.status = 'ACTIVE'
  )
);

-- 4. Storage: chỉ cho đọc bucket product-media
CREATE POLICY "anon can read product media"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'product-media');
```

## Cách App Query Catalog

Server route hoặc Server Component dùng helper:

```ts
import { createClient } from "@/lib/supabase/server";

const supabase = await createClient();

const { data, error } = await supabase
  .schema("catalog")
  .from("product_line")
  .select("*")
  .limit(5);
```

Client Component dùng helper:

```ts
"use client";

import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

const { data, error } = await supabase
  .schema("catalog")
  .from("product_line")
  .select("*")
  .limit(5);
```

Với quyền hiện tại, client chỉ đọc được các dòng có `status = 'ACTIVE'`.

## Cách Hiểu Grant Và Policy

`GRANT USAGE ON SCHEMA catalog TO anon` cho phép role `anon` nhìn thấy schema `catalog`.

`GRANT SELECT ON TABLE ... TO anon` cho phép role `anon` thực hiện query `SELECT` trên bảng.

RLS policy quyết định từng row có được trả về hay không. Ví dụ `product_line` chỉ trả row có:

```sql
status = 'ACTIVE'
```

Nếu thiếu `GRANT`, query có thể lỗi `permission denied`. Nếu có `GRANT` nhưng policy không match, query thường trả mảng rỗng.

## Checklist Khi Bị Lỗi

Lỗi `Invalid schema: catalog`: vào Data API và expose schema `catalog`.

Lỗi `permission denied for schema catalog`: thiếu `GRANT USAGE ON SCHEMA catalog TO anon`.

Lỗi `permission denied for table ...`: thiếu `GRANT SELECT ON TABLE ... TO anon`.

Query trả `[]` dù có dữ liệu: kiểm tra RLS policy và trạng thái dữ liệu. Ví dụ `product_line.status` phải là `ACTIVE`.

Ảnh không load từ storage: kiểm tra bucket id là `product-media` và policy trên `storage.objects`.

## Quy Định Cho Team

- Không paste hoặc commit `service_role` key.
- Không dùng `service_role` cho các route public storefront.
- Khi thêm bảng catalog mới, phải bật RLS, grant quyền đọc tối thiểu, và viết policy public rõ điều kiện. Hiện tại không được phép tự bật.
- Khi thêm dữ liệu cần public, đảm bảo cột trạng thái đúng với policy, ví dụ `ACTIVE` hoặc `is_active = true`.
- Policy public chỉ nên cho đọc dữ liệu đã publish. Dữ liệu draft, inactive, private không được lộ qua `anon`.
