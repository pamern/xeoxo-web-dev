import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";
import type { AppointmentLookupInput } from "@/validations/appointment/appointment-lookup.schema";
import type { AppointmentLookupDto } from "@/types/appointment-lookup.types";

type MeasurementAppointmentRecord = {
  appointment_id: number;
  appointment_code: string | null;
  customer_id: number | null;
  branch_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_status: string;
  contact_phone: string | null;
  contact_email: string | null;
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
      "appointment_id, appointment_code, customer_id, branch_id, appointment_date, start_time, end_time, appointment_status, contact_phone, contact_email",
    )
    .eq("appointment_code", input.appointment_code)
    .maybeSingle();

  if (appointmentError) {
    throw new Error(appointmentError.message);
  }

  let safeAppointment = (appointment ?? null) as MeasurementAppointmentRecord | null;

  if (!safeAppointment && /^\d+$/.test(input.appointment_code)) {
    const { data: legacyAppointment, error: legacyAppointmentError } = await admin
      .schema("customization")
      .from("measurement_appointment")
      .select(
        "appointment_id, appointment_code, customer_id, branch_id, appointment_date, start_time, end_time, appointment_status, contact_phone, contact_email",
      )
      .eq("appointment_id", Number(input.appointment_code))
      .maybeSingle();

    if (legacyAppointmentError) {
      throw new Error(legacyAppointmentError.message);
    }

    safeAppointment =
      (legacyAppointment ?? null) as MeasurementAppointmentRecord | null;
  }

  if (!safeAppointment) {
    return null;
  }

  const phoneIdentifier =
    typeof safeAppointment.contact_phone === "string"
      ? parseAuthIdentifier(safeAppointment.contact_phone)
      : null;
  const emailIdentifier =
    typeof safeAppointment.contact_email === "string"
      ? parseAuthIdentifier(safeAppointment.contact_email)
      : null;

  const isSnapshotContactMatched =
    (identifier.type === "phone" && phoneIdentifier?.value === identifier.value) ||
    (identifier.type === "email" && emailIdentifier?.value === identifier.value);

  if (!isSnapshotContactMatched && !safeAppointment.customer_id) {
    return null;
  }

  if (!isSnapshotContactMatched) {
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
    const customerPhoneIdentifier =
      typeof safeCustomer?.phone === "string"
        ? parseAuthIdentifier(safeCustomer.phone)
        : null;
    const customerEmailIdentifier =
      typeof safeCustomer?.email === "string"
        ? parseAuthIdentifier(safeCustomer.email)
        : null;

    const isCustomerContactMatched =
      (identifier.type === "phone" && customerPhoneIdentifier?.value === identifier.value) ||
      (identifier.type === "email" && customerEmailIdentifier?.value === identifier.value);

    if (!isCustomerContactMatched) {
      return null;
    }
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
    appointment_code:
      safeAppointment.appointment_code ??
      `APT${String(safeAppointment.appointment_id).padStart(8, "0")}`,
    branch_name: safeBranch?.branch_name ?? "Xéo Xọ",
    address: safeBranch?.address ?? "Địa chỉ chi nhánh chưa được cập nhật.",
    appointment_date: safeAppointment.appointment_date,
    start_time: safeAppointment.start_time,
    end_time: safeAppointment.end_time,
    appointment_status: safeAppointment.appointment_status,
  };
}
