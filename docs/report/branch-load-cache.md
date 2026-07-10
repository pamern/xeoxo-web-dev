Mình đã audit luồng tải dữ liệu chính và áp một đợt tối ưu an toàn, đo được. Patch đã vào các file trọng tâm như [src/data/collections.api.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/data/collections.api.ts:1), [src/data/products.api.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/data/products.api.ts:1), [src/app/products/[slug]/page.tsx](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/products/[slug]/page.tsx:1), [src/hooks/useQuickAddProduct.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/hooks/useQuickAddProduct.ts:1), [src/lib/requestCache.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/lib/requestCache.ts:1), [src/app/api/v1/payment-methods/route.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/api/v1/payment-methods/route.ts:1), [src/app/api/v1/collections/latest/route.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/api/v1/collections/latest/route.ts:1), [src/features/homepage/homepage.service.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/features/homepage/homepage.service.ts:165), cộng thêm provider/query key/cache tag mới. `tsc --noEmit` đã pass.

**Executive Summary**
- `generateMetadata` và page đang lặp fetch public product/collection shell. Mình đã dedupe bằng `cache()` cho product detail shell và public collection/product fetch server-side. Xem [src/app/products/[slug]/page.tsx:22](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/products/[slug]/page.tsx:22), [src/data/collections.api.ts:119](/home/ngocmypzg/Projects/xeoxo-web-dev/src/data/collections.api.ts:119), [src/data/products.api.ts:62](/home/ngocmypzg/Projects/xeoxo-web-dev/src/data/products.api.ts:62).
- Public data đang có nhiều chỗ `no-store` không cần thiết, làm tăng TTFB và query volume. Mình đã chuyển collection/product shell sang server fetch cache có `revalidate` + tags.
- Cache tag `catalog` cũ quá rộng. Mình đã tách thành `homepage`, `products`, `collections`, `categories`, `payment-methods` trong [src/lib/cache-policy.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/lib/cache-policy.ts:1) và áp vào homepage/payment/highlight.
- `cachedFetch` cũ không giới hạn kích thước, không dọn entry hết hạn chủ động. Mình đã thêm cleanup + LRU cap 100 entry trong [src/lib/requestCache.ts:9](/home/ngocmypzg/Projects/xeoxo-web-dev/src/lib/requestCache.ts:9).
- Quick add đang cache theo từng tab bằng `Map` nhưng chưa tận dụng React Query dù project đã cài. Mình đã thêm `QueryClientProvider` và chuyển quick add sang `useQuery/prefetch/ensureQueryData` ở [src/hooks/useQuickAddProduct.ts:31](/home/ngocmypzg/Projects/xeoxo-web-dev/src/hooks/useQuickAddProduct.ts:31).
- `payment-methods` và `collections/latest` là public, ít đổi nhưng trước đây query Supabase mỗi lần. Mình đã thêm `unstable_cache` 5 phút ở hai route đó.
- Hotspot lớn nhất còn lại là các route legacy/internal vẫn `select("*")` và fan-out nhiều query, đặc biệt [src/app/api/products/[slug]/route.ts:20](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/api/products/[slug]/route.ts:20), [src/app/api/collections/[slug]/route.ts:48](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/api/collections/[slug]/route.ts:48), và [src/app/api/v1/product-lines/[slug]/route.ts:224](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/api/v1/product-lines/[slug]/route.ts:224).
- Checkout preview vẫn có N+1 theo số cart item khi validate variant/stock tại [src/features/checkout/checkout-server.service.ts:121](/home/ngocmypzg/Projects/xeoxo-web-dev/src/features/checkout/checkout-server.service.ts:121). Mình chưa đổi phần này vì cần refactor batch validation cẩn thận hơn.

| Endpoint/Page | Dữ liệu | Cache hiện tại | TTL | Invalidation | Đề xuất | Lý do |
| --- | --- | ---: | ---: | --- | --- | --- |
| `/` | homepage sections + collections | `unstable_cache` | 60s | tag `homepage/categories/products/collections` | Giữ server cache, đã tách tag | Tránh invalidate cả catalog khi đổi 1 phần |
| `/collections`, `/collections/[slug]` | public collections | trước đây `no-store` qua internal API, giờ server fetch cache | 300s | `collections`, `collection:{slug}` | Giữ cache server | Giảm TTFB và query lặp giữa metadata/page |
| `/products/[slug]` shell | public product shell, breadcrumb, related shell | trước đây `no-store`, giờ server fetch cache + request dedupe | 120s | `products`, `product:{slug}` | Giữ shell cache, còn inventory vẫn no-store | SEO/first paint nhanh hơn, không cache sai stock checkout |
| `/api/v1/collections/latest` | highlight homepage | trước đây không shared cache | 300s | `homepage`, `collections` | Đã thêm `unstable_cache` | Dữ liệu public, ít đổi |
| `/api/v1/payment-methods` | payment methods public | trước đây không shared cache | 300s | `payment-methods` | Đã thêm `unstable_cache` | Giảm query lặp ở checkout |
| Quick add client | size/availability modal | trước là `cachedFetch` per-tab | 30s + gc 5m | invalidate query key + cache prefix | Dùng React Query cho quick add | Prefetch/rehydrate tốt hơn, dedupe chuẩn hơn |
| Auth/account/checkout | dữ liệu cá nhân, giao dịch | `no-store` / dynamic | realtime | mutation-driven | Giữ uncached/shared-cache off | Không được rò dữ liệu giữa user |

