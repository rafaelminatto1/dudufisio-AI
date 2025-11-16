
import React, { useState, useCallback, memo } from 'react';
import { Calendar as CalendarIcon, User as UserIcon, Type as TypeIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { AuditLogEntry } from '../types';
import { useAuditLogs } from '../hooks/useAuditLogs';
import Pagination from '../components/ui/Pagination';
import { Skeleton } from '../components/ui/skeleton';

// 🚀 Helper function para badge
const getActionBadge = (action: string) => {
    const lowerAction = action.toLowerCase();
    if (lowerAction.includes('create') || lowerAction.includes('assign')) return 'bg-primary-light text-sky-800';
    if (lowerAction.includes('update')) return 'bg-purple-100 text-purple-800';
    if (lowerAction.includes('delete')) return 'bg-error-light text-error';
    if (lowerAction.includes('login_success')) return 'bg-success-light text-success';
    if (lowerAction.includes('failed')) return 'bg-warning-light text-yellow-800';
    if (lowerAction.includes('view')) return 'bg-primary-light text-blue-800';
    if (lowerAction.includes('security')) return 'bg-warning-light text-warning';
    return 'bg-neutral-bgDark text-neutral-text';
};

// 🚀 Componente LogRow memoizado
const LogRow = memo<{ log: AuditLogEntry }>(({ log }) => (
    <tr className="border-b border-neutral-border">
        <td className="p-md whitespace-nowrap text-sm text-neutral-textSecondary font-mono">
            {log.timestamp.toLocaleString('pt-BR')}
        </td>
        <td className="p-md whitespace-nowrap">
            <div className="text-sm font-medium text-neutral-text">{log.user}</div>
        </td>
        <td className="p-md whitespace-nowrap">
            <span className={`px-sm inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadge(log.action)}`}>
                {log.action}
            </span>
        </td>
        <td className="p-md text-sm text-neutral-textSecondary max-w-md truncate" title={log.details}>{log.details}</td>
    </tr>
));
LogRow.displayName = 'LogRow';

const AuditLogPage: React.FC = () => {
    const [filters, setFilters] = useState({ date: '', user: '', action: 'All' });
    const [currentPage, setCurrentPage] = useState(1);
    const LOGS_PER_PAGE = 15;

    const { logs, totalLogs, isLoading, error, uniqueActions } = useAuditLogs({
        filters,
        currentPage,
        logsPerPage: LOGS_PER_PAGE,
    });
    
    // 🚀 Handler memoizado
    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setCurrentPage(1); // Reset to first page on filter change
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={4} className="p-md"><Skeleton className="h-10 w-full" /></td></tr>
            ));
        }
        if (error) {
            return <tr><td colSpan={4} className="text-center p-10 text-red-500">Falha ao carregar logs de auditoria.</td></tr>;
        }
        if (logs.length === 0) {
            return <tr><td colSpan={4} className="text-center p-10 text-neutral-textSecondary">Nenhum log encontrado para os filtros aplicados.</td></tr>;
        }
        return logs.map(log => <LogRow key={log.id} log={log} />);
    };

    return (
        <>
            <PageHeader
                title="Trilha de Auditoria"
                subtitle="Monitore todas as atividades importantes realizadas no sistema."
            />

            <div className="bg-white p-md rounded-t-2xl shadow-card border-b border-neutral-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary" />
                        <input
                            type="text" name="user" placeholder="Buscar por usuário ou detalhes..."
                            value={filters.user} onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                     <div className="relative">
                        <TypeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary" />
                        <select
                            name="action" value={filters.action} onChange={handleFilterChange}
                            className="appearance-none w-full pl-10 pr-4 py-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                        >
                            {uniqueActions.map(action => (
                                <option key={action} value={action}>{action === 'All' ? 'Todas as Ações' : action}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-textTertiary" />
                        <input
                            type="date" name="date" value={filters.date} onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto bg-white shadow-card">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-neutral-bgAlt">
                        <tr>
                            <th scope="col" className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase tracking-wider">Data/Hora</th>
                            <th scope="col" className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase tracking-wider">Usuário</th>
                            <th scope="col" className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase tracking-wider">Ação</th>
                            <th scope="col" className="p-md text-left text-xs font-medium text-neutral-textSecondary uppercase tracking-wider">Detalhes</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {renderContent()}
                    </tbody>
                </table>
            </div>
            <Pagination 
                currentPage={currentPage}
                totalItems={totalLogs}
                itemsPerPage={LOGS_PER_PAGE}
                onPageChange={setCurrentPage}
            />
        </>
    );
};

export default AuditLogPage;