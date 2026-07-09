import { z } from "zod";

export const saveMeasurementProfileSchema = z.object({
  measurements: z
    .record(z.string(), z.number().min(0).max(300))
    .refine(
      (obj) => Object.keys(obj).length > 0,
      { message: "Cần ít nhất một số đo." },
    ),
});

export type SaveMeasurementProfileInput = z.infer<typeof saveMeasurementProfileSchema>;
