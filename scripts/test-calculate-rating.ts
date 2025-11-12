import { calculateRating } from '../services/performanceMonitoring'

function assertEqual<T>(received: T, expected: T, message: string) {
  if (received !== expected) {
    console.error(`❌ ${message}: esperado=${expected}, recebido=${received}`)
    process.exitCode = 1
  } else {
    console.log(`✅ ${message}`)
  }
}

console.log('🔍 Validando calculateRating...')

assertEqual(calculateRating('LCP', 2000), 'good', 'LCP good')
assertEqual(calculateRating('LCP', 3000), 'needs-improvement', 'LCP needs-improvement')
assertEqual(calculateRating('LCP', 4500), 'poor', 'LCP poor')
assertEqual(calculateRating('UNKNOWN' as any, 1234), 'good', 'métrica desconhecida retorna good')

if ((process.exitCode || 0) === 0) {
  console.log('🏁 calculateRating validado com sucesso')
}
