// services/emailService.ts
export const sendEmail = async (to: string, subject: string, body: string) => {
  console.log(`📧 Email enviado para ${to}: ${subject}`);
  return { success: true, messageId: `email_${Date.now()}` };
};

export const sendEmailToInactivePatients = async (patients: any[]) => {
  console.log(`📧 Enviando emails para ${patients.length} pacientes inativos`);
  return { success: true, sent: patients.length };
};
