"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { CHAT_OPEN_ORDER_EVENT, type ChatOrderContext } from "@/lib/chat-events";
import { cn } from "@/lib/utils";

type Salutation = "Anh" | "Chị" | "Khác";

type GuestFormValues = {
  name: string;
  email: string;
  phone: string;
  salutation: Salutation;
};

type ChatMessage = {
  id: string;
  sender: "staff" | "customer";
  lines?: string[];
  order?: ChatOrderContext;
};

const SALUTATION_OPTIONS: Salutation[] = ["Anh", "Chị", "Khác"];

const EMPTY_GUEST_FORM: GuestFormValues = {
  name: "",
  email: "",
  phone: "",
  salutation: "Chị",
};

function buildGreetingMessage(displayName: string, pronoun: string): ChatMessage {
  return {
    id: "greeting",
    sender: "staff",
    lines: [
      `${displayName} thân mến,`,
      `Em là Fiona, nhân viên Chăm sóc Khách hàng của Xéo Xọ. Rất vui được đồng hành cùng ${pronoun} hôm nay ạ.`,
      `Nếu ${pronoun} cần tư vấn về sản phẩm, đơn hàng hoặc bất kỳ vấn đề nào khác, đừng ngần ngại nhắn cho em nhé.`,
      `Chúc ${pronoun} thật nhiều sức khỏe, niềm vui và những trải nghiệm mua sắm tuyệt vời tại Xéo Xọ!`,
    ],
  };
}

function mapCustomerSalutation(gender?: string | null) {
  if (gender === "MALE") return "Anh";
  if (gender === "FEMALE") return "Chị";
  return null;
}

function buildOrderSupportMessages(order: ChatOrderContext, pronoun: string): ChatMessage[] {
  return [
    { id: `order-${order.orderCode}`, sender: "staff", order },
    {
      id: `order-followup-${order.orderCode}`,
      sender: "staff",
      lines: [
        `Mình thấy ${pronoun} cần hỗ trợ về đơn hàng ${order.orderCode} ở trên.`,
        `${pronoun[0].toUpperCase()}${pronoun.slice(1)} cứ chia sẻ chi tiết vấn đề đang gặp phải, em sẽ hỗ trợ xử lý nhanh nhất có thể ạ.`,
      ],
    },
  ];
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 4h16v12H8l-4 4V4z" />
      <path d="M8 9h8M8 12.5h5" />
    </svg>
  );
}

function EmojiIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 10.5h.01M15.5 10.5h.01" />
      <path d="M8.5 14.5c1 1.2 2.2 1.8 3.5 1.8s2.5-.6 3.5-1.8" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="M4 16.5l5-4.5 3.5 3 3-2.5L20 16.5" />
    </svg>
  );
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="6" width="13" height="12" rx="2" />
      <path d="M16 10.5l5-2.5v8l-5-2.5z" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5 transition-transform", open && "rotate-180")}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <span className="absolute -top-1.5 left-3 bg-white px-1.5 text-[10px] font-medium text-black/45">
        {label}
        {required ? "*" : ""}
      </span>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-[10px] border border-black/15 bg-white px-3 py-2 text-[11px] text-black !outline-none transition-colors placeholder:text-black/30 focus:border-black";

