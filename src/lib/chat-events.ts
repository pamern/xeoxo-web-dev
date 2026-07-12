// Cầu nối sự kiện giữa các trang (vd: chi tiết đơn hàng) và ChatWidget toàn cục
// trong SiteLayout, để mở khung chat kèm theo ngữ cảnh đơn hàng cụ thể.
export const CHAT_OPEN_ORDER_EVENT = "xeoxo:chat-open-order";

export type ChatOrderContext = {
  orderCode: string;
  statusLabel: string;
  totalLabel: string;
};

export function openChatForOrder(context: ChatOrderContext) {
  window.dispatchEvent(
    new CustomEvent<ChatOrderContext>(CHAT_OPEN_ORDER_EVENT, { detail: context }),
  );
}
