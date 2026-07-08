import { z } from "zod";

export const personalColorResultSchema = z.object({
  temperature: z.enum(["WARM", "COOL"]),
  value: z.enum(["LIGHT", "DEEP"]),
  season: z.enum(["SPRING", "SUMMER", "AUTUMN", "WINTER"]),
});

export type PersonalColorResultInput = z.infer<
  typeof personalColorResultSchema
>;
