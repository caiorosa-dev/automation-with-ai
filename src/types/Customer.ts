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
      'Formado pelo primeiro e ultima parte do nome do cliente, com "@gmail.com" no final, sem espaços e sem pontos no email. Exemplo: JUNIOR HUMBERTO SABEI -> juniorsabei@gmail.com'
    ),
  hectares: z
    .number()
    .int()
    .positive()
    .describe(
      'Escolha um valor aleatório levemente condizente com o valor gasto do cliente. O número deve ser entre 15 e 50.'
    ),
});
