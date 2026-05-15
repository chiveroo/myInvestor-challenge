import { z } from 'zod'

export function buildSellDialogSchema(maxAmount: number) {
  return z.object({
    amount: z
      .number({ error: 'Introduce un importe válido.' })
      .optional()
      .superRefine((value, ctx) => {
        if (value === undefined) {
          ctx.addIssue({ code: 'custom', message: 'Introduce un importe válido.' })
          return
        }

        if (value <= 0) {
          ctx.addIssue({ code: 'custom', message: 'El importe debe ser mayor que 0 €.' })
        }

        if (value > maxAmount) {
          ctx.addIssue({ code: 'custom', message: 'No puedes vender más del saldo disponible.' })
        }
      }),
  })
}

export type SellDialogFormValues = z.input<ReturnType<typeof buildSellDialogSchema>>
