'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Stats = {
  total: number
  pendente: number
  recebido: number
  totalTransacoes: number
}

type Payment = {
  id: string
  valor: number | null
  status: string | null
  descricao: string | null
  created_at: string
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function FinancialDashboard({
  stats,
  payments,
}: {
  stats: Stats
  payments: Payment[]
}) {
  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.total)}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTransacoes} transações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(stats.recebido)}
            </div>
            <p className="text-xs text-muted-foreground">Valores confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {formatCurrency(stats.pendente)}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando pagamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total > 0
                ? ((stats.recebido / stats.total) * 100).toFixed(1)
                : '0'}
              %
            </div>
            <p className="text-xs text-muted-foreground">Pagamentos efetivados</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Transações */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="paid">Pagas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.slice(0, 10).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium">
                        {payment.descricao || 'Sem descrição'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {formatCurrency(payment.valor || 0)}
                      </span>
                      <Badge
                        variant={payment.status === 'pago' ? 'default' : 'secondary'}
                      >
                        {payment.status || 'indefinido'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {payments.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhuma transação encontrada
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paid" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Recebidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments
                  .filter((p) => p.status === 'pago')
                  .slice(0, 10)
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {payment.descricao || 'Sem descrição'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <span className="font-bold text-green-500">
                        {formatCurrency(payment.valor || 0)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments
                  .filter((p) => p.status === 'pendente')
                  .slice(0, 10)
                  .map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">
                          {payment.descricao || 'Sem descrição'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <span className="font-bold text-yellow-500">
                        {formatCurrency(payment.valor || 0)}
                      </span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

