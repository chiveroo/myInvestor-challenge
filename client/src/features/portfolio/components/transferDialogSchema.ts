import { z } from 'zod'

export function buildTransferDialogSchema(maxQuantity: number, fromFundId: string, destinationIds: string[]) {
  return z.object({
    quantity: z
      .number({ error: 'Introduce un importe válido.' })
      .optional()
      .superRefine((value, ctx) => {
        if (value === undefined) {
          ctx.addIssue({ code: 'custom', message: 'Introduce un importe válido.' })
          return
        }

        if (value <= 0) {
          ctx.addIssue({ code: 'custom', message: 'La cantidad debe ser mayor que 0 participaciones.' })
        }

        if (value > maxQuantity) {
          ctx.addIssue({ code: 'custom', message: 'No puedes traspasar más participaciones de las disponibles.' })
        }
      }),
    destinationId: z.string().superRefine((value, ctx) => {
      if (!value) {
        ctx.addIssue({ code: 'custom', message: 'Selecciona un fondo de destino.' })
        return
      }

      if (value === fromFundId) {
        ctx.addIssue({ code: 'custom', message: 'No puedes traspasar al mismo fondo.' })
      }

      if (!destinationIds.includes(value)) {
        ctx.addIssue({ code: 'custom', message: 'El fondo de destino debe estar ya comprado.' })
      }
    }),
  })
}

export type TransferDialogFormValues = z.input<ReturnType<typeof buildTransferDialogSchema>>
