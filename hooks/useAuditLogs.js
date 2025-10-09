import { useState, useEffect, useMemo } from 'react';
import { auditService } from '../services/auditService';
// Use the centralized audit service
const fetchAuditLogs = async () => {
    await new Promise(res => setTimeout(res, 100)); // Minimal delay
    return auditService.getLogs();
};
export const useAuditLogs = ({ filters, currentPage, logsPerPage }) => {
    const [allLogs, setAllLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadLogs = async () => {
            try {
                const logs = await fetchAuditLogs();
                setAllLogs(logs);
            }
            catch (err) {
                setError(err);
            }
            finally {
                setIsLoading(false);
            }
        };
        loadLogs();
    }, []);
    const uniqueActions = useMemo(() => {
        return ['All', ...Array.from(new Set(allLogs.map(log => log.action)))];
    }, [allLogs]);
    const filteredLogs = useMemo(() => {
        return allLogs.filter(log => {
            const userMatch = log.user.toLowerCase().includes(filters.user.toLowerCase()) || log.details.toLowerCase().includes(filters.user.toLowerCase());
            const actionMatch = filters.action === 'All' || log.action === filters.action;
            const dateMatch = !filters.date || new Date(log.timestamp).toISOString().split('T')[0] === filters.date;
            return userMatch && actionMatch && dateMatch;
        });
    }, [allLogs, filters]);
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * logsPerPage;
        return filteredLogs.slice(startIndex, startIndex + logsPerPage);
    }, [filteredLogs, currentPage, logsPerPage]);
    return {
        logs: paginatedLogs,
        totalLogs: filteredLogs.length,
        isLoading,
        error,
        uniqueActions
    };
};
