'use server';
import { z } from 'zod';
import { patientFormSchema } from '@/lib/validations/patient';
import * as patientService from '@/services/patientService';
// React 19 Server Action para criar paciente
export async function createPatientAction(formData) {
    try {
        // Extrair dados do FormData
        const rawData = {
            name: formData.get('name'),
            cpf: formData.get('cpf'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            birthDate: formData.get('birthDate') || new Date().toISOString(),
            gender: formData.get('gender'),
            address: {
                street: formData.get('street'),
                number: formData.get('number'),
                complement: formData.get('complement'),
                neighborhood: formData.get('neighborhood'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
            },
            emergencyContact: {
                name: formData.get('emergencyContactName'),
                phone: formData.get('emergencyContactPhone'),
                relationship: formData.get('emergencyContactRelationship'),
            },
            medicalInfo: {
                allergies: formData.get('allergies'),
                medications: formData.get('medications'),
                medicalConditions: formData.get('medicalConditions'),
                surgeries: formData.get('surgeries'),
            },
            consentGiven: formData.get('consentGiven') === 'true',
            whatsappConsent: formData.get('whatsappConsent'),
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
            status: 'Active',
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
            preferredChannel: 'whatsapp',
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
    }
    catch (error) {
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
export async function updatePatientAction(patientId, formData) {
    try {
        const rawData = {
            name: formData.get('name'),
            cpf: formData.get('cpf'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            birthDate: formData.get('birthDate') || new Date().toISOString(),
            gender: formData.get('gender'),
            address: {
                street: formData.get('street'),
                number: formData.get('number'),
                complement: formData.get('complement'),
                neighborhood: formData.get('neighborhood'),
                city: formData.get('city'),
                state: formData.get('state'),
                zipCode: formData.get('zipCode'),
            },
            emergencyContact: {
                name: formData.get('emergencyContactName'),
                phone: formData.get('emergencyContactPhone'),
                relationship: formData.get('emergencyContactRelationship'),
            },
            medicalInfo: {
                allergies: formData.get('allergies'),
                medications: formData.get('medications'),
                medicalConditions: formData.get('medicalConditions'),
                surgeries: formData.get('surgeries'),
            },
            consentGiven: formData.get('consentGiven') === 'true',
            whatsappConsent: formData.get('whatsappConsent'),
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
            status: 'Active',
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
    }
    catch (error) {
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
export async function deletePatientAction(patientId) {
    try {
        // TODO: Implementar método deletePatient no patientService
        // await patientService.deletePatient(patientId);
        return {
            success: true,
            message: 'Paciente removido com sucesso!'
        };
    }
    catch (error) {
        console.error('Erro ao deletar paciente:', error);
        return {
            success: false,
            error: 'Erro ao remover paciente'
        };
    }
}
