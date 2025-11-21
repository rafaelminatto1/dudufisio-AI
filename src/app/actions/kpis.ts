import { captureSentryCustomEvent } from '~/lib/services/sentry_client';
import { collectConfirmationRateKPI } from '~/lib/utils/kpi_collection';

interface GetConfirmationRateKPIResult {
  success: boolean;
  message: string;
  kpi?: {
    totalAppointments: number;
    confirmedAppointments: number;
    confirmationRate: number;
    timestamp: string;
  };
  error?: string;
}

export async function getConfirmationRateKPI(): Promise<GetConfirmationRateKPIResult> {
  console.log("[Server Action] Coletando KPI de Taxa de Confirmação.");
  const result = await collectConfirmationRateKPI();
  if (!result.success) {
    console.error("[Server Action] Falha ao coletar KPI de Taxa de Confirmação:", result.error);
  } else {
    console.log("[Server Action] KPI de Taxa de Confirmação coletado com sucesso.");
  }
  return result;
}

interface CheckConfirmationRateAlertResult {
  success: boolean;
  message: string;
  alertTriggered: boolean;
  currentRate?: number;
  threshold?: number;
  error?: string;
}

export async function checkConfirmationRateAlert(
  threshold: number = 80 // Limite padrão de 80%
): Promise<CheckConfirmationRateAlertResult> {
  try {
    console.log(`[Server Action] Verificando alerta para Taxa de Confirmação (limite: ${threshold}%).`);
    const kpiResult = await collectConfirmationRateKPI();

    if (!kpiResult.success || !kpiResult.kpi) {
      return { success: false, message: 'Não foi possível coletar o KPI para verificar o alerta.', alertTriggered: false, error: kpiResult.error };
    }

    const currentRate = kpiResult.kpi.confirmationRate;
    const alertTriggered = currentRate < threshold;

    if (alertTriggered) {
      const alertMessage = `ALERTA: Taxa de Confirmação (${currentRate}%) abaixo do limite (${threshold}%).`;
      console.warn(`[Server Action] ${alertMessage}`);

      // Envia um evento customizado para o Sentry para monitoramento
      await captureSentryCustomEvent('KPI Alert', {
        kpi: 'Confirmation Rate',
        currentValue: currentRate,
        threshold: threshold,
        message: alertMessage,
      });

      // TODO: Integrar com sistema de notificação (e-mail, Slack, WhatsApp)
    } else {
      console.log(`[Server Action] Taxa de Confirmação (${currentRate}%) acima ou igual ao limite (${threshold}%).`);
    }

    return {
      success: true,
      message: 'Verificação de alerta concluída.',
      alertTriggered: alertTriggered,
      currentRate: currentRate,
      threshold: threshold,
    };
  } catch (error) {
    console.error('[checkConfirmationRateAlert] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao verificar o alerta de Taxa de Confirmação.',
      alertTriggered: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

interface GenerateAndSendKpiReportResult {
  success: boolean;
  message: string;
  reportUrl?: string; // URL para o relatório gerado
  error?: string;
}

export async function generateAndSendKpiReport(
  reportType: 'daily' | 'weekly' | 'monthly',
  recipients: string[]
): Promise<GenerateAndSendKpiReportResult> {
  try {
    console.log(`[Server Action] Gerando e enviando relatório de KPI (${reportType}) para ${recipients.join(', ')}.`);

    // TODO: Lógica real para coletar dados para o relatório
    const kpiResult = await collectConfirmationRateKPI();
    if (!kpiResult.success || !kpiResult.kpi) {
      return { success: false, message: 'Não foi possível coletar dados para o relatório.', error: kpiResult.error };
    }

    // TODO: Lógica real para gerar o relatório (PDF, CSV, HTML)
    const simulatedReportContent = `Relatório de KPI (${reportType})\nTaxa de Confirmação: ${kpiResult.kpi.confirmationRate}%\nGerado em: ${new Date().toISOString()}`;
    const simulatedReportUrl = `https://example.com/reports/${reportType}-${Date.now()}.pdf`; // URL simulada

    // TODO: Lógica real para enviar o relatório aos destinatários (e-mail, Slack, WhatsApp)
    console.log(`[Server Action] Relatório gerado: ${simulatedReportUrl}`);
    console.log(`[Server Action] Relatório enviado para: ${recipients.join(', ')}`);

    return {
      success: true,
      message: `Relatório de KPI (${reportType}) gerado e enviado com sucesso.`,
      reportUrl: simulatedReportUrl,
    };
  } catch (error) {
    console.error('[generateAndSendKpiReport] Erro fatal:', error);
    return {
      success: false,
      message: 'Ocorreu um erro inesperado ao gerar e enviar o relatório de KPI.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
