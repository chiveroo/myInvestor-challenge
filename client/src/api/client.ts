export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiFetch<T>(
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(endpoint, init)

  if (!res.ok) {
    throw new ApiError(res.status, `${res.status}: ${res.statusText}`)
  }

  return res.json() as Promise<T>
}
