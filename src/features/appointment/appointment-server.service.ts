import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import type { AppointmentDto, CreateAppointmentValues } from "@/types/appointment.types";

class AppointmentError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
  }
}

function buildAppointmentCode() {
  return `APT${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

function addMinutesToTime(time: string, minutes: number) {
  const [hours, mins] = time.split(":").map(Number);
  const date = new Date(Date.UTC(2000, 0, 1, hours, mins));
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function buildAppointmentDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00+07:00`);
}

async function ensureGuestCustomer(
  fullName: string,
  phone: string,
  email?: string,
) {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const normalizedPhone = parseAuthIdentifier(phone);
  if (!normalizedPhone || normalizedPhone.type !== "phone") {
    throw new AppointmentError("Số điện thoại không hợp lệ.", 422);
  }

  const normalizedEmail = email?.trim().toLowerCase() || null;

  const { data: existing, error: existingError } = await admin
    .schema("iam")
    .from("customer")
    .select("customer_id")
    .eq("phone", normalizedPhone.value)
    .eq("customer_type", "GUEST")
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing?.customer_id) {
    return Number(existing.customer_id);
  }

  const { data, error } = await admin
    .schema("iam")
    .from("customer")
    .insert({
      customer_name: fullName.trim(),
      phone: normalizedPhone.value,
      email: normalizedEmail,
      customer_type: "GUEST",
      total_spent: 0,
      spent_in_year: 0,
      created_at: now,
      updated_at: now,
    })
    .select("customer_id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return Number(data.customer_id);
}

export async function createAppointment(
  customerId: number | null,
  values: CreateAppointmentValues,
): Promise<AppointmentDto> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  const appointmentAt = buildAppointmentDateTime(
    values.appointment_date,
    values.start_time,
  );

  if (Number.isNaN(appointmentAt.getTime())) {
    throw new AppointmentError("Ngày hẹn không hợp lệ.", 422);
  }

  const nowDate = new Date();
  if (appointmentAt.getTime() < nowDate.getTime()) {
    throw new AppointmentError("Không thể đặt lịch trong quá khứ.", 422);
  }

  if (appointmentAt.getTime() - nowDate.getTime() < 60 * 60 * 1000) {
    throw new AppointmentError("Lịch hẹn phải được đặt trước ít nhất 1 giờ.", 422);
  }

  if (values.product_line_id) {
    const { data: productLine, error: productLineError } = await admin
      .schema("catalog")
      .from("product_line")
      .select("product_line_id")
      .eq("product_line_id", values.product_line_id)
      .eq("status", "ACTIVE")
      .maybeSingle();

    if (productLineError) throw new Error(productLineError.message);
    if (!productLine) {
      throw new AppointmentError("Không tìm thấy sản phẩm.", 404);
    }
  }

  const effectiveCustomerId =
    customerId ??
    (await ensureGuestCustomer(values.full_name, values.phone, values.email));

  const appointmentData = {
    appointment_code: buildAppointmentCode(),
    customer_id: effectiveCustomerId,
    product_line_id: values.product_line_id || null,
    branch_id: values.branch_id,
    appointment_date: values.appointment_date,
    start_time: values.start_time,
    end_time: addMinutesToTime(values.start_time, 60),
    appointment_status: "CONFIRMED",
    contact_name: values.full_name.trim(),
    contact_phone:
      parseAuthIdentifier(values.phone)?.type === "phone"
        ? parseAuthIdentifier(values.phone)?.value
        : values.phone.trim(),
    contact_email: values.email?.trim().toLowerCase() || null,
    customer_note: values.customer_note?.trim() || null,
    created_at: now,
    updated_at: now,
  };

  const { data: appointment, error } = await admin
    .schema("customization")
    .from("measurement_appointment")
    .insert(appointmentData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    appointment_id: appointment.appointment_id,
    appointment_code: appointment.appointment_code,
    customer_id: appointment.customer_id,
    product_line_id: appointment.product_line_id,
    branch_id: appointment.branch_id,
    appointment_date: appointment.appointment_date,
    start_time: appointment.start_time,
    end_time: appointment.end_time,
    appointment_status: appointment.appointment_status,
    customer_note: appointment.customer_note,
    created_at: appointment.created_at,
  };
}

export function isAppointmentError(error: unknown): error is AppointmentError {
  return error instanceof AppointmentError;
}
