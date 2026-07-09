import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import type { AppointmentLookupInput } from "@/validations/appointment/appointment-lookup.schema";
import type { AppointmentLookupDto } from "@/types/appointment-lookup.types";

type MeasurementAppointmentRecord = {
  appointment_id: number;
  customer_id: number | null;
  branch_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_status: string;
};

type BranchRecord = {
  branch_id: number;
  branch_name: string;
  address: string;
};

type CustomerContactRecord = {
  phone: string | null;
  email: string | null;
};

export async function lookupAppointmentByContact(
  input: AppointmentLookupInput,
): Promise<AppointmentLookupDto | null> {
  const admin = createAdminClient();
  const identifier = parseAuthIdentifier(input.contact);

  if (!identifier) {
    return null;
  }

  const { data: appointment, error: appointmentError } = await admin
    .schema("customization")
    .from("measurement_appointment")
    .select(
      "appointment_id, customer_id, branch_id, appointment_date, start_time, end_time, appointment_status",
    )
    .eq("appointment_id", input.appointment_id)
    .maybeSingle();

  if (appointmentError) {
    throw new Error(appointmentError.message);
  }

  const safeAppointment = (appointment ?? null) as MeasurementAppointmentRecord | null;

  if (!safeAppointment?.customer_id) {
    return null;
  }

  const { data: customer, error: customerError } = await admin
    .schema("iam")
    .from("customer")
    .select("phone, email")
    .eq("customer_id", safeAppointment.customer_id)
    .maybeSingle();

  if (customerError) {
    throw new Error(customerError.message);
  }

  const safeCustomer = (customer ?? null) as CustomerContactRecord | null;
  const phoneIdentifier =
    typeof safeCustomer?.phone === "string"
      ? parseAuthIdentifier(safeCustomer.phone)
      : null;
  const emailIdentifier =
    typeof safeCustomer?.email === "string"
      ? parseAuthIdentifier(safeCustomer.email)
      : null;

  const isContactMatched =
    (identifier.type === "phone" && phoneIdentifier?.value === identifier.value) ||
    (identifier.type === "email" && emailIdentifier?.value === identifier.value);

  if (!isContactMatched) {
    return null;
  }

  const { data: branch, error: branchError } = await admin
    .schema("iam")
    .from("branch")
    .select("branch_id, branch_name, address")
    .eq("branch_id", safeAppointment.branch_id)
    .maybeSingle();

  if (branchError) {
    throw new Error(branchError.message);
  }

  const safeBranch = (branch ?? null) as BranchRecord | null;

  return {
    appointment_id: Number(safeAppointment.appointment_id),
    branch_name: safeBranch?.branch_name ?? "Xéo Xọ",
    address: safeBranch?.address ?? "Địa chỉ chi nhánh chưa được cập nhật.",
    appointment_date: safeAppointment.appointment_date,
    start_time: safeAppointment.start_time,
    end_time: safeAppointment.end_time,
    appointment_status: safeAppointment.appointment_status,
  };
}
