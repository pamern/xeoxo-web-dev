# Rebase Summary: `branch-thuba-designtokenagain` vs `develop`

## Boi canh

Nhanh dang o trang thai rebase len `develop`, va conflict hien tai tap trung chu yeu vao commit:

- `f601acc` - `Refine UI layouts and modal sizing`

Day la commit tinh chinh UI lon, anh huong nhieu page public va account/order flow. Phan lon xung dot khong nam o data contract hay API, ma nam o:

- layout shell
- spacing va typography
- panel/card styling
- modal sizing
- sticky rail / page grid
- responsive behavior

## Nhom file bi conflict

### Account / Order flow

- `src/app/account/orders/[id]/page.tsx`
- `src/app/account/orders/page.tsx`
- `src/components/molecules/CancelOrderButton/CancelOrderButton.tsx`
- `src/components/molecules/OrderActions/OrderActions.tsx`
- `src/components/molecules/OrderLineItem/OrderLineItem.tsx`
- `src/components/molecules/OrderStatusTabs/OrderStatusTabs.tsx`
- `src/components/organisms/AccountNavigation/AccountNavigation.tsx`
- `src/components/organisms/AccountOrderHistory/AccountOrderHistory.tsx`
- `src/components/organisms/OrderCard/OrderCard.tsx`
- `src/components/organisms/OrderDetailContent/OrderDetailContent.tsx`

### Catalog / Listing / Homepage

- `src/app/page.tsx`
- `src/components/organisms/CatalogHero/CatalogHero.tsx`
- `src/components/organisms/ProductFilterSidebar/ProductFilterSidebar.tsx`
- `src/components/organisms/ProductRow/ProductRow.tsx`
- `src/components/organisms/SiteHeader/SiteHeader.tsx`
- `src/components/organisms/StarsBanner/StarsBanner.tsx`
- `src/components/templates/CatalogPage/CatalogPage.tsx`
- `src/components/templates/ProductListingPage/ProductListingPage.tsx`
- `src/components/templates/ProductListingPage/ProductListingResults.tsx`

### Global style

- `src/app/globals.css`

## Ban chat xung dot

Qua doi chieu cac hunk conflict, mau thuan chinh la:

1. `develop` dua vao shell/layout moi
   - `account-page-shell`
   - `account-page-section`
   - `account-page-grid`
   - `account-content-panel`
   - `account-sticky-rail`

2. Commit UI dang rebase dua vao tinh chinh ve mat giao dien
   - panel nhe hon / spacing chat hon
   - heading hierarchy moi
   - mobile-first sizing cho card, tab, CTA
   - modal rong hon va shadow moi
   - mot so component sap xep lai de de doc tren mobile

3. Mot vai hunk tren nhanh UI co xu huong kem theo logic chua ton tai trong `develop`
   - vi du flow OTP trong `CancelOrderButton`
   - nhung phan nay khong phai la "design token only", nen can can nhac ky truoc khi giu

## Nguyen tac resolve da chon

Khi xu ly conflict, uu tien theo thu tu sau:

1. Giu logic va shell moi cua `develop`
   - Khong loai bo cac wrapper/page shell da duoc chuan hoa tren `develop`
   - Khong roll back logic order/history/detail dang hoat dong

2. Hap thu tinh chinh UI tu commit `Refine UI layouts and modal sizing`
   - Neu thay doi chi la className, spacing, typography, responsive sizing
   - Neu khong lam doi API component hoac them dependency logic moi

3. Khong keo them logic mo rong neu conflict chi duoc yeu cau de resolve rebase
   - OTP / flow xac minh moi
   - state moi chua du context
   - side effect moi khong co test/contract di kem

## Huong merge cu the

### Account page

- Giu `account-page-grid`, `account-sticky-rail`, `account-content-panel`
- Tinh chinh heading/panel spacing theo commit UI neu khong pha shell

### Order history / order detail

- Giu data flow hien tai cua `develop`
- Giu pagination, modal review, cancel callback, route helper
- Merge className de card/tabs/sections responsive hon

### Cancel order

- Giu flow cancel hien tai cua nhanh `develop`
- Khong dua OTP flow vao trong lan resolve nay
- Co the lay visual modal moi neu khong doi import/state contract

### Global CSS

- Uu tien bo token/layer dang duoc `develop` su dung
- Chi merge them phan style cong khai neu can thiet, tranh overwrite hang loat utility moi

## Muc tieu sau cung

Sau khi resolve:

- rebase tiep tuc duoc
- code compile duoc
- shell/layout moi cua `develop` van duoc giu
- tinh chinh UI an toan tu nhanh `branch-thuba-designtokenagain` duoc bao ton toi da


Những hunk có dấu hiệu kéo theo logic chưa hoàn chỉnh như OTP trong CancelOrderButton sẽ không được nhập vào trong lượt resolve này. 