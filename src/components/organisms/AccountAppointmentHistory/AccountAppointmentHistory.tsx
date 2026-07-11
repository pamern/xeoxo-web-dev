"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppointmentCancelConfirmModal } from "@/components/organisms/AppointmentCancelConfirmModal";
import { OrderStatusTabs, type OrderStatusTab } from "@/components/molecules/OrderStatusTabs";
import { ROUTES } from "@/constants/routes";
import { ACCOUNT_APPOINTMENT_FILTERS } from "@/features/appointment/account-appointment-history";
import { appointmentService } from "@/services/appointment.service";
import type {
  AccountAppointment,
  AccountAppointmentStatus,
} from "@/types/account-appointment.types";
import { cn } from "@/lib/utils";

function buildAppointmentStatusTabs(): OrderStatusTab[] {
  return ACCOUNT_APPOINTMENT_FILTERS.map((item) => ({
    href:
      item.value === "all"
        ? ROUTES.ACCOUNT_APPOINTMENTS
        : `${ROUTES.ACCOUNT_APPOINTMENTS}?status=${item.value}`,
    label: item.label,
    value: item.value,
  }));
}

function getAppointmentStatusClass(status: AccountAppointment["status"]) {
  if (status === "completed") {
    return "text-black/60";
  }

  if (status === "cancelled") {
    return "text-black/42";
  }

  return "text-black/68";
}

function AppointmentCard({
  appointment,
  isCancelling,
  onCancel,
}: {
  appointment: AccountAppointment;
  isCancelling: boolean;
  onCancel: (appointment: AccountAppointment) => void;
}) {
  return (
    <article className="overflow-hidden border border-black/40 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col gap-3.5 px-4 py-4 md:px-5 md:py-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-sm leading-[1.3] tracking-[-0.01em] text-black/72">
              <span className="font-bold text-black">{appointment.service_name}</span>
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold leading-none tracking-[-0.015em]",
              getAppointmentStatusClass(appointment.status),
            )}
          >
            {appointment.status_label}
          </span>
        </div>

        <div className="relative -mx-4 border-t border-neutral-300 bg-white px-5 py-4 shadow-[0_14px_38px_rgba(0,0,0,0.08)] transition duration-200 hover:shadow-[0_18px_46px_rgba(0,0,0,0.12)] md:-mx-5 md:px-5 md:py-5">
          <div className="absolute -left-4 -top-px h-px w-4 bg-white" />
          <div className="absolute -right-4 -top-px h-px w-4 bg-white" />
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
            <div className="grid gap-1.5">
              <p className="text-xs leading-[1.35] tracking-[-0.01em] text-black md:text-sm">
                {appointment.branch_address}
              </p>
              <p className="text-[0.6875rem] leading-[1.4] tracking-[-0.01em] text-black/60 md:text-xs">
                {appointment.duration_label}
              </p>
            </div>

            <div className="grid gap-1.5 pr-3 text-right sm:pr-5">
              <p className="whitespace-nowrap text-sm leading-[1.22] tracking-[-0.01em] text-black">
                Thời gian: {appointment.time_label}
              </p>
              <p className="whitespace-nowrap text-sm leading-[1.22] tracking-[-0.01em] text-black">
                {appointment.date_label}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-1 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          {appointment.status === "upcoming" ? (
            <button
              type="button"
              onClick={() => onCancel(appointment)}
              disabled={isCancelling}
              className="inline-flex h-10 items-center justify-center rounded-[8px] border border-black/20 bg-white px-5 text-xs font-medium text-black transition-colors duration-200 hover:border-black hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
            >
              {isCancelling ? "Đang hủy..." : "Huỷ lịch"}
            </button>
          ) : null}
          <Link
            href={ROUTES.FAQ_ACCOUNT}
            className="inline-flex h-10 items-center justify-center rounded-[8px] border border-black bg-black px-5 text-xs font-bold text-white transition-colors duration-200 hover:bg-white hover:text-black md:text-sm"
          >
            Liên hệ
          </Link>
        </div>
      </div>
    </article>
  );
}

