import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Database, ChevronRight, ChevronDown, Table } from 'lucide-react';
import { Badge } from '../ui/badge';

interface DataTable {
  name: string;
  rowCount: number;
  columns: string[];
  lastUpdated?: Date;
}

interface BIDataPreviewProps {
  tables: DataTable[];
  onTableSelect?: (tableName: string) => void;
}

export const BIDataPreview: React.FC<BIDataPreviewProps> = ({
  tables,
  onTableSelect
}) => {
  const [expandedTable, setExpandedTable] = useState<string | null>(null);

  const toggleTable = (tableName: string) => {
    setExpandedTable(expandedTable === tableName ? null : tableName);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  if (tables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Preview do Data Warehouse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhuma tabela disponível</p>
            <p className="text-sm mt-1">Execute a inicialização do sistema para popular o Data Warehouse</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Preview do Data Warehouse
          </CardTitle>
          <Badge variant="secondary">
            {tables.length} {tables.length === 1 ? 'Tabela' : 'Tabelas'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {tables.map((table) => (
            <div
              key={table.name}
              className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
            >
              <div
                className="flex items-center justify-between p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleTable(table.name)}
              >
                <div className="flex items-center gap-3 flex-1">
                  {expandedTable === table.name ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Table className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{table.name}</div>
                    {table.lastUpdated && (
                      <div className="text-xs text-muted-foreground">
                        Atualizado: {new Date(table.lastUpdated).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">
                    {formatNumber(table.rowCount)} registros
                  </Badge>
                  {onTableSelect && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTableSelect(table.name);
                      }}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Ver Dados
                    </button>
                  )}
                </div>
              </div>

              {expandedTable === table.name && (
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="mb-2 text-sm font-semibold text-muted-foreground">
                    Colunas ({table.columns.length}):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {table.columns.map((column, index) => (
                      <Badge key={`${column}-${index}`} variant="secondary" className="text-xs">
                        {column}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(tables.reduce((sum, t) => sum + t.rowCount, 0))}
              </div>
              <div className="text-xs text-muted-foreground">Total de Registros</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {tables.reduce((sum, t) => sum + t.columns.length, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total de Colunas</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