| Query | Tần suất dự kiến | Vấn đề | Index/Rewrite | Lợi ích |
| --- | ---: | --- | --- | --- |
| `catalog.product_line WHERE slug = ? AND status='ACTIVE'` từ product detail | rất cao | lookup slug public lặp nhiều | partial index `(slug) WHERE status='ACTIVE'` | giảm TTFB product detail |
| `catalog.collection WHERE slug = ?` từ collection detail | cao | chưa thấy index rõ cho slug active | partial index `(slug) WHERE status='ACTIVE'` | nhanh hơn cho collection page |
| `catalog.collection WHERE status='ACTIVE' ORDER BY launch_date DESC, created_at DESC LIMIT 1` | cao | route latest chạy nhiều | partial index `(launch_date DESC, created_at DESC) WHERE status='ACTIVE'` | giảm CPU cho homepage highlight |
| `sales.order_item WHERE variant_id IN (...)` trong product detail/reviews | cao | dùng để map review theo variant | index `(variant_id)` | giảm query review fan-out |
| `sales.review WHERE order_item_id IN (...) AND review_status='DISPLAY' ORDER BY created_at DESC` | cao | review aggregation nặng | partial index `(order_item_id, created_at DESC) WHERE review_status='DISPLAY'` | giảm latency reviews |
| checkout validate per item | trung bình nhưng nhạy cảm | N+1 `getVariantById` + `getVariantStock` | rewrite batch lấy variants + inventory 1 lần | giảm latency checkout/cart preview |

**Kiến trúc cache đề xuất**
```text
Browser
-> TanStack Query cho quick add / client reopen-heavy data
-> local state hoặc Zustand cho UI/cart persistence
-> Next.js server/API
-> Next Data Cache cho public collection/product shell, homepage, payment methods
-> Supabase/PostgreSQL cho source of truth
```

**P0-P3**
- `P0`: rewrite batch validation cho `prepareCheckout()` để bỏ N+1 theo cart item.
- `P0`: bỏ `select("*")` khỏi [src/app/api/products/[slug]/route.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/api/products/[slug]/route.ts:20) và [src/app/api/collections/[slug]/route.ts](/home/ngocmypzg/Projects/xeoxo-web-dev/src/app/api/collections/[slug]/route.ts:48).
- `P1`: tách `product detail` thành critical payload và deferred payload, không kéo reviews/customer summary trong request đầu.
- `P1`: chuyển `collections/[slug]` và `products?collection=` từ internal API route sang feature service trực tiếp để bỏ 1 hop HTTP nội bộ.
- `P1`: bổ sung event-driven invalidation cho `product:{slug}`, `collection:{slug}`, `homepage`, `payment-methods`.
- `P2`: mở rộng React Query cho `payment methods`, `size chart`, `collection highlight` nếu còn nhiều refetch client.
- `P3`: thêm benchmark script và dashboard `pg_stat_statements`.

**SQL đề xuất**
```sql
create index concurrently if not exists idx_product_line_slug_active
on catalog.product_line (slug)
where status = 'ACTIVE';

create index concurrently if not exists idx_collection_slug_active
on catalog.collection (slug)
where status = 'ACTIVE';

create index concurrently if not exists idx_collection_active_launch_created
on catalog.collection (launch_date desc, created_at desc)
where status = 'ACTIVE';

create index concurrently if not exists idx_order_item_variant_id
on sales.order_item (variant_id);

create index concurrently if not exists idx_review_display_order_item_created
on sales.review (order_item_id, created_at desc)
where review_status = 'DISPLAY';

create index concurrently if not exists idx_customer_guest_phone
on iam.customer (phone)
where customer_type = 'GUEST';
```

**`pg_stat_statements` audit queries**
```sql
select query, calls, total_exec_time, mean_exec_time, rows, shared_blks_read, temp_blks_read
from pg_stat_statements
order by total_exec_time desc
limit 20;

select query, calls, mean_exec_time, rows
from pg_stat_statements
where query ilike '%catalog.product_line%' or query ilike '%sales.review%'
order by mean_exec_time desc
limit 20;
```

**Benchmark plan**
- Trước/sau đo `homepage TTFB`, `product detail TTFB`, `quick add open time`, `checkout preview time`.
- Đếm số request Supabase cho homepage, collection detail, product detail.
- So sánh `mean_exec_time` và `calls` của các query product/collection/review trong `pg_stat_statements`.
- Đo payload size route `/api/products/[slug]`, `/api/collections/[slug]`, `/api/v1/product-lines/[slug]`.
- Thành công khi: homepage/product shell giảm query count, quick add mở lại gần như instant từ cache, và checkout preview không tăng sai lệch giá/tồn kho.

Phần đã thay đổi trong repo giữ nguyên behavior hiện tại, chỉ dời cache về đúng tầng hơn. Phần mình chưa sửa trực tiếp là batch checkout/cart validation và các route legacy `select("*")`, vì đó là hai chỗ nên làm tiếp ngay nhưng cần một patch riêng để tránh regression nghiệp vụ.