-- XÓA DỮ LIỆU ĐỂ TRÁNH TRÙNG LẶP KHI CHẠY SEED
DELETE FROM sales.review_media;
DELETE FROM sales.review;
DELETE FROM sales.shipping;
DELETE FROM sales.order_item;
DELETE FROM sales.sales_order;
DELETE FROM iam.address;
DELETE FROM catalog.media WHERE storage_key LIKE 'reviews/%';

DO $$
DECLARE
    r_cust RECORD;
    v_addr_id BIGINT;
    v_order_id BIGINT;
    v_item_id_1 BIGINT;
    v_item_id_2 BIGINT;
    v_review_id_1 BIGINT;
    v_review_id_2 BIGINT;
    v_media_id_1 BIGINT;
    v_media_id_2 BIGINT;
    v_num INT := 5000;
BEGIN
    -- Lặp qua tất cả khách hàng hiện có trong hệ thống
    FOR r_cust IN SELECT customer_id, customer_name FROM iam.customer LOOP
        v_num := v_num + 1;

        -- 1. Tạo địa chỉ mặc định cho khách hàng
        INSERT INTO iam.address (
            customer_id, recipient_name, recipient_phone, province_id, 
            district_name, address_detail, is_default, is_active, created_at, updated_at
        ) VALUES (
            r_cust.customer_id, r_cust.customer_name, '0912345678', 1,
            'Quận 3', '456 Nguyễn Thị Minh Khai, Phường 5', TRUE, TRUE, NOW(), NOW()
        ) RETURNING address_id INTO v_addr_id;

        -- ---------------------------------------------------------------------
        -- 1. ĐƠN HÀNG CHỜ XÁC NHẬN (PENDING)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
            r_cust.customer_id, NOW() - INTERVAL '10 days', 0, 30000, 2480000,
            'PENDING', 'PENDING', 'Giao hàng sau 5h chiều nhé shop', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '10 days'
        );

        -- ---------------------------------------------------------------------
        -- 2. ĐƠN HÀNG ĐÃ XÁC NHẬN (CONFIRMED)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
            r_cust.customer_id, NOW() - INTERVAL '8 days', 0, 30000, 1380000,
            'CONFIRMED', 'PENDING', NULL, NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '8 days'
        );

        -- ---------------------------------------------------------------------
        -- 3. ĐƠN HÀNG ĐANG CHUẨN BỊ (PACKING)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
            r_cust.customer_id, NOW() - INTERVAL '6 days', 0, 0, 3800000,
            'PACKING', 'PAID', 'Đóng gói kỹ giúp mình làm quà tặng', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '6 days'),
        (v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '6 days');

        -- ---------------------------------------------------------------------
        -- 4. ĐƠN HÀNG ĐANG VẬN CHUYỂN (SHIPPING)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
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
            v_order_id, v_addr_id, 'Giao Hàng Nhanh', 'GHN' || v_num, 'SHIPPING', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days', NOW()
        );

        -- ---------------------------------------------------------------------
        -- 5. ĐƠN HÀNG ĐÃ GIAO (DELIVERED) -> KHÁCH CÓ THỂ ĐÁNH GIÁ (CHƯA ĐÁNH GIÁ)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
            r_cust.customer_id, NOW() - INTERVAL '3 days', 0, 30000, 1380000,
            'COMPLETED', 'PAID', NULL, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '3 days'
        );

        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'Giao Hàng Tiết Kiệm', 'GHTK' || v_num, 'DELIVERED', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days', NOW()
        );

        -- ---------------------------------------------------------------------
        -- 6. ĐƠN HÀNG ĐÃ HOÀN THÀNH - ĐÃ CÓ ĐÁNH GIÁ KÈM HÌNH ẢNH (COMPLETED)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
            r_cust.customer_id, NOW() - INTERVAL '20 days', 0, 0, 3800000,
            'COMPLETED', 'PAID', NULL, NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days'
        ) RETURNING order_id INTO v_order_id;

        -- Dòng sản phẩm 1
        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '20 days')
        RETURNING order_item_id INTO v_item_id_1;

        -- Đánh giá sản phẩm 1 (Review 5 sao, có bình luận)
        INSERT INTO sales.review (
            customer_id, order_item_id, rating, review_content, review_status, created_at, updated_at
        ) VALUES (
            r_cust.customer_id, v_item_id_1, 5, 'Đầm chất vải lụa mềm mại cực kỳ, form dáng bay bổng rất ưng ý. Màu sắc sang trọng.', 'DISPLAY', NOW() - INTERVAL '18 days', NULL
        ) RETURNING review_id INTO v_review_id_1;

        -- Tạo hình ảnh đánh giá cho sản phẩm 1
        INSERT INTO catalog.media (
            storage_key, bucket_name, media_type, mime_type, file_size, alt_text, created_at, updated_at
        ) VALUES (
            'reviews/demo-image-1-' || r_cust.customer_id || '.png', 'products', 'IMAGE', 'image/png', 512000, 'Review image 1', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days'
        ) RETURNING media_id INTO v_media_id_1;

        INSERT INTO sales.review_media (
            review_id, media_id, display_order, created_at
        ) VALUES (
            v_review_id_1, v_media_id_1, 1, NOW() - INTERVAL '18 days'
        );

        -- Dòng sản phẩm 2
        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES 
        (v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '20 days')
        RETURNING order_item_id INTO v_item_id_2;

        -- Đánh giá sản phẩm 2 (Review 4 sao, có hình ảnh và video)
        INSERT INTO sales.review (
            customer_id, order_item_id, rating, review_content, review_status, created_at, updated_at
        ) VALUES (
            r_cust.customer_id, v_item_id_2, 4, 'Áo dài lên dáng chuẩn, đường chỉ thêu tay rất tỉ mỉ và sắc nét. Điểm trừ là giao hàng hơi chậm hơn dự kiến 1 ngày.', 'DISPLAY', NOW() - INTERVAL '17 days', NULL
        ) RETURNING review_id INTO v_review_id_2;

        -- Tạo ảnh và video đánh giá cho sản phẩm 2
        INSERT INTO catalog.media (
            storage_key, bucket_name, media_type, mime_type, file_size, alt_text, created_at, updated_at
        ) VALUES 
        ('reviews/demo-image-2-' || r_cust.customer_id || '.png', 'products', 'IMAGE', 'image/png', 480000, 'Review image 2', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days')
        RETURNING media_id INTO v_media_id_2;

        INSERT INTO catalog.media (
            storage_key, bucket_name, media_type, mime_type, file_size, alt_text, created_at, updated_at
        ) VALUES 
        ('reviews/demo-video-1-' || r_cust.customer_id || '.mp4', 'products', 'VIDEO', 'video/mp4', 2560000, 'Review video 1', NOW() - INTERVAL '17 days', NOW() - INTERVAL '17 days')
        RETURNING media_id INTO v_media_id_1;

        -- Liên kết ảnh cho review 2
        INSERT INTO sales.review_media (
            review_id, media_id, display_order, created_at
        ) VALUES (
            v_review_id_2, v_media_id_2, 1, NOW() - INTERVAL '17 days'
        );

        -- Liên kết video cho review 2
        INSERT INTO sales.review_media (
            review_id, media_id, display_order, created_at
        ) VALUES (
            v_review_id_2, v_media_id_1, 2, NOW() - INTERVAL '17 days'
        );

        -- Tạo thông tin vận chuyển đã giao
        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'ViettelPost', 'VTP' || v_num, 'DELIVERED', NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '20 days', NOW()
        );

        -- ---------------------------------------------------------------------
        -- 7. ĐƠN HÀNG ĐÃ HỦY (CANCELLED)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
            r_cust.customer_id, NOW() - INTERVAL '15 days', 0, 30000, 1380000,
            'CANCELLED', 'FAILED', 'Đặt nhầm phân loại, muốn đặt lại đơn khác', NOW() - INTERVAL '15 days', NOW() - INTERVAL '14 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 6, 'STANDARD', 1, 1350000, 0, 1350000, NOW() - INTERVAL '15 days'
        );

        -- ---------------------------------------------------------------------
        -- 8. ĐƠN HÀNG ĐÃ TRẢ HÀNG (RETURNED)
        -- ---------------------------------------------------------------------
        v_num := v_num + 1;
        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount, 
            shipping_fee, total_amount, order_status, payment_status, 
            customer_note, created_at, updated_at
        ) VALUES (
            'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(v_num::text, 5, '0'),
            r_cust.customer_id, NOW() - INTERVAL '25 days', 0, 30000, 2480000,
            'RETURNED', 'REFUNDED', NULL, NOW() - INTERVAL '25 days', NOW() - INTERVAL '22 days'
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, 1, 'STANDARD', 1, 2450000, 0, 2450000, NOW() - INTERVAL '25 days'
        );

        INSERT INTO sales.shipping (
            order_id, address_id, shipping_provider, tracking_code, shipping_status, shipped_at, delivered_at, created_at, updated_at
        ) VALUES (
            v_order_id, v_addr_id, 'Giao Hàng Nhanh', 'GHN' || v_num, 'DELIVERED', NOW() - INTERVAL '24 days', NOW() - INTERVAL '23 days', NOW() - INTERVAL '25 days', NOW()
        );

    END LOOP;
END $$;
