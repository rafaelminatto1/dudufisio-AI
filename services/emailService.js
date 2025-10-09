// services/emailService.ts
export const sendEmail = async (to, subject, body) => {
    console.log(`📧 Email enviado para ${to}: ${subject}`);
    return { success: true, messageId: `email_${Date.now()}` };
};
export const sendEmailToInactivePatients = async (patients) => {
    console.log(`📧 Enviando emails para ${patients.length} pacientes inativos`);
    return { success: true, sent: patients.length };
};
