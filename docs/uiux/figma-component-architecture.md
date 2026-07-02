# Figma Component Architecture Report

Source design: [Xeo Xo Team](https://www.figma.com/design/QVFDOtolokkYjrFLocQZy4/X%C3%A9o-X%E1%BB%8D-Team)

Note: the current Codex session does not expose a live Figma MCP tool, so this report is based on the extracted Figma inventory in `frontend/src/data/figma-assets-map.ts` plus the current Next.js app in `src/`. Node ids marked `TBD` or `multiple` are preserved from the extracted map.

## 1. Page And Frame Architecture

| Page | Figma Node ID | Frame Name | Suggested Component | Component Type | Reusable | Suggested File Path | Suggested Props |
|---|---:|---|---|---|---|---|---|
| Shared | `1:4` | Header | `SiteHeader` | Organism | Yes | `src/components/organisms/SiteHeader/SiteHeader.tsx` | `navItems`, `utilityLinks`, `logo`, `cartCount`, `onSearch` |
| Shared | `I1:4;1:1045` | Search | `SearchBox` | Molecule | Yes | `src/components/molecules/SearchBox/SearchBox.tsx` | `value`, `placeholder`, `onChange`, `onSubmit` |
| Shared | `I1:4;1:1034` | Ngon ngu | `LanguageSelector` | Molecule | Yes | `src/components/molecules/LanguageSelector/LanguageSelector.tsx` | `locale`, `options`, `onChange` |
| Shared | `1:87` | Footer | `SiteFooter` | Organism | Yes | `src/components/organisms/SiteFooter/SiteFooter.tsx` | `columns`, `contacts`, `socialLinks`, `policies` |
| Shared | `I1:87;1:1153` | Social Media | `SocialLinks` | Molecule | Yes | `src/components/molecules/SocialLinks/SocialLinks.tsx` | `items`, `size`, `variant` |
| Shared | `I1:103;1:1067` | Button Kham Pha | `Button` | Atom | Yes | `src/components/atoms/Button/Button.tsx` | `variant`, `size`, `isLoading`, `children` |
| Shared | `1:109` | Item | `ProductCard` | Molecule | Yes | `src/components/molecules/ProductCard/ProductCard.tsx` | `product`, `href`, `showSale`, `className` |
| Shared | `1:200` | Item-Materials | `MaterialCard` | Molecule | Yes | `src/components/molecules/MaterialCard/MaterialCard.tsx` | `material`, `imagePriority` |
| Shared | `1:103` | Banner-Catology | `CategoryBanner` | Molecule | Yes | `src/components/molecules/CategoryBanner/CategoryBanner.tsx` | `title`, `image`, `href`, `ctaLabel` |
| Shared | `1:100` | Gender | `GenderCard` | Molecule | Yes | `src/components/molecules/GenderCard/GenderCard.tsx` | `title`, `image`, `href` |
| Shared | `multiple` | Section title groups | `SectionHeading` | Molecule | Yes | `src/components/molecules/SectionHeading/SectionHeading.tsx` | `title`, `actionHref`, `actionLabel`, `align` |
| Shared | `TBD` | Filter-Bar | `FilterBar` | Organism | Yes | `src/components/organisms/FilterBar/FilterBar.tsx` | `filters`, `activeValues`, `sort`, `onChange` |
| Shared | `1:195` | Dinh vi gia tri | `ValueProposition` | Organism | Yes | `src/components/organisms/ValueProposition/ValueProposition.tsx` | `values`, `logo`, `image` |
| Ve Xeo Xo | `1:2` | Ve Xeo Xo | `AboutPageTemplate` | Template | Page-specific | `src/components/templates/AboutPage/AboutPage.tsx` | `story`, `principles`, `process`, `cta` |
| Ve Xeo Xo | `1:16` | Story | `BrandStorySection` | Organism | Yes | `src/components/organisms/BrandStorySection/BrandStorySection.tsx` | `title`, `body`, `images` |
| Ve Xeo Xo | `1:6` | Top-body | `AboutHero` | Organism | Yes | `src/components/organisms/AboutHero/AboutHero.tsx` | `title`, `subtitle`, `image`, `cta` |
| Ve Xeo Xo | `1:81` | Frame 32 | `PrincipleGrid` | Organism | Yes | `src/components/organisms/PrincipleGrid/PrincipleGrid.tsx` | `items` |
| Homepage | `1:88` | Homepage | `HomePageTemplate` | Template | Page-specific | `src/components/templates/HomePage/HomePage.tsx` | `collections`, `categories`, `products` |
| Homepage | `1:92` | Top-body | `HeroCarousel` | Organism | Yes | `src/components/organisms/HeroCarousel/HeroCarousel.tsx` | `slides`, `autoPlay`, `interval` |
| Homepage | `1:93` | BTS-list | `CollectionRail` | Organism | Yes | `src/components/organisms/CollectionRail/CollectionRail.tsx` | `collections`, `layout` |
| Homepage | `I1:100;1:1069` | Gender | `GenderSelect` | Organism | Yes | `src/components/organisms/GenderSelect/GenderSelect.tsx` | `items` |
| Homepage | `I1:103;1:1064` | Banner-Cato | `CategoryBanner` | Molecule | Yes | `src/components/molecules/CategoryBanner/CategoryBanner.tsx` | `title`, `image`, `href` |
| Homepage | `multiple` | Item-list | `ProductRow` | Organism | Yes | `src/components/organisms/ProductRow/ProductRow.tsx` | `title`, `products`, `actionHref` |
| Thoi Trang Nam | `1:139` | Thoi Trang Nam | `CatalogPage` | Template | Yes | `src/components/templates/CatalogPage/CatalogPage.tsx` | `gender` |
| Thoi Trang Nam | `TBD` | Top-body | `CatalogHero` | Organism | Yes | `src/components/organisms/CatalogHero/CatalogHero.tsx` | `label`, `image`, `ctaHref`, `collectionNote` |
| Thoi Trang Nam | `multiple` | Rectangle 34 | `CatalogHeroGrid` | Organism | Yes | `src/components/organisms/CatalogHeroGrid/CatalogHeroGrid.tsx` | `collections` |
| Thoi Trang Nam | `TBD` | Filter-Bar | `FilterBar` | Organism | Yes | `src/components/organisms/FilterBar/FilterBar.tsx` | `filters`, `activeValues`, `onChange` |
| Thoi Trang Nam | `TBD` | Item-list | `ProductRow` | Organism | Yes | `src/components/organisms/ProductRow/ProductRow.tsx` | `title`, `products`, `actionHref` |
| Thoi Trang Nam | `1:200-203` | Item-Materials list | `Materials` + `MaterialCard` | Organism + Molecule | Yes | `src/components/organisms/Materials/Materials.tsx` | `materials` |
| Thoi Trang Nu | `1:208` | Thoi Trang Nu | `CatalogPage` | Template | Yes | `src/components/templates/CatalogPage/CatalogPage.tsx` | `gender` |
| Thoi Trang Nu | `1:277-280` | Item-Materials | `Materials` + `MaterialCard` | Organism + Molecule | Yes | `src/components/organisms/Materials/Materials.tsx` | `materials` |
| Ban Hang | `1:285` | Ban Hang | `ProductListingPage` | Template | Yes | `src/components/templates/ProductListingPage/ProductListingPage.tsx` | `products`, `filters`, `breadcrumbs` |
| Ban Hang | `multiple` | Rectangle 34 | `ProductGrid` | Organism | Yes | `src/components/organisms/ProductGrid/ProductGrid.tsx` | `products`, `columns` |
| Dang nhap / Dang ky | `1:827` | Dang nhap / Dang ky | `AuthShell` | Template | Yes | `src/components/templates/AuthShell/AuthShell.tsx` | `title`, `subtitle`, `mode`, `children` |
| Dang nhap / Dang ky | `1:830` | Dang nhap | `LoginForm` | Organism | Yes | `src/components/organisms/LoginForm/LoginForm.tsx` | `onSubmit`, `oauthProviders`, `redirectTo` |
| Dang nhap / Dang ky | `1:909` | Dang ky | `RegisterForm` | Organism | Yes | `src/components/organisms/RegisterForm/RegisterForm.tsx` | `onSubmit`, `oauthProviders`, `benefits` |
| Dang nhap / Dang ky | `1:839` | Benefit card border | `AuthBenefitCard` | Molecule | Yes | `src/components/molecules/AuthBenefitCard/AuthBenefitCard.tsx` | `icon`, `title`, `description` |
| Dat lich hen | `1:707` | Dat lich hen | `AppointmentPageTemplate` | Template | Page-specific | `src/components/templates/AppointmentPage/AppointmentPage.tsx` | `branches`, `availableSlots` |
| Dat lich hen | `1:709` | Bieu mau | `AppointmentForm` | Organism | Yes | `src/components/organisms/AppointmentForm/AppointmentForm.tsx` | `branches`, `dates`, `timeSlots`, `onSubmit` |
| Dat lich hen | `1:741` | Chi nhanh | `SelectField` | Molecule | Yes | `src/components/molecules/SelectField/SelectField.tsx` | `label`, `options`, `value`, `onChange` |
| Dat lich hen | `1:744` | Chon lich | `DatePickerField` | Molecule | Yes | `src/components/molecules/DatePickerField/DatePickerField.tsx` | `label`, `value`, `minDate`, `onChange` |
| Dat lich hen | `1:747` | Chon khung gio | `TimeSlotPicker` | Molecule | Yes | `src/components/molecules/TimeSlotPicker/TimeSlotPicker.tsx` | `slots`, `value`, `onChange` |
| Gio hang | `1:1734` | Gio hang | `CheckoutPageTemplate` | Template | Page-specific | `src/components/templates/CheckoutPage/CheckoutPage.tsx` | `cartItems`, `totals`, `paymentMethods` |
| Gio hang | `1:1814` | Item | `CartItem` | Molecule | Yes | `src/components/molecules/CartItem/CartItem.tsx` | `item`, `onQuantityChange`, `onRemove` |
| Gio hang | `1:1737` | Thanh toan | `CheckoutForm` | Organism | Yes | `src/components/organisms/CheckoutForm/CheckoutForm.tsx` | `customer`, `shipping`, `payment`, `onSubmit` |
| Chi tiet san pham | `1:354` | Chi tiet san pham | `ProductDetailPageTemplate` | Template | Yes | `src/components/templates/ProductDetailPage/ProductDetailPage.tsx` | `product`, `relatedProducts`, `reviews` |
| Chi tiet san pham | `TBD` | Item-preview list | `ProductImageGallery` | Organism | Yes | `src/components/organisms/ProductImageGallery/ProductImageGallery.tsx` | `images`, `selectedIndex`, `onSelect` |
| Chi tiet san pham | `1:411` | Vip | `VipBanner` | Molecule | Yes | `src/components/molecules/VipBanner/VipBanner.tsx` | `title`, `description`, `href` |
| Chi tiet san pham | `1:408` | FreeShip | `FreeShippingBadge` | Atom | Yes | `src/components/atoms/FreeShippingBadge/FreeShippingBadge.tsx` | `label` |
| Chi tiet san pham | `TBD` | Color/Size selector | `VariantSelector` | Organism | Yes | `src/components/organisms/VariantSelector/VariantSelector.tsx` | `colors`, `sizes`, `value`, `onChange` |
| Chi tiet san pham | `TBD` | Danh gia | `ReviewSection` | Organism | Yes | `src/components/organisms/ReviewSection/ReviewSection.tsx` | `rating`, `reviews`, `onSubmit` |

## 2. Repeated UI Patterns

| Pattern | Figma Nodes | Recommended Reuse |
|---|---|---|
| Shared header/footer chrome | `1:4`, `1:87` | Keep as `SiteLayout` wrapping all public pages |
| Product cards and product grids | `1:109`, `multiple`, `1:285` | `ProductCard` used by `ProductRow` and `ProductGrid` |
| Category/collection CTA banners | `1:103`, `I1:103;1:1064` | `CategoryBanner` with image/title/href props |
| Section headings with CTA | `multiple` | `SectionHeading` with optional action link |
| Orange floral strips/backgrounds | `1:136`, `1:149`, `1:341`, `1:568` | Asset-driven `DecorativeBand` atom/molecule |
| Gender cards | `1:100`, `I1:100;1:1069` | `GenderCard` inside `GenderSelect` |
| Material cards | `1:200-203`, `1:277-280` | Extract `MaterialCard` from `Materials` organism |
| Form fields | `1:741`, `1:744`, `1:747`, auth inputs | Shared `TextField`, `SelectField`, `DatePickerField` |
| Modal/shell layouts | `1:827`, `1:707` | `ModalShell` + specialized forms |
| Product detail badges | `1:408`, `1:411` | `FreeShippingBadge`, `VipBanner` |

## 3. Page Component Trees

```txt
Homepage
+-- SiteLayout
|   +-- SiteHeader
|   +-- HeroCarousel
|   +-- CollectionRail
|   |   +-- CollectionCard
|   +-- GenderSelect
|   |   +-- GenderCard
|   +-- CategoryProductSection
|   |   +-- CategoryBanner
|   |   +-- ProductRow
|   |       +-- SectionHeading
|   |       +-- ProductCard
|   +-- StarsBanner
|   +-- SiteFooter

CatalogPage Nam/Nu
+-- SiteLayout
|   +-- CatalogHero
|   +-- CatalogHeroGrid
|   +-- FilterBar
|   +-- CategoryProductSection
|   |   +-- CategoryBanner
|   |   +-- ProductRow
|   +-- ValueProposition
|   +-- Materials
|   |   +-- MaterialCard
|   +-- StarsBanner
|   +-- SiteFooter

ProductListingPage / Ban Hang
+-- SiteLayout
|   +-- Breadcrumbs
|   +-- FilterBar
|   +-- ProductGrid
|   |   +-- ProductCard
|   +-- StarsBanner
|   +-- SiteFooter

ProductDetailPage
+-- SiteLayout
|   +-- Breadcrumbs
|   +-- ProductDetail
|   |   +-- ProductImageGallery
|   |   +-- FreeShippingBadge
|   |   +-- VipBanner
|   |   +-- VariantSelector
|   |   +-- Button
|   +-- ProductDescriptionSection
|   +-- ReviewSection
|   +-- ProductRow
|   +-- SiteFooter

AboutPage / Ve Xeo Xo
+-- SiteLayout
|   +-- AboutHero
|   +-- BrandManifesto
|   +-- BrandStorySection
|   +-- PrincipleGrid
|   |   +-- PrincipleCard
|   +-- ProcessSection
|   |   +-- ProcessCard
|   +-- ClosingCta
|   +-- SiteFooter

AuthPage
+-- AuthShell
|   +-- AuthBenefitGrid
|   |   +-- AuthBenefitCard
|   +-- LoginForm | RegisterForm
|   |   +-- TextField
|   |   +-- PasswordField
|   |   +-- OAuthButton
|   |   +-- Button
|   +-- ModalCloseButton

AppointmentPage
+-- ModalShell
|   +-- AppointmentForm
|       +-- TextField
|       +-- SelectField
|       +-- DatePickerField
|       +-- TimeSlotPicker
|       +-- Button

CheckoutPage / Gio Hang
+-- SiteLayout
|   +-- CheckoutForm
|   |   +-- ShippingAddressForm
|   |   +-- PaymentMethodSelector
|   |   +-- Button
|   +-- CartSummary
|   |   +-- CartItem
|   +-- SiteFooter
```

## 4. Component Inventory

### Existing Reusable Components

| Component | Responsibility | Parent | Children | Suggested Props Interface |
|---|---|---|---|---|
| `Button` | Primary/secondary CTA and form actions | Many | none | `interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'solid' \| 'outline' \| 'ghost'; size?: 'sm' \| 'md' \| 'lg'; isLoading?: boolean }` |
| `CategoryBanner` | Full-width category CTA banner | Home, Catalog | `Image`, `Link` | `{ title: string; image: string; href: string; ctaLabel?: string }` |
| `CollectionCard` | Collection preview card | Home, CatalogHeroGrid | `Image`, `Link` | `{ collection: Collection; className?: string }` |
| `ProductCard` | Product preview with image/name/price | ProductRow, ProductGrid | `Image`, `Link` | `{ product: Product; className?: string; showSale?: boolean }` |
| `SectionHeading` | Section title plus optional CTA | ProductRow | `Link` | `{ title: string; actionHref?: string; actionLabel?: string; align?: 'left' \| 'center' }` |
| `SiteHeader` | Global navigation/header | SiteLayout | `SearchBox`, nav links | `{ navItems?: NavItem[]; cartCount?: number }` |
| `SiteFooter` | Global footer | SiteLayout | link columns/social/contact | `{ columns?: FooterColumn[]; socialLinks?: SocialLink[] }` |
| `SiteLayout` | Public page chrome | Pages/templates | `SiteHeader`, `SiteFooter` | `{ children: React.ReactNode }` |
| `HeroCarousel` | Homepage hero slideshow | HomePage | carousel controls | `{ slides: Collection[]; autoPlay?: boolean }` |
| `GenderSelect` | Male/female category entry | HomePage | `GenderCard` | `{ items?: GenderEntry[] }` |
| `ProductRow` | Horizontal/section product row | Home, Catalog, ProductDetail | `SectionHeading`, `ProductCard` | `{ title: string; products: Product[]; actionHref?: string }` |
| `ProductGrid` | Grid listing of products | Category/Product listing | `ProductCard` | `{ products: Product[]; columns?: number }` |
| `CatalogHero` | Gender catalog hero | CatalogPage | `Image`, CTA | `{ label: string; image: string; ctaHref: string; collectionNote?: string }` |
| `CatalogHeroGrid` | Collection feature grid | CatalogPage | `CollectionCard`-like tiles | `{ collections: Collection[] }` |
| `ValueProposition` | Brand value section | CatalogPage | Image/list | `{ values: string[]; logo?: string; image?: string }` |
| `Materials` | Material-card section | CatalogPage | `MaterialCard` internal | `{ materials: Material[] }` |
| `StarsBanner` | Shared star/floral marketing band | Home, Catalog | none | `{ title?: string; background?: string }` |
| `ProductDetail` | PDP purchase panel | ProductDetailPage | `Button`, selectors | `{ product: Product }` |
| `SizeGuide` | Size tables | ProductDetail/Auth future | tabs/table | `{ defaultGender?: Gender }` |
| `AuthShell` | Auth modal/page shell | Auth pages | form children | `{ title: string; subtitle?: string; children: React.ReactNode }` |

### Missing Components To Create

| Component | Responsibility | Parent | Child Components | Suggested Props Interface |
|---|---|---|---|---|
| `SearchBox` | Header search input | `SiteHeader` | icon, input | `{ value?: string; placeholder?: string; onSubmit?: (query: string) => void }` |
| `LanguageSelector` | Language switcher | `SiteHeader` | flag/icon | `{ locale: string; options: LocaleOption[]; onChange: (locale: string) => void }` |
| `SocialLinks` | Reusable social icon row | `SiteFooter`, Contact | icons | `{ items: SocialLink[]; size?: 'sm' \| 'md' }` |
| `MaterialCard` | Single material card | `Materials` | image/caption/text | `{ material: Material }` |
| `FilterBar` | Collection/category/sort filters | Catalog/List pages | filter pills/select | `{ filters: FilterGroup[]; sort?: SortOption; onChange: (state: FilterState) => void }` |
| `Breadcrumbs` | Route hierarchy | Product/List pages | links | `{ items: BreadcrumbItem[] }` |
| `DecorativeBand` | Shared floral strips/background | Many | none | `{ variant: 'strip' \| 'stars' \| 'header'; className?: string }` |
| `TextField` | Text input | Forms | label/input/error | `{ label: string; name: string; value?: string; error?: string }` |
| `PasswordField` | Password input with eye toggle | Auth | `TextField`, icon | `{ label: string; name: string; value?: string; error?: string }` |
| `OAuthButton` | Google/Facebook auth button | Auth forms | logo + text | `{ provider: 'google' \| 'facebook'; onClick?: () => void }` |
| `AuthBenefitCard` | Auth benefits | AuthShell | icon/text | `{ icon: string; title: string; description: string }` |
| `AppointmentForm` | Booking flow | AppointmentPage | fields/pickers | `{ branches: Branch[]; timeSlots: TimeSlot[]; onSubmit: (values: AppointmentValues) => void }` |
| `SelectField` | Dropdown field | Appointment/Checkout | label/options | `{ label: string; options: Option[]; value?: string; onChange: (value: string) => void }` |
| `DatePickerField` | Date selection | Appointment | label/calendar | `{ label: string; value?: Date; minDate?: Date; onChange: (date: Date) => void }` |
| `TimeSlotPicker` | Time slot selection | Appointment | option chips | `{ slots: TimeSlot[]; value?: string; onChange: (id: string) => void }` |
| `CartItem` | Cart row | CartSummary | quantity/delete | `{ item: CartItemData; onQuantityChange: (qty: number) => void; onRemove: () => void }` |
| `CheckoutForm` | Shipping/payment form | CheckoutPage | form fields | `{ defaultValues?: CheckoutValues; onSubmit: (values: CheckoutValues) => void }` |
| `CartSummary` | Order summary | CheckoutPage | `CartItem` | `{ items: CartItemData[]; totals: CartTotals }` |
| `ProductImageGallery` | PDP image viewer | ProductDetail | thumbnails/main image | `{ images: ProductImage[]; selectedIndex?: number; onSelect?: (index: number) => void }` |
| `VariantSelector` | Color/size choices | ProductDetail | swatches/buttons | `{ colors: ColorOption[]; sizes: SizeOption[]; value: VariantValue; onChange: (value: VariantValue) => void }` |
| `VipBanner` | Xeo Hoi upsell | ProductDetail | icon/chevron | `{ title: string; description?: string; href?: string }` |
| `FreeShippingBadge` | Delivery badge | ProductDetail | icon/text | `{ label?: string }` |
| `ReviewSection` | Ratings and comments | ProductDetail | rating/review cards | `{ rating: number; reviews: Review[]; onSubmit?: (review: ReviewInput) => void }` |
| `BrandStorySection` | About story layout | AboutPage | image collage/text | `{ title: string; body: string[]; images: string[] }` |
| `PrincipleGrid` | Brand principles | AboutPage | `PrincipleCard` | `{ items: Principle[] }` |
| `ProcessSection` | Design/process cards | AboutPage | `ProcessCard` | `{ steps: ProcessStep[] }` |

## 5. Duplicate/Merge Recommendations

| Similar Components | Recommendation | Reason |
|---|---|---|
| `ProductCard`, cart product row, PDP related product item | Keep `ProductCard`; create separate `CartItem` | Product card is marketing/listing; cart row has quantity/delete/payment behavior |
| `CategoryBanner`, catalog banner, collection CTA banner | Keep `CategoryBanner`, add variants | Same visual role: large image CTA with title/link |
| `CollectionCard`, category card, gender card | Keep separate | Different content model and interaction semantics, though they can share `ImageCardBase` internally |
| `MaterialCard` inside `Materials` and Figma material item | Extract `MaterialCard` | Repeated in Nam/Nu catalog and collection detail |
| Auth login and register modal | Merge shell, separate forms | Same visual shell/benefit cards, different fields/validation |
| Appointment select/date/time inputs | Share field primitives | Same label/error layout; different interaction widgets |
| Orange floral strips across header/catalog/about/cart/PDP | Merge into `DecorativeBand` | Same source asset with size variants |
| Filter pills in `CatalogPage` and future listing filters | Extract `FilterBar` + `FilterPill` | Current `FilterPill` is local; Figma uses it across catalog/listing |

## 6. Recommended Atomic Design Structure

```txt
src/
+-- components/
|   +-- atoms/
|   |   +-- Button/
|   |   +-- FreeShippingBadge/
|   |   +-- IconButton/
|   |   +-- Label/
|   |   +-- DecorativeBand/
|   +-- molecules/
|   |   +-- AuthBenefitCard/
|   |   +-- Breadcrumbs/
|   |   +-- CartItem/
|   |   +-- CategoryBanner/
|   |   +-- CollectionCard/
|   |   +-- DatePickerField/
|   |   +-- GenderCard/
|   |   +-- MaterialCard/
|   |   +-- OAuthButton/
|   |   +-- PasswordField/
|   |   +-- ProductCard/
|   |   +-- SearchBox/
|   |   +-- SectionHeading/
|   |   +-- SelectField/
|   |   +-- SocialLinks/
|   |   +-- TextField/
|   |   +-- TimeSlotPicker/
|   |   +-- VipBanner/
|   +-- organisms/
|   |   +-- AppointmentForm/
|   |   +-- BrandStorySection/
|   |   +-- CartSummary/
|   |   +-- CatalogHero/
|   |   +-- CatalogHeroGrid/
|   |   +-- CheckoutForm/
|   |   +-- FilterBar/
|   |   +-- GenderSelect/
|   |   +-- HeroCarousel/
|   |   +-- LoginForm/
|   |   +-- Materials/
|   |   +-- ProductDetail/
|   |   +-- ProductGrid/
|   |   +-- ProductImageGallery/
|   |   +-- ProductRow/
|   |   +-- RegisterForm/
|   |   +-- ReviewSection/
|   |   +-- SiteFooter/
|   |   +-- SiteHeader/
|   |   +-- StarsBanner/
|   |   +-- ValueProposition/
|   |   +-- VariantSelector/
|   +-- templates/
|       +-- AboutPage/
|       +-- AppointmentPage/
|       +-- AuthShell/
|       +-- CatalogPage/
|       +-- CheckoutPage/
|       +-- HomePage/
|       +-- ProductDetailPage/
|       +-- ProductListingPage/
|       +-- SiteLayout/
+-- data/
+-- stores/
+-- types/
```

## 7. Dependency Graph

| Page | Components Used |
|---|---|
| `/` Homepage | `SiteLayout`, `SiteHeader`, `HeroCarousel`, `CollectionRail`, `CollectionCard`, `GenderSelect`, `GenderCard`, `CategoryBanner`, `ProductRow`, `SectionHeading`, `ProductCard`, `StarsBanner`, `SiteFooter` |
| `/danh-muc/nam` | `SiteLayout`, `CatalogHero`, `CatalogHeroGrid`, `FilterBar`, `CategoryBanner`, `ProductRow`, `ProductCard`, `ValueProposition`, `Materials`, `MaterialCard`, `StarsBanner`, `SiteFooter` |
| `/danh-muc/nu` | `SiteLayout`, `CatalogHero`, `CatalogHeroGrid`, `FilterBar`, `CategoryBanner`, `ProductRow`, `ProductCard`, `ValueProposition`, `Materials`, `MaterialCard`, `StarsBanner`, `SiteFooter` |
| `/products` or `/categories/[slug]` / Ban Hang | `SiteLayout`, `Breadcrumbs`, `FilterBar`, `ProductGrid`, `ProductCard`, `StarsBanner`, `SiteFooter` |
| `/products/[slug]` | `SiteLayout`, `Breadcrumbs`, `ProductDetail`, `ProductImageGallery`, `FreeShippingBadge`, `VipBanner`, `VariantSelector`, `Button`, `ReviewSection`, `ProductRow`, `ProductCard`, `SiteFooter` |
| `/about` | `SiteLayout`, `AboutHero`, `BrandManifesto`, `BrandStorySection`, `PrincipleGrid`, `ProcessSection`, `ClosingCta`, `SiteFooter` |
| `/login` | `AuthShell`, `AuthBenefitCard`, `LoginForm`, `TextField`, `PasswordField`, `OAuthButton`, `Button` |
| `/register` | `AuthShell`, `AuthBenefitCard`, `RegisterForm`, `TextField`, `PasswordField`, `OAuthButton`, `Button` |
| `/appointment` | `ModalShell`, `AppointmentForm`, `TextField`, `SelectField`, `DatePickerField`, `TimeSlotPicker`, `Button` |
| `/cart` or `/checkout` | `SiteLayout`, `CheckoutForm`, `CartSummary`, `CartItem`, `TextField`, `SelectField`, `Button`, `SiteFooter` |

## 8. Final Component Report

| Component | Used In Pages | Reusable | Need To Create | Notes |
|---|---|---|---|---|
| `SiteLayout` | All public pages | Yes | No | Current implementation exists |
| `SiteHeader` | All public pages | Yes | No | Add `SearchBox`, `LanguageSelector` extraction later |
| `SiteFooter` | All public pages | Yes | No | Extract `SocialLinks` and link columns if footer grows |
| `Button` | Auth, PDP, appointment, checkout | Yes | No | Existing atom is good base |
| `ProductCard` | Home, Catalog, Listing, Related products | Yes | No | Keep as listing card |
| `ProductRow` | Home, Catalog, PDP related | Yes | No | Existing organism |
| `ProductGrid` | Listing/category pages | Yes | No | Existing organism |
| `CategoryBanner` | Home, Catalog | Yes | No | Existing molecule; add variants if needed |
| `CollectionCard` | Home, Catalog grid | Yes | No | Existing molecule |
| `GenderSelect` | Homepage | Medium | No | Could accept config props instead of internal constants |
| `HeroCarousel` | Homepage | Yes | No | Existing organism |
| `StarsBanner` | Home, Catalog, Listing, PDP | Yes | No | Existing organism |
| `CatalogPage` | Nam/Nu catalog | Yes | No | Good template reuse by gender |
| `CatalogHero` | Nam/Nu catalog | Yes | No | Existing organism |
| `CatalogHeroGrid` | Nam/Nu catalog | Yes | No | Existing organism |
| `ValueProposition` | Nam/Nu catalog | Yes | No | Existing organism |
| `Materials` | Nam/Nu catalog | Yes | No | Extract `MaterialCard` for reuse |
| `MaterialCard` | Catalog material sections | Yes | Yes | Currently internal to `Materials` |
| `FilterBar` | Catalog, listing | Yes | Yes | Current `FilterPill` is local in `CatalogPage` |
| `SearchBox` | Header | Yes | Yes | Figma has dedicated node |
| `LanguageSelector` | Header | Yes | Yes | Figma has dedicated node |
| `SocialLinks` | Footer/contact | Yes | Yes | Figma has social group |
| `Breadcrumbs` | Listing/PDP | Yes | Yes | Figma has home icon references |
| `AuthShell` | Auth pages | Yes | No | Existing template |
| `LoginForm` | Login | Yes | Yes | Needed to complete auth screen |
| `RegisterForm` | Register | Yes | Yes | Needed to complete auth screen |
| `AuthBenefitCard` | Login/Register | Yes | Yes | Repeated benefit card |
| `TextField` | All forms | Yes | Yes | Shared primitive missing |
| `PasswordField` | Auth | Yes | Yes | Eye icon already mapped |
| `OAuthButton` | Auth | Yes | Yes | Google/Facebook logo nodes mapped |
| `AppointmentForm` | Appointment | Yes | Yes | Figma node `1:709` |
| `SelectField` | Appointment/checkout | Yes | Yes | Shared form control |
| `DatePickerField` | Appointment | Yes | Yes | Figma node `1:744` |
| `TimeSlotPicker` | Appointment | Yes | Yes | Figma node `1:747` |
| `CheckoutForm` | Cart/checkout | Yes | Yes | Figma node `1:1737` |
| `CartItem` | Cart/checkout | Yes | Yes | Figma node `1:1814` |
| `CartSummary` | Cart/checkout | Yes | Yes | Wraps repeated cart rows and totals |
| `ProductDetail` | PDP | Yes | No | Existing organism but needs subcomponent extraction |
| `ProductImageGallery` | PDP | Yes | Yes | Figma image carousel node |
| `VariantSelector` | PDP | Yes | Yes | Color/size selector missing |
| `VipBanner` | PDP | Yes | Yes | Figma node `1:411` |
| `FreeShippingBadge` | PDP | Yes | Yes | Figma node `1:408` |
| `ReviewSection` | PDP | Yes | Yes | Figma review section missing |
| `SizeGuide` | PDP/help | Yes | No | Existing but not wired to PDP |
| `AboutHero` | About | Medium | Yes | Current about page implements inline |
| `BrandStorySection` | About | Medium | Yes | Extract from inline page code |
| `PrincipleGrid` | About | Medium | Yes | Extract from inline page code |
| `ProcessSection` | About | Medium | Yes | Extract from inline page code |
| `DecorativeBand` | Shared decoration | Yes | Yes | Prevents duplicate floral strip handling |

## 9. Architecture Priorities

1. Extract `MaterialCard`, `FilterBar`, `Breadcrumbs`, and `DecorativeBand` first; these directly reduce duplication in catalog/listing/PDP.
2. Complete commerce missing pieces: `ProductImageGallery`, `VariantSelector`, `ReviewSection`, `CartItem`, `CheckoutForm`.
3. Complete auth/appointment forms with shared form atoms/molecules.
4. Refactor large inline pages such as `/about` into template + organisms only after core ecommerce flows are stable.
5. Keep `ProductCard`, `CollectionCard`, `CategoryBanner`, and `GenderCard` separate publicly; optionally share a private `ImageCardBase` helper internally.
