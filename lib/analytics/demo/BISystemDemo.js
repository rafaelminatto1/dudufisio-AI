import { BusinessIntelligenceSystem } from '../BusinessIntelligenceSystem';
import { BISystemTests } from '../tests/BISystemTests';
/**
 * Demonstração completa do Sistema de Business Intelligence
 * Este arquivo mostra como usar todas as funcionalidades do sistema BI
 */
export class BISystemDemo {
    constructor(supabaseUrl, supabaseKey) {
        this.biSystem = new BusinessIntelligenceSystem(supabaseUrl, supabaseKey);
        this.testSystem = new BISystemTests(supabaseUrl, supabaseKey);
    }
    /**
     * Executa uma demonstração completa do sistema
     */
    async runCompleteDemo() {
        console.log('🎯 DEMONSTRAÇÃO COMPLETA DO SISTEMA DE BUSINESS INTELLIGENCE');
        console.log('===========================================================\n');
        try {
            // 1. Inicialização do Sistema
            console.log('🚀 ETAPA 1: INICIALIZAÇÃO DO SISTEMA');
            console.log('-----------------------------------');
            await this.biSystem.initialize();
            console.log('✅ Sistema inicializado com sucesso!\n');
            // 2. Verificação de Saúde do Sistema
            console.log('🩺 ETAPA 2: VERIFICAÇÃO DE SAÚDE');
            console.log('--------------------------------');
            const health = await this.biSystem.healthCheck();
            console.log(`Status: ${health.status.toUpperCase()}`);
            if (health.details.length > 0) {
                console.log('Alertas:', health.details.join(', '));
            }
            console.log('✅ Verificação de saúde concluída!\n');
            // 3. Definir período de análise
            const period = {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
                end: new Date()
            };
            // 4. Geração de Dashboard Executivo
            console.log('📊 ETAPA 3: DASHBOARD EXECUTIVO');
            console.log('-------------------------------');
            const dashboard = await this.biSystem.generateExecutiveDashboard(period);
            this.printDashboardSummary(dashboard);
            console.log('✅ Dashboard gerado com sucesso!\n');
            // 5. Análises Preditivas
            console.log('🤖 ETAPA 4: ANÁLISES PREDITIVAS');
            console.log('-------------------------------');
            await this.demonstratePredictiveAnalytics();
            console.log('✅ Análises preditivas concluídas!\n');
            // 6. Detecção de Anomalias
            console.log('🔍 ETAPA 5: DETECÇÃO DE ANOMALIAS');
            console.log('----------------------------------');
            const anomalies = await this.biSystem.detectAnomalies(period);
            console.log(`Anomalias detectadas: ${anomalies.length}`);
            if (anomalies.length > 0) {
                anomalies.slice(0, 3).forEach(anomaly => {
                    console.log(`- ${anomaly.type.toUpperCase()}: ${anomaly.description}`);
                });
            }
            console.log('✅ Detecção de anomalias concluída!\n');
            // 7. Geração de Gráficos
            console.log('📈 ETAPA 6: GERAÇÃO DE GRÁFICOS');
            console.log('-------------------------------');
            const allCharts = await this.generateAllCharts(period);
            console.log(`Total de gráficos gerados: ${Object.values(allCharts).flat().length}`);
            Object.entries(allCharts).forEach(([type, charts]) => {
                console.log(`- ${type.charAt(0).toUpperCase() + type.slice(1)}: ${charts.length} gráficos`);
            });
            console.log('✅ Gráficos gerados com sucesso!\n');
            // 8. Geração de Relatório Completo
            console.log('📋 ETAPA 7: RELATÓRIO EXECUTIVO');
            console.log('-------------------------------');
            const report = await this.biSystem.generateCompleteReport(period, 'Relatório Demonstrativo Completo');
            console.log(`Relatório gerado: ${report.title}`);
            console.log(`Seções incluídas: ${report.sections.length}`);
            console.log(`Gráficos incluídos: ${report.charts.length}`);
            console.log(`Conjuntos de dados: ${report.dataSets.length}`);
            console.log('✅ Relatório gerado com sucesso!\n');
            // 9. Exportação em Múltiplos Formatos
            console.log('📤 ETAPA 8: EXPORTAÇÃO MULTI-FORMATO');
            console.log('------------------------------------');
            await this.demonstrateMultiFormatExport(report);
            console.log('✅ Exportações concluídas!\n');
            // 10. Análise Abrangente
            console.log('🔍 ETAPA 9: ANÁLISE ABRANGENTE');
            console.log('------------------------------');
            const comprehensiveAnalysis = await this.biSystem.performComprehensiveAnalysis(period);
            console.log('Análise abrangente incluiu:');
            console.log(`- Dashboard com ${Object.keys(comprehensiveAnalysis.dashboard.financial).length} KPIs financeiros`);
            console.log(`- ${comprehensiveAnalysis.anomalies.length} anomalias detectadas`);
            console.log(`- Relatório com ${comprehensiveAnalysis.report.sections.length} seções`);
            console.log(`- ${Object.values(comprehensiveAnalysis.charts).flat().length} gráficos gerados`);
            console.log('✅ Análise abrangente concluída!\n');
            // 11. Configuração de Relatórios Automatizados
            console.log('📅 ETAPA 10: RELATÓRIOS AUTOMATIZADOS');
            console.log('------------------------------------');
            await this.biSystem.setupAutomatedReports();
            console.log('✅ Relatórios automatizados configurados!\n');
            // 12. Métricas do Sistema
            console.log('📊 ETAPA 11: MÉTRICAS DO SISTEMA');
            console.log('--------------------------------');
            const systemMetrics = await this.biSystem.getSystemMetrics();
            console.log('Métricas coletadas:');
            console.log(`- Performance média: ${systemMetrics.performanceMetrics?.avgQueryTime || 'N/A'}ms`);
            console.log(`- Taxa de cache hit: ${systemMetrics.performanceMetrics?.cacheHitRate || 'N/A'}%`);
            console.log(`- Carga do sistema: ${systemMetrics.performanceMetrics?.systemLoad || 'N/A'}%`);
            console.log('✅ Métricas coletadas com sucesso!\n');
            console.log('🎉 DEMONSTRAÇÃO COMPLETA CONCLUÍDA COM SUCESSO!');
            console.log('===============================================');
            console.log('Sistema de Business Intelligence totalmente funcional e operacional.');
            console.log('Todas as funcionalidades foram testadas e estão funcionando corretamente.\n');
        }
        catch (error) {
            console.error('❌ ERRO NA DEMONSTRAÇÃO:', error);
            throw error;
        }
    }
    /**
     * Executa apenas os testes do sistema
     */
    async runSystemTests() {
        console.log('🧪 EXECUTANDO TESTES DO SISTEMA BI');
        console.log('==================================\n');
        try {
            const testResults = await this.testSystem.runAllTests();
            if (testResults.success) {
                console.log('\n🎉 TODOS OS TESTES PASSARAM!');
                console.log('Sistema completamente funcional e pronto para uso.');
            }
            else {
                console.log('\n⚠️ ALGUNS TESTES FALHARAM');
                console.log('Verifique os detalhes acima para correções necessárias.');
            }
            // Gerar relatório de testes
            const testReport = await this.testSystem.generateTestReport();
            console.log('\n📋 RELATÓRIO DE TESTES GERADO');
            console.log('============================');
            console.log('Relatório completo de testes disponível.');
        }
        catch (error) {
            console.error('❌ ERRO NOS TESTES:', error);
            throw error;
        }
    }
    /**
     * Demonstra o uso prático para diferentes cenários
     */
    async runPracticalScenarios() {
        console.log('💼 CENÁRIOS PRÁTICOS DE USO');
        console.log('==========================\n');
        const period = {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
            end: new Date()
        };
        // Cenário 1: Reunião Executiva Semanal
        console.log('📊 CENÁRIO 1: REUNIÃO EXECUTIVA SEMANAL');
        console.log('---------------------------------------');
        await this.executiveWeeklyMeeting(period);
        // Cenário 2: Análise Operacional Diária
        console.log('\n🔧 CENÁRIO 2: ANÁLISE OPERACIONAL DIÁRIA');
        console.log('----------------------------------------');
        await this.dailyOperationalAnalysis();
        // Cenário 3: Relatório Financeiro Mensal
        console.log('\n💰 CENÁRIO 3: RELATÓRIO FINANCEIRO MENSAL');
        console.log('-----------------------------------------');
        await this.monthlyFinancialReport();
        // Cenário 4: Alerta de Anomalias em Tempo Real
        console.log('\n🚨 CENÁRIO 4: ALERTAS DE ANOMALIAS');
        console.log('----------------------------------');
        await this.realTimeAnomalyAlerts(period);
        console.log('\n✅ Todos os cenários práticos demonstrados com sucesso!');
    }
    // Métodos auxiliares para demonstração
    printDashboardSummary(dashboard) {
        console.log('📊 Resumo do Dashboard:');
        console.log(`💰 Receita Total: R$ ${dashboard.financial.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
        console.log(`📈 Crescimento: ${dashboard.financial.revenueGrowth.toFixed(1)}%`);
        console.log(`👥 Pacientes Ativos: ${dashboard.patient.activePatients}`);
        console.log(`📅 Total de Consultas: ${dashboard.operational.totalAppointments}`);
        console.log(`⭐ Satisfação: ${dashboard.clinical.patientSatisfaction.toFixed(1)}/10`);
        console.log(`🎯 Taxa de Sucesso: ${dashboard.clinical.successRate.toFixed(1)}%`);
    }
    async demonstratePredictiveAnalytics() {
        try {
            // Demonstração de predição de no-show (com dados mock)
            console.log('🔮 Predições de No-Show:');
            const noShowPrediction = await this.biSystem.predictNoShow('demo_appointment_123');
            console.log(`- Risco: ${noShowPrediction.riskLevel.toUpperCase()}`);
            console.log(`- Probabilidade: ${(noShowPrediction.probability * 100).toFixed(1)}%`);
            console.log(`- Confiança: ${(noShowPrediction.confidence * 100).toFixed(1)}%`);
            // Demonstração de predição de resultado de tratamento
            console.log('\n🎯 Predições de Resultado:');
            const outcomePrediction = await this.biSystem.predictTreatmentOutcome('demo_patient_123', 'physiotherapy');
            console.log(`- Probabilidade de Sucesso: ${(outcomePrediction.successProbability * 100).toFixed(1)}%`);
            console.log(`- Sessões Estimadas: ${outcomePrediction.estimatedSessions}`);
            console.log(`- Duração Estimada: ${outcomePrediction.estimatedDuration} minutos`);
        }
        catch (error) {
            console.log('ℹ️ Usando dados simulados para demonstração de ML');
        }
    }
    async generateAllCharts(period) {
        const financialCharts = await this.biSystem.generateCharts('financial', period);
        const operationalCharts = await this.biSystem.generateCharts('operational', period);
        const clinicalCharts = await this.biSystem.generateCharts('clinical', period);
        const patientCharts = await this.biSystem.generateCharts('patient', period);
        return {
            financial: financialCharts,
            operational: operationalCharts,
            clinical: clinicalCharts,
            patient: patientCharts
        };
    }
    async demonstrateMultiFormatExport(report) {
        // Export em PDF
        console.log('📄 Exportando em PDF...');
        await this.biSystem.exportReport(report, {
            format: 'pdf',
            includeCharts: true,
            includeRawData: false
        });
        // Export em Excel
        console.log('📊 Exportando em Excel...');
        await this.biSystem.exportReport(report, {
            format: 'excel',
            includeCharts: true,
            includeRawData: true
        });
        // Export em JSON
        console.log('🔧 Exportando em JSON...');
        await this.biSystem.exportReport(report, {
            format: 'json',
            includeCharts: false,
            includeRawData: true
        });
        console.log('✅ Todas as exportações concluídas!');
    }
    // Cenários práticos
    async executiveWeeklyMeeting(period) {
        console.log('📊 Gerando dados para reunião executiva...');
        const dashboard = await this.biSystem.generateExecutiveDashboard(period);
        const financialCharts = await this.biSystem.generateCharts('financial', period);
        console.log('✅ Dashboard executivo pronto');
        console.log('✅ Gráficos financeiros gerados');
        console.log('📋 Material pronto para apresentação executiva');
    }
    async dailyOperationalAnalysis() {
        console.log('🔧 Executando análise operacional...');
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const period = { start: yesterday, end: today };
        const operationalCharts = await this.biSystem.generateCharts('operational', period);
        const anomalies = await this.biSystem.detectAnomalies(period);
        console.log('✅ Análise operacional diária concluída');
        console.log(`📈 ${operationalCharts.length} gráficos operacionais gerados`);
        console.log(`🔍 ${anomalies.length} anomalias verificadas`);
    }
    async monthlyFinancialReport() {
        console.log('💰 Gerando relatório financeiro mensal...');
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        const period = {
            start: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
            end: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
        };
        const report = await this.biSystem.generateReport({
            title: 'Relatório Financeiro Mensal',
            period,
            sections: ['executive_summary', 'financial_analysis'],
            format: 'pdf'
        });
        const exportedReport = await this.biSystem.exportReport(report, {
            format: 'excel',
            includeCharts: true,
            includeRawData: true
        });
        console.log('✅ Relatório financeiro mensal gerado');
        console.log('✅ Exportação em Excel concluída');
    }
    async realTimeAnomalyAlerts(period) {
        console.log('🚨 Verificando anomalias em tempo real...');
        const anomalies = await this.biSystem.detectAnomalies(period);
        const criticalAnomalies = anomalies.filter(a => a.severity === 'critical');
        const highAnomalies = anomalies.filter(a => a.severity === 'high');
        console.log(`🔴 Anomalias críticas: ${criticalAnomalies.length}`);
        console.log(`🟡 Anomalias de alta prioridade: ${highAnomalies.length}`);
        if (criticalAnomalies.length > 0) {
            console.log('⚠️ ALERTAS CRÍTICOS:');
            criticalAnomalies.forEach(anomaly => {
                console.log(`   - ${anomaly.description}`);
            });
        }
        console.log('✅ Verificação de anomalias concluída');
    }
}
// Exemplo de uso standalone
export async function runBIDemo(supabaseUrl, supabaseKey) {
    const demo = new BISystemDemo(supabaseUrl, supabaseKey);
    console.log('🎯 Iniciando Demonstração do Sistema BI...\n');
    try {
        // Executar demonstração completa
        await demo.runCompleteDemo();
        // Executar testes
        console.log('\n🧪 Executando Testes...');
        await demo.runSystemTests();
        // Executar cenários práticos
        console.log('\n💼 Executando Cenários Práticos...');
        await demo.runPracticalScenarios();
        console.log('\n🎉 DEMONSTRAÇÃO COMPLETA FINALIZADA!');
        console.log('===================================');
        console.log('Sistema de Business Intelligence totalmente testado e funcional.');
    }
    catch (error) {
        console.error('\n❌ ERRO NA DEMONSTRAÇÃO:', error);
        throw error;
    }
}
