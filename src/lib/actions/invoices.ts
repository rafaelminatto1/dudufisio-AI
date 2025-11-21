'use server';

import { generateInvoicePDF as generatePDF } from '~/lib/utils/pdfGenerator';
import { getPatientById } from './patients';

/**
 * Gera nota fiscal/recibo em PDF
 */
export async function generateInvoicePDF(data: {
  patient_id: string;
  appointment_id?: string;
  description: string;
  amount: number;
  payment_method: string;
}) {
  try {
    // Busca dados do paciente
    const patientResult = await getPatientById(data.patient_id);
    if (patientResult.error || !patientResult.data) {
      return { error: 'Paciente não encontrado', data: null };
    }

    const patient = patientResult.data;
    const invoiceNumber = `NF-${Date.now()}`;

    // Gera PDF
    const pdfBlob = await generatePDF({
      invoiceNumber,
      patientName: patient.full_name,
      patientCPF: patient.cpf || undefined,
      description: data.description,
      amount: data.amount,
      paymentMethod: data.payment_method,
      date: new Date().toISOString(),
    });

    // TODO: Upload para Supabase Storage
    // Por enquanto, retorna dados para download direto
    return {
      data: {
        invoice_number: invoiceNumber,
        pdf_blob: pdfBlob,
        download_url: URL.createObjectURL(pdfBlob),
      },
      error: null,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Erro ao gerar PDF',
      data: null,
    };
  }
}

