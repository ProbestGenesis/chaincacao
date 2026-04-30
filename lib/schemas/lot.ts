import { z } from 'zod';

export const LotFormSchema = z.object({
  espece: z.string().min(2, 'Espèce requise').max(50),
  poidsKg: z.number().min(1, 'Poids minimum 1 kg').max(10000),
  dateCollecte: z.date(),
  region: z.string().min(2, 'Région requise'),
  gpsLatitude: z.number().min(-90).max(90),
  gpsLongitude: z.number().min(-180).max(180),
  photoUrls: z.array(z.string().url()).optional().default([]),
  coopName: z.string().optional().default(''),
});

export type LotFormData = z.infer<typeof LotFormSchema>;
