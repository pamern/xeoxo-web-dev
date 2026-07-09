export type AppointmentDto = {
  appointment_id: number;
  customer_id: number;
  product_line_id: number | null;
  branch_id: number;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_status: string;
  customer_note: string | null;
  created_at: string;
};

export type CreateAppointmentValues = {
  full_name: string;
  phone: string;
  email?: string;
  branch_id: number;
  appointment_date: string;
  start_time: string;
  product_line_id?: number;
  customer_note?: string;
};
