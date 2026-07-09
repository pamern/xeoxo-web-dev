import { createAdminClient } from "@/lib/supabase/admin";
import type {
  AccountAppointment,
  AccountAppointmentListResult,
  AccountAppointmentStatus,
} from "@/types/account-appointment.types";
import type { AccountAppointmentQueryInput } from "@/validations/appointment/account-appointment-query.schema";

type MeasurementAppointmentRecord = {
  appointment_date: string;
  appointment_id: number;
  appointment_status: string;
  branch_id: number;
  end_time: string;
  product_line_id: number | null;
  start_time: string;
};

type BranchRecord = {
  address: string;
  branch_id: number;
  branch_name: string;
};

type ProductLineRecord = {
  line_name: string;
  product_line_id: number;
};

export const ACCOUNT_APPOINTMENT_FILTERS: Array<{
  label: string;
  value: AccountAppointmentStatus;
}> = [
  { label: "Tất cả", value: "all" },
  { label: "Sắp diễn ra", value: "upcoming" },
  { label: "Hoàn thành", value: "completed" },
  { label: "Đã hủy", value: "cancelled" },
];

function getAppointmentFilterFromStatus(
  status: string,
): Exclude<AccountAppointmentStatus, "all"> {
  const normalized = status.trim().toUpperCase();

  if (normalized === "COMPLETED") {
    return "completed";
  }

  if (normalized === "CANCELLED" || normalized === "NO_SHOW") {
    return "cancelled";
  }

  return "upcoming";
}

function getAppointmentStatusLabel(status: string) {
  const normalized = status.trim().toUpperCase();

  if (normalized === "PENDING") {
    return "Chờ xác nhận";
  }

  if (normalized === "CONFIRMED") {
    return "Sắp diễn ra";
  }

  if (normalized === "COMPLETED") {
    return "Hoàn thành";
  }

  if (normalized === "NO_SHOW") {
    return "Vắng mặt";
  }

  if (normalized === "CANCELLED") {
    return "Đã hủy";
  }

  return status;
}

function formatTimeLabel(startTime: string, endTime: string) {
  return `${startTime.slice(0, 5)} - ${endTime.slice(0, 5)}`;
}

function formatAppointmentDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-");
  if (!year || !month || !day) {
    return dateValue;
  }

  return `Ngày ${Number(day)} tháng ${Number(month)} năm ${year}`;
}

function buildDurationLabel(startTime: string, endTime: string) {
  const [startHour = "0", startMinute = "0"] = startTime.split(":");
  const [endHour = "0", endMinute = "0"] = endTime.split(":");
  const startTotalMinutes = Number(startHour) * 60 + Number(startMinute);
  const endTotalMinutes = Number(endHour) * 60 + Number(endMinute);
  const durationMinutes = Math.max(endTotalMinutes - startTotalMinutes, 0);

  if (!durationMinutes) {
    return "Thời lượng theo lịch hẹn";
  }

  return `Kéo dài khoảng ${durationMinutes} phút`;
}

function buildServiceName(
  productLineName: string | null | undefined,
  status: string,
) {
  const normalizedStatus = status.trim().toUpperCase();
  const baseName = productLineName?.trim();

  if (baseName) {
    return `May đo sản phẩm "${baseName}"`;
  }

  if (normalizedStatus === "COMPLETED") {
    return "Lịch hẹn tư vấn số đo đã hoàn tất";
  }

  return "Tư vấn và đo số đo trực tiếp";
}

export function isAccountAppointmentFilter(
  value: string | undefined,
): value is AccountAppointmentStatus {
  return ACCOUNT_APPOINTMENT_FILTERS.some((item) => item.value === value);
}

export function filterAppointmentsByStatus(
  appointments: AccountAppointment[],
  status: AccountAppointmentStatus,
) {
  if (status === "all") {
    return appointments;
  }

  return appointments.filter((appointment) => appointment.status === status);
}

function getDbStatusesByFilter(status: AccountAppointmentStatus) {
  if (status === "upcoming") {
    return ["PENDING", "CONFIRMED"];
  }

  if (status === "completed") {
    return ["COMPLETED"];
  }

  if (status === "cancelled") {
    return ["CANCELLED", "NO_SHOW"];
  }

  return null;
}

export async function getMeasurementAppointmentsByCustomerId(
  customerId: number,
  query: AccountAppointmentQueryInput,
): Promise<AccountAppointmentListResult> {
  const admin = createAdminClient();
  let appointmentsQuery = admin
    .schema("customization")
    .from("measurement_appointment")
    .select(
      "appointment_id, product_line_id, branch_id, appointment_date, start_time, end_time, appointment_status",
      { count: "exact" },
    )
    .eq("customer_id", customerId)
    .order("appointment_date", { ascending: false })
    .order("start_time", { ascending: false })
    .range((query.page - 1) * query.limit, query.page * query.limit - 1);

  const statuses = getDbStatusesByFilter(query.status_group);
  if (statuses) {
    appointmentsQuery = appointmentsQuery.in("appointment_status", statuses);
  }

  const { data: appointments, error: appointmentsError, count } =
    await appointmentsQuery;

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  const safeAppointments =
    (appointments ?? []) as MeasurementAppointmentRecord[];

  const branchIds = Array.from(
    new Set(safeAppointments.map((appointment) => appointment.branch_id)),
  );
  const productLineIds = Array.from(
    new Set(
      safeAppointments
        .map((appointment) => appointment.product_line_id)
        .filter((value): value is number => typeof value === "number"),
    ),
  );

  const branchesResult = branchIds.length
    ? await admin
        .schema("iam")
        .from("branch")
        .select("branch_id, branch_name, address")
        .in("branch_id", branchIds)
    : { data: [] as BranchRecord[], error: null };
  const productLinesResult = productLineIds.length
    ? await admin
        .schema("catalog")
        .from("product_line")
        .select("product_line_id, line_name")
        .in("product_line_id", productLineIds)
    : { data: [] as ProductLineRecord[], error: null };

  const { data: branches, error: branchesError } = branchesResult;
  const { data: productLines, error: productLinesError } = productLinesResult;

  if (branchesError) {
    throw new Error(branchesError.message);
  }

  if (productLinesError) {
    throw new Error(productLinesError.message);
  }

  const branchMap = new Map(
    ((branches ?? []) as BranchRecord[]).map((branch) => [branch.branch_id, branch]),
  );
  const productLineMap = new Map(
    ((productLines ?? []) as ProductLineRecord[]).map((line) => [
      line.product_line_id,
      line,
    ]),
  );

  const items = safeAppointments.map((appointment) => {
    const branch = branchMap.get(appointment.branch_id);
    const productLine = appointment.product_line_id
      ? productLineMap.get(appointment.product_line_id)
      : null;

    return {
      appointment_id: Number(appointment.appointment_id),
      branch_address: branch?.address ?? "Chưa cập nhật địa chỉ chi nhánh.",
      branch_name: branch?.branch_name ?? "Xéo Xọ",
      date_label: formatAppointmentDate(appointment.appointment_date),
      duration_label: buildDurationLabel(
        appointment.start_time,
        appointment.end_time,
      ),
      service_name: buildServiceName(
        productLine?.line_name,
        appointment.appointment_status,
      ),
      status: getAppointmentFilterFromStatus(appointment.appointment_status),
      status_label: getAppointmentStatusLabel(appointment.appointment_status),
      time_label: formatTimeLabel(
        appointment.start_time,
        appointment.end_time,
      ),
    } satisfies AccountAppointment;
  });

  return {
    items,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: Number(count ?? items.length),
    },
  };
}
