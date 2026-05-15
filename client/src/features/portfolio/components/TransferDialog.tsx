import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import styled from 'styled-components'
import { transferFund } from '@/api/funds'
import { Button } from '@/components/atoms/Button'
import { Dialog } from '@/components/organisms/Dialog'
import { useToast } from '@/hooks/useToast'
import { formatMoney } from '@/utils/format'
import { fundKeys } from '@/features/funds/keys'
import type { PortfolioPosition } from '@/types'
import { portfolioKeys } from '../keys'
import { formatQuantity, getTransferDestinationPositions } from './portfolioHelpers'
import { buildTransferDialogSchema, type TransferDialogFormValues } from './transferDialogSchema'

interface TransferDialogProps {
  position: PortfolioPosition
  positions: PortfolioPosition[]
  isOpen: boolean
  onClose: () => void
  onSuccess?: (payload: { quantity: number; destinationFundId: string; destinationFundName: string }) => void
}

function normalizeTransferQuantity(quantity: number | undefined, maxQuantity: number) {
  if (quantity === undefined || Number.isNaN(quantity)) {
    return undefined
  }

  if (quantity < 0) {
    return 0
  }

  return Math.min(quantity, maxQuantity)
}

function parseQuantity(value: string) {
  if (!value) {
    return undefined
  }

  const normalized = value.replace(',', '.')
  const parsed = Number.parseFloat(normalized)

  return Number.isNaN(parsed) ? undefined : parsed
}

export function TransferDialog({ position, positions, isOpen, onClose, onSuccess }: TransferDialogProps) {
  const queryClient = useQueryClient()
  const addToast = useToast()
  const [serverError, setServerError] = useState<string | null>(null)
  const maxQuantity = position.quantity
  const destinationOptions = getTransferDestinationPositions(position, positions)
  const defaultDestinationId = destinationOptions[0]?.id ?? ''
  const schema = buildTransferDialogSchema(
    maxQuantity,
    position.id,
    destinationOptions.map(destination => destination.id),
  )
  const quantityHintId = 'transfer-quantity-hint'
  const destinationHintId = 'transfer-destination-hint'

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm<TransferDialogFormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      quantity: undefined,
      destinationId: defaultDestinationId,
    },
  })

  const resetForm = () =>
    reset({
      quantity: undefined,
      destinationId: defaultDestinationId,
    })

  const mutation = useMutation({
    mutationFn: ({ quantity, destinationId }: { quantity: number; destinationId: string }) =>
      transferFund(position.id, destinationId, quantity),
    onSuccess: (_, variables) => {
      const destination = destinationOptions.find(option => option.id === variables.destinationId)

      queryClient.invalidateQueries({ queryKey: portfolioKeys.list() })
      queryClient.invalidateQueries({ queryKey: fundKeys.lists() })
      onSuccess?.({
        quantity: variables.quantity,
        destinationFundId: variables.destinationId,
        destinationFundName: destination?.name ?? 'Otro fondo',
      })
      addToast(
        `Orden de traspaso enviada de ${formatQuantity(variables.quantity)} participaciones de ${position.name} a ${destination?.name ?? 'otro fondo'}.`,
        'success'
      )
      resetForm()
      onClose()
    },
    onError: (error: Error) => {
      setServerError(error.message)
      addToast('No hemos podido procesar el traspaso. Inténtalo de nuevo.', 'error')
    },
  })

  function handleClose() {
    resetForm()
    setServerError(null)
    onClose()
  }

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Traspasar fondo" aria-label="Traspasar fondo">
      <form
        onSubmit={handleSubmit(data => {
          setServerError(null)
          mutation.mutate({ quantity: data.quantity ?? 0, destinationId: data.destinationId })
        })}
        noValidate
      >
        <HelperText>
          Selecciona el fondo de destino e indica cuántas participaciones quieres traspasar. El backend
          aplica la misma cantidad de participaciones al fondo origen y al destino.
        </HelperText>

        <PositionInfo>
          <div>
            <PositionName>{position.name}</PositionName>
          </div>

          <InfoRow>
            <InfoLabel>Valor actual de la posición</InfoLabel>
            <InfoValue>{formatMoney(position.totalValue.amount, position.totalValue.currency)}</InfoValue>
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
          <FieldLabel htmlFor="transfer-destination">Fondo de destino</FieldLabel>
          <Controller
            control={control}
            name="destinationId"
            render={({ field }) => (
              <Select
                {...field}
                id="transfer-destination"
                aria-describedby={destinationHintId}
                aria-invalid={!!errors.destinationId}
                disabled={mutation.isPending || destinationOptions.length === 0}
              >
                {destinationOptions.map(destination => (
                  <option key={destination.id} value={destination.id}>
                    {destination.name}
                  </option>
                ))}
              </Select>
            )}
          />
          <FieldHint id={destinationHintId} role={errors.destinationId ? 'alert' : undefined}>
            {errors.destinationId?.message ?? 'Solo puedes traspasar a fondos que ya tengas en cartera.'}
          </FieldHint>
        </FieldWrapper>

        <FieldWrapper>
          <Controller
            control={control}
            name="quantity"
            render={({ field }) => (
              <NumberField>
                <FieldLabel htmlFor="transfer-quantity">Participaciones a traspasar</FieldLabel>
                <NumberInput
                  id="transfer-quantity"
                  name={field.name}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  value={field.value ?? ''}
                  aria-describedby={quantityHintId}
                  aria-invalid={!!errors.quantity}
                  disabled={mutation.isPending || destinationOptions.length === 0}
                  onBlur={field.onBlur}
                  onChange={event => {
                    const normalizedValue = normalizeTransferQuantity(parseQuantity(event.target.value), maxQuantity)

                    setValue(field.name, normalizedValue, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    })
                  }}
                />
                {errors.quantity ? <FieldError role="alert">{errors.quantity.message}</FieldError> : null}
              </NumberField>
            )}
          />
          <FieldHint id={quantityHintId}>
            Máximo disponible para traspasar: {formatQuantity(maxQuantity)} participaciones.
          </FieldHint>
        </FieldWrapper>

        {serverError ? <ServerError role="alert">{serverError}</ServerError> : null}

        <Actions>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || mutation.isPending || destinationOptions.length === 0}
          >
            {mutation.isPending ? 'Enviando orden…' : 'Traspasar ahora'}
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

const FieldLabel = styled.label`
  display: block;
  margin-bottom: ${({ theme }) => theme.spacing['1']};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.textSecondary};
`

const NumberField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['1']};
`

const NumberInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
  border: ${({ theme }) => theme.borderWidth.md} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing['3']} ${({ theme }) => theme.spacing['4']};
  border: ${({ theme }) => theme.borderWidth.md} solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  color: ${({ theme }) => theme.colors.text};
  background: ${({ theme }) => theme.colors.background};

  &:focus-visible {
    outline: ${({ theme }) => theme.focus.ringWidth} solid ${({ theme }) => theme.colors.primary};
    outline-offset: ${({ theme }) => theme.focus.ringOffset};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const FieldHint = styled.p`
  margin-top: ${({ theme }) => theme.spacing['2']};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.textMuted};
`

const FieldError = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.negative};
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
