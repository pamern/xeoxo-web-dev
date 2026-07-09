import { z } from "zod";

export const createCustomizationSchema = z.object({
  component_id: z.number().int().positive("component_id phai la so nguyen duong."),
  measurements: z
    .record(z.string(), z.number().min(0).max(300))
    .refine(
      (obj) => Object.keys(obj).length > 0,
      { message: "Cần ít nhất một số đo." },
    ),
  customer_note: z.string().max(1000).optional().default(""),
  save_as_default: z.boolean().optional().default(false),
});

export type CreateCustomizationInput = z.infer<typeof createCustomizationSchema>;
