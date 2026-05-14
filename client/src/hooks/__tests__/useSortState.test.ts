import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSortState } from '../useSortState'

describe('useSortState', () => {
  it('starts with no active sort', () => {
    const { result } = renderHook(() => useSortState<string>())
    expect(result.current.sort).toBeNull()
  })

  it('sets ascending sort on first toggle of a field', () => {
    const { result } = renderHook(() => useSortState<string>())

    act(() => result.current.toggleSort('name'))

    expect(result.current.sort).toEqual({ field: 'name', direction: 'asc' })
  })

  it('changes to descending on second toggle of the same field', () => {
    const { result } = renderHook(() => useSortState<string>())

    act(() => result.current.toggleSort('name'))
    act(() => result.current.toggleSort('name'))

    expect(result.current.sort).toEqual({ field: 'name', direction: 'desc' })
  })

  it('clears sort on third toggle of the same field', () => {
    const { result } = renderHook(() => useSortState<string>())

    act(() => result.current.toggleSort('name'))
    act(() => result.current.toggleSort('name'))
    act(() => result.current.toggleSort('name'))

    expect(result.current.sort).toBeNull()
  })

  it('resets to ascending when switching to a different field', () => {
    const { result } = renderHook(() => useSortState<string>())

    act(() => result.current.toggleSort('name'))
    act(() => result.current.toggleSort('name')) // now desc
    act(() => result.current.toggleSort('category')) // new field → asc

    expect(result.current.sort).toEqual({ field: 'category', direction: 'asc' })
  })

  it('exposes a stable toggleSort reference across renders', () => {
    const { result, rerender } = renderHook(() => useSortState<string>())
    const first = result.current.toggleSort
    rerender()
    expect(result.current.toggleSort).toBe(first)
  })
})
