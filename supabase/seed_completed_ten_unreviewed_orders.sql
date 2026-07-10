-- BỔ SUNG 10 ĐƠN HÀNG HOÀN THÀNH CHƯA ĐÁNH GIÁ CHO KHÁCH HÀNG GIANG TRẦN NGỌC CHÂU (CUSTOMER_ID = 4) ĐỂ TEST

DO $$
DECLARE
    v_cust_id BIGINT := 4; -- Target khách hàng test chính
    v_addr_id BIGINT;
    v_order_id BIGINT;
    v_num BIGINT;
    i INT;
BEGIN
    -- 1. Lấy địa chỉ của khách hàng (hoặc tạo mới nếu chưa có)
    SELECT address_id INTO v_addr_id 
    FROM iam.address 
    WHERE customer_id = v_cust_id AND is_active = TRUE
    LIMIT 1;

    IF v_addr_id IS NULL THEN
        INSERT INTO iam.address (
            customer_id, recipient_name, recipient_phone, province_id, 
            district_name, address_detail, is_default, is_active, created_at, updated_at
        ) VALUES (
            v_cust_id, 'Giang Trần Ngọc Châu', '0987654321', 1,
            'Quận 1', '123 Đường Lê Lợi, Phường Bến Thành', TRUE, TRUE, NOW(), NOW()
        ) RETURNING address_id INTO v_addr_id;
    END IF;

    -- Lấy số thứ tự lớn nhất hiện tại của order_code để tạo code tiếp theo không trùng lặp
    v_num := (EXTRACT(EPOCH FROM NOW())::BIGINT % 10000000);

    -- 2. Loop để tạo ra 10 đơn hàng COMPLETED
    FOR i IN 1..10 LOOP
        v_num := v_num + 1;
        
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || v_num::TEXT) FROM 1 FOR 6)),
            v_cust_id, NOW() - INTERVAL '3 days', 0, 30000, 2480000,
            'COMPLETED', 'PAID', 'Đơn hàng test số ' || i, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
        ) RETURNING order_id INTO v_order_id;

        -- Xen kẽ đơn 1 sản phẩm và đơn 2 sản phẩm
        IF i % 2 = 1 THEN
            -- Đơn có 1 sản phẩm
            INSERT INTO sales.order_item (
                order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
            ) VALUES (
                v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '3 days'
            );
        ELSE
            -- Đơn có 2 sản phẩm
            INSERT INTO sales.order_item (
                order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
            ) VALUES 
            (v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '3 days'),
            (v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '3 days');
        END IF;

        -- Thêm thông tin vận chuyển đã hoàn thành
        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'Giao Hàng Nhanh', 'GHN' || v_num, 'DELIVERED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW()
        );

    END LOOP;
END $$;
