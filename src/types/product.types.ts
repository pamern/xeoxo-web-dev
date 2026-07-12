// Domain types cho phần thương mại (sản phẩm, bộ sưu tập, giỏ hàng).
// Tách khỏi user.types.ts vốn phục vụ auth.

export type Gender = "nam" | "nu" | "tre-em";

export type ProductCategory = {
  slug: string;
  name: string;
  gender: Gender;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  /** Ảnh chính + ảnh phụ (gallery). */
  images: string[];
  categorySlug: string;
  gender: Gender;
  collectionSlug?: string;
  /** Mô tả ngắn hiển thị ở trang chi tiết. */
  description: string;
  sizes: string[];
  colors: ProductColor[];
  /** Đánh dấu hàng mới / đang giảm giá để hiển thị badge. */
  isNew?: boolean;
  salePrice?: number;
  materialName?: string;
  collectionName?: string;
  /** Thời gian tạo dòng sản phẩm, dùng để sort "Mới nhất". */
  createdAt?: string;
  /** Tổng số lượng đã bán (đơn COMPLETED), dùng để sort "Bán chạy nhất". */
  soldQuantity?: number;
};

export type ProductColor = {
  name: string;
  hex: string;
};

export type Collection = {
  slug: string;
  name: string;
  subtitle: string;
  coverImage: string;
  description: string;
};

export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

// Card chất liệu vải hiển thị ở trang catalog ("CÔNG NGHỆ VẢI NỔI BẬT").
export type Material = {
  image: string;
  /** Mô tả ngắn overlay trên ảnh. */
  caption: string;
  name: string;
  /** Thành phần dạng "70% gấm dệt Vạn Phúc, 20% tơ..." */
  composition: string;
  features: string[];
};
