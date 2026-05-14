import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { buyFund, getFunds, transferFund } from '../funds'
import { getPortfolio } from '../portfolio'
import { server } from '@/test/msw/server'

describe('API wrappers', () => {
  it('returns the portfolio payload from the portfolio endpoint', async () => {
    const portfolio = {
      totalValue: 1234.56,
      totalInvested: 1000,
      totalProfitability: 23.46,
      holdings: [],
    }

    server.use(
      http.get('http://localhost/api/portfolio', () => HttpResponse.json(portfolio))
    )

    await expect(getPortfolio()).resolves.toEqual(portfolio)
  })

  it('returns funds from the funds endpoint with query params', async () => {
    const funds = {
      data: [
        {
          id: 'fund-1',
          name: 'Global Equity',
          category: 'Equity',
          price: 101.5,
          profitability: 8.2,
          minimumInvestment: 100,
          risk: 'HIGH',
        },
      ],
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
    }

    server.use(
      http.get('http://localhost/api/funds', ({ request }) => {
        const url = new URL(request.url)

        expect(url.searchParams.get('page')).toBe('2')
        expect(url.searchParams.get('limit')).toBe('5')
        expect(url.searchParams.get('sort')).toBe('name:asc')

        return HttpResponse.json(funds)
      })
    )

    await expect(
      getFunds({
        page: 2,
        limit: 5,
        sort: { field: 'name', direction: 'asc' },
      })
    ).resolves.toEqual(funds)
  })

  it('posts the buy payload to the fund buy endpoint', async () => {
    let requestBody: unknown
    let contentType: string | null = null

    server.use(
      http.post('http://localhost/api/funds/fund-1/buy', async ({ request }) => {
        requestBody = await request.json()
        contentType = request.headers.get('content-type')

        return HttpResponse.json({ message: 'ok' })
      })
    )

    await expect(buyFund('fund-1', 3)).resolves.toEqual({ message: 'ok' })
    expect(requestBody).toEqual({ quantity: 3 })
    expect(contentType).toBe('application/json')
  })

  it('posts the transfer payload to the funds transfer endpoint', async () => {
    let requestBody: unknown
    let contentType: string | null = null

    server.use(
      http.post('http://localhost/api/funds/transfer', async ({ request }) => {
        requestBody = await request.json()
        contentType = request.headers.get('content-type')

        return HttpResponse.json({ message: 'ok' })
      })
    )

    await expect(transferFund('fund-1', 'fund-2', 3.25)).resolves.toEqual({ message: 'ok' })
    expect(requestBody).toEqual({ fromFundId: 'fund-1', toFundId: 'fund-2', quantity: 3.25 })
    expect(contentType).toBe('application/json')
  })
})
