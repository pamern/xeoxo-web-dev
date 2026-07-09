export const ROUTES = {
  HOME: "/",

  ABOUT: "/about",
  MATERIALS: "/materials",
  BLOG: "/blog",

  PRODUCTS: "/products",
  PRODUCT: (slug: string) => `/products/${encodeURIComponent(slug)}`,

  COLLECTIONS: "/collections",
  COLLECTION: (slug: string) => `/collections/${encodeURIComponent(slug)}`,

  CATALOG_WOMEN: "/catalog/nu",
  CATALOG_MEN: "/catalog/nam",
  CATALOG_KIDS: "/catalog/tre-em",
  CATALOG_AO_DAI: "/catalog/ao-dai",
  CATALOG: (slug: string) => `/catalog/${encodeURIComponent(slug)}`,

  CATEGORIES: "/categories",
  CATEGORY_MEN: "/categories/ao-nam",
  CATEGORY_WOMEN: "/categories/ao-dam-vay",
  CATEGORY_KIDS: "/categories/tre-em",

  CATEGORY: (slug: string) => `/categories/${encodeURIComponent(slug)}`,

  CART: "/cart",
  CHECKOUT: "/checkout",
  APPOINTMENT: "/appointment",

  LOGIN: "/login",
  REGISTER: "/register",

  ACCOUNT: "/account",
  ACCOUNT_PROFILE: "/account/profile",
  ACCOUNT_ADDRESSES: "/account/addresses",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_APPOINTMENTS: "/account/appointments",
  ACCOUNT_ORDER: (orderId: string) =>
    `/account/orders/${encodeURIComponent(orderId)}`,

  ORDER_LOOKUP: "/orders/lookup",
  ORDER: (orderId: string) => `/orders/${encodeURIComponent(orderId)}`,

  PERSONAL_COLOR: "/personal-color",

  FAQ: "/faq",
  FAQ_ACCOUNT: "/faq?view=account",
  SIZE_GUIDE: "/size-guide",
  WASHING_GUIDE: "/washing-guide",

  MEMBERSHIP: "/membership",
  BENEFITS: "/membership/benefits",

  CAREERS: "/careers",
  COPYRIGHT: "/copyright",

  POLICIES: "/policy",
  POLICY: (slug: string) => `/policy/${encodeURIComponent(slug)}`,

  DASHBOARD: "/dashboard",
} as const;

export const API = {
  AUTH_ME: "/api/v1/auth/me",
  AUTH_CALLBACK: "/api/v1/auth/callback",
  AUTH_SYNC_PROFILE: "/api/v1/auth/sync-profile",
  COLLECTIONS_LATEST: "/api/v1/collections/latest",
  CUSTOMERS_ME: "/api/v1/customers/me",

  PRODUCT_LINE: (slug: string) =>
    `/api/v1/product-lines/${encodeURIComponent(slug)}`,
  PRODUCT_SIZE_CHART: (slug: string) =>
    `/api/v1/product-lines/${encodeURIComponent(slug)}/size-chart`,
  PRODUCT_REVIEWS: (slug: string) =>
    `/api/v1/product-lines/${encodeURIComponent(slug)}/reviews`,

  CART: "/api/v1/cart",
  CART_ITEMS: "/api/v1/cart-items",
  CART_ITEM: (cartItemId: number) => `/api/v1/cart-items/${cartItemId}`,
  CHECKOUT_PREVIEW: "/api/v1/cart/checkout-preview",

  ADDRESSES: "/api/v1/addresses",
  PAYMENT_METHODS: "/api/v1/payment-methods",
  ORDERS: "/api/v1/orders",
  ORDER_LOOKUP: "/api/v1/orders/lookup",
  APPOINTMENT_LOOKUP: "/api/v1/measurement-appointments/lookup",
  ORDER_PAYMENTS: (orderId: number) => `/api/v1/orders/${orderId}/payments`,

  POSTS: "/api/posts",
} as const;
