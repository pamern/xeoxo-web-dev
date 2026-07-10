import { randomUUID } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AppointmentDto, CreateAppointmentValues } from "@/types/appointment.types";

function buildAppointmentCode() {
  return `APT${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

export async function createAppointment(
  customerId: number | null,
  values: CreateAppointmentValues
): Promise<AppointmentDto> {
  const admin = createAdminClient();
  const now = new Date().toISOString();

  // Validate product_line_id if provided
  if (values.product_line_id) {
    const { data: productLine, error: productLineError } = await admin
      .schema("catalog")
      .from("product_line")
      .select("product_line_id")
      .eq("product_line_id", values.product_line_id)
      .maybeSingle();

    if (productLineError) throw new Error(productLineError.message);
    if (!productLine) throw new Error("Khong tim thay san pham.");
  }

  const startTimeStr = values.start_time;
  const [hours, minutes] = startTimeStr.split(':').map(Number);
  const startDate = new Date(Date.UTC(2000, 0, 1, hours, minutes));
  startDate.setUTCMinutes(startDate.getUTCMinutes() + 30);
  const endTimeStr = `${startDate.getUTCHours().toString().padStart(2, '0')}:${startDate.getUTCMinutes().toString().padStart(2, '0')}`;

  const appointmentData = {
    appointment_code: buildAppointmentCode(),
    customer_id: customerId,
    product_line_id: values.product_line_id || null,
    branch_id: values.branch_id,
    appointment_date: values.appointment_date,
    start_time: startTimeStr,
    end_time: endTimeStr,
    appointment_status: 'CONFIRMED',
    contact_name: values.full_name.trim(),
    contact_phone: values.phone.trim(),
    contact_email: values.email?.trim().toLowerCase() || null,
    customer_note: values.customer_note || null,
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
