'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  CreditCard,
  RefreshCw,
  Download,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Transaction {
  id: string;
  patientId: string;
  patientName: string;
  type: 'package_purchase' | 'single_session' | 'installment' | 'refund' | 'adjustment' | 'expense';
  amount: number;
  netAmount: number;
  taxAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  paymentMethod: {
    type: string;
    displayName: string;
  };
  dueDate: string;
  paidDate?: string;
  description?: string;
  installments: number;
  installmentNumber: number;
  createdAt: string;
  updatedAt: string;
}

interface TransactionFilters {
  search: string;
  status: string;
  type: string;
  paymentMethod: string;
  dateRange: string;
}

export function TransactionManager() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    status: '',
    type: '',
    paymentMethod: '',
    dateRange: ''
  });

  useEffect(() => {
    loadTransactions();
  }, [filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/financial/transactions?${queryParams}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (transactionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/financial/transactions/${transactionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await loadTransactions();
      }
    } catch (error) {
      console.error('Error updating transaction status:', error);
    }
  };

  const handleProcessPayment = async (transactionId: string) => {
    try {
      const response = await fetch(`/api/financial/transactions/${transactionId}/process-payment`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadTransactions();
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendente', variant: 'secondary' as const, icon: Clock },
      paid: { label: 'Pago', variant: 'default' as const, icon: CheckCircle },
      overdue: { label: 'Em Atraso', variant: 'destructive' as const, icon: AlertTriangle },
      cancelled: { label: 'Cancelado', variant: 'outline' as const, icon: XCircle },
      refunded: { label: 'Reembolsado', variant: 'outline' as const, icon: RefreshCw }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      package_purchase: 'Compra de Pacote',
      single_session: 'Sessão Avulsa',
      installment: 'Parcela',
      refund: 'Reembolso',
      adjustment: 'Ajuste',
      expense: 'Despesa'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filters.search && !transaction.patientName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !transaction.description?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Transações</h1>
          <p className="text-gray-500 mt-1">
            Visualize e gerencie todas as transações financeiras
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transação
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por paciente ou descrição..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Status</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Em Atraso</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="refunded">Reembolsado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Tipos</SelectItem>
                <SelectItem value="package_purchase">Compra de Pacote</SelectItem>
                <SelectItem value="single_session">Sessão Avulsa</SelectItem>
                <SelectItem value="installment">Parcela</SelectItem>
                <SelectItem value="refund">Reembolso</SelectItem>
                <SelectItem value="adjustment">Ajuste</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.paymentMethod} onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Método de Pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Métodos</SelectItem>
                <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="bank_slip">Boleto</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => setFilters({
              search: '',
              status: '',
              type: '',
              paymentMethod: '',
              dateRange: ''
            })}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações ({filteredTransactions.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadTransactions}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Paciente</th>
                    <th className="text-left p-3 font-medium">Tipo</th>
                    <th className="text-left p-3 font-medium">Valor</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Vencimento</th>
                    <th className="text-left p-3 font-medium">Pagamento</th>
                    <th className="text-left p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{transaction.patientName}</div>
                          <div className="text-sm text-gray-500">{transaction.description}</div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {getTypeLabel(transaction.type)}
                        </Badge>
                        {transaction.installments > 1 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {transaction.installmentNumber}/{transaction.installments}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold">{formatCurrency(transaction.amount)}</div>
                        {transaction.taxAmount > 0 && (
                          <div className="text-sm text-gray-500">
                            Líquido: {formatCurrency(transaction.netAmount)}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(transaction.dueDate)}
                        </div>
                      </td>
                      <td className="p-3">
                        {transaction.paidDate ? (
                          <div className="flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            {formatDate(transaction.paidDate)}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Não pago</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {transaction.status === 'pending' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleProcessPayment(transaction.id)}
                            >
                              <CreditCard className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhuma transação encontrada</p>
                  <p>Tente ajustar os filtros ou criar uma nova transação.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>
          
          {selectedTransaction && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="payment">Pagamento</TabsTrigger>
                <TabsTrigger value="history">Histórico</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID da Transação</label>
                    <p className="font-mono text-sm">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Paciente</label>
                    <p>{selectedTransaction.patientName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo</label>
                    <p>{getTypeLabel(selectedTransaction.type)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Total</label>
                    <p className="text-lg font-bold">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor Líquido</label>
                    <p className="text-lg font-bold">{formatCurrency(selectedTransaction.netAmount)}</p>
                  </div>
                  {selectedTransaction.installments > 1 && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Parcelas</label>
                        <p>{selectedTransaction.installmentNumber}/{selectedTransaction.installments}</p>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Método de Pagamento</label>
                    <p>{selectedTransaction.paymentMethod.displayName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Vencimento</label>
                    <p>{formatDate(selectedTransaction.dueDate)}</p>
                  </div>
                  {selectedTransaction.paidDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Pagamento</label>
                      <p>{formatDate(selectedTransaction.paidDate)}</p>
                    </div>
                  )}
                  {selectedTransaction.taxAmount > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Impostos</label>
                      <p>{formatCurrency(selectedTransaction.taxAmount)}</p>
                    </div>
                  )}
                </div>
                
                {selectedTransaction.status === 'pending' && (
                  <div className="flex gap-2 mt-6">
                    <Button onClick={() => handleProcessPayment(selectedTransaction.id)}>
                      Processar Pagamento
                    </Button>
                    <Button variant="outline" onClick={() => handleStatusUpdate(selectedTransaction.id, 'cancelled')}>
                      Cancelar
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="history" className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Transação criada</p>
                      <p className="text-sm text-gray-500">{formatDate(selectedTransaction.createdAt)}</p>
                    </div>
                  </div>
                  
                  {selectedTransaction.paidDate && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="font-medium">Pagamento confirmado</p>
                        <p className="text-sm text-gray-500">{formatDate(selectedTransaction.paidDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="font-medium">Última atualização</p>
                      <p className="text-sm text-gray-500">{formatDate(selectedTransaction.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
