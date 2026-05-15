import { describe, expectTypeOf, it } from 'vitest'
import { z } from 'zod'
import {
  buildSellDialogSchema,
  type SellDialogFormValues,
} from '../components/SellDialog'
import {
  buildTransferDialogSchema,
  type TransferDialogFormValues,
} from '../components/TransferDialog'

describe('dialog form types', () => {
  it('keeps SellDialog form values aligned with the schema input', () => {
    expectTypeOf<SellDialogFormValues>().toEqualTypeOf<
      z.input<ReturnType<typeof buildSellDialogSchema>>
    >()
  })

  it('keeps TransferDialog form values aligned with the schema input', () => {
    expectTypeOf<TransferDialogFormValues>().toEqualTypeOf<
      z.input<ReturnType<typeof buildTransferDialogSchema>>
    >()
  })
})
