import { z } from 'zod';

export const BeadPositionSchema = z.object({
  row: z.number(),
  col: z.number(),
  color: z.string(),
});
