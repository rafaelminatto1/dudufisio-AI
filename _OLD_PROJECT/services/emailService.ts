// services/emailService.ts
export const sendEmail = async (to: string, subject: string, body: string) => {
  
  return { success: true, messageId: `email_${Date.now()}` };
};

export const sendEmailToInactivePatients = async (patients: any[]) => {
  
  return { success: true, sent: patients.length };
};
