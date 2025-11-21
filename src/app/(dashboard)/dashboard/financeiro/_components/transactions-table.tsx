'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { formatCurrency, formatDateTime } from '~/lib/utils';
import { Badge } from '~/components/ui/badge';

interface TransactionsTableProps {
  transactions: any[];
  onDelete?: (id: string) => Promise<void>;
  onUpdateStatus?: (id: string, newStatus: string) => Promise<void>;
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma transação encontrada
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Data</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((transaction) => (
          <TableRow key={transaction.id}>
            <TableCell>{formatDateTime(transaction.created_at)}</TableCell>
            <TableCell>
              <Badge
                variant={
                  transaction.transaction_type === 'receita' ? 'default' : 'destructive'
                }
              >
                {transaction.transaction_type}
              </Badge>
            </TableCell>
            <TableCell className="font-medium">
              {formatCurrency(Number(transaction.amount))}
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  transaction.payment_status === 'pago'
                    ? 'default'
                    : transaction.payment_status === 'pendente'
                      ? 'secondary'
                      : 'destructive'
                }
              >
                {transaction.payment_status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

