/**
 * Serviço de Relatórios Financeiros
 * Gera DRE, Fluxo de Caixa, Análise de Inadimplência
 */

export interface DREReport {
  period: {
    start: Date;
    end: Date;
  };
  receitas: {
    operacional: {
      consultas: number;
      procedimentos: number;
      planos: number;
      produtos: number;
      total: number;
    };
    naoOperacional: {
      investimentos: number;
      outros: number;
      total: number;
    };
    receitaBruta: number;
    deducoes: {
      impostos: number;
      descontos: number;
      glosas: number;
      total: number;
    };
    receitaLiquida: number;
  };
  custos: {
    fixos: {
      aluguel: number;
      salarios: number;
      encargos: number;
      equipamentos: number;
      manutencao: number;
      total: number;
    };
    variaveis: {
      materiais: number;
      comissoes: number;
      marketing: number;
      outros: number;
      total: number;
    };
    custoTotal: number;
  };
  resultado: {
    lucroBruto: number;
    despesasOperacionaisTotal: number;
    lucroOperacional: number;
    lucroLiquido: number;
    margemBruta: number; // %
    margemOperacional: number; // %
    margemLiquida: number; // %
    ebitda: number;
  };
  comparativo: {
    periodoAnterior: {
      receitaLiquida: number;
      lucroLiquido: number;
      margemLiquida: number;
    };
    variacao: {
      receita: number; // %
      lucro: number; // %
      margem: number; // pontos percentuais
    };
  };
}

export interface CashFlowReport {
  period: {
    start: Date;
    end: Date;
  };
  saldoInicial: number;
  entradas: {
    recebimentos: {
      aVista: number;
      cartao: number;
      pix: number;
      transferencia: number;
      cheque: number;
      total: number;
    };
    recebimentosFuturos: Array<{
      date: Date;
      amount: number;
      source: string;
    }>;
    outrasEntradas: number;
    totalEntradas: number;
  };
  saidas: {
    fornecedores: number;
    salarios: number;
    impostos: number;
    aluguel: number;
    servicos: number;
    marketing: number;
    equipamentos: number;
    outros: number;
    totalSaidas: number;
  };
  saldoFinal: number;
  fluxoDiario: Array<{
    date: Date;
    entradas: number;
    saidas: number;
    saldo: number;
  }>;
  projecao30Dias: {
    entradasPrevistas: number;
    saidasPrevistas: number;
    saldoProjetado: number;
  };
  alertas: Array<{
    type: 'warning' | 'danger' | 'info';
    message: string;
    date?: Date;
  }>;
}

export interface DefaultReport {
  period: {
    start: Date;
    end: Date;
  };
  overview: {
    totalRecebiveis: number;
    totalRecebido: number;
    totalInadimplente: number;
    taxaInadimplencia: number; // %
    ticketMedio: number;
  };
  porFaixa: {
    ate30Dias: {
      quantidade: number;
      valor: number;
      percentual: number;
    };
    de31a60Dias: {
      quantidade: number;
      valor: number;
      percentual: number;
    };
    de61a90Dias: {
      quantidade: number;
      valor: number;
      percentual: number;
    };
    acima90Dias: {
      quantidade: number;
      valor: number;
      percentual: number;
    };
  };
  porPaciente: Array<{
    patientId: string;
    patientName: string;
    debito: number;
    diasAtraso: number;
    ultimoPagamento?: Date;
    risco: 'baixo' | 'medio' | 'alto';
    acoes: string[];
  }>;
  evolucao: Array<{
    month: string;
    inadimplencia: number;
    taxa: number;
  }>;
  acoesRecomendadas: Array<{
    prioridade: 'alta' | 'media' | 'baixa';
    acao: string;
    impactoEstimado: number; // R$
  }>;
}

export interface FinancialKPI {
  name: string;
  value: number;
  unit: 'currency' | 'percentage' | 'number';
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  status: 'good' | 'warning' | 'critical';
  benchmark?: number;
}

