import { http, HttpResponse } from 'msw'
import { mockFunds } from './fixtures'

// MSW intercepts fetch at the Node.js level in jsdom.
// Relative URLs resolve against jsdom's default origin (http://localhost).
const BASE = 'http://localhost'

export const handlers = [
  http.get(`${BASE}/api/funds`, ({ request }) => {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const limit = parseInt(url.searchParams.get('limit') ?? '10', 10)

    const start = (page - 1) * limit
    const data = mockFunds.slice(start, start + limit)

    return HttpResponse.json({
      pagination: {
        page,
        limit,
        totalFunds: mockFunds.length,
        totalPages: Math.ceil(mockFunds.length / limit),
      },
      data,
    })
  }),

  http.post(`${BASE}/api/funds/:id/buy`, () => {
    return HttpResponse.json({ message: 'Compra realizada con éxito' })
  }),
]
