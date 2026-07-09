export type CustomizationRequestDto = {
  customization_id: number;
  customer_id: number;
  component_id: number;
  measurement_profile_id: number | null;
  measurement_snapshot?: CustomizationMeasurementSnapshot | null;
  unit_price: number;
  surcharge_percent: number;
  surcharge_amount: number;
  custom_price: number;
  customization_status: string;
  customer_note: string | null;
  created_at: string;
};

export type CustomizationMeasurementSnapshot = {
  measurements: Record<string, number>;
  note?: string | null;
  component_id: number;
  component_type?: string | null;
  source: "CUSTOMIZE_MODAL";
  saved_as_default: boolean;
  created_at: string;
};

export type CreateCustomizationValues = {
  component_id: number;
  measurements: Record<string, number>;
  customer_note?: string;
  save_as_default?: boolean;
};
