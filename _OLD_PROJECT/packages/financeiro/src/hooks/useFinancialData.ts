import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabaseClient';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  sessions: number;
}

export interface RevenueCategory {
  name: string;
  value: number;
  color: string;
}

export interface FinancialRealData {
  revenueData: RevenueData[];
  categories: RevenueCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook para buscar dados financeiros reais do Supabase
 * Retorna dados dos últimos 6 meses agregados por mês
 */
export default function useFinancialData(): FinancialRealData {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [categories, setCategories] = useState<RevenueCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar transações dos últimos 6 meses
      const sixMonthsAgo = subMonths(new Date(), 6);
      
      const { data: transactions, error: fetchError } = await supabase
        .from('financial_transactions')
        .select('*')
        .gte('date', sixMonthsAgo.toISOString())
        .order('date', { ascending: true });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      if (!transactions || transactions.length === 0) {
        // Se não houver dados, retornar dados mock para desenvolvimento
        setRevenueData(getMockRevenueData());
        setCategories(getMockCategories());
        setLoading(false);
        return;
      }

      // Processar dados por mês
      const monthlyData = processMonthlyData(transactions);
      setRevenueData(monthlyData);

      // Processar categorias
      const categoryData = processCategoryData(transactions);
      setCategories(categoryData);

    } catch (err: any) {
      console.error('Erro ao buscar dados financeiros:', err);
      setError(err.message || 'Erro ao carregar dados financeiros');
      
      // Em caso de erro, usar dados mock
      setRevenueData(getMockRevenueData());
      setCategories(getMockCategories());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    revenueData,
    categories,
    loading,
    error,
    refetch: fetchData
  };
}

// Export nomeado para compatibilidade
export { useFinancialData as useFinancialRealData };

/**
 * Processa transações agrupando por mês
 */
function processMonthlyData(transactions: any[]): RevenueData[] {
  const monthMap = new Map<string, RevenueData>();

  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = format(date, 'yyyy-MM');
    const monthLabel = format(date, 'MMM', { locale: ptBR });

    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthLabel,
        revenue: 0,
        expenses: 0,
        profit: 0,
        sessions: 0
      });
    }

    const monthData = monthMap.get(monthKey)!;
    const amount = transaction.amount || 0;

    if (transaction.type === 'income' || transaction.type === 'revenue') {
      monthData.revenue += amount;
      if (transaction.category === 'session' || transaction.category === 'consulta') {
        monthData.sessions += 1;
      }
    } else if (transaction.type === 'expense') {
      monthData.expenses += amount;
    }

    monthData.profit = monthData.revenue - monthData.expenses;
  });

  // Converter para array e ordenar por data
  return Array.from(monthMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([_, data]) => data);
}

/**
 * Processa categorias de receita
 */
function processCategoryData(transactions: any[]): RevenueCategory[] {
  const categoryMap = new Map<string, number>();

  transactions.forEach(transaction => {
    if (transaction.type === 'income' || transaction.type === 'revenue') {
      const category = transaction.category || 'Outros';
      const amount = transaction.amount || 0;
      categoryMap.set(category, (categoryMap.get(category) || 0) + amount);
    }
  });

  const categoryColors: Record<string, string> = {
    'consulta': '#3b82f6',
    'session': '#3b82f6',
    'exame': '#10b981',
    'exam': '#10b981',
    'produto': '#f59e0b',
    'product': '#f59e0b',
    'plano': '#8b5cf6',
    'plan': '#8b5cf6',
    'outros': '#6b7280',
    'other': '#6b7280'
  };

  return Array.from(categoryMap.entries())
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: categoryColors[name.toLowerCase()] || '#6b7280'
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Dados mock para desenvolvimento/fallback
 */
function getMockRevenueData(): RevenueData[] {
  return [
    { month: 'Jan', revenue: 45000, expenses: 28000, profit: 17000, sessions: 120 },
    { month: 'Fev', revenue: 52000, expenses: 30000, profit: 22000, sessions: 135 },
    { month: 'Mar', revenue: 48000, expenses: 29000, profit: 19000, sessions: 128 },
    { month: 'Abr', revenue: 55000, expenses: 32000, profit: 23000, sessions: 145 },
    { month: 'Mai', revenue: 58000, expenses: 33000, profit: 25000, sessions: 152 },
    { month: 'Jun', revenue: 62000, expenses: 35000, profit: 27000, sessions: 165 }
  ];
}

/**
 * Categorias mock para desenvolvimento/fallback
 */
function getMockCategories(): RevenueCategory[] {
  return [
    { name: 'Consultas', value: 35000, color: '#3b82f6' },
    { name: 'Exames', value: 15000, color: '#10b981' },
    { name: 'Produtos', value: 8000, color: '#f59e0b' },
    { name: 'Planos', value: 4000, color: '#8b5cf6' }
  ];
}

