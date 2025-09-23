'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Download, 
  Send,
  FileText, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Mail,
  RefreshCw,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  invoiceNumber: string | null;
  formattedInvoiceNumber: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  discountAmount: number;
  totalTax: number;
  totalAmount: number;
  notes: string | null;
  status: 'draft' | 'issued' | 'paid' | 'cancelled' | 'overdue';
  daysOverdue: number;
  daysUntilDue: number;
  createdAt: string;
  updatedAt: string;
}

interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  metadata?: Record<string, any>;
}

interface InvoiceFilters {
  search: string;
  status: string;
  dateRange: string;
  overdueOnly: boolean;
}

export function InvoiceManager() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: '',
    dateRange: '',
    overdueOnly: false
  });

  useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/financial/invoices?${queryParams}`);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/financial/invoices/${invoiceId}/issue`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadInvoices();
      }
    } catch (error) {
      console.error('Error issuing invoice:', error);
    }
  };

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/financial/invoices/${invoiceId}/mark-paid`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadInvoices();
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/financial/invoices/${invoiceId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadInvoices();
      }
    } catch (error) {
      console.error('Error cancelling invoice:', error);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/financial/invoices/${invoiceId}/send`, {
        method: 'POST',
      });

      if (response.ok) {
        // Show success message
        console.log('Invoice sent successfully');
      }
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/financial/invoices/${invoiceId}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const getStatusBadge = (status: string, daysOverdue: number) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'secondary' as const, icon: Edit },
      issued: { label: 'Emitida', variant: 'default' as const, icon: FileText },
      paid: { label: 'Paga', variant: 'default' as const, icon: CheckCircle },
      overdue: { label: `Vencida (${daysOverdue}d)`, variant: 'destructive' as const, icon: AlertTriangle },
      cancelled: { label: 'Cancelada', variant: 'outline' as const, icon: XCircle }
    };

    // Override for overdue invoices
    if (status === 'issued' && daysOverdue > 0) {
      status = 'overdue';
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
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

  const getInvoiceActions = (invoice: Invoice) => {
    const actions = [];

    if (invoice.status === 'draft') {
      actions.push({
        label: 'Emitir',
        icon: Send,
        onClick: () => handleIssueInvoice(invoice.id),
        variant: 'default' as const
      });
    }

    if (invoice.status === 'issued' || invoice.status === 'overdue') {
      actions.push({
        label: 'Marcar como Paga',
        icon: CheckCircle,
        onClick: () => handleMarkAsPaid(invoice.id),
        variant: 'default' as const
      });
    }

    if (invoice.status !== 'paid' && invoice.status !== 'cancelled') {
      actions.push({
        label: 'Cancelar',
        icon: XCircle,
        onClick: () => handleCancelInvoice(invoice.id),
        variant: 'outline' as const
      });
    }

    if (invoice.status !== 'draft') {
      actions.push({
        label: 'Download',
        icon: Download,
        onClick: () => handleDownloadInvoice(invoice.id),
        variant: 'outline' as const
      });

      actions.push({
        label: 'Enviar',
        icon: Mail,
        onClick: () => handleSendInvoice(invoice.id),
        variant: 'outline' as const
      });
    }

    return actions;
  };

  const filteredInvoices = invoices.filter(invoice => {
    if (filters.search && !invoice.patientName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !invoice.formattedInvoiceNumber.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciar Faturas</h1>
          <p className="text-gray-500 mt-1">
            Crie, emita e gerencie faturas para os pacientes
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nova Fatura
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Rascunhos</p>
                <p className="text-2xl font-bold">
                  {invoices.filter(i => i.status === 'draft').length}
                </p>
              </div>
              <Edit className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Emitidas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {invoices.filter(i => i.status === 'issued').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pagas</p>
                <p className="text-2xl font-bold text-green-600">
                  {invoices.filter(i => i.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {invoices.filter(i => i.daysOverdue > 0).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
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
                placeholder="Buscar por paciente ou número..."
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
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="issued">Emitida</SelectItem>
                <SelectItem value="paid">Paga</SelectItem>
                <SelectItem value="overdue">Vencida</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.dateRange} onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Períodos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Esta Semana</SelectItem>
                <SelectItem value="month">Este Mês</SelectItem>
                <SelectItem value="quarter">Este Trimestre</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={filters.overdueOnly ? "default" : "outline"}
              onClick={() => setFilters(prev => ({ ...prev, overdueOnly: !prev.overdueOnly }))}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Apenas Vencidas
            </Button>

            <Button variant="outline" onClick={() => setFilters({
              search: '',
              status: '',
              dateRange: '',
              overdueOnly: false
            })}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Faturas ({filteredInvoices.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadInvoices}>
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
                    <th className="text-left p-3 font-medium">Número</th>
                    <th className="text-left p-3 font-medium">Paciente</th>
                    <th className="text-left p-3 font-medium">Valor</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Emissão</th>
                    <th className="text-left p-3 font-medium">Vencimento</th>
                    <th className="text-left p-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-mono text-sm">
                          {invoice.formattedInvoiceNumber}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-medium">{invoice.patientName}</div>
                        {invoice.notes && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {invoice.notes}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold">{formatCurrency(invoice.totalAmount)}</div>
                        {invoice.discountAmount > 0 && (
                          <div className="text-sm text-gray-500">
                            Desconto: {formatCurrency(invoice.discountAmount)}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(invoice.status, invoice.daysOverdue)}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(invoice.issueDate)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(invoice.dueDate)}
                          {invoice.daysUntilDue < 0 && (
                            <span className="text-red-500 ml-1">
                              ({Math.abs(invoice.daysUntilDue)}d atraso)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowDetails(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          {getInvoiceActions(invoice).slice(0, 2).map((action, index) => (
                            <Button
                              key={index}
                              variant={action.variant}
                              size="sm"
                              onClick={action.onClick}
                            >
                              <action.icon className="w-4 h-4" />
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">Nenhuma fatura encontrada</p>
                  <p>Tente ajustar os filtros ou criar uma nova fatura.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Fatura</DialogTitle>
          </DialogHeader>
          
          {selectedInvoice && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="items">Itens</TabsTrigger>
                <TabsTrigger value="actions">Ações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Número da Fatura</label>
                      <p className="text-xl font-bold font-mono">{selectedInvoice.formattedInvoiceNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Paciente</label>
                      <p className="text-lg font-semibold">{selectedInvoice.patientName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedInvoice.status, selectedInvoice.daysOverdue)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Emissão</label>
                      <p>{formatDate(selectedInvoice.issueDate)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Vencimento</label>
                      <p>{formatDate(selectedInvoice.dueDate)}</p>
                      {selectedInvoice.daysUntilDue < 0 && (
                        <p className="text-sm text-red-500">
                          {Math.abs(selectedInvoice.daysUntilDue)} dias em atraso
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor Total</label>
                      <p className="text-2xl font-bold">{formatCurrency(selectedInvoice.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h3 className="font-semibold">Resumo Financeiro</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(selectedInvoice.subtotal)}</span>
                    </div>
                    {selectedInvoice.discountAmount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Desconto:</span>
                        <span className="font-medium">-{formatCurrency(selectedInvoice.discountAmount)}</span>
                      </div>
                    )}
                    {selectedInvoice.totalTax > 0 && (
                      <div className="flex justify-between">
                        <span>Impostos:</span>
                        <span className="font-medium">{formatCurrency(selectedInvoice.totalTax)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Observações</label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-lg">{selectedInvoice.notes}</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="items" className="space-y-4">
                <div className="space-y-3">
                  <h3 className="font-semibold">Itens da Fatura</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 font-medium">Descrição</th>
                          <th className="text-center p-3 font-medium">Qtd</th>
                          <th className="text-right p-3 font-medium">Valor Unit.</th>
                          <th className="text-right p-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.lineItems.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-3">
                              <div className="font-medium">{item.description}</div>
                              {item.metadata && (
                                <div className="text-sm text-gray-500">
                                  {Object.entries(item.metadata).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </td>
                            <td className="text-center p-3">{item.quantity}</td>
                            <td className="text-right p-3">{formatCurrency(item.unitPrice)}</td>
                            <td className="text-right p-3 font-medium">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold">Ações Disponíveis</h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {getInvoiceActions(selectedInvoice).map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant}
                        onClick={action.onClick}
                        className="justify-start"
                      >
                        <action.icon className="w-4 h-4 mr-2" />
                        {action.label}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Histórico</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Fatura criada em {formatDate(selectedInvoice.createdAt)}</span>
                      </div>
                      {selectedInvoice.status !== 'draft' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Fatura emitida</span>
                        </div>
                      )}
                      {selectedInvoice.status === 'paid' && (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Pagamento confirmado</span>
                        </div>
                      )}
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