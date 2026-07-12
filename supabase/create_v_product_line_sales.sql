-- View tổng hợp số lượng đã bán theo product_line, dùng cho mục "Bán chạy nhất".
-- Chỉ tính các đơn hàng đã hoàn tất (COMPLETED) để tránh đếm đơn đang chờ/đã huỷ.

CREATE OR REPLACE VIEW catalog.v_product_line_sales AS
SELECT
    pc.product_line_id,
    SUM(oi.quantity)::BIGINT AS sold_quantity
FROM sales.order_item oi
JOIN sales.sales_order so ON so.order_id = oi.order_id
JOIN catalog.product_variant pv ON pv.variant_id = oi.variant_id
JOIN catalog.product_component pc ON pc.component_id = pv.component_id
WHERE so.order_status = 'COMPLETED'
GROUP BY pc.product_line_id;

COMMENT ON VIEW catalog.v_product_line_sales IS
    'Tổng số lượng đã bán (đơn COMPLETED) theo product_line_id, dùng để sort "Bán chạy nhất".';

-- Cấp quyền đọc cho các role PostgREST dùng, nếu không sẽ bị "permission denied for view".
GRANT SELECT ON catalog.v_product_line_sales TO anon, authenticated, service_role;
