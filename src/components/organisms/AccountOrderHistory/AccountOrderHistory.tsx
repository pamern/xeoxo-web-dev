"use client";

import Link from "next/link";
import { OrderStatusTabs, type OrderStatusTab } from "@/components/molecules/OrderStatusTabs";
import { OrderCard } from "@/components/organisms/OrderCard";
import { ROUTES } from "@/constants/routes";
import {
  getOrderActions,
  getOrderStatusPresentation,
  ORDER_HISTORY_FILTERS,
  type OrderHistoryFilter,
} from "@/features/order/order-history";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import type { AccountOrder } from "@/types/account-order.types";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " VND";
}

function buildOrderStatusTabs(): OrderStatusTab[] {
  return ORDER_HISTORY_FILTERS.map((item) => ({
    href:
      item.value === "all"
        ? ROUTES.ACCOUNT_ORDERS
        : `${ROUTES.ACCOUNT_ORDERS}?status=${item.value}`,
    label: item.label,
    value: item.value,
  }));
}

export function AccountOrderHistory({
  initialOrders,
  isAuthenticated,
  statusGroup,
}: {
  initialOrders?: AccountOrder[];
  isAuthenticated: boolean;
  statusGroup: OrderHistoryFilter;
}) {
  const { errorMessage, isLoading, orders } = useOrderHistory(
    statusGroup,
    isAuthenticated,
    initialOrders,
  );
  const statusTabs = buildOrderStatusTabs();
  const summaryLabel =
    statusGroup === "all"
      ? `Tất cả đơn hàng (${orders.length})`
      : `${statusTabs.find((tab) => tab.value === statusGroup)?.label ?? "Đơn hàng"} (${orders.length})`;

  if (!isAuthenticated) {
    return (
      <div className="mt-8 rounded-[20px] border border-border bg-secondary px-6 py-8">
        <p className="text-lg font-medium">
          Bạn cần đăng nhập để xem lịch sử đơn hàng.
        </p>
        <p className="mt-2 text-sm font-light text-foreground/72">
          Sau khi đăng nhập, trang này sẽ hiển thị các đơn hàng gắn với tài khoản
          của bạn trong hệ thống.
        </p>
        <div className="mt-6">
          <Link
            href={`${ROUTES.HOME}?auth=login`}
            className="inline-flex h-12 items-center justify-center rounded-pill bg-black px-8 text-sm font-bold uppercase tracking-[0.03em] text-white"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="-mx-2 rounded-[18px] bg-white px-2 pb-5 pt-1">
        <div className="flex flex-col gap-3 border-b border-black/10 pb-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#cf5c43]">
                Quản lý đơn hàng
              </p>
              <p className="mt-2 text-lg font-semibold text-foreground md:text-[22px]">
                {summaryLabel}
              </p>
            </div>
            <p className="max-w-[420px] text-sm font-light leading-relaxed text-foreground/68">
              Bộ lọc luôn được giữ trong tầm nhìn để bạn đổi trạng thái mà không mất vị trí đang đọc.
            </p>
          </div>

          <OrderStatusTabs
            items={statusTabs}
            value={statusGroup}
            className="border-b-0 pb-0"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-[20px] border border-black/12 bg-secondary px-6 py-10">
          <p className="text-base font-medium text-foreground/72">
            Đang tải lịch sử đơn hàng...
          </p>
        </div>
      ) : errorMessage ? (
        <div className="mt-8 rounded-[20px] border border-[#d76a54]/25 bg-[#fff2ee] px-6 py-8">
          <p className="text-lg font-semibold text-[#b14f3d]">{errorMessage}</p>
        </div>
      ) : orders.length ? (
        <div className="mt-8 space-y-6">
          {orders.map((order) => {
            const status = getOrderStatusPresentation(order.order_status);

            return (
              <OrderCard
                key={order.order_id}
                orderCode={order.order_code}
                statusLabel={status.label}
                statusTone={status.tone}
                totalLabel={formatCurrency(order.total_amount)}
                href={ROUTES.ACCOUNT_ORDER(order.order_id.toString())}
                items={order.items.map((item) => ({
                  imageAlt: item.image_alt ?? item.title,
                  imageSrc: item.image_src,
                  price: formatCurrency(item.price),
                  quantity: item.quantity,
                  subtitle: item.subtitle,
                  title: item.title,
                }))}
                actions={getOrderActions(order, {
                  customerPolicy: ROUTES.POLICY("customer"),
                  paymentPolicy: ROUTES.POLICY("payment"),
                  product: ROUTES.PRODUCT,
                  returnPolicy: ROUTES.POLICY("return"),
                  shippingPolicy: ROUTES.POLICY("shipping"),
                  orderDetail: ROUTES.ACCOUNT_ORDER,
                })}
              />
            );
          })}
        </div>
      ) : (
        <div className="mt-8 rounded-[20px] border border-black/12 bg-secondary px-6 py-10">
          <p className="text-xl font-bold text-foreground">
            {statusGroup === "all"
              ? "Bạn chưa có đơn hàng nào."
              : "Chưa có đơn hàng ở trạng thái này."}
          </p>
          <p className="mt-3 max-w-[620px] text-sm font-light leading-relaxed text-foreground/72 md:text-base">
            {statusGroup === "all"
              ? "Khi bạn đặt hàng thành công, lịch sử đơn hàng sẽ hiển thị tại đây để bạn theo dõi trạng thái và thao tác nhanh."
              : "Hãy thử chuyển sang trạng thái khác để xem những đơn hàng tương ứng trong tài khoản của bạn."}
          </p>
          <div className="mt-6">
            <Link
              href={ROUTES.COLLECTIONS}
              className="inline-flex min-h-[50px] items-center justify-center rounded-[8px] border border-[#cf5c43] bg-[url('/images/header-line-up.png')] bg-[length:cover] bg-center px-6 text-lg font-extrabold text-white shadow-[0_12px_26px_rgba(207,92,67,0.28)]"
            >
              Khám phá bộ sưu tập
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
