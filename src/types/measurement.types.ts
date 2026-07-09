export type MeasurementDetailDto = {
  measurement_type_id: number;
  measurement_code: string;
  measurement_name: string;
  value: number;
};

export type MeasurementProfileDto = {
  measurement_profile_id: number;
  customer_id: number;
  is_active: boolean;
  measurements: MeasurementDetailDto[];
  updated_at: string;
};

export type SaveMeasurementProfileValues = {
  measurements: Record<string, number>;
};
