// services/supplies/reportsService.ts
import { supabase } from '../../lib/supabaseClient';
import { 
  Supply, 
  StockMovement, 
  SupplyConsumptionReport,
  StockValuationReport,
  SupplyCategory,
  TaskCostSummary
} from '../../types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// ============================================================================
// TIPOS DE RELATÓRIOS
// ============================================================================

export interface PeriodFilter {
  startDate: string;
  endDate: string;
}

export interface ConsumptionByPeriodReport {
  period: PeriodFilter;
  totalConsumed: number;
  totalCost: number;
  itemsCount: number;
  topSupplies: {
    id: string;
    name: string;
    category: SupplyCategory;
    quantityConsumed: number;
    totalCost: number;
    percentageOfTotal: number;
  }[];
  dailyConsumption: {
    date: string;
    quantity: number;
    cost: number;
  }[];
  categoryBreakdown: {
    category: SupplyCategory;
    quantity: number;
    cost: number;
    percentage: number;
  }[];
}

export interface ProcedureCostAnalysis {
  procedureType: string;
  procedureCount: number;
  averageSupplyCost: number;
  totalSupplyCost: number;
  supplies: {
    id: string;
    name: string;
    averageQuantity: number;
    averageCost: number;
    frequency: number;
  }[];
  trends: {
    month: string;
    cost: number;
    count: number;
  }[];
}

export interface SupplyMovementReport {
  supply: Supply;
  period: PeriodFilter;
  openingStock: number;
  closingStock: number;
  totalReceived: number;
  totalConsumed: number;
  totalAdjustments: number;
  stockTurnover: number;
  movements: StockMovement[];
  valueAnalysis: {
    openingValue: number;
    closingValue: number;
    consumedValue: number;
    receivedValue: number;
  };
}

// ============================================================================
// SERVIÇO DE RELATÓRIOS
// ============================================================================

class SupplyReportsService {
  
  /**
   * Gera relatório de consumo por período
   */
  async generateConsumptionByPeriodReport(
    period: PeriodFilter,
    categoryFilter?: SupplyCategory,
    supplierFilter?: string
  ): Promise<ConsumptionByPeriodReport> {
    try {
      // Buscar movimentações do período
      const query = supabase
        .from('stock_movements')
        .select(`
          *,
          supply:supplies(
            id, name, category, unit_cost, supplier_id
          )
        `)
        .eq('movement_type', 'saida')
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate);

      const { data: movements, error } = await query;
      if (error) throw error;

      // Filtrar por categoria ou fornecedor se especificado
      let filteredMovements = movements || [];
      if (categoryFilter) {
        filteredMovements = filteredMovements.filter(m => m.supply?.category === categoryFilter);
      }
      if (supplierFilter) {
        filteredMovements = filteredMovements.filter(m => m.supply?.supplier_id === supplierFilter);
      }

      // Calcular totais
      const totalConsumed = filteredMovements.reduce((sum, m) => sum + (m.quantity || 0), 0);
      const totalCost = filteredMovements.reduce((sum, m) => sum + (m.total_cost || 0), 0);

      // Agrupar por insumo
      const supplyMap = new Map<string, any>();
      filteredMovements.forEach(movement => {
        const supplyId = movement.supply_id;
        if (!supplyMap.has(supplyId)) {
          supplyMap.set(supplyId, {
            id: supplyId,
            name: movement.supply?.name || 'Unknown',
            category: movement.supply?.category || 'outros',
            quantityConsumed: 0,
            totalCost: 0
          });
        }
        const supply = supplyMap.get(supplyId);
        supply.quantityConsumed += movement.quantity || 0;
        supply.totalCost += movement.total_cost || 0;
      });

      // Top supplies
      const topSupplies = Array.from(supplyMap.values())
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 10)
        .map(supply => ({
          ...supply,
          percentageOfTotal: totalCost > 0 ? (supply.totalCost / totalCost) * 100 : 0
        }));

