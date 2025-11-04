import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { TestEvolutionData } from '../../types';
import * as testEvolutionService from '../../services/testEvolutionService';

/**
 * Tabela de evolução com ordenação, filtros e export
 * Permite visualizar dados em formato tabular
 * Export para CSV
 */

interface EvolutionTableProps {
  data: TestEvolutionData[];
  testName: string;
  itemsPerPage?: number;
}

type SortColumn = 'sessionNumber' | 'value' | 'variation' | 'percentChange';
type SortDirection = 'asc' | 'desc';

export const EvolutionTable: React.FC<EvolutionTableProps> = ({
  data,
  testName,
  itemsPerPage = 10,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>('sessionNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Ordenação
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];

      // Handle undefined values
      if (aVal === undefined) aVal = 0;
      if (bVal === undefined) bVal = 0;

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [data, sortColumn, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedData.slice(start, end);
  }, [sortedData, currentPage, itemsPerPage]);

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExport = () => {
    const csv = testEvolutionService.exportToCSV(data, testName);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `evolucao_${testName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortableHeader: React.FC<{ column: SortColumn; label: string }> = ({ column, label }) => (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
      <button
        onClick={() => handleSort(column)}
        className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
      >
        <span>{label}</span>
        <ArrowUpDown className={`w-3 h-3 ${
          sortColumn === column ? 'text-blue-600' : 'text-slate-400'
        }`} />
      </button>
    </th>
  );

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <p>Nenhum dado disponível para exibir</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Header com título e export */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <h4 className="font-semibold text-slate-900">Tabela de Evolução</h4>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="flex items-center space-x-2"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Exportar CSV</span>
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <SortableHeader column="sessionNumber" label="Sessão" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Data
              </th>
              <SortableHeader column="value" label="Valor" />
              <SortableHeader column="variation" label="Variação" />
              <SortableHeader column="percentChange" label="%" />
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Observações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {paginatedData.map((item, index) => {
              const isPositiveVariation = (item.variation || 0) > 0;
              const isNegativeVariation = (item.variation || 0) < 0;

              return (
                <tr
                  key={`${item.sessionNumber}-${index}`}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    #{item.sessionNumber}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(item.sessionDate).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                    {item.value} {item.unit}
                    {item.side && (
                      <span className="ml-1 text-xs text-slate-500">
                        ({item.side === 'left' ? 'E' : item.side === 'right' ? 'D' : 'Bil'})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.variation !== undefined ? (
                      <span className={
                        isPositiveVariation
                          ? 'text-green-600 font-medium'
                          : isNegativeVariation
                          ? 'text-red-600 font-medium'
                          : 'text-slate-500'
                      }>
                        {isPositiveVariation && '+'}
                        {item.variation.toFixed(1)} {item.unit}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {item.percentChange !== undefined ? (
                      <span className={
                        item.percentChange > 0
                          ? 'text-green-600 font-medium'
                          : item.percentChange < 0
                          ? 'text-red-600 font-medium'
                          : 'text-slate-500'
                      }>
                        {item.percentChange > 0 && '+'}
                        {item.percentChange.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {item.notes ? (
                      <span title={item.notes}>
                        {item.notes.length > 50
                          ? `${item.notes.substring(0, 50)}...`
                          : item.notes}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200">
          <div className="text-sm text-slate-600">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a{' '}
            {Math.min(currentPage * itemsPerPage, data.length)} de {data.length} registros
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolutionTable;

