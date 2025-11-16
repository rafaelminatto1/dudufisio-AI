// services/reportService.ts
import { MedicalReport, Patient } from '../types';
import { mockMedicalReports, mockUsers, mockPatients, mockSoapNotes, mockClinicInfo, mockTherapists } from '../data/mockData';
import html2pdf from 'html2pdf.js';


const reports: MedicalReport[] = [...mockMedicalReports];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getReportsByPatientId = async (patientId: string): Promise<MedicalReport[]> => {
    await delay(300);
    return reports.filter(r => r.patientId === patientId).sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
};

export const getReportById = async (reportId: number): Promise<MedicalReport | undefined> => {
    await delay(300);
    return reports.find(r => r.id === reportId);
};

export const updateReport = async (reportId: number, data: Partial<Omit<MedicalReport, 'id'>>): Promise<MedicalReport> => {
    await delay(400);
    const index = reports.findIndex(r => r.id === reportId);
    if (index === -1) {
        throw new Error("Relatório não encontrado.");
    }
    reports[index] = { ...reports[index], ...data };
    return reports[index];
};

export const generateReport = async (patientId: string, recipientDoctor: string, recipientCrm: string): Promise<MedicalReport> => {
    await delay(1000); // Simulate network and data fetching time

    const patient = mockPatients.find(p => p.id === patientId);
    const notes = mockSoapNotes.filter(n => n.patientId === patientId).slice(0, 3); // Get last 3 notes

    if (!patient) {
        throw new Error("Paciente não encontrado.");
    }
    
    const prompt = `
        CONTEXTO: Você é um fisioterapeuta experiente criando um relatório médico profissional para o Dr(a). ${recipientDoctor || 'Colega Médico'} (CRM: ${recipientCrm || 'A informar'}).

        DADOS DO PACIENTE:
        Nome: ${patient.name}
        Queixa Principal: ${patient.conditions?.[0]?.name || 'Não especificada'}
        Histórico Médico Relevante: ${patient.medicalAlerts || 'Nenhum'}
        
        ÚLTIMAS EVOLUÇÕES (Formato SOAP):
        ${notes.map(n => `
        Data: ${n.date}
        Subjetivo: ${n.subjective}
        Avaliação: ${n.assessment}
        Plano: ${n.plan}
        ---`).join('\n')}
        
        INSTRUÇÕES:
        1. Crie um relatório médico conciso e profissional em português brasileiro.
        2. Use linguagem técnica apropriada para comunicação entre profissionais de saúde.
        3. Estruture o relatório nas seguintes seções: Identificação do Paciente, Diagnóstico Fisioterapêutico, Tratamento Realizado, Evolução Clínica, e Prognóstico e Recomendações. Formate os títulos das seções em negrito (ex: **Identificação do Paciente**).
        4. Seja objetivo e factual, baseando-se estritamente nos dados fornecidos. Não invente informações.
        5. Sintetize as evoluções em um parágrafo coeso na seção "Evolução Clínica".
    `;
    
    // Mock AI response for demo purposes
    const mockAiContent = `**Identificação do Paciente**
${patient.name} apresenta queixa principal de ${patient.conditions?.[0]?.name || 'dor'}.

**Diagnóstico Fisioterapêutico**
Baseado na avaliação inicial e evolução das sessões, o diagnóstico aponta para limitação funcional com comprometimento da mobilidade.

**Tratamento Realizado**
Foram realizadas sessões de fisioterapia com técnicas específicas para o quadro apresentado, incluindo exercícios terapêuticos e modalidades físicas.

**Evolução Clínica**
${notes.length > 0 ? `O paciente demonstrou evolução positiva durante o período de tratamento, com melhora gradual dos sintomas relatados nas sessões.` : 'Paciente em início de tratamento.'}

**Prognóstico e Recomendações**
Prognóstico favorável com continuidade do tratamento conforme prescrição fisioterapêutica. Recomenda-se acompanhamento médico para evolução do quadro.`;

    const newReport: MedicalReport = {
        id: Date.now(),
        patientId,
        therapistId: mockUsers.find(u => u.role === 'Fisioterapeuta')?.id || 'user_1',
        title: `Relatório Médico - ${patient.name}`,
        aiGeneratedContent: mockAiContent,
        content: mockAiContent.replace(/\*\*(.*?)\*\*/g, '<h3>$1</h3>').replace(/\n/g, '<br>'),
        status: 'draft',
        recipientDoctor,
        recipientCrm,
        generatedAt: new Date(),
    };

    reports.unshift(newReport);
    return newReport;
};

