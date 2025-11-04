import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DollarSign, BarChart3, Calendar, Users, TrendingUp, TrendingDown } from 'lucide-react';

interface FinancialMetrics {
  monthlyRevenue: number;
  averageTicket: number;
  occupancyRate: number;
  partnerCommissions: number;
  revenueGrowth: number;
  ticketGrowth: number;
}

interface FinancialMetricsCardsProps {
  data: FinancialMetrics;
  isLoading?: boolean;
}

const FinancialMetricsCards: React.FC<FinancialMetricsCardsProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Faturamento Mensal</CardTitle>
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            R$ {data.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center text-sm">
            {data.revenueGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
            )}
            <span className={data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
              {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth}%
            </span>
            <span className="text-slate-500 ml-1">vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            R$ {data.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="flex items-center text-sm">
            {data.ticketGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 mr-1 text-red-600" />
            )}
            <span className={data.ticketGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
              {data.ticketGrowth >= 0 ? '+' : ''}{data.ticketGrowth}%
            </span>
            <span className="text-slate-500 ml-1">vs mês anterior</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Taxa de Ocupação</CardTitle>
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-purple-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {data.occupancyRate}%
          </div>
          <div className="text-sm text-slate-500">
            da agenda está ocupada
          </div>
          <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${data.occupancyRate}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Comissões Parceiros</CardTitle>
          <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
            <Users className="h-5 w-5 text-orange-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-900 mb-1">
            R$ {data.partnerCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-sm text-slate-500">
            {((data.partnerCommissions / data.monthlyRevenue) * 100).toFixed(1)}% do faturamento
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialMetricsCards;
