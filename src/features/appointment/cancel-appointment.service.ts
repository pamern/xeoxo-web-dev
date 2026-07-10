import { createAdminClient } from "@/lib/supabase/admin";
import { parseAuthIdentifier } from "@/lib/auth-identifier";

type MeasurementAppointmentRecord = {
  appointment_id: number;
  appointment_status: string;
  contact_email: string | null;
  contact_phone: string | null;
  customer_id: number | null;
  customer_note: string | null;
};

type CustomerContactRecord = {
  email: string | null;
  phone: string | null;
};

export type CancelAppointmentResult = {
  success: boolean;
  appointment_id?: number;
  appointment_status?: "CANCELLED";
  message: string;
};

const CANCELLABLE_APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED"];

function buildCancelledCustomerNote(
  existingNote: string | null,
  cancelReason?: string,
) {
  if (!cancelReason) {
    return existingNote;
  }

  const trimmedExisting = existingNote?.trim() ?? "";
  const nextLine = `[Khách hủy lịch] ${cancelReason.trim()}`;

  return trimmedExisting ? `${trimmedExisting}\n\n${nextLine}` : nextLine;
}

async function getAppointmentById(appointmentId: number) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("customization")
    .from("measurement_appointment")
    .select(
      "appointment_id, customer_id, appointment_status, contact_phone, contact_email, customer_note",
    )
    .eq("appointment_id", appointmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? null) as MeasurementAppointmentRecord | null;
}

async function contactMatchesAppointment(
  appointment: MeasurementAppointmentRecord,
  contact: string,
) {
  const identifier = parseAuthIdentifier(contact);

  if (!identifier) {
    return false;
  }

  const snapshotPhone =
    typeof appointment.contact_phone === "string"
      ? parseAuthIdentifier(appointment.contact_phone)
      : null;
  const snapshotEmail =
    typeof appointment.contact_email === "string"
      ? parseAuthIdentifier(appointment.contact_email)
      : null;

  const matchesSnapshot =
    (identifier.type === "phone" && snapshotPhone?.value === identifier.value) ||
    (identifier.type === "email" && snapshotEmail?.value === identifier.value);

  if (matchesSnapshot) {
    return true;
  }

  if (!appointment.customer_id) {
    return false;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .schema("iam")
    .from("customer")
    .select("phone, email")
    .eq("customer_id", appointment.customer_id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  const customer = (data ?? null) as CustomerContactRecord | null;
  const customerPhone =
    typeof customer?.phone === "string"
      ? parseAuthIdentifier(customer.phone)
      : null;
  const customerEmail =
    typeof customer?.email === "string"
      ? parseAuthIdentifier(customer.email)
      : null;

  return (
    (identifier.type === "phone" &&
      customerPhone?.value === identifier.value) ||
    (identifier.type === "email" && customerEmail?.value === identifier.value)
  );
}

async function cancelAppointmentByAuthorizedCustomer(
  appointmentId: number,
  customerId: number,
  cancelReason?: string,
): Promise<CancelAppointmentResult> {
  const admin = createAdminClient();
  const appointment = await getAppointmentById(appointmentId);

  if (!appointment) {
    return { success: false, message: "Không tìm thấy lịch hẹn." };
  }

  if (Number(appointment.customer_id) !== customerId) {
    return {
      success: false,
      message: "Bạn không có quyền hủy lịch hẹn này.",
    };
  }

  const normalizedStatus = appointment.appointment_status.trim().toUpperCase();

  if (!CANCELLABLE_APPOINTMENT_STATUSES.includes(normalizedStatus)) {
    return {
      success: false,
      message:
        normalizedStatus === "CANCELLED"
          ? "Lịch hẹn này đã được hủy trước đó."
          : "Lịch hẹn đã hoàn thành hoặc không còn có thể hủy.",
    };
  }

  const { error } = await admin
    .schema("customization")
    .from("measurement_appointment")
    .update({
      appointment_status: "CANCELLED",
      customer_note: buildCancelledCustomerNote(
        appointment.customer_note,
        cancelReason,
      ),
      updated_at: new Date().toISOString(),
    })
    .eq("appointment_id", appointmentId);

  if (error) {
    return { success: false, message: error.message };
  }

  return {
    success: true,
    appointment_id: appointmentId,
    appointment_status: "CANCELLED",
    message: "Hủy lịch hẹn thành công.",
  };
}

export async function cancelCustomerAppointment(
  customerId: number,
  appointmentId: number,
  cancelReason?: string,
) {
  return cancelAppointmentByAuthorizedCustomer(
    appointmentId,
    customerId,
    cancelReason,
  );
}

export async function cancelLookupAppointment(
  appointmentId: number,
  contact: string,
  cancelReason?: string,
) {
  const appointment = await getAppointmentById(appointmentId);

  if (!appointment) {
    return { success: false, message: "Không tìm thấy lịch hẹn." };
  }

  const isMatched = await contactMatchesAppointment(appointment, contact);

  if (!isMatched) {
    return {
      success: false,
      message: "Thông tin tra cứu không khớp với lịch hẹn này.",
    };
  }

  if (!appointment.customer_id) {
    const admin = createAdminClient();
    const normalizedStatus = appointment.appointment_status.trim().toUpperCase();

    if (!CANCELLABLE_APPOINTMENT_STATUSES.includes(normalizedStatus)) {
      return {
        success: false,
        message:
          normalizedStatus === "CANCELLED"
            ? "Lịch hẹn này đã được hủy trước đó."
            : "Lịch hẹn đã hoàn thành hoặc không còn có thể hủy.",
      };
    }

    const { error } = await admin
      .schema("customization")
      .from("measurement_appointment")
      .update({
        appointment_status: "CANCELLED",
        customer_note: buildCancelledCustomerNote(
          appointment.customer_note,
          cancelReason,
        ),
        updated_at: new Date().toISOString(),
      })
      .eq("appointment_id", appointmentId);

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      appointment_id: appointmentId,
      appointment_status: "CANCELLED",
      message: "Hủy lịch hẹn thành công.",
    };
  }

  return cancelAppointmentByAuthorizedCustomer(
    appointmentId,
    Number(appointment.customer_id),
    cancelReason,
  );
}