export const sendReport = async (reportId: number): Promise<MedicalReport> => {
    await delay(300);
    const index = reports.findIndex(r => r.id === reportId);
    if (index === -1) {
        throw new Error("Relatório não encontrado.");
    }
    const report = reports[index];
    if (!report) {
        throw new Error("Relatório não encontrado.");
    }
    if (report.status !== 'finalized') {
        throw new Error("Apenas relatórios finalizados podem ser enviados.");
    }
    report.status = 'sent';
    return report;
};

export const generatePdf = async (report: MedicalReport, patient: Patient): Promise<void> => {
    const therapist = mockTherapists.find(t => t.id === report.therapistId);
    const therapistCrefito = '12345-F'; // Mock CREFITO

    const pdfElement = document.createElement('div');
    pdfElement.innerHTML = `
        <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; font-size: 12px; line-height: 1.6;">
            <header style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0ea5e9; padding-bottom: 15px; margin-bottom: 25px;">
                <div>
                    <h1 style="font-size: 22px; color: #0284c7; margin: 0;">${mockClinicInfo.name}</h1>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">${mockClinicInfo.address}</p>
                    <p style="font-size: 11px; color: #666; margin: 5px 0 0 0;">${mockClinicInfo.phone} | ${mockClinicInfo.email}</p>
                </div>
                ${mockClinicInfo.logoUrl ? `<img src="${mockClinicInfo.logoUrl}" alt="Logo" style="max-height: 50px;"/>` : ''}
            </header>
            
            <h2 style="text-align: center; font-size: 16px; margin-bottom: 25px; font-weight: bold; text-transform: uppercase;">Relatório Fisioterapêutico</h2>
            
            <table style="width: 100%; margin-bottom: 20px; border-collapse: collapse; font-size: 12px;">
                <tr>
                    <td style="padding: 5px; border: 1px solid #ddd; background-color: #f9f9f9; width: 120px;"><strong>Paciente:</strong></td>
                    <td style="padding: 5px; border: 1px solid #ddd;">${patient.name}</td>
                </tr>
                 <tr>
                    <td style="padding: 5px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Data de Nasc.:</strong></td>
                    <td style="padding: 5px; border: 1px solid #ddd;">${new Date(patient.birthDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                </tr>
                <tr>
                    <td style="padding: 5px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Destinatário:</strong></td>
                    <td style="padding: 5px; border: 1px solid #ddd;">${report.recipientDoctor || 'N/A'} (CRM: ${report.recipientCrm || 'N/A'})</td>
                </tr>
                 <tr>
                    <td style="padding: 5px; border: 1px solid #ddd; background-color: #f9f9f9;"><strong>Data do Relatório:</strong></td>
                    <td style="padding: 5px; border: 1px solid #ddd;">${new Date(report.generatedAt).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                </tr>
            </table>
            
            <section class="report-content">
                ${report.content.replace(/<h3>/g, '<h3 style="font-size: 14px; color: #0284c7; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 20px; margin-bottom: 10px;">').replace(/<\/h3>/g, '</h3>')}
            </section>
            
            <footer style="margin-top: 80px; text-align: center;">
                 <div style="display: inline-block; text-align: center;">
                    <p style="border-top: 1px solid #333; padding-top: 5px; width: 250px; margin: 0 auto;">${therapist?.name || 'Fisioterapeuta Responsável'}</p>
                    <p style="font-size: 11px; margin-top: 5px;">CREFITO: ${therapistCrefito}</p>
                 </div>
                 <p style="font-size: 10px; color: #888; margin-top: 40px;">Este relatório é confidencial e protegido por sigilo profissional.</p>
            </footer>
        </div>
    `;

    const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5],
        filename:     `relatorio-${patient.name.replace(/\s/g, '_')}-${report.id}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    return html2pdf().set(opt).from(pdfElement).save();
};
