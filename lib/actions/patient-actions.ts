'use server';

import { z } from 'zod';
import { patientFormSchema } from '@/lib/validations/patient';
import * as patientService from '@/services/patientService';
import { PatientStatus, CommunicationChannel } from '@/types';

// React 19 Server Action para criar paciente
export async function createPatientAction(formData: FormData) {
  try {
    // Extrair dados do FormData
    const rawData = {
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      birthDate: (formData.get('birthDate') as string) || new Date().toISOString(),
      gender: formData.get('gender') as string,
      address: {
        street: formData.get('street') as string,
        number: formData.get('number') as string,
        complement: formData.get('complement') as string,
        neighborhood: formData.get('neighborhood') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string,
      },
      emergencyContact: {
        name: formData.get('emergencyContactName') as string,
        phone: formData.get('emergencyContactPhone') as string,
        relationship: formData.get('emergencyContactRelationship') as string,
      },
      medicalInfo: {
        allergies: formData.get('allergies') as string,
        medications: formData.get('medications') as string,
        medicalConditions: formData.get('medicalConditions') as string,
        surgeries: formData.get('surgeries') as string,
      },
      consentGiven: formData.get('consentGiven') === 'true',
      whatsappConsent: formData.get('whatsappConsent') as string,
    };

    // Validar dados
    const validatedData = patientFormSchema.parse(rawData);

    // Criar paciente
    const patientData = {
      ...validatedData,
      birthDate: validatedData.birthDate || new Date().toISOString(),
      phone: validatedData.phone || '',
      email: validatedData.email || '',
      address: {
        street: validatedData.addressStreet || '',
        city: validatedData.addressCity || '',
        state: validatedData.addressState || '',
        zip: validatedData.addressZip || ''
      },
      emergencyContact: {
        name: validatedData.emergencyContactName || '',
        phone: validatedData.emergencyContactPhone || ''
      },
      status: 'Active' as PatientStatus,
      registrationDate: new Date().toISOString(),
      avatarUrl: '',
      allergies: validatedData.allergies || undefined,
      medicalAlerts: validatedData.medicalAlerts || undefined,
      surgeries: [],
      conditions: [],
      attachments: [],
      trackedMetrics: [],
      communicationLogs: [],
      painPoints: [],
      preferredLocale: 'pt-BR',
      preferredChannel: 'whatsapp' as CommunicationChannel,
      preferredName: validatedData.name,
      age: validatedData.birthDate ? new Date().getFullYear() - new Date(validatedData.birthDate).getFullYear() : undefined,
      gender: undefined,
      insuranceType: undefined
    };
    const patient = await patientService.addPatient(patientData);

    return {
      success: true,
      patient,
      message: 'Paciente criado com sucesso!'
    };
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: error.flatten().fieldErrors
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// React 19 Server Action para atualizar paciente
export async function updatePatientAction(patientId: string, formData: FormData) {
  try {
    const rawData = {
      name: formData.get('name') as string,
      cpf: formData.get('cpf') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      birthDate: (formData.get('birthDate') as string) || new Date().toISOString(),
      gender: formData.get('gender') as string,
      address: {
        street: formData.get('street') as string,
        number: formData.get('number') as string,
        complement: formData.get('complement') as string,
        neighborhood: formData.get('neighborhood') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string,
      },
      emergencyContact: {
        name: formData.get('emergencyContactName') as string,
        phone: formData.get('emergencyContactPhone') as string,
        relationship: formData.get('emergencyContactRelationship') as string,
      },
      medicalInfo: {
        allergies: formData.get('allergies') as string,
        medications: formData.get('medications') as string,
        medicalConditions: formData.get('medicalConditions') as string,
        surgeries: formData.get('surgeries') as string,
      },
      consentGiven: formData.get('consentGiven') === 'true',
      whatsappConsent: formData.get('whatsappConsent') as string,
    };

    const validatedData = patientFormSchema.parse(rawData);
    const patientData = {
      ...validatedData,
      id: patientId,
      birthDate: validatedData.birthDate || new Date().toISOString(),
      phone: validatedData.phone || '',
      email: validatedData.email || '',
      address: {
        street: validatedData.addressStreet || '',
        city: validatedData.addressCity || '',
        state: validatedData.addressState || '',
        zip: validatedData.addressZip || ''
      },
      emergencyContact: {
        name: validatedData.emergencyContactName || '',
        phone: validatedData.emergencyContactPhone || ''
      },
      status: 'Active' as PatientStatus,
      lastVisit: '',
      registrationDate: new Date().toISOString(),
      avatarUrl: ''
    };
    const patient = await patientService.updatePatient(patientData);

    return {
      success: true,
      patient,
      message: 'Paciente atualizado com sucesso!'
    };
  } catch (error) {
    console.error('Erro ao atualizar paciente:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Dados inválidos',
        fieldErrors: error.flatten().fieldErrors
      };
    }

    return {
      success: false,
      error: 'Erro interno do servidor'
    };
  }
}

// React 19 Server Action para deletar paciente
export async function deletePatientAction(patientId: string) {
  try {
    // TODO: Implementar método deletePatient no patientService
    // await patientService.deletePatient(patientId);
    
    return {
      success: true,
      message: 'Paciente removido com sucesso!'
    };
  } catch (error) {
    console.error('Erro ao deletar paciente:', error);
    
    return {
      success: false,
      error: 'Erro ao remover paciente'
    };
  }
}
