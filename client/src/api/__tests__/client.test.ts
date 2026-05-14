import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/msw/server'
import { ApiError, apiFetch } from '../client'

describe('apiFetch', () => {
  it('returns parsed JSON on a successful response', async () => {
    server.use(
      http.get('http://localhost/test', () =>
        HttpResponse.json({ value: 42 })
      )
    )
    const result = await apiFetch<{ value: number }>('/test')
    expect(result).toEqual({ value: 42 })
  })

  it('throws ApiError with the response status on a non-ok response', async () => {
    server.use(
      http.get('http://localhost/test', () =>
        new HttpResponse(null, { status: 404, statusText: 'Not Found' })
      )
    )
    await expect(apiFetch('/test')).rejects.toThrow(ApiError)
    await expect(apiFetch('/test')).rejects.toMatchObject({ status: 404 })
  })

  it('sets the error name to "ApiError"', async () => {
    server.use(
      http.get('http://localhost/test', () =>
        new HttpResponse(null, { status: 500, statusText: 'Server Error' })
      )
    )
    try {
      await apiFetch('/test')
    } catch (err) {
      expect((err as ApiError).name).toBe('ApiError')
    }
  })
})