export function AccountAppointmentHistory({
  initialAppointments,
  isAuthenticated,
  statusGroup,
}: {
  initialAppointments: AccountAppointment[];
  isAuthenticated: boolean;
  statusGroup: AccountAppointmentStatus;
}) {
  const statusTabs = buildAppointmentStatusTabs();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [isCancellingId, setIsCancellingId] = useState<number | null>(null);
  const [appointmentToConfirm, setAppointmentToConfirm] =
    useState<AccountAppointment | null>(null);
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (!feedback) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFeedback(null);
    }, 5000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [feedback]);

  async function handleCancelAppointment(appointment: AccountAppointment) {
    setIsCancellingId(appointment.appointment_id);
    setFeedback(null);
    setAppointmentToConfirm(null);

    try {
      await appointmentService.cancelAppointment(appointment.appointment_id);
      setAppointments((current) => {
        if (statusGroup === "upcoming") {
          return current.filter(
            (item) => item.appointment_id !== appointment.appointment_id,
          );
        }

        return current.map((item) =>
          item.appointment_id === appointment.appointment_id
            ? { ...item, status: "cancelled", status_label: "Đã hủy" }
            : item,
        );
      });
      setFeedback({
        tone: "success",
        message: "Hủy lịch hẹn thành công.",
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Không thể hủy lịch hẹn lúc này.",
      });
    } finally {
      setIsCancellingId(null);
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="mt-6 rounded-[18px] border border-border bg-secondary px-5 py-6">
        <p className="text-base font-medium">
          Bạn cần đăng nhập để xem lịch hẹn của mình.
        </p>
        <p className="mt-2 text-sm font-light text-foreground/72">
          Sau khi đăng nhập, trang này sẽ hiển thị các lịch hẹn tư vấn, may đo
          và trải nghiệm dịch vụ đã gắn với tài khoản của bạn.
        </p>
        <div className="mt-5">
          <Link
            href={`${ROUTES.HOME}?auth=login`}
            className="inline-flex h-10 items-center justify-center rounded-pill bg-black px-7 text-xs font-bold uppercase tracking-[0.03em] text-white"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <OrderStatusTabs items={statusTabs} value={statusGroup} />

      {feedback ? (
        <div
          className={cn(
            "mt-5 rounded-[14px] border px-4 py-3 text-sm font-medium",
            feedback.tone === "success"
              ? "border-[#cf5c43]/25 bg-[#fff2ee] text-[#b14f3d]"
              : "border-destructive/25 bg-[hsl(var(--destructive)/0.08)] text-destructive",
          )}
        >
          {feedback.message}
        </div>
      ) : null}

      {appointments.length ? (
        <div className="mt-6 space-y-5">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
              isCancelling={isCancellingId === appointment.appointment_id}
              onCancel={setAppointmentToConfirm}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-[18px] border border-black/12 bg-secondary px-5 py-8">
          <p className="text-lg font-bold text-foreground">
            {statusGroup === "all"
              ? "Bạn chưa có lịch hẹn nào."
              : "Chưa có lịch hẹn ở trạng thái này."}
          </p>
          <p className="mt-3 max-w-[520px] text-sm font-light leading-relaxed text-foreground/72">
            {statusGroup === "all"
              ? "Khi bạn đặt lịch tư vấn, may đo hoặc trải nghiệm dịch vụ, lịch hẹn sẽ hiển thị tại đây để bạn tiện theo dõi."
              : "Hãy chuyển sang nhóm trạng thái khác để xem các lịch hẹn tương ứng."}
          </p>
          <div className="mt-5">
            <Link
              href={ROUTES.APPOINTMENT}
              className="inline-flex min-h-[42px] items-center justify-center rounded-[8px] border border-[#cf5c43] bg-[url('/images/header-line-up.png')] bg-[length:cover] bg-center px-5 text-base font-extrabold text-white shadow-[0_12px_26px_rgba(207,92,67,0.28)]"
            >
              Tra cứu lịch hẹn
            </Link>
          </div>
        </div>
      )}

      {appointmentToConfirm ? (
        <AppointmentCancelConfirmModal
          appointment={appointmentToConfirm}
          isSubmitting={isCancellingId === appointmentToConfirm.appointment_id}
          onClose={() => setAppointmentToConfirm(null)}
          onConfirm={() => void handleCancelAppointment(appointmentToConfirm)}
        />
      ) : null}
    </div>
  );
}
