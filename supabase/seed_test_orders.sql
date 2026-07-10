-- DỌN DẸP DỮ LIỆU ĐỂ TRÁNH TRÙNG LẶP KHI CHẠY LẠI
DELETE FROM sales.review;
DELETE FROM sales.shipping;
DELETE FROM sales.order_item;
DELETE FROM sales.sales_order;
DELETE FROM iam.address;

DO $$
DECLARE
    r_cust RECORD;
    v_addr_id BIGINT;
    v_order_id BIGINT;
    v_item_id BIGINT;
    v_num INT;
BEGIN
    v_num := 1000;
    -- Lặp qua từng khách hàng trong hệ thống
    FOR r_cust IN SELECT customer_id, customer_name FROM iam.customer LOOP
        -- 1. Tạo địa chỉ mặc định cho khách hàng
        INSERT INTO iam.address (
            customer_id, recipient_name, recipient_phone, province_id, 
            district_name, address_detail, is_default, is_active, created_at, updated_at
        ) VALUES (
            r_cust.customer_id, r_cust.customer_name, '0987654321', 1,
            'Quận 1', '123 Đường Lê Lợi, Phường Bến Thành', TRUE, TRUE, NOW(), NOW()
        ) RETURNING address_id INTO v_addr_id;

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 1: CHỜ XÁC NHẬN (PENDING) - 1 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '7 days', 0, 30000, 2480000,
            'PENDING', 'PENDING', 'Giao giờ hành chính', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '7 days'
        );

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 2: ĐÃ XÁC NHẬN (CONFIRMED) - 1 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '6 days', 0, 30000, 1380000,
            'CONFIRMED', 'PENDING', NULL, NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '6 days'
        );

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 3: ĐANG CHUẨN BỊ HÀNG (PACKING) - 2 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '5 days', 0, 0, 3800000,
            'PACKING', 'PAID', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '5 days'),
        (v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '5 days');

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 4: ĐANG GIAO HÀNG (SHIPPING) - 1 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '4 days', 0, 30000, 2480000,
            'SHIPPING', 'PAID', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '4 days'
        );

        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'Giao Hàng Tiết Kiệm', 'GHTK' || v_num, 'SHIPPING', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW()
        );

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 5: ĐÃ HỦY (CANCELLED) - 1 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '10 days', 0, 30000, 1380000,
            'CANCELLED', 'FAILED', NULL, NOW() - INTERVAL '10 days', NOW() - INTERVAL '9 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '10 days'
        );

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 6: ĐÃ HOÀN TRẢ (RETURNED) - 2 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '12 days', 0, 0, 3800000,
            'RETURNED', 'REFUNDED', NULL, NOW() - INTERVAL '12 days', NOW() - INTERVAL '8 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '12 days'),
        (v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '12 days');

        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'Giao Hàng Tiết Kiệm', 'GHTK' || v_num, 'DELIVERED', NOW() - INTERVAL '11 days', NOW() - INTERVAL '9 days', NOW() - INTERVAL '12 days', NOW()
        );

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 7: GIAO THÀNH CÔNG - CHƯA ĐÁNH GIÁ (COMPLETED) - 1 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '3 days', 0, 30000, 2480000,
            'COMPLETED', 'PAID', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '3 days'
        );

        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'VNPost', 'VNP' || v_num, 'DELIVERED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW()
        );

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 8: GIAO THÀNH CÔNG - ĐÃ ĐÁNH GIÁ CẢ 2 (COMPLETED) - 2 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '15 days', 0, 0, 3800000,
            'COMPLETED', 'PAID', NULL, NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '15 days')
        RETURNING order_item_id INTO v_item_id;

        -- Đánh giá sản phẩm 1
        INSERT INTO sales.review (
            customer_id, order_item_id, rating, review_content, review_status, created_at, updated_at
        ) VALUES (
            r_cust.customer_id, v_item_id, 5, 'Vải lụa rất mịn, mặc mát lắm ạ!', 'DISPLAY', NOW() - INTERVAL '14 days', NOW()
        );

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '15 days')
        RETURNING order_item_id INTO v_item_id;

        -- Đánh giá sản phẩm 2
        INSERT INTO sales.review (
            customer_id, order_item_id, rating, review_content, review_status, created_at, updated_at
        ) VALUES (
            r_cust.customer_id, v_item_id, 4, 'Áo dài form đẹp, thêu tay tỉ mỉ.', 'DISPLAY', NOW() - INTERVAL '14 days', NOW()
        );

        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'ViettelPost', 'VTP' || v_num, 'DELIVERED', NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days', NOW() - INTERVAL '15 days', NOW()
        );

        -- ----------------------------------------------------
        -- ĐƠN HÀNG 9: GIAO THÀNH CÔNG - ĐÃ ĐÁNH GIÁ (COMPLETED) - 1 sản phẩm
        -- ----------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 4, '0'),
            r_cust.customer_id, NOW() - INTERVAL '2 days', 0, 30000, 1380000,
            'COMPLETED', 'PAID', NULL, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '2 days'
        )
        RETURNING order_item_id INTO v_item_id;

        -- Đánh giá sản phẩm
        INSERT INTO sales.review (
            customer_id, order_item_id, rating, review_content, review_status, created_at, updated_at
        ) VALUES (
            r_cust.customer_id, v_item_id, 5, 'Màu sắc y như hình, giao hàng rất nhanh.', 'DISPLAY', NOW() - INTERVAL '1 day', NOW()
        );

        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'Giao Hàng Nhanh', 'GHN' || v_num, 'DELIVERED', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW()
        );

    END LOOP;
END $$;
