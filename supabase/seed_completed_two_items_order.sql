-- BỔ SUNG ĐƠN HÀNG HOÀN THÀNH CÓ 2 SẢN PHẨM CHO TẤT CẢ KHÁCH HÀNG ĐỂ TEST ĐÁNH GIÁ MULTI-ITEMS

DO $$
DECLARE
    r_cust RECORD;
    v_addr_id BIGINT;
    v_order_id BIGINT;
    v_num BIGINT;
BEGIN
    -- Khởi tạo v_num bằng timestamp epoch để tránh trùng lặp và không cần parse từ DB
    v_num := (EXTRACT(EPOCH FROM NOW())::BIGINT % 10000000);

    FOR r_cust IN SELECT customer_id, customer_name FROM iam.customer LOOP
        -- 1. Lấy địa chỉ của khách hàng (hoặc tạo mới nếu chưa có)
        SELECT address_id INTO v_addr_id 
        FROM iam.address 
        WHERE customer_id = r_cust.customer_id AND is_active = TRUE
        LIMIT 1;

        IF v_addr_id IS NULL THEN
            INSERT INTO iam.address (
                customer_id, recipient_name, recipient_phone, province_id, 
                district_name, address_detail, is_default, is_active, created_at, updated_at
            ) VALUES (
                r_cust.customer_id, r_cust.customer_name, '0987654321', 1,
                'Quận 1', '123 Đường Lê Lợi, Phường Bến Thành', TRUE, TRUE, NOW(), NOW()
            ) RETURNING address_id INTO v_addr_id;
        END IF;

        -- 2. Tạo đơn hàng COMPLETED mới
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || r_cust.customer_id::TEXT || v_num::TEXT) FROM 1 FOR 6)),
            r_cust.customer_id, NOW() - INTERVAL '2 days', 0, 30000, 3830000,
            'COMPLETED', 'PAID', 'Đơn hàng bổ sung 2 sản phẩm', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
        ) RETURNING order_id INTO v_order_id;

        -- 3. Thêm 2 sản phẩm (variant_id 1 và variant_id 6) vào đơn hàng này
        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '2 days'),
        (v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '2 days');

        -- 4. Thêm thông tin vận chuyển đã hoàn thành
        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'Giao Hàng Nhanh', 'GHN' || v_num, 'DELIVERED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW()
        );

    END LOOP;
END $$;
