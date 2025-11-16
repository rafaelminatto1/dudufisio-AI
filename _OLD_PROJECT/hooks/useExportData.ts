import { useCallback } from 'react';
import { toast } from 'sonner';

export type ExportFormat = 'csv' | 'json' | 'xlsx';

export interface ExportConfig<T> {
  filename?: string;
  columns?: Array<{
    key: keyof T | string;
    label: string;
    format?: (value: any) => string;
  }>;
  includeHeaders?: boolean;
}

export function useExportData<T extends Record<string, any>>() {
  const exportToCSV = useCallback(
    (data: T[], config: ExportConfig<T> = {}) => {
      try {
        const {
          filename = 'export',
          columns,
          includeHeaders = true,
        } = config;

        if (data.length === 0) {
          toast.error('Não há dados para exportar');
          return;
        }

        // Get columns
        const cols = columns || Object.keys(data[0]).map((key) => ({
          key,
          label: key,
        }));

        // Build CSV content
        let csv = '';

        // Headers
        if (includeHeaders) {
          csv = cols.map((col) => `"${col.label}"`).join(',') + '\n';
        }

        // Data rows
        data.forEach((row) => {
          const values = cols.map((col) => {
            const value = row[col.key as keyof T];
            const formatted = col.format ? col.format(value) : value;
            return `"${String(formatted).replace(/"/g, '""')}"`;
          });
          csv += values.join(',') + '\n';
        });

        // Create and download file
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Dados exportados com sucesso!');
      } catch (error) {
        console.error('Error exporting CSV:', error);
        toast.error('Erro ao exportar dados');
      }
    },
    []
  );

  const exportToJSON = useCallback(
    (data: T[], config: ExportConfig<T> = {}) => {
      try {
        const { filename = 'export', columns } = config;

        if (data.length === 0) {
          toast.error('Não há dados para exportar');
          return;
        }

        // Filter columns if specified
        let exportData = data;
        if (columns) {
          exportData = data.map((row) => {
            const filtered: any = {};
            columns.forEach((col) => {
              const value = row[col.key as keyof T];
              filtered[col.label] = col.format ? col.format(value) : value;
            });
            return filtered;
          });
        }

        // Create and download file
        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.json`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('Dados exportados com sucesso!');
      } catch (error) {
        console.error('Error exporting JSON:', error);
        toast.error('Erro ao exportar dados');
      }
    },
    []
  );

  const exportToPrint = useCallback(
    (data: T[], config: ExportConfig<T> = {}) => {
      try {
        const { columns } = config;

        if (data.length === 0) {
          toast.error('Não há dados para imprimir');
          return;
        }

        // Get columns
        const cols = columns || Object.keys(data[0]).map((key) => ({
          key,
          label: key,
        }));

        // Build HTML table
        let html = '<html><head><style>';
        html += 'table { border-collapse: collapse; width: 100%; }';
        html += 'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }';
        html += 'th { background-color: #f2f2f2; font-weight: bold; }';
        html += 'tr:nth-child(even) { background-color: #f9f9f9; }';
        html += '</style></head><body>';
        html += '<table>';

        // Headers
        html += '<thead><tr>';
        cols.forEach((col) => {
          html += `<th>${col.label}</th>`;
        });
        html += '</tr></thead>';

        // Data rows
        html += '<tbody>';
        data.forEach((row) => {
          html += '<tr>';
          cols.forEach((col) => {
            const value = row[col.key as keyof T];
            const formatted = col.format ? col.format(value) : value;
            html += `<td>${formatted}</td>`;
          });
          html += '</tr>';
        });
        html += '</tbody></table></body></html>';

        // Open print window
        const printWindow = window.open('', '', 'width=800,height=600');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.focus();
          printWindow.print();
        }
      } catch (error) {
        console.error('Error printing data:', error);
        toast.error('Erro ao imprimir dados');
      }
    },
    []
  );

  const copyToClipboard = useCallback(
    async (data: T[], config: ExportConfig<T> = {}) => {
      try {
        const { columns } = config;

        if (data.length === 0) {
          toast.error('Não há dados para copiar');
          return;
        }

        // Get columns
        const cols = columns || Object.keys(data[0]).map((key) => ({
          key,
          label: key,
        }));

        // Build tab-separated text
        let text = cols.map((col) => col.label).join('\t') + '\n';
        data.forEach((row) => {
          const values = cols.map((col) => {
            const value = row[col.key as keyof T];
            return col.format ? col.format(value) : value;
          });
          text += values.join('\t') + '\n';
        });

        // Copy to clipboard
        await navigator.clipboard.writeText(text);
        toast.success('Dados copiados para área de transferência!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
        toast.error('Erro ao copiar dados');
      }
    },
    []
  );

  return {
    exportToCSV,
    exportToJSON,
    exportToPrint,
    copyToClipboard,
  };
}

