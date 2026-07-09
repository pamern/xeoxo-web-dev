"use client";

import Link from "next/link";
import { OrderStatusTabs, type OrderStatusTab } from "@/components/molecules/OrderStatusTabs";
import { ROUTES } from "@/constants/routes";
import { ACCOUNT_APPOINTMENT_FILTERS } from "@/features/appointment/account-appointment-history";
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
}: {
  appointment: AccountAppointment;
}) {
  return (
    <article className="overflow-hidden border border-black/40 bg-white shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
      <div className="flex flex-col gap-4 px-4 py-5 md:px-6 md:py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-[15px] leading-[1.3] tracking-[-0.01em] text-black/72">
              <span className="font-bold text-black">{appointment.service_name}</span>
            </p>
          </div>

          <span
            className={cn(
              "rounded-full px-3 py-1 text-[13px] font-bold leading-none tracking-[-0.015em]",
              getAppointmentStatusClass(appointment.status),
            )}
          >
            {appointment.status_label}
          </span>
        </div>

        <div className="relative -mx-4 border-t border-neutral-300 bg-white px-5 py-5 shadow-[0_14px_38px_rgba(0,0,0,0.08)] transition duration-200 hover:shadow-[0_18px_46px_rgba(0,0,0,0.12)] md:-mx-6 md:px-6 md:py-6">
          <div className="absolute -left-4 -top-px h-px w-4 bg-white" />
          <div className="absolute -right-4 -top-px h-px w-4 bg-white" />
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,220px)]">
            <div className="grid gap-2">
              <p className="text-[14px] leading-[1.35] tracking-[-0.01em] text-black">
                {appointment.branch_address}
              </p>
              <p className="text-[12px] leading-[1.4] tracking-[-0.01em] text-black/60">
                {appointment.duration_label}
              </p>
            </div>

            <div className="grid gap-2 pr-4 text-right sm:pr-6">
              <p className="whitespace-nowrap text-[15px] leading-[1.22] tracking-[-0.01em] text-black">
                Thời gian: {appointment.time_label}
              </p>
              <p className="whitespace-nowrap text-[15px] leading-[1.22] tracking-[-0.01em] text-black">
                {appointment.date_label}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-black/20 bg-white px-6 text-sm font-medium text-black transition-colors duration-200 hover:border-black hover:bg-black/5"
          >
            Huỷ lịch
          </button>
          <Link
            href={ROUTES.FAQ_ACCOUNT}
            className="inline-flex h-12 items-center justify-center rounded-[8px] border border-black bg-black px-6 text-sm font-bold text-white transition-colors duration-200 hover:bg-white hover:text-black"
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

  if (!isAuthenticated) {
    return (
      <div className="mt-8 rounded-[20px] border border-border bg-secondary px-6 py-8">
        <p className="text-lg font-medium">
          Bạn cần đăng nhập để xem lịch hẹn của mình.
        </p>
        <p className="mt-2 text-sm font-light text-foreground/72">
          Sau khi đăng nhập, trang này sẽ hiển thị các lịch hẹn tư vấn, may đo
          và trải nghiệm dịch vụ đã gắn với tài khoản của bạn.
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
      <OrderStatusTabs items={statusTabs} value={statusGroup} />

      {initialAppointments.length ? (
        <div className="mt-8 space-y-6">
          {initialAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.appointment_id}
              appointment={appointment}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-[20px] border border-black/12 bg-secondary px-6 py-10">
          <p className="text-xl font-bold text-foreground">
            {statusGroup === "all"
              ? "Bạn chưa có lịch hẹn nào."
              : "Chưa có lịch hẹn ở trạng thái này."}
          </p>
          <p className="mt-3 max-w-[620px] text-sm font-light leading-relaxed text-foreground/72 md:text-base">
            {statusGroup === "all"
              ? "Khi bạn đặt lịch tư vấn, may đo hoặc trải nghiệm dịch vụ, lịch hẹn sẽ hiển thị tại đây để bạn tiện theo dõi."
              : "Hãy chuyển sang nhóm trạng thái khác để xem các lịch hẹn tương ứng."}
          </p>
          <div className="mt-6">
            <Link
              href={ROUTES.APPOINTMENT}
              className="inline-flex min-h-[50px] items-center justify-center rounded-[8px] border border-[#cf5c43] bg-[url('/images/header-line-up.png')] bg-[length:cover] bg-center px-6 text-lg font-extrabold text-white shadow-[0_12px_26px_rgba(207,92,67,0.28)]"
            >
              Tra cứu lịch hẹn
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
