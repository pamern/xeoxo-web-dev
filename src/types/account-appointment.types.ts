export type AccountAppointmentStatus =
  | "all"
  | "upcoming"
  | "completed"
  | "cancelled";

export type AccountAppointment = {
  appointment_id: number;
  branch_address: string;
  branch_name: string;
  date_label: string;
  duration_label: string;
  service_name: string;
  status: Exclude<AccountAppointmentStatus, "all">;
  status_label: string;
  time_label: string;
};

export type AccountAppointmentListResult = {
  items: AccountAppointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};
