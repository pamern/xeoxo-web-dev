-- Script chèn dữ liệu mock đơn hàng đầy đủ 7 trạng thái để kiểm thử
-- Chạy script này trong Supabase SQL Editor

-- Lưu ý: ID của khách hàng "Giang Trần Ngọc Châu" hiện tại trong DB là 8.
-- Các sản phẩm được sử dụng:
--   - Variant ID 1: Áo dài Thanh Kỳ (giá 2,450,000 VND)
--   - Variant ID 6: Áo dài Sắc Kỳ (giá 1,350,000 VND)

-- Xóa sạch dữ liệu đơn hàng cũ của customer 8 để tránh trùng lặp
DELETE FROM sales.shipping WHERE order_id IN (SELECT order_id FROM sales.sales_order WHERE customer_id = 8);
DELETE FROM sales.order_item WHERE order_id IN (SELECT order_id FROM sales.sales_order WHERE customer_id = 8);
DELETE FROM sales.sales_order WHERE customer_id = 8;

-- Lấy address_id ngẫu nhiên hoặc mặc định của customer 8 để liên kết vận chuyển
-- (Nếu customer 8 chưa có địa chỉ nào, câu lệnh dưới sẽ trả về NULL và ta sẽ tạo 1 địa chỉ mặc định)
DO $$
DECLARE
    addr_id INT;
BEGIN
    SELECT address_id INTO addr_id FROM iam.address WHERE customer_id = 8 LIMIT 1;
    
    IF addr_id IS NULL THEN
        INSERT INTO iam.address (customer_id, recipient_name, recipient_phone, province_id, district_name, address_detail, is_default, is_active, created_at, updated_at)
        VALUES (8, 'Giang Trần Ngọc Châu', '0912345678', 1, 'Quận 1', '123 Nguyễn Huệ, Phường Bến Nghé', true, true, NOW(), NOW())
        RETURNING address_id INTO addr_id;
    END IF;
END $$;


