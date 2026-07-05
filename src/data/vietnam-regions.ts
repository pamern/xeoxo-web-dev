export const PROVINCES = [
  { id: 79, name: "TP. Hồ Chí Minh" },
  { id: 1, name: "Hà Nội" },
  { id: 2, name: "Đà Nẵng" },
  { id: 3, name: "Hải Phòng" },
  { id: 4, name: "Cần Thơ" },
  { id: 5, name: "An Giang" },
  { id: 6, name: "Bà Rịa - Vũng Tàu" },
  { id: 7, name: "Bắc Giang" },
  { id: 8, name: "Bắc Kạn" },
  { id: 9, name: "Bạc Liêu" },
  { id: 10, name: "Bắc Ninh" },
  { id: 11, name: "Bến Tre" },
  { id: 12, name: "Bình Định" },
  { id: 13, name: "Bình Dương" },
  { id: 14, name: "Bình Phước" },
  { id: 15, name: "Bình Thuận" },
  { id: 16, name: "Cà Mau" },
  { id: 17, name: "Cao Bằng" },
  { id: 18, name: "Đắk Lắk" },
  { id: 19, name: "Đắk Nông" },
  { id: 20, name: "Điện Biên" },
  { id: 21, name: "Đồng Nai" },
  { id: 22, name: "Đồng Tháp" },
  { id: 23, name: "Gia Lai" },
  { id: 24, name: "Hà Giang" },
  { id: 25, name: "Hà Nam" },
  { id: 26, name: "Hà Tĩnh" },
  { id: 27, name: "Hải Dương" },
  { id: 28, name: "Hậu Giang" },
  { id: 29, name: "Hòa Bình" },
  { id: 30, name: "Hưng Yên" },
  { id: 31, name: "Khánh Hòa" },
  { id: 32, name: "Kiên Giang" },
  { id: 33, name: "Kon Tum" },
  { id: 34, name: "Lai Châu" },
  { id: 35, name: "Lâm Đồng" },
  { id: 36, name: "Lạng Sơn" },
  { id: 37, name: "Lào Cai" },
  { id: 38, name: "Long An" },
  { id: 39, name: "Nam Định" },
  { id: 40, name: "Nghệ An" },
  { id: 41, name: "Ninh Bình" },
  { id: 42, name: "Ninh Thuận" },
  { id: 43, name: "Phú Thọ" },
  { id: 44, name: "Quảng Bình" },
  { id: 45, name: "Quảng Nam" },
  { id: 46, name: "Quảng Ngãi" },
  { id: 47, name: "Quảng Ninh" },
  { id: 48, name: "Quảng Trị" },
  { id: 49, name: "Sóc Trăng" },
  { id: 50, name: "Sơn La" },
  { id: 51, name: "Tây Ninh" },
  { id: 52, name: "Thái Bình" },
  { id: 53, name: "Thái Nguyên" },
  { id: 54, name: "Thanh Hóa" },
  { id: 55, name: "Thừa Thiên Huế" },
  { id: 56, name: "Tiền Giang" },
  { id: 57, name: "Trà Vinh" },
  { id: 58, name: "Tuyên Quang" },
  { id: 59, name: "Vĩnh Long" },
  { id: 60, name: "Vĩnh Phúc" },
  { id: 61, name: "Yên Bái" },
  { id: 62, name: "Phú Yên" },
];

