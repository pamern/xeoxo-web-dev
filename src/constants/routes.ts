export const ROUTES = {
  HOME: "/",

  ABOUT: "/about",
  MATERIALS: "/materials",
  BLOG: "/blog",

  PRODUCTS: "/products",
  PRODUCT: (slug: string) =>
    `/products/${encodeURIComponent(slug)}`,

  COLLECTIONS: "/collections",
  COLLECTION: (slug: string) =>
    `/collections/${encodeURIComponent(slug)}`,

  CATALOG_WOMEN: "/catalog/nu",
  CATALOG_MEN: "/catalog/nam",
  CATALOG_KIDS: "/catalog/tre-em",
  CATALOG_AO_DAI: "/catalog/ao-dai",
  CATALOG: (slug: string) =>
    `/catalog/${encodeURIComponent(slug)}`,

  CATEGORIES: "/categories",
  CATEGORY_MEN: "/categories/ao-nam",
  CATEGORY_WOMEN: "/categories/ao-dam-vay",
  CATEGORY_KIDS: "/categories/tre-em",

  CATEGORY: (slug: string) =>
    `/categories/${encodeURIComponent(slug)}`,

  CART: "/cart",
  CHECKOUT: "/checkout",

  LOGIN: "/login",
  REGISTER: "/register",

  ACCOUNT: "/account",
  ACCOUNT_PROFILE: "/account/profile",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_ORDER: (orderId: string) =>
    `/account/orders/${encodeURIComponent(orderId)}`,

  ORDER_LOOKUP: "/orders/lookup",
  ORDER: (orderId: string) =>
    `/orders/${encodeURIComponent(orderId)}`,

  PERSONAL_COLOR: "/personal-color",

  FAQ: "/faq",
  SIZE_GUIDE: "/size-guide",
  WASHING_GUIDE: "/washing-guide",

  MEMBERSHIP: "/membership",
  BENEFITS: "/membership/benefits",

  CAREERS: "/careers",
  COPYRIGHT: "/copyright",

  POLICIES: "/policy",
  POLICY: (slug: string) =>
    `/policy/${encodeURIComponent(slug)}`,

  DASHBOARD: "/dashboard",
} as const;

export const API = {
  LOGIN: "/api/auth/login",
  REGISTER: "/api/auth/register",
  LOGOUT: "/api/auth/logout",
  ME: "/api/auth/me",

  POSTS: "/api/posts",
} as const;
