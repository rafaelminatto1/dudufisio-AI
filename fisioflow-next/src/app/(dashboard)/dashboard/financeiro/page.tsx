import { createClient } from '@/lib/supabase/server'
import { FinancialDashboard } from './_components/financial-dashboard'

export default async function FinanceiroPage() {
  const supabase = await createClient()
  
  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select('*')
    .order('created_at', { ascending: false })

  // Calcular estatísticas
  const total = pagamentos?.reduce((acc, p) => {
    if (p.status === 'pago') {
      return acc + (p.valor || 0)
    }
    return acc
  }, 0) || 0

  const pendente = pagamentos?.reduce((acc, p) => {
    if (p.status === 'pendente') {
      return acc + (p.valor || 0)
    }
    return acc
  }, 0) || 0

  const stats = {
    total,
    pendente,
    recebido: total,
    totalTransacoes: pagamentos?.length || 0,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
        <p className="text-muted-foreground">
          Acompanhe receitas, despesas e relatórios financeiros
        </p>
      </div>

      <FinancialDashboard stats={stats} payments={pagamentos || []} />
    </div>
  )
}