      // Consumo diário
      const dailyMap = new Map<string, { quantity: number; cost: number }>();
      filteredMovements.forEach(movement => {
        const date = new Date(movement.created_at).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { quantity: 0, cost: 0 });
        }
        const daily = dailyMap.get(date)!;
        daily.quantity += movement.quantity || 0;
        daily.cost += movement.total_cost || 0;
      });

      const dailyConsumption = Array.from(dailyMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Breakdown por categoria
      const categoryMap = new Map<SupplyCategory, { quantity: number; cost: number }>();
      filteredMovements.forEach(movement => {
        const category = movement.supply?.category || 'outros';
        if (!categoryMap.has(category)) {
          categoryMap.set(category, { quantity: 0, cost: 0 });
        }
        const cat = categoryMap.get(category)!;
        cat.quantity += movement.quantity || 0;
        cat.cost += movement.total_cost || 0;
      });

      const categoryBreakdown = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          quantity: data.quantity,
          cost: data.cost,
          percentage: totalCost > 0 ? (data.cost / totalCost) * 100 : 0
        }))
        .sort((a, b) => b.cost - a.cost);

      return {
        period,
        totalConsumed,
        totalCost,
        itemsCount: supplyMap.size,
        topSupplies,
        dailyConsumption,
        categoryBreakdown
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de consumo:', error);
      throw error;
    }
  }

  /**
   * Análise de custos por procedimento
   */
  async generateProcedureCostAnalysis(
    procedureType: string,
    period?: PeriodFilter
  ): Promise<ProcedureCostAnalysis> {
    try {
      // Buscar insumos usados em tarefas do tipo especificado
      let query = supabase
        .from('task_supplies_used')
        .select(`
          *,
          supply:supplies(id, name, category),
          task:tasks!inner(id, type, created_at)
        `)
        .eq('task.type', procedureType);

      if (period) {
        query = query
          .gte('task.created_at', period.startDate)
          .lte('task.created_at', period.endDate);
      }

      const { data: taskSupplies, error } = await query;
      if (error) throw error;

      // Agrupar por task_id para contar procedimentos únicos
      const uniqueTasks = new Set(taskSupplies?.map(ts => ts.task_id));
      const procedureCount = uniqueTasks.size;

      // Calcular custos totais
      const totalSupplyCost = taskSupplies?.reduce((sum, ts) => sum + (ts.total_cost || 0), 0) || 0;
      const averageSupplyCost = procedureCount > 0 ? totalSupplyCost / procedureCount : 0;

      // Agrupar por insumo
      const supplyStats = new Map<string, any>();
      taskSupplies?.forEach(ts => {
        const supplyId = ts.supply_id;
        if (!supplyStats.has(supplyId)) {
          supplyStats.set(supplyId, {
            id: supplyId,
            name: ts.supply?.name || 'Unknown',
            totalQuantity: 0,
            totalCost: 0,
            occurrences: 0
          });
        }
        const stats = supplyStats.get(supplyId);
        stats.totalQuantity += ts.quantity_used || 0;
        stats.totalCost += ts.total_cost || 0;
        stats.occurrences += 1;
      });

      const supplies = Array.from(supplyStats.values())
        .map(stats => ({
          id: stats.id,
          name: stats.name,
          averageQuantity: procedureCount > 0 ? stats.totalQuantity / procedureCount : 0,
          averageCost: procedureCount > 0 ? stats.totalCost / procedureCount : 0,
          frequency: procedureCount > 0 ? (stats.occurrences / procedureCount) * 100 : 0
        }))
        .sort((a, b) => b.averageCost - a.averageCost);

      // Tendências mensais
      const monthlyMap = new Map<string, { cost: number; count: number }>();
      taskSupplies?.forEach(ts => {
        const month = new Date(ts.task?.created_at || ts.usage_date).toISOString().substring(0, 7);
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, { cost: 0, count: 0 });
        }
        const monthly = monthlyMap.get(month)!;
        monthly.cost += ts.total_cost || 0;
      });

      // Contar tarefas por mês
      uniqueTasks.forEach(taskId => {
        const task = taskSupplies?.find(ts => ts.task_id === taskId)?.task;
        if (task) {
          const month = new Date(task.created_at).toISOString().substring(0, 7);
          const monthly = monthlyMap.get(month);
          if (monthly) monthly.count += 1;
        }
      });

      const trends = Array.from(monthlyMap.entries())
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => a.month.localeCompare(b.month));

      return {
        procedureType,
        procedureCount,
        averageSupplyCost,
        totalSupplyCost,
        supplies,
        trends
      };
    } catch (error) {
      console.error('Erro ao gerar análise de custos:', error);
      throw error;
    }
  }

  /**
   * Relatório de movimentação de estoque
   */
  async generateStockMovementReport(
    supplyId: string,
    period: PeriodFilter
  ): Promise<SupplyMovementReport> {
    try {
      // Buscar dados do insumo
      const { data: supply, error: supplyError } = await supabase
        .from('supplies')
        .select('*')
        .eq('id', supplyId)
        .single();

      if (supplyError) throw supplyError;

      // Buscar estoque inicial (última movimentação antes do período)
      const { data: previousMovements } = await supabase
        .from('stock_movements')
        .select('quantity, movement_type')
        .eq('supply_id', supplyId)
        .lt('created_at', period.startDate)
        .order('created_at', { ascending: true });

      let openingStock = 0;
      previousMovements?.forEach(m => {
        if (m.movement_type === 'entrada') {
          openingStock += m.quantity;
        } else if (m.movement_type === 'saida') {
          openingStock -= m.quantity;
        } else if (m.movement_type === 'ajuste') {
          openingStock += m.quantity; // ajuste pode ser positivo ou negativo
        }
      });

      // Buscar movimentações do período
      const { data: movements, error: movError } = await supabase
        .from('stock_movements')
        .select('*')
        .eq('supply_id', supplyId)
        .gte('created_at', period.startDate)
        .lte('created_at', period.endDate)
        .order('created_at', { ascending: false });

      if (movError) throw movError;

      // Calcular totais
      let totalReceived = 0;
      let totalConsumed = 0;
      let totalAdjustments = 0;
      let consumedValue = 0;
      let receivedValue = 0;

      movements?.forEach(m => {
        if (m.movement_type === 'entrada') {
          totalReceived += m.quantity;
          receivedValue += m.total_cost || 0;
        } else if (m.movement_type === 'saida') {
          totalConsumed += m.quantity;
          consumedValue += m.total_cost || 0;
        } else if (m.movement_type === 'ajuste') {
          totalAdjustments += m.quantity;
        }
      });

      const closingStock = openingStock + totalReceived - totalConsumed + totalAdjustments;
      const stockTurnover = openingStock > 0 ? totalConsumed / openingStock : 0;

      const unitCost = supply.unit_cost || 0;
      const openingValue = openingStock * unitCost;
      const closingValue = closingStock * unitCost;

      return {
        supply,
        period,
        openingStock,
        closingStock,
        totalReceived,
        totalConsumed,
        totalAdjustments,
        stockTurnover,
        movements: movements || [],
        valueAnalysis: {
          openingValue,
          closingValue,
          consumedValue,
          receivedValue
        }
      };
    } catch (error) {
      console.error('Erro ao gerar relatório de movimentação:', error);
      throw error;
    }
  }

  /**
   * Exportar relatório para CSV
   * Substitui exportToExcel devido a vulnerabilidades no pacote xlsx
   */
  async exportToCSV(data: any, reportType: string): Promise<Blob> {
    let csvContent = '';

    switch (reportType) {
      case 'consumption':
        csvContent = this.generateConsumptionCSV(data as ConsumptionByPeriodReport);
        break;
      case 'procedure':
        csvContent = this.generateProcedureCSV(data as ProcedureCostAnalysis);
        break;
      case 'movement':
        csvContent = this.generateMovementCSV(data as SupplyMovementReport);
        break;
      default:
        // CSV genérico
        csvContent = this.objectToCSV([data]);
    }

    // Gerar arquivo CSV com BOM para Excel
    return new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  }

  private generateConsumptionCSV(report: ConsumptionByPeriodReport): string {
    let csv = 'RELATÓRIO DE CONSUMO DE INSUMOS\n\n';
    
    // Resumo
    csv += 'RESUMO\n';
    csv += 'Campo,Valor\n';
    csv += `Período,"${report.period.startDate} a ${report.period.endDate}"\n`;
    csv += `Total Consumido,${report.totalConsumed}\n`;
    csv += `Custo Total,R$ ${report.totalCost.toFixed(2)}\n`;
    csv += `Itens Diferentes,${report.itemsCount}\n\n`;

    // Top Insumos
    csv += 'TOP INSUMOS MAIS CONSUMIDOS\n';
    csv += 'Insumo,Categoria,Quantidade,Custo Total,% do Total\n';
    report.topSupplies.forEach(item => {
      csv += `"${item.name}",${item.category},${item.quantityConsumed},"R$ ${item.totalCost.toFixed(2)}",${item.percentageOfTotal.toFixed(1)}%\n`;
    });
    csv += '\n';

    // Consumo Diário
    csv += 'CONSUMO DIÁRIO\n';
    csv += 'Data,Quantidade,Custo\n';
    report.dailyConsumption.forEach(item => {
      csv += `${item.date},${item.quantity},"R$ ${item.cost.toFixed(2)}"\n`;
    });
    csv += '\n';

    // Por Categoria
    csv += 'CONSUMO POR CATEGORIA\n';
    csv += 'Categoria,Quantidade,Custo,Percentual\n';
    report.categoryBreakdown.forEach(item => {
      csv += `${item.category},${item.quantity},"R$ ${item.cost.toFixed(2)}",${item.percentage.toFixed(1)}%\n`;
    });

    return csv;
  }

  private generateProcedureCSV(report: ProcedureCostAnalysis): string {
    let csv = 'ANÁLISE DE CUSTOS POR PROCEDIMENTO\n\n';
    
    // Resumo
    csv += 'RESUMO\n';
    csv += 'Campo,Valor\n';
    csv += `Tipo de Procedimento,"${report.procedureType}"\n`;
    csv += `Quantidade de Procedimentos,${report.procedureCount}\n`;
    csv += `Custo Médio por Procedimento,"R$ ${report.averageSupplyCost.toFixed(2)}"\n`;
    csv += `Custo Total,"R$ ${report.totalSupplyCost.toFixed(2)}"\n\n`;

    // Insumos Utilizados
    csv += 'INSUMOS UTILIZADOS\n';
    csv += 'Insumo,Quantidade Média,Custo Médio,Frequência de Uso\n';
    report.supplies.forEach(item => {
      csv += `"${item.name}",${item.averageQuantity.toFixed(2)},"R$ ${item.averageCost.toFixed(2)}",${item.frequency.toFixed(1)}%\n`;
    });
    csv += '\n';

    // Tendências
    csv += 'TENDÊNCIAS MENSAlS\n';
    csv += 'Mês,Quantidade,Custo Total,Custo Médio\n';
    report.trends.forEach(item => {
      const avgCost = item.count > 0 ? item.cost / item.count : 0;
      csv += `${item.month},${item.count},"R$ ${item.cost.toFixed(2)}","R$ ${avgCost.toFixed(2)}"\n`;
    });

    return csv;
  }

  private generateMovementCSV(report: SupplyMovementReport): string {
    let csv = 'RELATÓRIO DE MOVIMENTAÇÃO DE ESTOQUE\n\n';
    
    // Resumo
    csv += 'RESUMO\n';
    csv += 'Campo,Valor\n';
    csv += `Insumo,"${report.supply.name}"\n`;
    csv += `Período,"${report.period.startDate} a ${report.period.endDate}"\n`;
    csv += `Estoque Inicial,${report.openingStock}\n`;
    csv += `Estoque Final,${report.closingStock}\n`;
    csv += `Total Recebido,${report.totalReceived}\n`;
    csv += `Total Consumido,${report.totalConsumed}\n`;
    csv += `Giro de Estoque,${report.stockTurnover.toFixed(2)}\n`;
    csv += `Valor Inicial,"R$ ${report.valueAnalysis.openingValue.toFixed(2)}"\n`;
    csv += `Valor Final,"R$ ${report.valueAnalysis.closingValue.toFixed(2)}"\n\n`;

    // Movimentações
    csv += 'MOVIMENTAÇÕES\n';
    csv += 'Data,Tipo,Quantidade,Custo Unitário,Custo Total,Motivo,Documento\n';
    report.movements.forEach(m => {
      const date = new Date(m.createdAt).toLocaleDateString('pt-BR');
      const unitCost = m.unitCost ? `R$ ${m.unitCost.toFixed(2)}` : '-';
      const totalCost = m.totalCost ? `R$ ${m.totalCost.toFixed(2)}` : '-';
      const reason = m.reason || '-';
      const doc = m.referenceDocument || '-';
      csv += `${date},${m.movementType},${m.quantity},"${unitCost}","${totalCost}","${reason}","${doc}"\n`;
    });

    return csv;
  }

  private objectToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';
    
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
        return value;
      });
      csv += values.join(',') + '\n';
    });
    
    return csv;
  }

  /**
   * Exportar relatório para PDF
   */
  async exportToPDF(data: any, reportType: string, title: string): Promise<Blob> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Cabeçalho
    pdf.setFontSize(20);
    pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(10);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    switch (reportType) {
      case 'consumption':
        this.addConsumptionPDF(pdf, data as ConsumptionByPeriodReport, yPosition);
        break;
      case 'procedure':
        this.addProcedurePDF(pdf, data as ProcedureCostAnalysis, yPosition);
        break;
      case 'movement':
        this.addMovementPDF(pdf, data as SupplyMovementReport, yPosition);
        break;
    }

    // Gerar PDF
    return pdf.output('blob');
  }

  private addConsumptionPDF(pdf: jsPDF, report: ConsumptionByPeriodReport, startY: number) {
    let y = startY;

    // Resumo
    pdf.setFontSize(14);
    pdf.text('Resumo do Consumo', 14, y);
    y += 10;

    pdf.setFontSize(10);
    pdf.text(`Período: ${report.period.startDate} a ${report.period.endDate}`, 14, y);
    y += 6;
    pdf.text(`Total Consumido: ${report.totalConsumed} unidades`, 14, y);
    y += 6;
    pdf.text(`Custo Total: R$ ${report.totalCost.toFixed(2)}`, 14, y);
    y += 6;
    pdf.text(`Itens Diferentes: ${report.itemsCount}`, 14, y);
    y += 15;

    // Tabela de Top Insumos
    pdf.setFontSize(12);
    pdf.text('Top 10 Insumos Mais Consumidos', 14, y);
    y += 10;

    const tableData = report.topSupplies.map(item => [
      item.name,
      item.category,
      item.quantityConsumed.toString(),
      `R$ ${item.totalCost.toFixed(2)}`,
      `${item.percentageOfTotal.toFixed(1)}%`
    ]);

    pdf.autoTable({
      startY: y,
      head: [['Insumo', 'Categoria', 'Quantidade', 'Custo Total', '% do Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 }
    });

    // Nova página para gráficos se necessário
    if (pdf.lastAutoTable.finalY > pageHeight - 50) {
      pdf.addPage();
      y = 20;
    } else {
      y = pdf.lastAutoTable.finalY + 15;
    }

    // Breakdown por categoria
    pdf.setFontSize(12);
    pdf.text('Consumo por Categoria', 14, y);
    y += 10;

    const categoryData = report.categoryBreakdown.map(item => [
      item.category,
      item.quantity.toString(),
      `R$ ${item.cost.toFixed(2)}`,
      `${item.percentage.toFixed(1)}%`
    ]);

    pdf.autoTable({
      startY: y,
      head: [['Categoria', 'Quantidade', 'Custo', 'Percentual']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 }
    });
  }

  private addProcedurePDF(pdf: jsPDF, report: ProcedureCostAnalysis, startY: number) {
    let y = startY;

    // Resumo
    pdf.setFontSize(14);
    pdf.text('Análise de Custos por Procedimento', 14, y);
    y += 10;

    pdf.setFontSize(10);
    pdf.text(`Tipo de Procedimento: ${report.procedureType}`, 14, y);
    y += 6;
    pdf.text(`Quantidade de Procedimentos: ${report.procedureCount}`, 14, y);
    y += 6;
    pdf.text(`Custo Médio por Procedimento: R$ ${report.averageSupplyCost.toFixed(2)}`, 14, y);
    y += 6;
    pdf.text(`Custo Total: R$ ${report.totalSupplyCost.toFixed(2)}`, 14, y);
    y += 15;

    // Tabela de Insumos
    pdf.setFontSize(12);
    pdf.text('Insumos Utilizados', 14, y);
    y += 10;

    const suppliesData = report.supplies.slice(0, 15).map(item => [
      item.name,
      item.averageQuantity.toFixed(2),
      `R$ ${item.averageCost.toFixed(2)}`,
      `${item.frequency.toFixed(1)}%`
    ]);

    pdf.autoTable({
      startY: y,
      head: [['Insumo', 'Qtd Média', 'Custo Médio', 'Frequência']],
      body: suppliesData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 }
    });
  }

  private addMovementPDF(pdf: jsPDF, report: SupplyMovementReport, startY: number) {
    let y = startY;

    // Informações do Insumo
    pdf.setFontSize(14);
    pdf.text(`Movimentação: ${report.supply.name}`, 14, y);
    y += 10;

    pdf.setFontSize(10);
    pdf.text(`Período: ${report.period.startDate} a ${report.period.endDate}`, 14, y);
    y += 10;

    // Resumo de Estoque
    const stockSummary = [
      ['Estoque Inicial', report.openingStock.toString()],
      ['Total Recebido', `+${report.totalReceived}`],
      ['Total Consumido', `-${report.totalConsumed}`],
      ['Ajustes', report.totalAdjustments.toString()],
      ['Estoque Final', report.closingStock.toString()],
      ['Giro de Estoque', report.stockTurnover.toFixed(2)]
    ];

    pdf.autoTable({
      startY: y,
      head: [['Descrição', 'Quantidade']],
      body: stockSummary,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 }
    });

    y = pdf.lastAutoTable.finalY + 15;

    // Análise de Valores
    pdf.setFontSize(12);
    pdf.text('Análise Financeira', 14, y);
    y += 10;

    const valueAnalysis = [
      ['Valor Inicial', `R$ ${report.valueAnalysis.openingValue.toFixed(2)}`],
      ['Valor Recebido', `R$ ${report.valueAnalysis.receivedValue.toFixed(2)}`],
      ['Valor Consumido', `R$ ${report.valueAnalysis.consumedValue.toFixed(2)}`],
      ['Valor Final', `R$ ${report.valueAnalysis.closingValue.toFixed(2)}`]
    ];

    pdf.autoTable({
      startY: y,
      head: [['Descrição', 'Valor']],
      body: valueAnalysis,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
      margin: { left: 14, right: 14 }
    });
  }
}

// Exportar instância singleton
export const supplyReportsService = new SupplyReportsService();

// Exportar tipos para uso em componentes
export type { 
  ConsumptionByPeriodReport,
  ProcedureCostAnalysis,
  SupplyMovementReport,
  PeriodFilter
};