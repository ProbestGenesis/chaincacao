import { z } from 'zod';

export const LotFormSchema = z.object({
  espece: z.string().min(2, 'Espèce requise').max(50),
  poidsKg: z.number().min(1, 'Poids minimum 1 kg').max(10000),
  dateCollecte: z.date(),
  parcelleId: z.string().min(1, 'La parcelle est requise'),
  coopId: z.string().optional(),
  photoUrls: z.array(z.string().url()).optional().default([]),
});

export type LotFormData = z.infer<typeof LotFormSchema>;