-- ============================================================================
-- 1. PENDING: Chờ xác nhận (Chờ thanh toán)
-- ============================================================================
INSERT INTO sales.sales_order (order_code, customer_id, order_date, reward_dicount_amount, shipping_fee, total_amount, order_status, payment_status, customer_note, created_at, updated_at)
VALUES ('ORD202607080001', 8, NOW() - INTERVAL '1 hour', 0, 30000, 2480000, 'PENDING', 'PENDING', 'Mong shop đóng gói cẩn thận', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour');

INSERT INTO sales.order_item (order_id, variant_id, customization_id, item_type, quantity, unit_price, discount_amount, line_total, created_at)
VALUES ((SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080001'), 1, NULL, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '1 hour');

INSERT INTO sales.shipping (order_id, address_id, shipping_provider, tracking_code, shipping_status, created_at, updated_at)
VALUES (
    (SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080001'),
    (SELECT address_id FROM iam.address WHERE customer_id = 8 LIMIT 1),
    'Giao hàng nhanh', 'GHN-PENDING-123', 'PENDING', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'
);

-- ============================================================================
-- 2. CONFIRMED: Đã xác nhận
-- ============================================================================
INSERT INTO sales.sales_order (order_code, customer_id, order_date, reward_dicount_amount, shipping_fee, total_amount, order_status, payment_status, customer_note, created_at, updated_at)
VALUES ('ORD202607080002', 8, NOW() - INTERVAL '3 hours', 0, 30000, 1380000, 'CONFIRMED', 'PAID', NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours');

INSERT INTO sales.order_item (order_id, variant_id, customization_id, item_type, quantity, unit_price, discount_amount, line_total, created_at)
VALUES ((SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080002'), 6, NULL, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '3 hours');

INSERT INTO sales.shipping (order_id, address_id, shipping_provider, tracking_code, shipping_status, created_at, updated_at)
VALUES (
    (SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080002'),
    (SELECT address_id FROM iam.address WHERE customer_id = 8 LIMIT 1),
    'Giao hàng tiết kiệm', 'GHTK-CONFIRMED-456', 'CONFIRMED', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'
);

-- ============================================================================
-- 3. PACKING: Đang chuẩn bị hàng
-- ============================================================================
INSERT INTO sales.sales_order (order_code, customer_id, order_date, reward_dicount_amount, shipping_fee, total_amount, order_status, payment_status, customer_note, created_at, updated_at)
VALUES ('ORD202607080003', 8, NOW() - INTERVAL '6 hours', 0, 0, 2450000, 'PACKING', 'PAID', NULL, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours');

INSERT INTO sales.order_item (order_id, variant_id, customization_id, item_type, quantity, unit_price, discount_amount, line_total, created_at)
VALUES ((SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080003'), 1, NULL, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '6 hours');

INSERT INTO sales.shipping (order_id, address_id, shipping_provider, tracking_code, shipping_status, created_at, updated_at)
VALUES (
    (SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080003'),
    (SELECT address_id FROM iam.address WHERE customer_id = 8 LIMIT 1),
    'Giao hàng nhanh', 'GHN-PACKING-789', 'PACKING', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours'
);

-- ============================================================================
-- 4. SHIPPING: Đang giao hàng
-- ============================================================================
INSERT INTO sales.sales_order (order_code, customer_id, order_date, reward_dicount_amount, shipping_fee, total_amount, order_status, payment_status, customer_note, created_at, updated_at)
VALUES ('ORD202607080004', 8, NOW() - INTERVAL '12 hours', 0, 30000, 2730000, 'SHIPPING', 'PAID', NULL, NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours');

INSERT INTO sales.order_item (order_id, variant_id, customization_id, item_type, quantity, unit_price, discount_amount, line_total, created_at)
VALUES ((SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080004'), 6, NULL, 'STANDARD', 2, 1350000, 0, 2700000, NOW() - INTERVAL '12 hours');

INSERT INTO sales.shipping (order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, created_at, updated_at)
VALUES (
    (SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080004'),
    (SELECT address_id FROM iam.address WHERE customer_id = 8 LIMIT 1),
    'Viettel Post', 'VT-DELIVERING-999', 'SHIPPING', NOW() - INTERVAL '8 hours', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '8 hours'
);

-- ============================================================================
-- 5. COMPLETED: Giao hàng thành công (Hoàn thành)
-- ============================================================================
INSERT INTO sales.sales_order (order_code, customer_id, order_date, reward_dicount_amount, shipping_fee, total_amount, order_status, payment_status, customer_note, created_at, updated_at)
VALUES ('ORD202607080005', 8, NOW() - INTERVAL '1 day', 0, 30000, 2480000, 'COMPLETED', 'PAID', 'Giao buổi chiều nhé', NOW() - INTERVAL '1 day', NOW() - INTERVAL '10 hours');

INSERT INTO sales.order_item (order_id, variant_id, customization_id, item_type, quantity, unit_price, discount_amount, line_total, created_at)
VALUES ((SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080005'), 1, NULL, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '1 day');

INSERT INTO sales.shipping (order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at)
VALUES (
    (SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080005'),
    (SELECT address_id FROM iam.address WHERE customer_id = 8 LIMIT 1),
    'Giao hàng tiết kiệm', 'SPXVNO68026217776', 'DELIVERED', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '14 hours', NOW() - INTERVAL '1 day', NOW() - INTERVAL '14 hours'
);

-- ============================================================================
-- 6. CANCELLED: Đã huỷ
-- ============================================================================
INSERT INTO sales.sales_order (order_code, customer_id, order_date, reward_dicount_amount, shipping_fee, total_amount, order_status, payment_status, customer_note, created_at, updated_at)
VALUES ('ORD202607080006', 8, NOW() - INTERVAL '2 days', 0, 30000, 1380000, 'CANCELLED', 'PENDING', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

INSERT INTO sales.order_item (order_id, variant_id, customization_id, item_type, quantity, unit_price, discount_amount, line_total, created_at)
VALUES ((SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080006'), 6, NULL, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '2 days');

INSERT INTO sales.shipping (order_id, address_id, shipping_provider, tracking_code, shipping_status, created_at, updated_at)
VALUES (
    (SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080006'),
    (SELECT address_id FROM iam.address WHERE customer_id = 8 LIMIT 1),
    'Giao hàng tiết kiệm', 'GHTK-CANCELLED-777', 'CANCELLED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
);

-- ============================================================================
-- 7. RETURNED: Đã hoàn trả
-- ============================================================================
INSERT INTO sales.sales_order (order_code, customer_id, order_date, reward_dicount_amount, shipping_fee, total_amount, order_status, payment_status, customer_note, created_at, updated_at)
VALUES ('ORD202607080007', 8, NOW() - INTERVAL '3 days', 0, 30000, 2480000, 'RETURNED', 'REFUNDED', 'Lỗi đường may ở tay áo', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day');

INSERT INTO sales.order_item (order_id, variant_id, customization_id, item_type, quantity, unit_price, discount_amount, line_total, created_at)
VALUES ((SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080007'), 1, NULL, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '3 days');

INSERT INTO sales.shipping (order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at)
VALUES (
    (SELECT order_id FROM sales.sales_order WHERE order_code = 'ORD202607080007'),
    (SELECT address_id FROM iam.address WHERE customer_id = 8 LIMIT 1),
    'Giao hàng nhanh', 'GHN-RETURNED-888', 'RETURNED', NOW() - INTERVAL '2 days' - INTERVAL '12 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'
);
