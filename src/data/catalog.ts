import type { Collection, Material, Product, ProductCategory } from "@/types/product.types";

// Lớp dữ liệu mock có cấu trúc rõ ràng, dễ thay bằng nguồn thật (Prisma/API).
// Không hardcode rải rác trong UI — mọi trang đọc từ đây qua các selector ở dưới.

export const PRODUCT_IMAGE = "/products/placeholder.png";

export const CATEGORIES: ProductCategory[] = [
  { slug: "ao-dam-vay", name: "Áo đầm - Váy", gender: "nu" },
  { slug: "ao-dai-nu", name: "Áo dài", gender: "nu" },
  { slug: "ao-cuoi", name: "Áo dài đôi - Cưới", gender: "nu" },
  { slug: "ao-nam", name: "Áo nam", gender: "nam" },
  { slug: "ao-dai-nam", name: "Áo dài nam", gender: "nam" },
  { slug: "ao-doi-cuoi", name: "Áo đôi - Cưới", gender: "nam" },
];

export const COLLECTIONS: Collection[] = [
  {
    slug: "ha-khue",
    name: "Hạ Khuê",
    subtitle: "Bộ sưu tập",
    coverImage: "/banners/hero-hakhue.png",
    description:
      "Hạ Khuê gợi nhắc vẻ đẹp của những ngày hè dịu dàng — nơi sắc màu Á Đông hòa quyện cùng phom dáng hiện đại, tôn vinh sự thanh thoát của người phụ nữ.",
  },
  {
    slug: "canh-giang",
    name: "Cảnh Giang",
    subtitle: "Bộ sưu tập",
    coverImage: "/collections/canh-giang.png",
    description:
      "Cảnh Giang lấy cảm hứng từ sông nước miền Bắc, mang đến những thiết kế nhẹ nhàng, phảng phất nét cổ điển mà vẫn tinh tế.",
  },
  {
    slug: "cat-dien",
    name: "Cát Điền",
    subtitle: "Bộ sưu tập",
    coverImage: "/collections/cat-dien.png",
    description:
      "Cát Điền tôn vinh chất liệu thủ công và đường thêu tỉ mỉ, gửi gắm câu chuyện về sự bền bỉ và vẻ đẹp mộc mạc.",
  },
  {
    slug: "sac-ky-huong",
    name: "Sắc Kỳ Hương",
    subtitle: "Bộ sưu tập",
    coverImage: "/collections/sac-ky-huong.png",
    description:
      "Sắc Kỳ Hương rực rỡ với bảng màu đậm chất phương Đông, dành cho những dịp trọng đại và khoảnh khắc đáng nhớ.",
  },
  {
    slug: "xuan-diem-khai-hoa",
    name: "Xuân Diệm Khai Hoa",
    subtitle: "Bộ sưu tập",
    coverImage: "/collections/xuan-diem-khai-hoa.png",
    description:
      "Xuân Diệm Khai Hoa khắc họa khoảnh khắc hoa xuân hé nở, biểu tượng cho khởi đầu mới và niềm hân hoan.",
  },
];

const SIZES = ["S", "M", "L", "XL"];
const COLORS = [
  { name: "Đen", hex: "#000000" },
  { name: "Trắng ngà", hex: "#F5F1E8" },
  { name: "Đỏ rượu", hex: "#7B1E2B" },
];

const PRODUCT_NAMES = [
  "Đầm Thanh Tiêu",
  "Áo Dài Hạ Khuê",
  "Váy Cát Điền",
  "Đầm Sắc Kỳ",
  "Áo Dài Cưới Phượng",
  "Đầm Xuân Diệm",
  "Áo Nam Trúc Lâm",
  "Áo Dài Nam Tùng",
];

function buildProducts(): Product[] {
  const products: Product[] = [];
  let counter = 1;

  for (const category of CATEGORIES) {
    for (let i = 0; i < 4; i += 1) {
      const name = PRODUCT_NAMES[(counter + i) % PRODUCT_NAMES.length];
      const slug = `${category.slug}-${i + 1}`;
      products.push({
        id: `p-${counter}`,
        slug,
        name,
        price: 950000 + ((counter * 50000) % 600000),
        images: [PRODUCT_IMAGE, PRODUCT_IMAGE, PRODUCT_IMAGE],
        categorySlug: category.slug,
        gender: category.gender,
        collectionSlug: COLLECTIONS[(counter + i) % COLLECTIONS.length].slug,
        description:
          "Thiết kế lấy cảm hứng từ vẻ đẹp Á Đông, sử dụng chất liệu cao cấp với đường may thủ công tỉ mỉ, tôn dáng và thoải mái khi mặc.",
        sizes: SIZES,
        colors: COLORS,
        isNew: i === 0,
        salePrice: i === 1 ? 750000 + ((counter * 30000) % 200000) : undefined,
      });
      counter += 1;
    }
  }

  return products;
}

export const PRODUCTS: Product[] = buildProducts();

// "CÔNG NGHỆ VẢI NỔI BẬT" — 4 card chất liệu (ảnh placeholder, thay sau).
export const MATERIALS: Material[] = [
  {
    image: PRODUCT_IMAGE,
    caption: "Gấm dệt cổ điển, khí chất quý ông.",
    name: "GẤM VẠN PHÚC",
    composition: "70% gấm dệt Vạn Phúc, 20% tơ ánh mềm, 10% sợi giữ phom",
    features: ["Mềm nhẹ, đứng dáng thanh lịch.", "Bề mặt ánh nhẹ sang trọng."],
  },
  {
    image: PRODUCT_IMAGE,
    caption: "Gấm dệt hiện đại, phom dáng sang trọng.",
    name: "GẤM BẢO LỘC",
    composition: "68% gấm dệt Bảo Lộc, 22% sợi tơ mềm, 10% sợi cấu trúc cao cấp",
    features: ["Thoáng nhẹ, dễ chuyển động.", "Giữ phom đẹp, nam tính hiện đại."],
  },
  {
    image: PRODUCT_IMAGE,
    caption: "Gấm dệt thủ công, đậm nét Á Đông.",
    name: "GẤM NAM CAO",
    composition: "72% gấm dệt Nam Cao, 18% sợi ánh cao cấp, 10% sợi giữ form",
    features: ["Chạm mềm, bề mặt dày vừa phải.", "Họa tiết nổi tạo chiều sâu thị giác."],
  },
  {
    image: PRODUCT_IMAGE,
    caption: "Gấm dệt ánh sắc, nam tính hiện đại.",
    name: "GẤM TÂN CHÂU",
    composition: "70% gấm dệt Tân Châu, 20% sợi tơ ánh, 10% sợi giữ phom",
    features: ["Mềm mát, thoải mái khi mặc.", "Ánh vải sâu màu, sang trọng."],
  },
];

// "ĐỊNH VỊ GIÁ TRỊ" — 4 dòng giá trị thương hiệu.
export const VALUE_PROPS = [
  "Bản sắc giao thoa",
  "Trải nghiệm duy mỹ và cá nhân hóa",
  "Độc bản và thủ công",
  "Giá trị cảm xúc tự do",
];
