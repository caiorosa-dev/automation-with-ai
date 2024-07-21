import { z } from 'zod';

export type Customer = {
  email: string;
  hectares: number;
};

export const customerSchema = z.object({
  email: z
    .string()
    .email()
    .describe(
      'Formado pelo primeiro e ultimo nome do cliente, com "@gmail.com" no final.'
    ),
  hectares: z
    .number()
    .int()
    .positive()
    .describe(
      'Escolha um valor aleatório porém condizente com o valor gasto do cliente. O número deve ser entre 20 e 50.'
    ),
});
