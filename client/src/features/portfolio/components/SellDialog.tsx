import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import styled from 'styled-components'
import { sellFund } from '@/api/funds'
import { CurrencyInput } from '@/components/atoms/CurrencyInput'
import { Button } from '@/components/atoms/Button'
import { Dialog } from '@/components/organisms/Dialog'
import { useToast } from '@/hooks/useToast'
import { formatMoney } from '@/utils/format'
import { fundKeys } from '@/features/funds/keys'
import { portfolioKeys } from '../keys'
import { getUnitValueAmount } from './portfolioHelpers'
import type { PortfolioPosition } from '@/types'

interface SellDialogProps {
  position: PortfolioPosition
  isOpen: boolean
  onClose: () => void
}

interface FormValues {
  amount: number | undefined
}

function buildSchema(maxAmount: number) {
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

function normalizeSellAmount(amount: number | undefined, maxAmount: number) {
  if (amount === undefined || Number.isNaN(amount)) {
    return undefined
  }

  if (amount < 0) {
    return 0
  }

  return Math.min(amount, maxAmount)
}

export function SellDialog({ position, isOpen, onClose }: SellDialogProps) {
  const queryClient = useQueryClient()
  const addToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const maxAmount = position.totalValue.amount
  const unitValue = getUnitValueAmount(position)
  const schema = buildSchema(maxAmount)
  const amountHintId = 'sell-amount-hint'

  const resetForm = () => reset({ amount: undefined })

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      amount: undefined,
    },
  })

  const mutation = useMutation({
    mutationFn: (amount: number) => {
      if (unitValue === null) {
        throw new Error('No hemos podido calcular la cantidad disponible para vender.')
      }

      return sellFund(position.id, amount / unitValue)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: portfolioKeys.list() })
      queryClient.invalidateQueries({ queryKey: fundKeys.lists() })
      addToast(`Orden de venta enviada para ${position.name}.`, 'success')
      resetForm()
      onClose()
    },
    onError: (error: Error) => {
      setServerError(error.message)
      addToast('No hemos podido procesar la venta. Inténtalo de nuevo.', 'error')
    },
  })

  function handleClose() {
    resetForm()
    setServerError(null)
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Vender fondo" aria-label="Vender fondo">
      <form
        onSubmit={handleSubmit(data => {
          setServerError(null)
          mutation.mutate(data.amount ?? 0)
        })}
        noValidate
      >
        <HelperText>Indica cuánto quieres vender de esta posición.</HelperText>

        <PositionInfo>
          <div>
            <PositionName>{position.name}</PositionName>
          </div>

          <InfoRow>
            <InfoLabel>Importe disponible</InfoLabel>
            <InfoValue>{formatMoney(maxAmount, position.totalValue.currency)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Participaciones disponibles</InfoLabel>
            <InfoValue>
              {new Intl.NumberFormat('es-ES', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(position.quantity)}{' '}
              participaciones
            </InfoValue>
          </InfoRow>
        </PositionInfo>

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
                onValueChange={value => {
                  const normalizedValue = normalizeSellAmount(value, maxAmount)

                  setValue(field.name, normalizedValue, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  })
                }}
              />
            )}
          />
          <FieldHint id={amountHintId}>
            Máximo disponible para vender: {formatMoney(maxAmount, position.totalValue.currency)}.
          </FieldHint>
        </FieldWrapper>

        {serverError ? <ServerError role="alert">{serverError}</ServerError> : null}

        <Actions>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!isValid || mutation.isPending}>
            {mutation.isPending ? 'Enviando orden…' : 'Vender ahora'}
          </Button>
        </Actions>
      </form>
    </Dialog>
  )
}

const PositionInfo = styled.div`
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

const PositionName = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.text};
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