export const DISTRICTS: Record<number, Array<{ id: string; name: string }>> = {
  79: [
    { id: "Quận 1", name: "Quận 1" }, { id: "Quận 3", name: "Quận 3" }, { id: "Quận 4", name: "Quận 4" },
    { id: "Quận 5", name: "Quận 5" }, { id: "Quận 6", name: "Quận 6" }, { id: "Quận 7", name: "Quận 7" },
    { id: "Quận 8", name: "Quận 8" }, { id: "Quận 10", name: "Quận 10" }, { id: "Quận 11", name: "Quận 11" },
    { id: "Quận 12", name: "Quận 12" }, { id: "Quận Bình Thạnh", name: "Quận Bình Thạnh" },
    { id: "Quận Gò Vấp", name: "Quận Gò Vấp" }, { id: "Quận Phú Nhuận", name: "Quận Phú Nhuận" },
    { id: "Quận Tân Bình", name: "Quận Tân Bình" }, { id: "Quận Tân Phú", name: "Quận Tân Phú" },
    { id: "Quận Bình Tân", name: "Quận Bình Tân" }, { id: "TP. Thủ Đức", name: "TP. Thủ Đức" },
    { id: "Huyện Bình Chánh", name: "Huyện Bình Chánh" }, { id: "Huyện Củ Chi", name: "Huyện Củ Chi" },
    { id: "Huyện Hóc Môn", name: "Huyện Hóc Môn" }, { id: "Huyện Nhà Bè", name: "Huyện Nhà Bè" },
    { id: "Huyện Cần Giờ", name: "Huyện Cần Giờ" }
  ],
  1: [
    { id: "Quận Ba Đình", name: "Quận Ba Đình" }, { id: "Quận Hoàn Kiếm", name: "Quận Hoàn Kiếm" },
    { id: "Quận Tây Hồ", name: "Quận Tây Hồ" }, { id: "Quận Long Biên", name: "Quận Long Biên" },
    { id: "Quận Cầu Giấy", name: "Quận Cầu Giấy" }, { id: "Quận Đống Đa", name: "Quận Đống Đa" },
    { id: "Quận Hai Bà Trưng", name: "Quận Hai Bà Trưng" }, { id: "Quận Hoàng Mai", name: "Quận Hoàng Mai" },
    { id: "Quận Thanh Xuân", name: "Quận Thanh Xuân" }, { id: "Quận Nam Từ Liêm", name: "Quận Nam Từ Liêm" },
    { id: "Quận Bắc Từ Liêm", name: "Quận Bắc Từ Liêm" }, { id: "Quận Hà Đông", name: "Quận Hà Đông" },
    { id: "Thị xã Sơn Tây", name: "Thị xã Sơn Tây" }, { id: "Huyện Ba Vì", name: "Huyện Ba Vì" },
    { id: "Huyện Chương Mỹ", name: "Huyện Chương Mỹ" }, { id: "Huyện Đan Phượng", name: "Huyện Đan Phượng" },
    { id: "Huyện Đông Anh", name: "Huyện Đông Anh" }, { id: "Huyện Gia Lâm", name: "Huyện Gia Lâm" },
    { id: "Huyện Hoài Đức", name: "Huyện Hoài Đức" }, { id: "Huyện Mê Linh", name: "Huyện Mê Linh" },
    { id: "Huyện Mỹ Đức", name: "Huyện Mỹ Đức" }, { id: "Huyện Phú Xuyên", name: "Huyện Phú Xuyên" },
    { id: "Huyện Phúc Thọ", name: "Huyện Phúc Thọ" }, { id: "Huyện Quốc Oai", name: "Huyện Quốc Oai" },
    { id: "Huyện Sóc Sơn", name: "Huyện Sóc Sơn" }, { id: "Huyện Thạch Thất", name: "Huyện Thạch Thất" },
    { id: "Huyện Thanh Oai", name: "Huyện Thanh Oai" }, { id: "Huyện Thanh Trì", name: "Huyện Thanh Trì" },
    { id: "Huyện Thường Tín", name: "Huyện Thường Tín" }, { id: "Huyện Ứng Hòa", name: "Huyện Ứng Hòa" }
  ],
  2: [
    { id: "Quận Hải Châu", name: "Quận Hải Châu" }, { id: "Quận Thanh Khê", name: "Quận Thanh Khê" },
    { id: "Quận Sơn Trà", name: "Quận Sơn Trà" }, { id: "Quận Ngũ Hành Sơn", name: "Quận Ngũ Hành Sơn" },
    { id: "Quận Liên Chiểu", name: "Quận Liên Chiểu" }, { id: "Quận Cẩm Lệ", name: "Quận Cẩm Lệ" },
    { id: "Huyện Hòa Vang", name: "Huyện Hòa Vang" }
  ],
  3: [
    { id: "Quận Hồng Bàng", name: "Quận Hồng Bàng" }, { id: "Quận Ngô Quyền", name: "Quận Ngô Quyền" },
    { id: "Quận Lê Chân", name: "Quận Lê Chân" }, { id: "Quận Hải An", name: "Quận Hải An" },
    { id: "Quận Kiến An", name: "Quận Kiến An" }, { id: "Quận Đồ Sơn", name: "Quận Đồ Sơn" },
    { id: "Quận Dương Kinh", name: "Quận Dương Kinh" }, { id: "Huyện Thuỷ Nguyên", name: "Huyện Thuỷ Nguyên" },
    { id: "Huyện An Dương", name: "Huyện An Dương" }, { id: "Huyện An Lão", name: "Huyện An Lão" },
    { id: "Huyện Kiến Thuỵ", name: "Huyện Kiến Thuỵ" }, { id: "Huyện Tiên Lãng", name: "Huyện Tiên Lãng" },
    { id: "Huyện Vĩnh Bảo", name: "Huyện Vĩnh Bảo" }, { id: "Huyện Cát Hải", name: "Huyện Cát Hải" }
  ],
  4: [
    { id: "Quận Ninh Kiều", name: "Quận Ninh Kiều" }, { id: "Quận Bình Thủy", name: "Quận Bình Thủy" },
    { id: "Quận Cái Răng", name: "Quận Cái Răng" }, { id: "Quận Ô Môn", name: "Quận Ô Môn" },
    { id: "Quận Thốt Nốt", name: "Quận Thốt Nốt" }, { id: "Huyện Phong Điền", name: "Huyện Phong Điền" },
    { id: "Huyện Đỏ Đỏ", name: "Huyện Đỏ Đỏ" }, { id: "Huyện Thới Lai", name: "Huyện Thới Lai" },
    { id: "Huyện Vĩnh Thạnh", name: "Huyện Vĩnh Thạnh" }
  ],
  5: [
    { id: "Thành phố Long Xuyên", name: "Thành phố Long Xuyên" }, { id: "Thành phố Châu Đốc", name: "Thành phố Châu Đốc" },
    { id: "Thị xã Tân Châu", name: "Thị xã Tân Châu" }, { id: "Huyện An Phú", name: "Huyện An Phú" },
    { id: "Thị xã Tịnh Biên", name: "Thị xã Tịnh Biên" }, { id: "Huyện Tri Tôn", name: "Huyện Tri Tôn" },
    { id: "Huyện Châu Phú", name: "Huyện Châu Phú" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Chợ Mới", name: "Huyện Chợ Mới" }, { id: "Huyện Thoại Sơn", name: "Huyện Thoại Sơn" },
    { id: "Huyện Phú Tân", name: "Huyện Phú Tân" }
  ],
  6: [
    { id: "Thành phố Vũng Tàu", name: "Thành phố Vũng Tàu" }, { id: "Thành phố Bà Rịa", name: "Thành phố Bà Rịa" },
    { id: "Thị xã Phú Mỹ", name: "Thị xã Phú Mỹ" }, { id: "Huyện Châu Đức", name: "Huyện Châu Đức" },
    { id: "Huyện Đất Đỏ", name: "Huyện Đất Đỏ" }, { id: "Huyện Long Điền", name: "Huyện Long Điền" },
    { id: "Huyện Xuyên Mộc", name: "Huyện Xuyên Mộc" }, { id: "Huyện Côn Đảo", name: "Huyện Côn Đảo" }
  ],
  7: [
    { id: "Thành phố Bắc Giang", name: "Thành phố Bắc Giang" }, { id: "Thị xã Việt Yên", name: "Thị xã Việt Yên" },
    { id: "Thị xã Chũ", name: "Thị xã Chũ" }, { id: "Huyện Hiệp Hòa", name: "Huyện Hiệp Hòa" },
    { id: "Huyện Lạng Giang", name: "Huyện Lạng Giang" }, { id: "Huyện Lục Nam", name: "Huyện Lục Nam" },
    { id: "Huyện Lục Ngạn", name: "Huyện Lục Ngạn" }, { id: "Huyện Sơn Động", name: "Huyện Sơn Động" },
    { id: "Huyện Tân Yên", name: "Huyện Tân Yên" }, { id: "Huyện Yên Dũng", name: "Huyện Yên Dũng" },
    { id: "Huyện Yên Thế", name: "Huyện Yên Thế" }
  ],
  8: [
    { id: "Thành phố Bắc Kạn", name: "Thành phố Bắc Kạn" }, { id: "Huyện Ba Bể", name: "Huyện Ba Bể" },
    { id: "Huyện Bạch Thông", name: "Huyện Bạch Thông" }, { id: "Huyện Chợ Đồn", name: "Huyện Chợ Đồn" },
    { id: "Huyện Chợ Mới", name: "Huyện Chợ Mới" }, { id: "Huyện Na Rì", name: "Huyện Na Rì" },
    { id: "Huyện Ngân Sơn", name: "Huyện Ngân Sơn" }, { id: "Huyện Pác Nặm", name: "Huyện Pác Nặm" }
  ],
  9: [
    { id: "Thành phố Bạc Liêu", name: "Thành phố Bạc Liêu" }, { id: "Thị xã Giá Rai", name: "Thị xã Giá Rai" },
    { id: "Huyện Đông Hải", name: "Huyện Đông Hải" }, { id: "Huyện Hòa Bình", name: "Huyện Hòa Bình" },
    { id: "Huyện Hồng Dân", name: "Huyện Hồng Dân" }, { id: "Huyện Phước Long", name: "Huyện Phước Long" },
    { id: "Huyện Vĩnh Lợi", name: "Huyện Vĩnh Lợi" }
  ],
  10: [
    { id: "Thành phố Bắc Ninh", name: "Thành phố Bắc Ninh" }, { id: "Thành phố Từ Sơn", name: "Thành phố Từ Sơn" },
    { id: "Thị xã Thuận Thành", name: "Thị xã Thuận Thành" }, { id: "Thị xã Quế Võ", name: "Thị xã Quế Võ" },
    { id: "Huyện Gia Bình", name: "Huyện Gia Bình" }, { id: "Huyện Lương Tài", name: "Huyện Lương Tài" },
    { id: "Huyện Tiên Du", name: "Huyện Tiên Du" }, { id: "Huyện Yên Phong", name: "Huyện Yên Phong" }
  ],
  11: [
    { id: "Thành phố Bến Tre", name: "Thành phố Bến Tre" }, { id: "Huyện Ba Tri", name: "Huyện Ba Tri" },
    { id: "Huyện Bình Đại", name: "Huyện Bình Đại" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Chợ Lách", name: "Huyện Chợ Lách" }, { id: "Huyện Giồng Trôm", name: "Huyện Giồng Trôm" },
    { id: "Huyện Mỏ Cày Bắc", name: "Huyện Mỏ Cày Bắc" }, { id: "Huyện Mỏ Cày Nam", name: "Huyện Mỏ Cày Nam" },
    { id: "Huyện Thạnh Phú", name: "Huyện Thạnh Phú" }
  ],
  12: [
    { id: "Thành phố Quy Nhơn", name: "Thành phố Quy Nhơn" }, { id: "Thị xã An Nhơn", name: "Thị xã An Nhơn" },
    { id: "Thị xã Hoài Nhơn", name: "Thị xã Hoài Nhơn" }, { id: "Huyện An Lão", name: "Huyện An Lão" },
    { id: "Huyện Hoài Ân", name: "Huyện Hoài Ân" }, { id: "Huyện Phù Cát", name: "Huyện Phù Cát" },
    { id: "Huyện Phù Mỹ", name: "Huyện Phù Mỹ" }, { id: "Huyện Tuy Phước", name: "Huyện Tuy Phước" },
    { id: "Huyện Tây Sơn", name: "Huyện Tây Sơn" }, { id: "Huyện Vân Canh", name: "Huyện Vân Canh" },
    { id: "Huyện Vĩnh Thạnh", name: "Huyện Vĩnh Thạnh" }
  ],
  13: [
    { id: "Thành phố Thủ Dầu Một", name: "Thành phố Thủ Dầu Một" }, { id: "Thành phố Thuận An", name: "Thành phố Thuận An" },
    { id: "Thành phố Dĩ An", name: "Thành phố Dĩ An" }, { id: "Thành phố Tân Uyên", name: "Thành phố Tân Uyên" },
    { id: "Thành phố Bến Cát", name: "Thành phố Bến Cát" }, { id: "Huyện Bàu Bàng", name: "Huyện Bàu Bàng" },
    { id: "Huyện Bắc Tân Uyên", name: "Huyện Bắc Tân Uyên" }, { id: "Huyện Dầu Tiếng", name: "Huyện Dầu Tiếng" },
    { id: "Huyện Phú Giáo", name: "Huyện Phú Giáo" }
  ],
  14: [
    { id: "Thành phố Đồng Xoài", name: "Thành phố Đồng Xoài" }, { id: "Thị xã Bình Long", name: "Thị xã Bình Long" },
    { id: "Thị xã Phước Long", name: "Thị xã Phước Long" }, { id: "Thị xã Chơn Thành", name: "Thị xã Chơn Thành" },
    { id: "Huyện Bù Đăng", name: "Huyện Bù Đăng" }, { id: "Huyện Bù Đốp", name: "Huyện Bù Đốp" },
    { id: "Huyện Bù Gia Mập", name: "Huyện Bù Gia Mập" }, { id: "Huyện Đồng Phú", name: "Huyện Đồng Phú" },
    { id: "Huyện Hớn Quản", name: "Huyện Hớn Quản" }, { id: "Huyện Lộc Ninh", name: "Huyện Lộc Ninh" },
    { id: "Huyện Phú Riềng", name: "Huyện Phú Riềng" }
  ],
  15: [
    { id: "Thành phố Phan Thiết", name: "Thành phố Phan Thiết" }, { id: "Thị xã La Gi", name: "Thị xã La Gi" },
    { id: "Huyện Tuy Phong", name: "Huyện Tuy Phong" }, { id: "Huyện Bắc Bình", name: "Huyện Bắc Bình" },
    { id: "Huyện Hàm Thuận Bắc", name: "Huyện Hàm Thuận Bắc" }, { id: "Huyện Hàm Thuận Nam", name: "Huyện Hàm Thuận Nam" },
    { id: "Huyện Tánh Linh", name: "Huyện Tánh Linh" }, { id: "Huyện Đức Linh", name: "Huyện Đức Linh" },
    { id: "Huyện Hàm Tân", name: "Huyện Hàm Tân" }, { id: "Huyện Phú Quý", name: "Huyện Phú Quý" }
  ],
  16: [
    { id: "Thành phố Cà Mau", name: "Thành phố Cà Mau" }, { id: "Huyện Đầm Dơi", name: "Huyện Đầm Dơi" },
    { id: "Huyện Ngọc Hiển", name: "Huyện Ngọc Hiển" }, { id: "Huyện Năm Căn", name: "Huyện Năm Căn" },
    { id: "Huyện Cái Nước", name: "Huyện Cái Nước" }, { id: "Huyện Phú Tân", name: "Huyện Phú Tân" },
    { id: "Huyện Trần Văn Thời", name: "Huyện Trần Văn Thời" }, { id: "Huyện U Minh", name: "Huyện U Minh" },
    { id: "Huyện Thới Bình", name: "Huyện Thới Bình" }
  ],
  17: [
    { id: "Thành phố Cao Bằng", name: "Thành phố Cao Bằng" }, { id: "Huyện Bảo Lạc", name: "Huyện Bảo Lạc" },
    { id: "Huyện Bảo Lâm", name: "Huyện Bảo Lâm" }, { id: "Huyện Hạ Lang", name: "Huyện Hạ Lang" },
    { id: "Huyện Hà Quảng", name: "Huyện Hà Quảng" }, { id: "Huyện Hòa An", name: "Huyện Hòa An" },
    { id: "Huyện Nguyên Bình", name: "Huyện Nguyên Bình" }, { id: "Huyện Quảng Hòa", name: "Huyện Quảng Hòa" },
    { id: "Huyện Thạch An", name: "Huyện Thạch An" }, { id: "Huyện Trùng Khánh", name: "Huyện Trùng Khánh" }
  ],
  18: [
    { id: "Thành phố Buôn Ma Thuột", name: "Thành phố Buôn Ma Thuột" }, { id: "Thị xã Buôn Hồ", name: "Thị xã Buôn Hồ" },
    { id: "Huyện Ea H'leo", name: "Huyện Ea H'leo" }, { id: "Huyện Ea Súp", name: "Huyện Ea Súp" },
    { id: "Huyện Krông Năng", name: "Huyện Krông Năng" }, { id: "Huyện Krông Búk", name: "Huyện Krông Búk" },
    { id: "Huyện Buôn Đôn", name: "Huyện Buôn Đôn" }, { id: "Huyện Cư M'gar", name: "Huyện Cư M'gar" },
    { id: "Huyện Ea Kar", name: "Huyện Ea Kar" }, { id: "Huyện M'Drắk", name: "Huyện M'Drắk" },
    { id: "Huyện Krông Pắc", name: "Huyện Krông Pắc" }, { id: "Huyện Krông Bông", name: "Huyện Krông Bông" },
    { id: "Huyện Krông Ana", name: "Huyện Krông Ana" }, { id: "Huyện Lắk", name: "Huyện Lắk" },
    { id: "Huyện Cư Kuin", name: "Huyện Cư Kuin" }
  ],
  19: [
    { id: "Thành phố Gia Nghĩa", name: "Thành phố Gia Nghĩa" }, { id: "Huyện Đắk Glong", name: "Huyện Đắk Glong" },
    { id: "Huyện Đắk Mil", name: "Huyện Đắk Mil" }, { id: "Huyện Đắk Song", name: "Huyện Đắk Song" },
    { id: "Huyện Đắk R'Lấp", name: "Huyện Đắk R'Lấp" }, { id: "Huyện Tuy Đức", name: "Huyện Tuy Đức" },
    { id: "Huyện Krông Nô", name: "Huyện Krông Nô" }, { id: "Huyện Cư Jút", name: "Huyện Cư Jút" }
  ],
  20: [
    { id: "Thành phố Điện Biên Phủ", name: "Thành phố Điện Biên Phủ" }, { id: "Thị xã Mường Lay", name: "Thị xã Mường Lay" },
    { id: "Huyện Điện Biên", name: "Huyện Điện Biên" }, { id: "Huyện Điện Biên Đông", name: "Huyện Điện Biên Đông" },
    { id: "Huyện Mường Ảng", name: "Huyện Mường Ảng" }, { id: "Huyện Mường Chà", name: "Huyện Mường Chà" },
    { id: "Huyện Mường Nhé", name: "Huyện Mường Nhé" }, { id: "Huyện Nậm Pồ", name: "Huyện Nậm Pồ" },
    { id: "Huyện Tủa Chùa", name: "Huyện Tủa Chùa" }, { id: "Huyện Tuần Giáo", name: "Huyện Tuần Giáo" }
  ],
  21: [
    { id: "Thành phố Biên Hòa", name: "Thành phố Biên Hòa" }, { id: "Thành phố Long Khánh", name: "Thành phố Long Khánh" },
    { id: "Huyện Long Thành", name: "Huyện Long Thành" }, { id: "Huyện Nhơn Trạch", name: "Huyện Nhơn Trạch" },
    { id: "Huyện Trảng Bom", name: "Huyện Trảng Bom" }, { id: "Huyện Thống Nhất", name: "Huyện Thống Nhất" },
    { id: "Huyện Cẩm Mỹ", name: "Huyện Cẩm Mỹ" }, { id: "Huyện Vĩnh Cửu", name: "Huyện Vĩnh Cửu" },
    { id: "Huyện Xuân Lộc", name: "Huyện Xuân Lộc" }, { id: "Huyện Định Quán", name: "Huyện Định Quán" },
    { id: "Huyện Tân Phú", name: "Huyện Tân Phú" }
  ],
  22: [
    { id: "Thành phố Cao Lãnh", name: "Thành phố Cao Lãnh" }, { id: "Thành phố Sa Đéc", name: "Thành phố Sa Đéc" },
    { id: "Thành phố Hồng Ngự", name: "Thành phố Hồng Ngự" }, { id: "Huyện Cao Lãnh", name: "Huyện Cao Lãnh" },
    { id: "Huyện Châu Thành", name: "Huyện Châu Thành" }, { id: "Huyện Hồng Ngự", name: "Huyện Hồng Ngự" },
    { id: "Huyện Lai Vung", name: "Huyện Lai Vung" }, { id: "Huyện Lấp Vò", name: "Huyện Lấp Vò" },
    { id: "Huyện Tam Nông", name: "Huyện Tam Nông" }, { id: "Huyện Tân Hồng", name: "Huyện Tân Hồng" },
    { id: "Huyện Thanh Bình", name: "Huyện Thanh Bình" }, { id: "Huyện Tháp Mười", name: "Huyện Tháp Mười" }
  ],
  23: [
    { id: "Thành phố Pleiku", name: "Thành phố Pleiku" }, { id: "Thị xã An Khê", name: "Thị xã An Khê" },
    { id: "Thị xã Ayun Pa", name: "Thị xã Ayun Pa" }, { id: "Huyện Chư Păh", name: "Huyện Chư Păh" },
    { id: "Huyện Chư Prông", name: "Huyện Chư Prông" }, { id: "Huyện Chư Sê", name: "Huyện Chư Sê" },
    { id: "Huyện Đak Đoa", name: "Huyện Đak Đoa" }, { id: "Huyện Đak Pơ", name: "Huyện Đak Pơ" },
    { id: "Huyện Đức Cơ", name: "Huyện Đức Cơ" }, { id: "Huyện Ia Grai", name: "Huyện Ia Grai" },
    { id: "Huyện Ia Pa", name: "Huyện Ia Pa" }, { id: "Huyện Kông Chro", name: "Huyện Kông Chro" },
    { id: "Huyện Krông Pa", name: "Huyện Krông Pa" }, { id: "Huyện Mang Yang", name: "Huyện Mang Yang" },
    { id: "Huyện Phú Thiện", name: "Huyện Phú Thiện" }, { id: "Huyện Chư Pưh", name: "Huyện Chư Pưh" }
  ],
  24: [
    { id: "Thành phố Hà Giang", name: "Thành phố Hà Giang" }, { id: "Huyện Bắc Mê", name: "Huyện Bắc Mê" },
    { id: "Huyện Bắc Quang", name: "Huyện Bắc Quang" }, { id: "Huyện Đồng Văn", name: "Huyện Đồng Văn" },
    { id: "Huyện Hoàng Su Phì", name: "Huyện Hoàng Su Phì" }, { id: "Huyện Mèo Vạc", name: "Huyện Mèo Vạc" },
    { id: "Huyện Quản Bạ", name: "Huyện Quản Bạ" }, { id: "Huyện Quang Bình", name: "Huyện Quang Bình" },
    { id: "Huyện Vị Xuyên", name: "Huyện Vị Xuyên" }, { id: "Huyện Xín Mần", name: "Huyện Xín Mần" },
    { id: "Huyện Yên Minh", name: "Huyện Yên Minh" }
  ],
  25: [
    { id: "Thành phố Phủ Lý", name: "Thành phố Phủ Lý" }, { id: "Thị xã Duy Tiên", name: "Thị xã Duy Tiên" },
    { id: "Thị xã Kim Bảng", name: "Thị xã Kim Bảng" }, { id: "Huyện Bình Lục", name: "Huyện Bình Lục" },
    { id: "Huyện Lý Nhân", name: "Huyện Lý Nhân" }, { id: "Huyện Thanh Liêm", name: "Huyện Thanh Liêm" }
  ],
  26: [
    { id: "Thành phố Hà Tĩnh", name: "Thành phố Hà Tĩnh" }, { id: "Thị xã Hồng Lĩnh", name: "Thị xã Hồng Lĩnh" },
    { id: "Thị xã Kỳ Anh", name: "Thị xã Kỳ Anh" }, { id: "Huyện Cẩm Xuyên", name: "Huyện Cẩm Xuyên" },
    { id: "Huyện Can Lộc", name: "Huyện Can Lộc" }, { id: "Huyện Đức Thọ", name: "Huyện Đức Thọ" },
    { id: "Huyện Hương Khê", name: "Huyện Hương Khê" }, { id: "Huyện Hương Sơn", name: "Huyện Hương Sơn" },
    { id: "Huyện Kỳ Anh", name: "Huyện Kỳ Anh" }, { id: "Huyện Lộc Hà", name: "Huyện Lộc Hà" },
    { id: "Huyện Nghi Xuân", name: "Huyện Nghi Xuân" }, { id: "Huyện Thạch Hà", name: "Huyện Thạch Hà" },
    { id: "Huyện Vũ Quang", name: "Huyện Vũ Quang" }
  ],
  27: [
    { id: "Thành phố Hải Dương", name: "Thành phố Hải Dương" }, { id: "Thành phố Chí Linh", name: "Thành phố Chí Linh" },
    { id: "Thị xã Kinh Môn", name: "Thị xã Kinh Môn" }, { id: "Huyện Bình Giang", name: "Huyện Bình Giang" },
    { id: "Huyện Cẩm Giàng", name: "Huyện Cẩm Giàng" }, { id: "Huyện Gia Lộc", name: "Huyện Gia Lộc" },
    { id: "Huyện Kim Thành", name: "Huyện Kim Thành" }, { id: "Huyện Nam Sách", name: "Huyện Nam Sách" },
    { id: "Huyện Ninh Giang", name: "Huyện Ninh Giang" }, { id: "Huyện Thanh Hà", name: "Huyện Thanh Hà" },
    { id: "Huyện Thanh Miện", name: "Huyện Thanh Miện" }, { id: "Huyện Tứ Kỳ", name: "Huyện Tứ Kỳ" }
  ],
  28: [
    { id: "Thành phố Vị Thanh", name: "Thành phố Vị Thanh" }, { id: "Thành phố Ngã Bảy", name: "Thành phố Ngã Bảy" },
    { id: "Thị xã Long Mỹ", name: "Thị xã Long Mỹ" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Châu Thành A", name: "Huyện Châu Thành A" }, { id: "Huyện Long Mỹ", name: "Huyện Long Mỹ" },
    { id: "Huyện Phụng Hiệp", name: "Huyện Phụng Hiệp" }, { id: "Huyện Vị Thủy", name: "Huyện Vị Thủy" }
  ],
  29: [
    { id: "Thành phố Hòa Bình", name: "Thành phố Hòa Bình" }, { id: "Huyện Cao Phong", name: "Huyện Cao Phong" },
    { id: "Huyện Đà Bắc", name: "Huyện Đà Bắc" }, { id: "Huyện Kim Bôi", name: "Huyện Kim Bôi" },
    { id: "Huyện Lạc Sơn", name: "Huyện Lạc Sơn" }, { id: "Huyện Lạc Thủy", name: "Huyện Lạc Thủy" },
    { id: "Huyện Lương Sơn", name: "Huyện Lương Sơn" }, { id: "Huyện Mai Châu", name: "Huyện Mai Châu" },
    { id: "Huyện Tân Lạc", name: "Huyện Tân Lạc" }, { id: "Huyện Yên Thủy", name: "Huyện Yên Thủy" }
  ],
  30: [
    { id: "Thành phố Hưng Yên", name: "Thành phố Hưng Yên" }, { id: "Thị xã Mỹ Hào", name: "Thị xã Mỹ Hào" },
    { id: "Huyện Ân Thi", name: "Huyện Ân Thi" }, { id: "Huyện Khoái Châu", name: "Huyện Khoái Châu" },
    { id: "Huyện Kim Động", name: "Huyện Kim Động" }, { id: "Huyện Phù Cừ", name: "Huyện Phù Cừ" },
    { id: "Huyện Tiên Lữ", name: "Huyện Tiên Lữ" }, { id: "Huyện Văn Giang", name: "Huyện Văn Giang" },
    { id: "Huyện Văn Lâm", name: "Huyện Văn Lâm" }, { id: "Huyện Yên Mỹ", name: "Huyện Yên Mỹ" }
  ],
  31: [
    { id: "Thành phố Nha Trang", name: "Thành phố Nha Trang" }, { id: "Thành phố Cam Ranh", name: "Thành phố Cam Ranh" },
    { id: "Thị xã Ninh Hòa", name: "Thị xã Ninh Hòa" }, { id: "Huyện Vạn Ninh", name: "Huyện Vạn Ninh" },
    { id: "Huyện Diên Khánh", name: "Huyện Diên Khánh" }, { id: "Huyện Khánh Vĩnh", name: "Huyện Khánh Vĩnh" },
    { id: "Huyện Khánh Sơn", name: "Huyện Khánh Sơn" }, { id: "Huyện Cam Lâm", name: "Huyện Cam Lâm" }
  ],
  32: [
    { id: "Thành phố Rạch Giá", name: "Thành phố Rạch Giá" }, { id: "Thành phố Hà Tiên", name: "Thành phố Hà Tiên" },
    { id: "Thành phố Phú Quốc", name: "Thành phố Phú Quốc" }, { id: "Huyện Kiên Lương", name: "Huyện Kiên Lương" },
    { id: "Huyện Hòn Đất", name: "Huyện Hòn Đất" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Tân Hiệp", name: "Huyện Tân Hiệp" }, { id: "Huyện Giồng Riềng", name: "Huyện Giồng Riềng" },
    { id: "Huyện Gò Quao", name: "Huyện Gò Quao" }, { id: "Huyện An Biên", name: "Huyện An Biên" },
    { id: "Huyện An Minh", name: "Huyện An Minh" }, { id: "Huyện Vĩnh Thuận", name: "Huyện Vĩnh Thuận" },
    { id: "Huyện Kiên Hải", name: "Huyện Kiên Hải" }, { id: "Huyện U Minh Thượng", name: "Huyện U Minh Thượng" },
    { id: "Huyện Giang Thành", name: "Huyện Giang Thành" }
  ],
  33: [
    { id: "Thành phố Kon Tum", name: "Thành phố Kon Tum" }, { id: "Huyện Đắk Glei", name: "Huyện Đắk Glei" },
    { id: "Huyện Đắk Tô", name: "Huyện Đắk Tô" }, { id: "Huyện Đắk Hà", name: "Huyện Đắk Hà" },
    { id: "Huyện Kon Plông", name: "Huyện Kon Plông" }, { id: "Huyện Kon Rẫy", name: "Huyện Kon Rẫy" },
    { id: "Huyện Ngọc Hồi", name: "Huyện Ngọc Hồi" }, { id: "Huyện Sa Thầy", name: "Huyện Sa Thầy" },
    { id: "Huyện Tu Mơ Rông", name: "Huyện Tu Mơ Rông" }, { id: "Huyện Ia H'Drai", name: "Huyện Ia H'Drai" }
  ],
  34: [
    { id: "Thành phố Lai Châu", name: "Thành phố Lai Châu" }, { id: "Huyện Mường Tè", name: "Huyện Mường Tè" },
    { id: "Huyện Phong Thổ", name: "Huyện Phong Thổ" }, { id: "Huyện Sìn Hồ", name: "Huyện Sìn Hồ" },
    { id: "Huyện Tam Đường", name: "Huyện Tam Đường" }, { id: "Huyện Than Uyên", name: "Huyện Than Uyên" },
    { id: "Huyện Tân Uyên", name: "Huyện Tân Uyên" }, { id: "Huyện Nậm Nhùn", name: "Huyện Nậm Nhùn" }
  ],
  35: [
    { id: "Thành phố Đà Lạt", name: "Thành phố Đà Lạt" }, { id: "Thành phố Bảo Lộc", name: "Thành phố Bảo Lộc" },
    { id: "Huyện Lạc Dương", name: "Huyện Lạc Dương" }, { id: "Huyện Đơn Dương", name: "Huyện Đơn Dương" },
    { id: "Huyện Đức Trọng", name: "Huyện Đức Trọng" }, { id: "Huyện Lâm Hà", name: "Huyện Lâm Hà" },
    { id: "Huyện Di Linh", name: "Huyện Di Linh" }, { id: "Huyện Bảo Lâm", name: "Huyện Bảo Lâm" },
    { id: "Huyện Đạ Huoai", name: "Huyện Đạ Huoai" }, { id: "Huyện Đạ Tẻh", name: "Huyện Đạ Tẻh" },
    { id: "Huyện Cát Tiên", name: "Huyện Cát Tiên" }, { id: "Huyện Đam Rông", name: "Huyện Đam Rông" }
  ],
  36: [
    { id: "Thành phố Lạng Sơn", name: "Thành phố Lạng Sơn" }, { id: "Huyện Hữu Lũng", name: "Huyện Hữu Lũng" },
    { id: "Huyện Lộc Bình", name: "Huyện Lộc Bình" }, { id: "Huyện Cao Lộc", name: "Huyện Cao Lộc" },
    { id: "Huyện Tràng Định", name: "Huyện Tràng Định" }, { id: "Huyện Văn Lãng", name: "Huyện Văn Lãng" },
    { id: "Huyện Văn Quan", name: "Huyện Văn Quan" }, { id: "Huyện Bình Gia", name: "Huyện Bình Gia" },
    { id: "Huyện Bắc Sơn", name: "Huyện Bắc Sơn" }, { id: "Huyện Chi Lăng", name: "Huyện Chi Lăng" },
    { id: "Huyện Đình Lập", name: "Huyện Đình Lập" }
  ],
  37: [
    { id: "Thành phố Lào Cai", name: "Thành phố Lào Cai" }, { id: "Thị xã Sa Pa", name: "Thị xã Sa Pa" },
    { id: "Huyện Bát Xát", name: "Huyện Bát Xát" }, { id: "Huyện Bảo Thắng", name: "Huyện Bảo Thắng" },
    { id: "Huyện Bảo Yên", name: "Huyện Bảo Yên" }, { id: "Huyện Bắc Hà", name: "Huyện Bắc Hà" },
    { id: "Huyện Mường Khương", name: "Huyện Mường Khương" }, { id: "Huyện Si Ma Cai", name: "Huyện Si Ma Cai" },
    { id: "Huyện Văn Bàn", name: "Huyện Văn Bàn" }
  ],
  38: [
    { id: "Thành phố Tân An", name: "Thành phố Tân An" }, { id: "Thị xã Kiến Tường", name: "Thị xã Kiến Tường" },
    { id: "Huyện Bến Lức", name: "Huyện Bến Lức" }, { id: "Huyện Cần Đước", name: "Huyện Cần Đước" },
    { id: "Huyện Cần Giuộc", name: "Huyện Cần Giuộc" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Đức Hòa", name: "Huyện Đức Hòa" }, { id: "Huyện Đức Huệ", name: "Huyện Đức Huệ" },
    { id: "Huyện Mộc Hóa", name: "Huyện Mộc Hóa" }, { id: "Huyện Tân Hưng", name: "Huyện Tân Hưng" },
    { id: "Huyện Tân Thạnh", name: "Huyện Tân Thạnh" }, { id: "Huyện Tân Trụ", name: "Huyện Tân Trụ" },
    { id: "Huyện Thạnh Hóa", name: "Huyện Thạnh Hóa" }, { id: "Huyện Thủ Thừa", name: "Huyện Thủ Thừa" },
    { id: "Huyện Vĩnh Hưng", name: "Huyện Vĩnh Hưng" }
  ],
  39: [
    { id: "Thành phố Nam Định", name: "Thành phố Nam Định" }, { id: "Huyện Giao Thủy", name: "Huyện Giao Thủy" },
    { id: "Huyện Hải Hậu", name: "Huyện Hải Hậu" }, { id: "Huyện Mỹ Lộc", name: "Huyện Mỹ Lộc" },
    { id: "Huyện Nam Trực", name: "Huyện Nam Trực" }, { id: "Huyện Nghĩa Hưng", name: "Huyện Nghĩa Hưng" },
    { id: "Huyện Trực Ninh", name: "Huyện Trực Ninh" }, { id: "Huyện Vụ Bản", name: "Huyện Vụ Bản" },
    { id: "Huyện Xuân Trường", name: "Huyện Xuân Trường" }, { id: "Huyện Ý Yên", name: "Huyện Ý Yên" }
  ],
  40: [
    { id: "Thành phố Vinh", name: "Thành phố Vinh" }, { id: "Thị xã Cửa Lò", name: "Thị xã Cửa Lò" },
    { id: "Thị xã Thái Hòa", name: "Thị xã Thái Hòa" }, { id: "Thị xã Hoàng Mai", name: "Thị xã Hoàng Mai" },
    { id: "Huyện Anh Sơn", name: "Huyện Anh Sơn" }, { id: "Huyện Con Cuông", name: "Huyện Con Cuông" },
    { id: "Huyện Diễn Châu", name: "Huyện Diễn Châu" }, { id: "Huyện Đô Lương", name: "Huyện Đô Lương" },
    { id: "Huyện Hưng Nguyên", name: "Huyện Hưng Nguyên" }, { id: "Huyện Kỳ Sơn", name: "Huyện Kỳ Sơn" },
    { id: "Huyện Nam Đàn", name: "Huyện Nam Đàn" }, { id: "Huyện Nghi Lộc", name: "Huyện Nghi Lộc" },
    { id: "Huyện Nghĩa Đàn", name: "Huyện Nghĩa Đàn" }, { id: "Huyện Quế Phong", name: "Huyện Quế Phong" },
    { id: "Huyện Quỳ Châu", name: "Huyện Quỳ Châu" }, { id: "Huyện Quỳ Hợp", name: "Huyện Quỳ Hợp" },
    { id: "Huyện Quỳnh Lưu", name: "Huyện Quỳnh Lưu" }, { id: "Huyện Tân Kỳ", name: "Huyện Tân Kỳ" },
    { id: "Huyện Thanh Chương", name: "Huyện Thanh Chương" }, { id: "Huyện Tương Dương", name: "Huyện Tương Dương" },
    { id: "Huyện Yên Thành", name: "Huyện Yên Thành" }
  ],
  41: [
    { id: "Thành phố Ninh Bình", name: "Thành phố Ninh Bình" }, { id: "Thành phố Tam Điệp", name: "Thành phố Tam Điệp" },
    { id: "Huyện Gia Viễn", name: "Huyện Gia Viễn" }, { id: "Huyện Hoa Lư", name: "Huyện Hoa Lư" },
    { id: "Huyện Kim Sơn", name: "Huyện Kim Sơn" }, { id: "Huyện Nho Quan", name: "Huyện Nho Quan" },
    { id: "Huyện Yên Khánh", name: "Huyện Yên Khánh" }, { id: "Huyện Yên Mô", name: "Huyện Yên Mô" }
  ],
  42: [
    { id: "Thành phố Phan Rang - Tháp Chàm", name: "Thành phố Phan Rang - Tháp Chàm" }, { id: "Huyện Bác Ái", name: "Huyện Bác Ái" },
    { id: "Huyện Ninh Hải", name: "Huyện Ninh Hải" }, { id: "Huyện Ninh Phước", name: "Huyện Ninh Phước" },
    { id: "Huyện Ninh Sơn", name: "Huyện Ninh Sơn" }, { id: "Huyện Thuận Bắc", name: "Huyện Thuận Bắc" },
    { id: "Huyện Thuận Nam", name: "Huyện Thuận Nam" }
  ],
  43: [
    { id: "Thành phố Việt Trì", name: "Thành phố Việt Trì" }, { id: "Thị xã Phú Thọ", name: "Thị xã Phú Thọ" },
    { id: "Huyện Cẩm Khê", name: "Huyện Cẩm Khê" }, { id: "Huyện Đoan Hùng", name: "Huyện Đoan Hùng" },
    { id: "Huyện Hạ Hòa", name: "Huyện Hạ Hòa" }, { id: "Huyện Lâm Thao", name: "Huyện Lâm Thao" },
    { id: "Huyện Phù Ninh", name: "Huyện Phù Ninh" }, { id: "Huyện Tam Nông", name: "Huyện Tam Nông" },
    { id: "Huyện Tân Sơn", name: "Huyện Tân Sơn" }, { id: "Huyện Thanh Ba", name: "Huyện Thanh Ba" },
    { id: "Huyện Thanh Sơn", name: "Huyện Thanh Sơn" }, { id: "Huyện Thanh Thủy", name: "Huyện Thanh Thủy" },
    { id: "Huyện Yên Lập", name: "Huyện Yên Lập" }
  ],
  44: [
    { id: "Thành phố Đồng Hới", name: "Thành phố Đồng Hới" }, { id: "Thị xã Ba Đồn", name: "Thị xã Ba Đồn" },
    { id: "Huyện Bố Trạch", name: "Huyện Bố Trạch" }, { id: "Huyện Lệ Thủy", name: "Huyện Lệ Thủy" },
    { id: "Huyện Minh Hóa", name: "Huyện Minh Hóa" }, { id: "Huyện Quảng Ninh", name: "Huyện Quảng Ninh" },
    { id: "Huyện Quảng Trạch", name: "Huyện Quảng Trạch" }, { id: "Huyện Tuyên Hóa", name: "Huyện Tuyên Hóa" }
  ],
  45: [
    { id: "Thành phố Tam Kỳ", name: "Thành phố Tam Kỳ" }, { id: "Thành phố Hội An", name: "Thành phố Hội An" },
    { id: "Thị xã Điện Bàn", name: "Thị xã Điện Bàn" }, { id: "Huyện Bắc Trà My", name: "Huyện Bắc Trà My" },
    { id: "Huyện Đại Lộc", name: "Huyện Đại Lộc" }, { id: "Huyện Đông Giang", name: "Huyện Đông Giang" },
    { id: "Huyện Duy Xuyên", name: "Huyện Duy Xuyên" }, { id: "Huyện Hiệp Đức", name: "Huyện Hiệp Đức" },
    { id: "Huyện Nam Giang", name: "Huyện Nam Giang" }, { id: "Huyện Nam Trà My", name: "Huyện Nam Trà My" },
    { id: "Huyện Nông Sơn", name: "Huyện Nông Sơn" }, { id: "Huyện Núi Thành", name: "Huyện Núi Thành" },
    { id: "Huyện Phú Ninh", name: "Huyện Phú Ninh" }, { id: "Huyện Phước Sơn", name: "Huyện Phước Sơn" },
    { id: "Huyện Quế Sơn", name: "Huyện Quế Sơn" }, { id: "Huyện Tây Giang", name: "Huyện Tây Giang" },
    { id: "Huyện Thăng Bình", name: "Huyện Thăng Bình" }, { id: "Huyện Tiên Phước", name: "Huyện Tiên Phước" }
  ],
  46: [
    { id: "Thành phố Quảng Ngãi", name: "Thành phố Quảng Ngãi" }, { id: "Thị xã Đức Phổ", name: "Thị xã Đức Phổ" },
    { id: "Huyện Lý Sơn", name: "Huyện Lý Sơn" }, { id: "Huyện Bình Sơn", name: "Huyện Bình Sơn" },
    { id: "Huyện Trà Bồng", name: "Huyện Trà Bồng" }, { id: "Huyện Sơn Tịnh", name: "Huyện Sơn Tịnh" },
    { id: "Huyện Tư Nghĩa", name: "Huyện Tư Nghĩa" }, { id: "Huyện Nghĩa Hành", name: "Huyện Nghĩa Hành" },
    { id: "Huyện Mộ Đức", name: "Huyện Mộ Đức" }, { id: "Huyện Sơn Hà", name: "Huyện Sơn Hà" },
    { id: "Huyện Sơn Tây", name: "Huyện Sơn Tây" }, { id: "Huyện Minh Long", name: "Huyện Minh Long" },
    { id: "Huyện Ba Tơ", name: "Huyện Ba Tơ" }
  ],
  47: [
    { id: "Thành phố Hạ Long", name: "Thành phố Hạ Long" }, { id: "Thành phố Cẩm Phả", name: "Thành phố Cẩm Phả" },
    { id: "Thành phố Uông Bí", name: "Thành phố Uông Bí" }, { id: "Thành phố Móng Cái", name: "Thành phố Móng Cái" },
    { id: "Thị xã Quảng Yên", name: "Thị xã Quảng Yên" }, { id: "Thị xã Đông Triều", name: "Thị xã Đông Triều" },
    { id: "Huyện Tiên Yên", name: "Huyện Tiên Yên" }, { id: "Huyện Đầm Hà", name: "Huyện Đầm Hà" },
    { id: "Huyện Hải Hà", name: "Huyện Hải Hà" }, { id: "Huyện Ba Chẽ", name: "Huyện Ba Chẽ" },
    { id: "Huyện Bình Liêu", name: "Huyện Bình Liêu" }, { id: "Huyện Vân Đồn", name: "Huyện Vân Đồn" },
    { id: "Huyện Cô Tô", name: "Huyện Cô Tô" }
  ],
  48: [
    { id: "Thành phố Đông Hà", name: "Thành phố Đông Hà" }, { id: "Thị xã Quảng Trị", name: "Thị xã Quảng Trị" },
    { id: "Huyện Vĩnh Linh", name: "Huyện Vĩnh Linh" }, { id: "Huyện Gio Linh", name: "Huyện Gio Linh" },
    { id: "Huyện Cam Lộ", name: "Huyện Cam Lộ" }, { id: "Huyện Triệu Phong", name: "Huyện Triệu Phong" },
    { id: "Huyện Hải Lăng", name: "Huyện Hải Lăng" }, { id: "Huyện Hướng Hóa", name: "Huyện Hướng Hóa" },
    { id: "Huyện Đakrông", name: "Huyện Đakrông" }
  ],
  49: [
    { id: "Thành phố Sóc Trăng", name: "Thành phố Sóc Trăng" }, { id: "Thị xã Vĩnh Châu", name: "Thị xã Vĩnh Châu" },
    { id: "Thị xã Ngã Năm", name: "Thị xã Ngã Năm" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Kế Sách", name: "Huyện Kế Sách" }, { id: "Huyện Mỹ Tú", name: "Huyện Mỹ Tú" },
    { id: "Huyện Mỹ Xuyên", name: "Huyện Mỹ Xuyên" }, { id: "Huyện Long Phú", name: "Huyện Long Phú" },
    { id: "Huyện Thạnh Trị", name: "Huyện Thạnh Trị" }, { id: "Huyện Cù Lao Dung", name: "Huyện Cù Lao Dung" },
    { id: "Huyện Trần Đề", name: "Huyện Trần Đề" }
  ],
  50: [
    { id: "Thành phố Sơn La", name: "Thành phố Sơn La" }, { id: "Huyện Quỳnh Nhai", name: "Huyện Quỳnh Nhai" },
    { id: "Huyện Thuận Châu", name: "Huyện Thuận Châu" }, { id: "Huyện Mường La", name: "Huyện Mường La" },
    { id: "Huyện Bắc Yên", name: "Huyện Bắc Yên" }, { id: "Huyện Phù Yên", name: "Huyện Phù Yên" },
    { id: "Huyện Mộc Châu", name: "Huyện Mộc Châu" }, { id: "Huyện Yên Châu", name: "Huyện Yên Châu" },
    { id: "Huyện Mai Sơn", name: "Huyện Mai Sơn" }, { id: "Huyện Sông Mã", name: "Huyện Sông Mã" },
    { id: "Huyện Sốp Cộp", name: "Huyện Sốp Cộp" }, { id: "Huyện Vân Hồ", name: "Huyện Vân Hồ" }
  ],
  51: [
    { id: "Thành phố Tây Ninh", name: "Thành phố Tây Ninh" }, { id: "Thị xã Hòa Thành", name: "Thị xã Hòa Thành" },
    { id: "Thị xã Trảng Bàng", name: "Thị xã Trảng Bàng" }, { id: "Huyện Tân Biên", name: "Huyện Tân Biên" },
    { id: "Huyện Tân Châu", name: "Huyện Tân Châu" }, { id: "Huyện Dương Minh Châu", name: "Huyện Dương Minh Châu" },
    { id: "Huyện Châu Thành", name: "Huyện Châu Thành" }, { id: "Huyện Gò Dầu", name: "Huyện Gò Dầu" },
    { id: "Huyện Bến Cầu", name: "Huyện Bến Cầu" }
  ],
  52: [
    { id: "Thành phố Thái Bình", name: "Thành phố Thái Bình" }, { id: "Huyện Quỳnh Phụ", name: "Huyện Quỳnh Phụ" },
    { id: "Huyện Hưng Hà", name: "Huyện Hưng Hà" }, { id: "Huyện Đông Hưng", name: "Huyện Đông Hưng" },
    { id: "Huyện Thái Thụy", name: "Huyện Thái Thụy" }, { id: "Huyện Tiền Hải", name: "Huyện Tiền Hải" },
    { id: "Huyện Kiến Xương", name: "Huyện Kiến Xương" }, { id: "Huyện Vũ Thư", name: "Huyện Vũ Thư" }
  ],
  53: [
    { id: "Thành phố Thái Nguyên", name: "Thành phố Thái Nguyên" }, { id: "Thành phố Sông Công", name: "Thành phố Sông Công" },
    { id: "Thành phố Phổ Yên", name: "Thành phố Phổ Yên" }, { id: "Huyện Định Hóa", name: "Huyện Định Hóa" },
    { id: "Huyện Phú Lương", name: "Huyện Phú Lương" }, { id: "Huyện Đồng Hỷ", name: "Huyện Đồng Hỷ" },
    { id: "Huyện Võ Nhai", name: "Huyện Võ Nhai" }, { id: "Huyện Đại Từ", name: "Huyện Đại Từ" },
    { id: "Huyện Phú Bình", name: "Huyện Phú Bình" }
  ],
  54: [
    { id: "Thành phố Thanh Hóa", name: "Thành phố Thanh Hóa" }, { id: "Thành phố Sầm Sơn", name: "Thành phố Sầm Sơn" },
    { id: "Thị xã Bỉm Sơn", name: "Thị xã Bỉm Sơn" }, { id: "Thị xã Nghi Sơn", name: "Thị xã Nghi Sơn" },
    { id: "Huyện Mường Lát", name: "Huyện Mường Lát" }, { id: "Huyện Quan Hóa", name: "Huyện Quan Hóa" },
    { id: "Huyện Quan Sơn", name: "Huyện Quan Sơn" }, { id: "Huyện Bá Thước", name: "Huyện Bá Thước" },
    { id: "Huyện Lang Chánh", name: "Huyện Lang Chánh" }, { id: "Huyện Ngọc Lặc", name: "Huyện Ngọc Lặc" },
    { id: "Huyện Thường Xuân", name: "Huyện Thường Xuân" }, { id: "Huyện Như Xuân", name: "Huyện Như Xuân" },
    { id: "Huyện Như Thanh", name: "Huyện Như Thanh" }, { id: "Huyện Vĩnh Lộc", name: "Huyện Vĩnh Lộc" },
    { id: "Huyện Yên Định", name: "Huyện Yên Định" }, { id: "Huyện Thạch Thành", name: "Huyện Thạch Thành" },
    { id: "Huyện Hà Trung", name: "Huyện Hà Trung" }, { id: "Huyện Nga Sơn", name: "Huyện Nga Sơn" },
    { id: "Huyện Hậu Lộc", name: "Huyện Hậu Lộc" }, { id: "Huyện Hoằng Hóa", name: "Huyện Hoằng Hóa" },
    { id: "Huyện Đông Sơn", name: "Huyện Đông Sơn" }, { id: "Huyện Thiệu Hóa", name: "Huyện Thiệu Hóa" },
    { id: "Huyện Triệu Sơn", name: "Huyện Triệu Sơn" }, { id: "Huyện Thọ Xuân", name: "Huyện Thọ Xuân" },
    { id: "Huyện Nông Cống", name: "Huyện Nông Cống" }, { id: "Huyện Quảng Xương", name: "Huyện Quảng Xương" }
  ],
  55: [
    { id: "Thành phố Huế", name: "Thành phố Huế" }, { id: "Thị xã Hương Thủy", name: "Thị xã Hương Thủy" },
    { id: "Thị xã Hương Trà", name: "Thị xã Hương Trà" }, { id: "Huyện Phong Điền", name: "Huyện Phong Điền" },
    { id: "Huyện Quảng Điền", name: "Huyện Quảng Điền" }, { id: "Huyện Phú Vang", name: "Huyện Phú Vang" },
    { id: "Huyện Phú Lộc", name: "Huyện Phú Lộc" }, { id: "Huyện A Lưới", name: "Huyện A Lưới" },
    { id: "Huyện Nam Đông", name: "Huyện Nam Đông" }
  ],
  56: [
    { id: "Thành phố Mỹ Tho", name: "Thành phố Mỹ Tho" }, { id: "Thị xã Gò Công", name: "Thị xã Gò Công" },
    { id: "Thị xã Cai Lậy", name: "Thị xã Cai Lậy" }, { id: "Huyện Cái Bè", name: "Huyện Cái Bè" },
    { id: "Huyện Cai Lậy", name: "Huyện Cai Lậy" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Chợ Gạo", name: "Huyện Chợ Gạo" }, { id: "Huyện Gò Công Tây", name: "Huyện Gò Công Tây" },
    { id: "Huyện Gò Công Đông", name: "Huyện Gò Công Đông" }, { id: "Huyện Tân Phước", name: "Huyện Tân Phước" }
  ],
  57: [
    { id: "Thành phố Trà Vinh", name: "Thành phố Trà Vinh" }, { id: "Thị xã Duyên Hải", name: "Thị xã Duyên Hải" },
    { id: "Huyện Càng Long", name: "Huyện Càng Long" }, { id: "Huyện Cầu Kè", name: "Huyện Cầu Kè" },
    { id: "Huyện Tiểu Cần", name: "Huyện Tiểu Cần" }, { id: "Huyện Châu Thành", name: "Huyện Châu Thành" },
    { id: "Huyện Trà Cú", name: "Huyện Trà Cú" }, { id: "Huyện Cầu Ngang", name: "Huyện Cầu Ngang" },
    { id: "Huyện Duyên Hải", name: "Huyện Duyên Hải" }
  ],
  58: [
    { id: "Thành phố Tuyên Quang", name: "Thành phố Tuyên Quang" }, { id: "Huyện Lâm Bình", name: "Huyện Lâm Bình" },
    { id: "Huyện Na Hang", name: "Huyện Na Hang" }, { id: "Huyện Chiêm Hóa", name: "Huyện Chiêm Hóa" },
    { id: "Huyện Hàm Yên", name: "Huyện Hàm Yên" }, { id: "Huyện Yên Sơn", name: "Huyện Yên Sơn" },
    { id: "Huyện Sơn Dương", name: "Huyện Sơn Dương" }
  ],
  59: [
    { id: "Thành phố Vĩnh Long", name: "Thành phố Vĩnh Long" }, { id: "Thị xã Bình Minh", name: "Thị xã Bình Minh" },
    { id: "Huyện Long Hồ", name: "Huyện Long Hồ" }, { id: "Huyện Mang Thít", name: "Huyện Mang Thít" },
    { id: "Huyện Vũng Liêm", name: "Huyện Vũng Liêm" }, { id: "Huyện Tam Bình", name: "Huyện Tam Bình" },
    { id: "Huyện Trà Ôn", name: "Huyện Trà Ôn" }, { id: "Huyện Bình Tân", name: "Huyện Bình Tân" }
  ],
  60: [
    { id: "Thành phố Vĩnh Yên", name: "Thành phố Vĩnh Yên" }, { id: "Thành phố Phúc Yên", name: "Thành phố Phúc Yên" },
    { id: "Huyện Lập Thạch", name: "Huyện Lập Thạch" }, { id: "Huyện Sông Lô", name: "Huyện Sông Lô" },
    { id: "Huyện Tam Dương", name: "Huyện Tam Dương" }, { id: "Huyện Tam Đảo", name: "Huyện Tam Đảo" },
    { id: "Huyện Bình Xuyên", name: "Huyện Bình Xuyên" }, { id: "Huyện Yên Lạc", name: "Huyện Yên Lạc" },
    { id: "Huyện Vĩnh Tường", name: "Huyện Vĩnh Tường" }
  ],
  61: [
    { id: "Thành phố Yên Bái", name: "Thành phố Yên Bái" }, { id: "Thị xã Nghĩa Lộ", name: "Thị xã Nghĩa Lộ" },
    { id: "Huyện Trạm Tấu", name: "Huyện Trạm Tấu" }, { id: "Huyện Mù Cang Chải", name: "Huyện Mù Cang Chải" },
    { id: "Huyện Văn Chấn", name: "Huyện Văn Chấn" }, { id: "Huyện Văn Yên", name: "Huyện Văn Yên" },
    { id: "Huyện Lục Yên", name: "Huyện Lục Yên" }, { id: "Huyện Trấn Yên", name: "Huyện Trấn Yên" },
    { id: "Huyện Yên Bình", name: "Huyện Yên Bình" }
  ],
  62: [
    { id: "Thành phố Tuy Hòa", name: "Thành phố Tuy Hòa" }, { id: "Thị xã Sông Cầu", name: "Thị xã Sông Cầu" },
    { id: "Thị xã Đông Hòa", name: "Thị xã Đông Hòa" }, { id: "Huyện Đồng Xuân", name: "Huyện Đồng Xuân" },
    { id: "Huyện Tuy An", name: "Huyện Tuy An" }, { id: "Huyện Sơn Hòa", name: "Huyện Sơn Hòa" },
    { id: "Huyện Sông Hinh", name: "Huyện Sông Hinh" }, { id: "Huyện Tây Hòa", name: "Huyện Tây Hòa" },
    { id: "Huyện Phú Hòa", name: "Huyện Phú Hòa" }
  ]
};

export const DEFAULT_DISTRICTS = [
  { id: "Quận / Huyện trung tâm", name: "Quận / Huyện trung tâm" },
  { id: "Thành phố / Thị xã", name: "Thành phố / Thị xã" },
  { id: "Huyện ngoại thành", name: "Huyện ngoại thành" }
];

export function validateForm(data: {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  otherReceiver: boolean;
  receiverName?: string;
  receiverPhone?: string;
}) {
  const nameTrim = data.fullName.trim();
  if (!nameTrim) return "Vui lòng nhập Họ và tên người nhận.";
  if (nameTrim.split(/\s+/).length < 2) return "Họ và tên phải có tối thiểu 2 từ (cả họ và tên).";
  if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(nameTrim)) return "Họ và tên không được phép chứa số hay ký tự đặc biệt.";

  const phoneTrim = data.phone.trim();
  if (!phoneTrim) return "Vui lòng nhập Số điện thoại nhận hàng.";
  if (!/^0[3|5|7|8|9][0-9]{8}$/.test(phoneTrim)) return "Số điện thoại không hợp lệ (phải có 10 chữ số, bắt đầu bằng 03, 05, 07, 08 hoặc 09).";

  const emailTrim = data.email.trim();
  if (!emailTrim) return "Vui lòng nhập địa chỉ Email để nhận thông báo đơn hàng.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) return "Email không đúng định dạng (ví dụ: nguyenvana@gmail.com).";

  const addressTrim = data.address.trim();
  if (!addressTrim) return "Vui lòng nhập địa chỉ giao hàng cụ thể.";
  if (addressTrim.length < 6) return "Địa chỉ chi tiết quá ngắn. Vui lòng ghi rõ số nhà, tên đường, thôn/xóm/phường/xã.";

  if (data.otherReceiver) {
    const rName = (data.receiverName ?? "").trim();
    if (!rName) return "Vui lòng nhập Họ và tên người nhận hộ.";
    if (rName.split(/\s+/).length < 2) return "Họ và tên người nhận hộ phải có tối thiểu 2 từ.";
    if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(rName)) return "Họ và tên người nhận hộ không được chứa số/ký tự đặc biệt.";

    const rPhone = (data.receiverPhone ?? "").trim();
    if (!rPhone) return "Vui lòng nhập Số điện thoại người nhận hộ.";
    if (!/^0[3|5|7|8|9][0-9]{8}$/.test(rPhone)) return "Số điện thoại người nhận hộ không hợp lệ.";
  }

  return null;
}

export function validateFields(
  data: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    otherReceiver: boolean;
    receiverName?: string;
    receiverPhone?: string;
  },
  isMember: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};

  const nameTrim = data.fullName.trim();
  if (!nameTrim) {
    errors.fullName = "Vui lòng nhập Họ và tên người nhận.";
  } else if (nameTrim.split(/\s+/).length < 2) {
    errors.fullName = "Họ và tên phải có tối thiểu 2 từ (cả họ và tên).";
  } else if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(nameTrim)) {
    errors.fullName = "Họ và tên không được chứa số hay ký tự đặc biệt.";
  }

  const phoneTrim = data.phone.trim();
  if (!phoneTrim) {
    errors.phone = "Vui lòng nhập Số điện thoại nhận hàng.";
  } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(phoneTrim)) {
    errors.phone = "Số điện thoại không đúng định dạng (ví dụ: 0912345678).";
  }

  const emailTrim = data.email.trim();
  if (!isMember) {
    if (!emailTrim) {
      errors.email = "Vui lòng nhập địa chỉ Email để nhận thông báo đơn hàng.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errors.email = "Email không đúng định dạng (ví dụ: nguyenvana@gmail.com).";
    }
  } else {
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrim)) {
      errors.email = "Email không đúng định dạng (ví dụ: nguyenvana@gmail.com).";
    }
  }

  const addressTrim = data.address.trim();
  if (!addressTrim) {
    errors.address = "Vui lòng nhập địa chỉ giao hàng cụ thể.";
  } else if (addressTrim.length < 6) {
    errors.address = "Địa chỉ chi tiết quá ngắn (vui lòng ghi rõ số nhà, tên đường...).";
  }

  if (data.otherReceiver) {
    const rName = (data.receiverName ?? "").trim();
    if (!rName) {
      errors.receiverName = "Vui lòng nhập Họ và tên người nhận hộ.";
    } else if (rName.split(/\s+/).length < 2) {
      errors.receiverName = "Họ và tên người nhận hộ phải có tối thiểu 2 từ.";
    } else if (/[0-9!@#$%^&*(),.?":{}|<>]/.test(rName)) {
      errors.receiverName = "Họ và tên không được chứa số/ký tự đặc biệt.";
    }

    const rPhone = (data.receiverPhone ?? "").trim();
    if (!rPhone) {
      errors.receiverPhone = "Vui lòng nhập Số điện thoại người nhận hộ.";
    } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(rPhone)) {
      errors.receiverPhone = "Số điện thoại nhận hộ không hợp lệ.";
    }
  }

  return errors;
}