class FinancialReportService {
  /**
   * Gera Demonstrativo de Resultado do Exercício (DRE)
   */
  async generateDRE(startDate: Date, endDate: Date): Promise<DREReport> {
    try {
      const report: DREReport = {
        period: { start: startDate, end: endDate },
        receitas: {
          operacional: {
            consultas: 125000,
            procedimentos: 85000,
            planos: 45000,
            produtos: 15000,
            total: 270000
          },
          naoOperacional: {
            investimentos: 2000,
            outros: 1000,
            total: 3000
          },
          receitaBruta: 273000,
          deducoes: {
            impostos: 18500,
            descontos: 8200,
            glosas: 3500,
            total: 30200
          },
          receitaLiquida: 242800
        },
        custos: {
          fixos: {
            aluguel: 12000,
            salarios: 85000,
            encargos: 28000,
            equipamentos: 8000,
            manutencao: 3500,
            total: 136500
          },
          variaveis: {
            materiais: 18500,
            comissoes: 12500,
            marketing: 8500,
            outros: 6000,
            total: 45500
          },
          custoTotal: 182000
        },
        resultado: {
          lucroBruto: 60800,
          despesasOperacionaisTotal: 45500,
          lucroOperacional: 15300,
          lucroLiquido: 14200,
          margemBruta: 25.0,
          margemOperacional: 6.3,
          margemLiquida: 5.8,
          ebitda: 23300
        },
        comparativo: {
          periodoAnterior: {
            receitaLiquida: 228000,
            lucroLiquido: 12500,
            margemLiquida: 5.5
          },
          variacao: {
            receita: 6.5,
            lucro: 13.6,
            margem: 0.3
          }
        }
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar DRE:', error);
      throw new Error('Falha ao gerar DRE');
    }
  }

  /**
   * Gera relatório de Fluxo de Caixa
   */
  async generateCashFlow(startDate: Date, endDate: Date): Promise<CashFlowReport> {
    try {
      // Gerar array de fluxo diário
      const fluxoDiario: CashFlowReport['fluxoDiario'] = [];
      let saldoAcumulado = 45000; // saldo inicial
      
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        
        const entradas = Math.random() * 5000 + 2000;
        const saidas = Math.random() * 4000 + 1500;
        saldoAcumulado += (entradas - saidas);
        
        fluxoDiario.push({
          date,
          entradas,
          saidas,
          saldo: saldoAcumulado
        });
      }

      const report: CashFlowReport = {
        period: { start: startDate, end: endDate },
        saldoInicial: 45000,
        entradas: {
          recebimentos: {
            aVista: 52000,
            cartao: 85000,
            pix: 45000,
            transferencia: 28000,
            cheque: 5000,
            total: 215000
          },
          recebimentosFuturos: [
            { date: new Date('2025-02-05'), amount: 12500, source: 'Convênio X' },
            { date: new Date('2025-02-10'), amount: 8500, source: 'Plano Y' },
            { date: new Date('2025-02-15'), amount: 15000, source: 'Convênio Z' }
          ],
          outrasEntradas: 3000,
          totalEntradas: 218000
        },
        saidas: {
          fornecedores: 28500,
          salarios: 95000,
          impostos: 22000,
          aluguel: 12000,
          servicos: 8500,
          marketing: 12000,
          equipamentos: 15000,
          outros: 7000,
          totalSaidas: 200000
        },
        saldoFinal: 63000,
        fluxoDiario,
        projecao30Dias: {
          entradasPrevistas: 245000,
          saidasPrevistas: 215000,
          saldoProjetado: 93000
        },
        alertas: [
          {
            type: 'info',
            message: 'Pagamento de salários previsto para dia 5',
            date: new Date('2025-02-05')
          },
          {
            type: 'warning',
            message: 'Saldo projetado abaixo do mínimo recomendado em 15/02',
            date: new Date('2025-02-15')
          },
          {
            type: 'info',
            message: 'Recebimento de convênio previsto para dia 10',
            date: new Date('2025-02-10')
          }
        ]
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar fluxo de caixa:', error);
      throw new Error('Falha ao gerar fluxo de caixa');
    }
  }

  /**
   * Gera relatório de Inadimplência
   */
  async generateDefaultReport(startDate: Date, endDate: Date): Promise<DefaultReport> {
    try {
      const report: DefaultReport = {
        period: { start: startDate, end: endDate },
        overview: {
          totalRecebiveis: 285000,
          totalRecebido: 245000,
          totalInadimplente: 40000,
          taxaInadimplencia: 14.0,
          ticketMedio: 850
        },
        porFaixa: {
          ate30Dias: {
            quantidade: 18,
            valor: 15500,
            percentual: 38.75
          },
          de31a60Dias: {
            quantidade: 12,
            valor: 11800,
            percentual: 29.5
          },
          de61a90Dias: {
            quantidade: 7,
            valor: 8200,
            percentual: 20.5
          },
          acima90Dias: {
            quantidade: 5,
            valor: 4500,
            percentual: 11.25
          }
        },
        porPaciente: [
          {
            patientId: 'patient_045',
            patientName: 'Carlos Silva',
            debito: 3500,
            diasAtraso: 45,
            ultimoPagamento: new Date('2024-12-10'),
            risco: 'medio',
            acoes: [
              'Enviar lembrete por WhatsApp',
              'Oferecer parcelamento',
              'Agendar contato telefônico'
            ]
          },
          {
            patientId: 'patient_078',
            patientName: 'Ana Paula Costa',
            debito: 5200,
            diasAtraso: 85,
            ultimoPagamento: new Date('2024-11-01'),
            risco: 'alto',
            acoes: [
              'Contato imediato',
              'Negociação de desconto',
              'Avaliar envio para cobrança jurídica'
            ]
          }
        ],
        evolucao: [
          { month: 'Set/24', inadimplencia: 32000, taxa: 11.5 },
          { month: 'Out/24', inadimplencia: 35500, taxa: 12.8 },
          { month: 'Nov/24', inadimplencia: 38000, taxa: 13.2 },
          { month: 'Dez/24', inadimplencia: 41500, taxa: 14.5 },
          { month: 'Jan/25', inadimplencia: 40000, taxa: 14.0 }
        ],
        acoesRecomendadas: [
          {
            prioridade: 'alta',
            acao: 'Implementar cobrança automática via WhatsApp',
            impactoEstimado: 12000
          },
          {
            prioridade: 'alta',
            acao: 'Revisar política de crédito e análise de risco',
            impactoEstimado: 8000
          },
          {
            prioridade: 'media',
            acao: 'Oferecer desconto para pagamento à vista',
            impactoEstimado: 5500
          },
          {
            prioridade: 'media',
            acao: 'Implementar programa de fidelidade',
            impactoEstimado: 4000
          },
          {
            prioridade: 'baixa',
            acao: 'Contratar empresa de recuperação de crédito',
            impactoEstimado: 2500
          }
        ]
      };

      return report;
    } catch (error) {
      console.error('Erro ao gerar relatório de inadimplência:', error);
      throw new Error('Falha ao gerar relatório de inadimplência');
    }
  }

  /**
   * Calcula KPIs financeiros
   */
  async calculateFinancialKPIs(startDate: Date, endDate: Date): Promise<FinancialKPI[]> {
    try {
      const kpis: FinancialKPI[] = [
        {
          name: 'Receita Líquida',
          value: 242800,
          unit: 'currency',
          trend: 'up',
          changePercentage: 6.5,
          status: 'good',
          benchmark: 230000
        },
        {
          name: 'Margem Líquida',
          value: 5.8,
          unit: 'percentage',
          trend: 'up',
          changePercentage: 0.3,
          status: 'good',
          benchmark: 5.0
        },
        {
          name: 'Taxa de Inadimplência',
          value: 14.0,
          unit: 'percentage',
          trend: 'down',
          changePercentage: -0.5,
          status: 'warning',
          benchmark: 10.0
        },
        {
          name: 'Ticket Médio',
          value: 850,
          unit: 'currency',
          trend: 'up',
          changePercentage: 3.2,
          status: 'good',
          benchmark: 800
        },
        {
          name: 'EBITDA',
          value: 23300,
          unit: 'currency',
          trend: 'up',
          changePercentage: 8.5,
          status: 'good',
          benchmark: 20000
        },
        {
          name: 'Saldo de Caixa',
          value: 63000,
          unit: 'currency',
          trend: 'up',
          changePercentage: 12.5,
          status: 'good',
          benchmark: 50000
        }
      ];

      return kpis;
    } catch (error) {
      console.error('Erro ao calcular KPIs:', error);
      throw new Error('Falha ao calcular KPIs financeiros');
    }
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  /**
   * Formata percentual
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  /**
   * Exporta relatório financeiro para Excel
   */
  async exportFinancialReport(
    report: DREReport | CashFlowReport | DefaultReport,
    filename: string
  ): Promise<Blob> {
    try {
      // Em produção, usar biblioteca como xlsx
      console.log(`Exportando relatório financeiro: ${filename}`);
      
      const blob = new Blob(['Excel content'], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      return blob;
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      throw new Error('Falha ao exportar relatório financeiro');
    }
  }
}

export const financialReportService = new FinancialReportService();
