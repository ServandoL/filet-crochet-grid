import {z} from "zod";

/** export type FilledCell = [number, number]; */
export const FilledCellSchema = z.tuple([z.number(), z.number()]);
export type FilledCell = z.infer<typeof FilledCellSchema>;

/** export interface Pattern { ... } */
export const PatternSchema = z.object({
  name: z.string(),
  rows: z.number(),
  cols: z.number(),
  cells: z.array(FilledCellSchema),
  updatedAt: z.string(),
  createdAt: z.string(),
});

export type Pattern = z.infer<typeof PatternSchema>;

export const PatternPatchSchema = z.object({
  name: z.string().optional(),
  cells: z.array(FilledCellSchema).optional(),
});
