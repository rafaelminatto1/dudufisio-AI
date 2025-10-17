/**
 * Agenda Data Adapter
 * 
 * Provides a unified interface for accessing agenda data from different sources
 * (Mock, Supabase, etc.) using the Adapter Pattern.
 * 
 * This allows easy switching between mock data and real database without
 * changing the application code.
 */

import type { Appointment, Patient, Therapist, WaitlistEntry } from '../../types';
import { mockAppointmentService } from './mockAppointmentService';
import { mockPatientService } from './mockPatientService';
import { mockTherapistService } from './mockTherapistService';
import { mockWaitlistService } from './mockWaitlistService';

// Configuration: set to true to use Supabase, false for mock data
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

/**
 * Interface for agenda data operations
 */
export interface IAgendaDataAdapter {
  // Appointments
  getAppointments(startDate: Date, endDate: Date): Promise<Appointment[]>;
  createAppointment(appointment: Appointment): Promise<Appointment>;
  updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment>;
  deleteAppointment(id: string): Promise<boolean>;
  
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | null>;
  createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient>;
  updatePatient(id: string, data: Partial<Patient>): Promise<Patient>;
  deletePatient(id: string): Promise<boolean>;
  
  // Therapists
  getTherapists(): Promise<Therapist[]>;
  getTherapist(id: string): Promise<Therapist | null>;
  
  // Waitlist
  getWaitlistEntries(): Promise<WaitlistEntry[]>;
  createWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'created_at'>): Promise<WaitlistEntry>;
  updateWaitlistEntry(id: string, data: Partial<WaitlistEntry>): Promise<WaitlistEntry>;
  deleteWaitlistEntry(id: string): Promise<boolean>;
}

/**
 * Mock Implementation
 * Uses the existing mock services
 */
class MockAgendaAdapter implements IAgendaDataAdapter {
  async getAppointments(startDate: Date, endDate: Date): Promise<Appointment[]> {
    return mockAppointmentService.getAppointments(startDate, endDate);
  }
  
  async createAppointment(appointment: Appointment): Promise<Appointment> {
    return mockAppointmentService.createAppointment(appointment);
  }
  
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    return mockAppointmentService.updateAppointment(id, data);
  }
  
  async deleteAppointment(id: string): Promise<boolean> {
    return mockAppointmentService.deleteAppointment(id);
  }
  
  async getPatients(): Promise<Patient[]> {
    return mockPatientService.getPatients();
  }
  
  async getPatient(id: string): Promise<Patient | null> {
    return mockPatientService.getPatientById(id);
  }
  
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    return mockPatientService.createPatient(patient);
  }
  
  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    return mockPatientService.updatePatient(id, data);
  }
  
  async deletePatient(id: string): Promise<boolean> {
    return mockPatientService.deletePatient(id);
  }
  
  async getTherapists(): Promise<Therapist[]> {
    return mockTherapistService.getTherapists();
  }
  
  async getTherapist(id: string): Promise<Therapist | null> {
    return mockTherapistService.getTherapistById(id);
  }
  
  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    return mockWaitlistService.getWaitlist();
  }
  
  async createWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'created_at'>): Promise<WaitlistEntry> {
    return mockWaitlistService.addToWaitlist(entry);
  }
  
  async updateWaitlistEntry(id: string, data: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
    return mockWaitlistService.updateWaitlistEntry(id, data);
  }
  
  async deleteWaitlistEntry(id: string): Promise<boolean> {
    return mockWaitlistService.removeFromWaitlist(id);
  }
}

/**
 * Supabase Implementation
 * TODO: Implement when Supabase integration is ready
 */
class SupabaseAgendaAdapter implements IAgendaDataAdapter {
  async getAppointments(startDate: Date, endDate: Date): Promise<Appointment[]> {
    // TODO: Implement Supabase query
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockAppointmentService.getAppointments(startDate, endDate);
  }
  
  async createAppointment(appointment: Appointment): Promise<Appointment> {
    // TODO: Implement Supabase insert
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockAppointmentService.createAppointment(appointment);
  }
  
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    // TODO: Implement Supabase update
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockAppointmentService.updateAppointment(id, data);
  }
  
  async deleteAppointment(id: string): Promise<boolean> {
    // TODO: Implement Supabase delete
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockAppointmentService.deleteAppointment(id);
  }
  
  async getPatients(): Promise<Patient[]> {
    // TODO: Implement Supabase query
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockPatientService.getPatients();
  }
  
  async getPatient(id: string): Promise<Patient | null> {
    // TODO: Implement Supabase query
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockPatientService.getPatientById(id);
  }
  
  async createPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
    // TODO: Implement Supabase insert
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockPatientService.createPatient(patient);
  }
  
  async updatePatient(id: string, data: Partial<Patient>): Promise<Patient> {
    // TODO: Implement Supabase update
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockPatientService.updatePatient(id, data);
  }
  
  async deletePatient(id: string): Promise<boolean> {
    // TODO: Implement Supabase delete
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockPatientService.deletePatient(id);
  }
  
  async getTherapists(): Promise<Therapist[]> {
    // TODO: Implement Supabase query
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockTherapistService.getTherapists();
  }
  
  async getTherapist(id: string): Promise<Therapist | null> {
    // TODO: Implement Supabase query
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockTherapistService.getTherapistById(id);
  }
  
  async getWaitlistEntries(): Promise<WaitlistEntry[]> {
    // TODO: Implement Supabase query
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockWaitlistService.getWaitlist();
  }
  
  async createWaitlistEntry(entry: Omit<WaitlistEntry, 'id' | 'created_at'>): Promise<WaitlistEntry> {
    // TODO: Implement Supabase insert
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockWaitlistService.addToWaitlist(entry);
  }
  
  async updateWaitlistEntry(id: string, data: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
    // TODO: Implement Supabase update
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockWaitlistService.updateWaitlistEntry(id, data);
  }
  
  async deleteWaitlistEntry(id: string): Promise<boolean> {
    // TODO: Implement Supabase delete
    console.warn('Supabase adapter not yet implemented, falling back to mock data');
    return mockWaitlistService.removeFromWaitlist(id);
  }
}

/**
 * Factory function to get the appropriate adapter
 */
export const createAgendaAdapter = (): IAgendaDataAdapter => {
  if (USE_SUPABASE) {
    console.log('Using Supabase adapter for agenda data');
    return new SupabaseAgendaAdapter();
  } else {
    console.log('Using Mock adapter for agenda data');
    return new MockAgendaAdapter();
  }
};

/**
 * Singleton instance
 */
export const agendaAdapter: IAgendaDataAdapter = createAgendaAdapter();
