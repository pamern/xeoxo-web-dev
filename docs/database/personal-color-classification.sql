-- Phân loại personal color cho 37 màu thật trong catalog.color.
-- Chạy bằng role postgres (Supabase SQL Editor) — service_role không có quyền
-- UPDATE bảng này qua API (xem docs/database/schema_access_control.md).
-- Đối chiếu logic phân loại tại src/features/personal-color/color-classification.ts

update catalog.color set personal_color_season = 'AUTUMN', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'MUTED' where color_id = 1; -- Be
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'CLEAR' where color_id = 2; -- Cam
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 3; -- Hồng
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'CLEAR' where color_id = 4; -- Hồng cam
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 5; -- Hồng nhạt
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 6; -- Hồng phấn
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 7; -- Hồng phấn nhạt
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 8; -- Hồng sen
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 9; -- Hồng tím
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 10; -- Hồng đậm
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'MUTED' where color_id = 11; -- Hồng đỗ
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 12; -- Kem
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'CLEAR' where color_id = 13; -- Trắng
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 14; -- Trắng kem
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 15; -- Trắng xám
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 16; -- Tím
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 17; -- Tím nhạt
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'CLEAR' where color_id = 18; -- Vàng
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 19; -- Vàng kem
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'CLEAR' where color_id = 20; -- Vàng nhạt
update catalog.color set personal_color_season = 'AUTUMN', color_temperature = 'WARM', color_value = 'DEEP', color_chroma = 'MUTED' where color_id = 21; -- Vàng nâu
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 22; -- Xanh
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 23; -- Xanh biển
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 24; -- Xanh biển nhạt
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 25; -- Xanh coban
update catalog.color set personal_color_season = 'SPRING', color_temperature = 'WARM', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 26; -- Xanh cốm
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 27; -- Xanh lam
update catalog.color set personal_color_season = 'AUTUMN', color_temperature = 'WARM', color_value = 'DEEP', color_chroma = 'MUTED' where color_id = 28; -- Xanh lá
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 29; -- Xanh lục
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 30; -- Xanh ngọc
update catalog.color set personal_color_season = 'AUTUMN', color_temperature = 'WARM', color_value = 'DEEP', color_chroma = 'MUTED' where color_id = 31; -- Xanh oliu
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 32; -- Xanh xám
update catalog.color set personal_color_season = 'SUMMER', color_temperature = 'COOL', color_value = 'LIGHT', color_chroma = 'SOFT' where color_id = 33; -- Xám bạc
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 34; -- Đen
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 35; -- Đỏ
update catalog.color set personal_color_season = 'WINTER', color_temperature = 'COOL', color_value = 'DEEP', color_chroma = 'CLEAR' where color_id = 36; -- Đỏ mận
update catalog.color set personal_color_season = 'AUTUMN', color_temperature = 'WARM', color_value = 'DEEP', color_chroma = 'MUTED' where color_id = 37; -- Đỏ đậm
