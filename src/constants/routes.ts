// Đường dẫn tập trung tại 1 chỗ -> đổi route không phải sửa rải rác.
export const ROUTES = {
  HOME: "/",
  ABOUT: "/ve-xeo-xo",
  CATALOG_WOMEN: "/danh-muc/nu",
  CATALOG_MEN: "/danh-muc/nam",
  CATALOG_KIDS: "/danh-muc/tre-em",
  COLLECTIONS: "/bo-suu-tap",
  SALE: "/ban-hang",
  CART: "/gio-hang",
  POLICY: "/chinh-sach",
  APPOINTMENT: "/dat-lich-hen",
  SIZE_GUIDE: "/huong-dan-size",
  LOGIN: "/dang-nhap",
  SIGNUP: "/dang-ky",
  DASHBOARD: "/dashboard",
} as const;

export const collectionRoute = (slug: string) => `/bo-suu-tap/${slug}`;
export const productRoute = (slug: string) => `/san-pham/${slug}`;
export const categoryRoute = (gender: "nam" | "nu", slug: string) =>
  `/danh-muc/${gender}/${slug}`;

export const API = {
  LOGIN: "/api/auth/login",
  SIGNUP: "/api/auth/signup",
  LOGOUT: "/api/auth/logout",
  ME: "/api/auth/me",
  POSTS: "/api/posts",
} as const;