export function ChatWidget() {
  const { isAuthenticated, customer, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [guestStarted, setGuestStarted] = useState(false);
  const [guestForm, setGuestForm] = useState<GuestFormValues>(EMPTY_GUEST_FORM);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [pendingOrderContext, setPendingOrderContext] = useState<ChatOrderContext | null>(
    null,
  );
  const [pronoun, setPronoun] = useState("bạn");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const ready = isAuthenticated || guestStarted;

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen]);

  function ensureGreeting(displayName: string, greetingPronoun: string) {
    setPronoun(greetingPronoun);
    setMessages((prev) => prev ?? [buildGreetingMessage(displayName, greetingPronoun)]);
  }

  function appendOrderSupportMessages(order: ChatOrderContext, contextPronoun: string) {
    setMessages((prev) => [
      ...(prev ?? []),
      ...buildOrderSupportMessages(order, contextPronoun),
    ]);
  }

  function getAuthenticatedGreeting() {
    const salutation = mapCustomerSalutation(customer?.gender);
    const name = customer?.customer_name?.trim() || "bạn";
    const displayName = salutation ? `${salutation} ${name}` : name;
    const greetingPronoun = salutation ? salutation.toLowerCase() : "bạn";
    return { displayName, greetingPronoun };
  }

  function handleOpen() {
    setIsOpen(true);

    if (isAuthenticated) {
      const { displayName, greetingPronoun } = getAuthenticatedGreeting();
      ensureGreeting(displayName, greetingPronoun);
    }
  }

  useEffect(() => {
    function handleOpenForOrder(event: Event) {
      const detail = (event as CustomEvent<ChatOrderContext>).detail;
      if (!detail) return;

      setIsOpen(true);

      if (isAuthenticated) {
        const { displayName, greetingPronoun } = getAuthenticatedGreeting();
        ensureGreeting(displayName, greetingPronoun);
        appendOrderSupportMessages(detail, greetingPronoun);
      } else if (guestStarted) {
        appendOrderSupportMessages(detail, pronoun);
      } else {
        setPendingOrderContext(detail);
      }
    }

    window.addEventListener(CHAT_OPEN_ORDER_EVENT, handleOpenForOrder);
    return () => window.removeEventListener(CHAT_OPEN_ORDER_EVENT, handleOpenForOrder);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, guestStarted, customer, pronoun]);

  function handleStartGuestChat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = guestForm.name.trim();
    if (!name || !guestForm.phone.trim()) {
      return;
    }

    const displayName =
      guestForm.salutation === "Khác" ? name : `${guestForm.salutation} ${name}`;
    const greetingPronoun =
      guestForm.salutation === "Khác" ? "bạn" : guestForm.salutation.toLowerCase();
    ensureGreeting(displayName, greetingPronoun);
    setGuestStarted(true);

    if (pendingOrderContext) {
      appendOrderSupportMessages(pendingOrderContext, greetingPronoun);
      setPendingOrderContext(null);
    }
  }

  function handleSend() {
    const content = draft.trim();
    if (!content) return;

    setMessages((prev) => [
      ...(prev ?? []),
      { id: `${Date.now()}`, sender: "customer", lines: [content] },
    ]);
    setDraft("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-[150] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {isOpen && (
        <div className="flex max-h-[70vh] w-[min(320px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[16px] border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between px-4 pb-1.5 pt-3.5">
            <h2 className="text-sm font-extrabold uppercase leading-none text-[#ff593d]">
              Chat
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Thu gọn khung chat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-black/70 transition-colors hover:bg-black/5"
            >
              <ChevronIcon open={false} />
            </button>
          </div>
          <div
            className="h-[4px] w-full bg-[length:auto_100%] bg-repeat-x"
            style={{ backgroundImage: "url(/images/header-line-up.png)" }}
            aria-hidden
          />

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {!ready ? (
              <form onSubmit={handleStartGuestChat} className="flex flex-col gap-3">
                <p className="text-[11px] font-medium text-black/70">
                  Để lại thông tin để Xéo Xọ hỗ trợ bạn nhanh hơn nhé!
                </p>

                <Field label="Nhập tên của bạn" required>
                  <input
                    value={guestForm.name}
                    onChange={(event) => {
                      event.target.setCustomValidity("");
                      setGuestForm((prev) => ({ ...prev, name: event.target.value }));
                    }}
                    onInvalid={(event) => {
                      event.currentTarget.setCustomValidity("Vui lòng nhập tên của bạn.");
                    }}
                    className={inputClassName}
                    placeholder="Nhập tên của bạn"
                    required
                  />
                </Field>

                <Field label="Nhập email của bạn">
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(event) => {
                      event.target.setCustomValidity("");
                      setGuestForm((prev) => ({ ...prev, email: event.target.value }));
                    }}
                    onInvalid={(event) => {
                      event.currentTarget.setCustomValidity(
                        "Vui lòng nhập đúng định dạng email (có ký tự \"@\").",
                      );
                    }}
                    className={inputClassName}
                    placeholder="Nhập email của bạn"
                  />
                </Field>

                <Field label="Nhập số điện thoại của bạn" required>
                  <input
                    value={guestForm.phone}
                    onChange={(event) => {
                      event.target.setCustomValidity("");
                      setGuestForm((prev) => ({ ...prev, phone: event.target.value }));
                    }}
                    onInvalid={(event) => {
                      event.currentTarget.setCustomValidity(
                        "Vui lòng nhập số điện thoại của bạn.",
                      );
                    }}
                    className={inputClassName}
                    placeholder="Nhập số điện thoại của bạn"
                    required
                  />
                </Field>

                <Field label="Xưng hô">
                  <select
                    value={guestForm.salutation}
                    onChange={(event) =>
                      setGuestForm((prev) => ({
                        ...prev,
                        salutation: event.target.value as Salutation,
                      }))
                    }
                    className={cn(inputClassName, "appearance-none")}
                  >
                    {SALUTATION_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </Field>

                <button
                  type="submit"
                  className="mt-1 flex min-h-[36px] w-full items-center justify-center rounded-[10px] border border-black bg-cover bg-center px-4 text-[11px] font-bold text-white shadow-[0_8px_18px_rgba(207,92,67,0.24)] transition-opacity hover:opacity-90"
                  style={{ backgroundImage: "url('/images/button_background.png')" }}
                >
                  Bắt đầu trò chuyện
                </button>
              </form>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-medium text-black/60">
                  Chăm sóc Khách hàng của Xéo Xọ -{" "}
                  <span className="font-bold text-black">Fiona</span>
                </p>

                {(messages ?? []).map((message) => {
                  if (message.order) {
                    return (
                      <div
                        key={message.id}
                        className="rounded-xl border border-black/15 bg-[#fafafa] px-3.5 py-3 text-[11px] text-black/85"
                      >
                        <p className="font-semibold leading-snug text-black break-all">
                          Đơn hàng {message.order.orderCode}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center rounded-full border border-black/15 bg-white px-2.5 py-1 text-[10px] font-medium text-black/70">
                            {message.order.statusLabel}
                          </span>
                          <span className="shrink-0 text-xs font-bold text-black">
                            {message.order.totalLabel}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return message.sender === "staff" ? (
                    <div
                      key={message.id}
                      className="rounded-xl border border-black/15 bg-white px-3 py-2.5 text-[11px] leading-relaxed text-black/85"
                    >
                      {message.lines?.map((line, index) => (
                        <p key={index} className={index > 0 ? "mt-1.5" : undefined}>
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div key={message.id} className="flex justify-end">
                      <div className="max-w-[80%] rounded-xl rounded-tr-sm bg-black px-3 py-2 text-[11px] text-white">
                        {message.lines?.map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {ready && (
            <div className="border-t border-black/10 px-3.5 py-2.5">
              <div className="mb-1.5 flex items-center gap-2.5 text-black/40">
                <EmojiIcon className="h-4 w-4" />
                <ImageIcon className="h-4 w-4" />
                <VideoIcon className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Nhập nội dung tin nhắn...."
                  className="min-w-0 flex-1 border-none bg-transparent text-[11px] text-black !outline-none placeholder:text-black/35"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  aria-label="Gửi tin nhắn"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#ff593d] transition-colors hover:bg-[#ff593d]/10"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4"
                    aria-hidden
                  >
                    <path d="M3 20l18-8L3 4v6l12 2-12 2v6z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isOpen && !isLoading && (
        <button
          type="button"
          onClick={handleOpen}
          className="flex min-h-[46px] items-center gap-2 rounded-pill border border-black bg-cover bg-center px-5 text-sm font-bold text-white shadow-[0_12px_28px_rgba(207,92,67,0.32)] transition-transform hover:-translate-y-0.5"
          style={{ backgroundImage: "url('/images/button_background.png')" }}
        >
          <ChatIcon className="h-5 w-5" />
          Chat
        </button>
      )}
    </div>
  );
}
