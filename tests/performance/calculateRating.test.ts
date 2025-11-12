import { describe, it, expect } from 'vitest'
import { calculateRating } from '../../services/performanceMonitoring'

describe('calculateRating', () => {
  it('classifica LCP como good quando <= 2500ms', () => {
    expect(calculateRating('LCP', 2000)).toBe('good')
  })

  it('classifica LCP como needs-improvement quando entre 2500 e 4000ms', () => {
    expect(calculateRating('LCP', 3000)).toBe('needs-improvement')
  })

  it('classifica LCP como poor quando > 4000ms', () => {
    expect(calculateRating('LCP', 4500)).toBe('poor')
  })

  it('retorna good para métricas desconhecidas', () => {
    expect(calculateRating('UNKNOWN', 1234 as any)).toBe('good')
  })
})
