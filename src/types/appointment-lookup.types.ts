export type AppointmentLookupValues = {
  appointment_id: string;
  contact: string;
};

export type AppointmentLookupDto = {
  appointment_id: number;
  branch_name: string;
  address: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_status: string;
};
