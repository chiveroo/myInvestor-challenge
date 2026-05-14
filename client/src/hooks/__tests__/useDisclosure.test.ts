import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useDisclosure } from '../useDisclosure'

describe('useDisclosure', () => {
  it('starts closed by default', () => {
    const { result } = renderHook(() => useDisclosure())
    expect(result.current.isOpen).toBe(false)
  })

  it('starts open when initial=true', () => {
    const { result } = renderHook(() => useDisclosure(true))
    expect(result.current.isOpen).toBe(true)
  })

  it('opens on open()', () => {
    const { result } = renderHook(() => useDisclosure())
    act(() => result.current.open())
    expect(result.current.isOpen).toBe(true)
  })

  it('closes on close()', () => {
    const { result } = renderHook(() => useDisclosure(true))
    act(() => result.current.close())
    expect(result.current.isOpen).toBe(false)
  })

  it('toggles state on toggle()', () => {
    const { result } = renderHook(() => useDisclosure())
    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(true)
    act(() => result.current.toggle())
    expect(result.current.isOpen).toBe(false)
  })

  it('exposes stable references for open, close, toggle across renders', () => {
    const { result, rerender } = renderHook(() => useDisclosure())
    const { open, close, toggle } = result.current
    rerender()
    expect(result.current.open).toBe(open)
    expect(result.current.close).toBe(close)
    expect(result.current.toggle).toBe(toggle)
  })
})
