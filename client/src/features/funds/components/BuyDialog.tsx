import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { Dialog } from '@/components/organisms/Dialog'
import { CurrencyInput } from '@/components/atoms/CurrencyInput'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { useToast } from '@/hooks/useToast'
import { buyFund } from '@/api/funds'
import { fundKeys } from '../keys'
import { portfolioKeys } from '@/features/portfolio/keys'
import type { Fund } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────────

const schema = z.object({
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

      if (value > 10_000) {
        ctx.addIssue({ code: 'custom', message: 'No puedes invertir más de 10.000 € en una sola compra.' })
      }
    }),
})

type FormValues = z.infer<typeof schema>

// ── Component ──────────────────────────────────────────────────────────────────

interface BuyDialogProps {
  fund: Fund
  isOpen: boolean
  onClose: () => void
  onSuccess?: (payload: { amount: number; quantity: number }) => void
}

const fmtCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency }).format(amount)

export function BuyDialog({ fund, isOpen, onClose, onSuccess }: BuyDialogProps) {
  const queryClient = useQueryClient()
  const addToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const amountHintId = 'buy-amount-hint'

  const resetForm = () => reset({ amount: undefined })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      amount: undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (amount: number) => {
      const quantity = amount / fund.value.amount
      return buyFund(fund.id, quantity)
    },
    onSuccess: (_, amount) => {
      const quantity = amount / fund.value.amount
      queryClient.invalidateQueries({ queryKey: fundKeys.lists() })
      queryClient.invalidateQueries({ queryKey: portfolioKeys.list() })
      onSuccess?.({ amount, quantity })
      addToast(`Orden de compra enviada para ${fund.name}.`, 'success')
      resetForm()
      onClose()
    },
    onError: (err: Error) => {
      setServerError(err.message)
      addToast('No hemos podido procesar la compra. Inténtalo de nuevo.', 'error')
    },
  })

  function handleClose() {
    resetForm()
    setServerError(null)
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Comprar fondo" aria-label="Comprar fondo">
      <form
        onSubmit={handleSubmit(data => {
          setServerError(null)
          mutation.mutate(data.amount ?? 0)
        })}
        noValidate
      >
        <HelperText>Indica cuánto quieres invertir en este fondo.</HelperText>

        <FundInfo>
          <FundHeader>
            <div>
              <FundName>{fund.name}</FundName>
              <FundSymbol>{fund.symbol}</FundSymbol>
            </div>
            <Badge label={fund.category} variant={fund.category} />
          </FundHeader>

          <InfoRow>
            <InfoLabel>Valor liquidativo</InfoLabel>
            <InfoValue>{fmtCurrency(fund.value.amount, fund.value.currency)}</InfoValue>
          </InfoRow>
        </FundInfo>

        <FieldWrapper>
          <Controller
            control={control}
            name="amount"
            render={({ field }) => (
              <CurrencyInput
                label="Importe"
                name={field.name}
                value={field.value}
                error={errors.amount?.message}
                aria-describedby={amountHintId}
                disabled={mutation.isPending}
                onBlur={field.onBlur}
                onValueChange={field.onChange}
              />
            )}
          />
          <FieldHint id={amountHintId}>Importe máximo por compra: 10.000 €.</FieldHint>
        </FieldWrapper>

        {serverError && <ServerError role="alert">{serverError}</ServerError>}

        <Actions>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? 'Enviando orden…' : 'Comprar ahora'}
          </Button>
        </Actions>
      </form>
    </Dialog>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const FundInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['3']};
  padding: ${({ theme }) => theme.spacing['4']};
  background: ${({ theme }) => theme.colors.backgroundSubtle};
  border: ${({ theme }) => theme.borderWidth.base} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  margin-bottom: ${({ theme }) => theme.spacing['5']};
`

const HelperText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing['4']};
`

const FundHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing['3']};
`

const FundName = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`

const FundSymbol = styled.p`
  margin-top: ${({ theme }) => theme.spacing['1']};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const InfoLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const InfoValue = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
`

const FieldWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing['5']};
`

const FieldHint = styled.p`
  margin-top: ${({ theme }) => theme.spacing['2']};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const ServerError = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.negative};
  margin-bottom: ${({ theme }) => theme.spacing['4']};
`

const Actions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing['3']};
  justify-content: flex-end;
  flex-wrap: wrap;
`
