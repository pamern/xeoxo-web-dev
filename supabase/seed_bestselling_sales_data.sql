-- Bổ sung dữ liệu bán hàng test (đơn COMPLETED) trải đều cho nhiều dòng sản phẩm,
-- để catalog.v_product_line_sales có đủ dữ liệu cho việc test "Bán chạy nhất"
-- thay vì chỉ có 1 sản phẩm duy nhất như hiện tại.
--
-- Idempotent: chạy lại nhiều lần không bị trùng lặp (xóa seed cũ theo order_code
-- prefix 'BSLSEED' trước khi tạo lại).

DELETE FROM sales.order_item WHERE order_id IN (
    SELECT order_id FROM sales.sales_order WHERE order_code LIKE 'BSLSEED%'
);
DELETE FROM sales.sales_order WHERE order_code LIKE 'BSLSEED%';

DO $$
DECLARE
    v_cust_id BIGINT;
    r_variant RECORD;
    v_order_id BIGINT;
    v_qty INT;
    v_idx INT := 0;
BEGIN
    -- Gán tạm toàn bộ đơn seed cho 1 khách hàng có sẵn trong hệ thống.
    SELECT customer_id INTO v_cust_id FROM iam.customer ORDER BY customer_id LIMIT 1;

    IF v_cust_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy customer nào trong iam.customer để gán đơn hàng test.';
    END IF;

    -- Lấy 1 variant ACTIVE đại diện cho mỗi product_line đang có hàng, để mỗi
    -- dòng sản phẩm có ít nhất 1 đơn COMPLETED phục vụ thống kê bán chạy.
    FOR r_variant IN
        SELECT DISTINCT ON (pc.product_line_id)
            pv.variant_id, pc.product_line_id, pv.price
        FROM catalog.product_variant pv
        JOIN catalog.product_component pc ON pc.component_id = pv.component_id
        WHERE pv.status = 'ACTIVE'
        ORDER BY pc.product_line_id, pv.variant_id
    LOOP
        v_idx := v_idx + 1;

        -- Số lượng giảm dần theo thứ tự product_line_id để tạo ra một bảng xếp
        -- hạng bán chạy có phân hóa rõ ràng, tối thiểu 1 sản phẩm/đơn.
        v_qty := GREATEST(1, 30 - v_idx * 2 + (v_idx % 5));

        INSERT INTO sales.sales_order (
            order_code, customer_id, order_date, reward_discount_amount,
            shipping_fee, total_amount, order_status, payment_status,
            customer_note, created_at, updated_at
        ) VALUES (
            'BSLSEED' || LPAD(v_idx::text, 5, '0'),
            v_cust_id, NOW() - (v_idx || ' days')::INTERVAL, 0,
            0, r_variant.price * v_qty, 'COMPLETED', 'PAID',
            'Seed data cho thống kê bán chạy',
            NOW() - (v_idx || ' days')::INTERVAL, NOW() - (v_idx || ' days')::INTERVAL
        ) RETURNING order_id INTO v_order_id;

        INSERT INTO sales.order_item (
            order_id, variant_id, item_type, quantity, unit_price, discount_amount, line_total, created_at
        ) VALUES (
            v_order_id, r_variant.variant_id, 'STANDARD', v_qty, r_variant.price, 0,
            r_variant.price * v_qty, NOW() - (v_idx || ' days')::INTERVAL
        );
    END LOOP;

    RAISE NOTICE 'Đã tạo % đơn hàng COMPLETED cho % dòng sản phẩm.', v_idx, v_idx;
END $$;
