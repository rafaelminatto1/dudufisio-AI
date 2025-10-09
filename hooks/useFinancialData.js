// hooks/useFinancialData.ts
import { useState, useEffect, useCallback } from 'react';
import { TransactionType } from '../types';
import * as financialService from '../services/financialService';
import * as patientService from '../services/patientService';
const useFinancialData = (period) => {
    const [data, setData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [fetchedTransactions, allPatients] = await Promise.all([
                financialService.getTransactions(period),
                patientService.getAllPatients(),
            ]);
            setTransactions(fetchedTransactions);
            // Process KPIs
            const revenues = fetchedTransactions.filter(t => t.type === TransactionType.Receita);
            const expenses = fetchedTransactions.filter(t => t.type === TransactionType.Despesa);
            const grossRevenue = revenues.reduce((sum, t) => sum + t.amount, 0);
            const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
            const netProfit = grossRevenue - totalExpenses;
            const averageTicket = revenues.length > 0 ? grossRevenue / revenues.length : 0;
            const activePatients = allPatients.filter(p => p.status === 'Active').length;
            // Process Chart Data
            const flowMap = new Map();
            fetchedTransactions.forEach(t => {
                const dateKey = new Date(t.date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
                const entry = flowMap.get(dateKey) || { Receita: 0, Despesa: 0 };
                if (t.type === TransactionType.Receita) {
                    entry.Receita += t.amount;
                }
                else {
                    entry.Despesa += t.amount;
                }
                flowMap.set(dateKey, entry);
            });
            const cashFlowData = Array.from(flowMap.entries())
                .map(([date, values]) => ({ date, ...values }))
                .sort((a, b) => {
                const [dayA, monthA] = a.date.split(' de ');
                const [dayB, monthB] = b.date.split(' de ');
                // A simple sort for "dd de mmm" format
                const monthOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
                const monthIndexA = monthOrder.indexOf(monthA || '');
                const monthIndexB = monthOrder.indexOf(monthB || '');
                if (monthIndexA !== monthIndexB)
                    return monthIndexA - monthIndexB;
                return parseInt(dayA || '0') - parseInt(dayB || '0');
            });
            // Process Breakdown Data
            const revenueBreakdownMap = new Map();
            revenues.forEach(t => {
                const current = revenueBreakdownMap.get(t.category) || 0;
                revenueBreakdownMap.set(t.category, current + t.amount);
            });
            const revenueBreakdown = Array.from(revenueBreakdownMap.entries()).map(([name, value]) => ({ name, value }));
            const expenseBreakdownMap = new Map();
            expenses.forEach(t => {
                const current = expenseBreakdownMap.get(t.category) || 0;
                expenseBreakdownMap.set(t.category, current + t.amount);
            });
            const expenseBreakdown = Array.from(expenseBreakdownMap.entries()).map(([name, value]) => ({ name, value }));
            setData({
                kpis: { grossRevenue, totalExpenses, netProfit, activePatients, averageTicket },
                cashFlowData,
                revenueBreakdown,
                expenseBreakdown
            });
            setError(null);
        }
        catch (err) {
            setError(err);
        }
        finally {
            setIsLoading(false);
        }
    }, [period]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    return { data, transactions, isLoading, error, refetch: fetchData };
};
export default useFinancialData;
