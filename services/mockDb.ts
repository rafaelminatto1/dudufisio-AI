// services/mockDb.ts
import {
  Patient,
  Appointment,
  SoapNote,
  TreatmentPlan,
  ExercisePrescription,
  RecurrenceTemplate,
  WaitlistEntry,
  ScheduleBlock,
  SchedulingAlert,
} from '../types';
import {
  mockPatients,
  mockAppointments,
  mockSoapNotes,
  mockTreatmentPlans,
  mockExercisePrescriptions,
  mockRecurrenceTemplates,
  mockWaitlistEntries,
  mockScheduleBlocks,
  mockSchedulingAlerts,
} from '../data/mockData';

// Create mutable copies of the mock data to act as our "database"
let patients = [...mockPatients];
let appointments = [...mockAppointments];
const soapNotes = [...mockSoapNotes];
const treatmentPlans = [...mockTreatmentPlans];
let exercisePrescriptions = [...mockExercisePrescriptions];
let recurrenceTemplates = [...(mockRecurrenceTemplates || [])];
let waitlistEntries = [...(mockWaitlistEntries || [])];
let scheduleBlocks = [...(mockScheduleBlocks || [])];
let schedulingAlerts = [...(mockSchedulingAlerts || [])];

// A central place to manage all mock data, ensuring consistency.
export const db = {
  // Patients
  getPatients: (): Patient[] => [...patients],
  getPatientById: (id: string): Patient | undefined => patients.find(p => p.id === id),
  addPatient: (patient: Patient): void => { patients.unshift(patient); },
  updatePatient: (updatedPatient: Patient): void => {
    patients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p);
  },

  // Appointments
  getAppointments: (): Appointment[] => [...appointments],
  saveAppointment: (appointmentData: Appointment): void => {
    const index = appointments.findIndex(a => a.id === appointmentData.id);
    if (index > -1) {
      appointments[index] = appointmentData;
    } else {
      appointments.push(appointmentData);
    }
  },
  deleteAppointment: (id: string): void => {
    appointments = appointments.filter(a => a.id !== id);
  },
  deleteAppointmentSeries: (seriesId: string, fromDate: Date): void => {
    appointments = appointments.filter(a => !(a.seriesId === seriesId && a.startTime >= fromDate));
  },

  // Recurrence Templates
  getRecurrenceTemplates: (): RecurrenceTemplate[] => [...recurrenceTemplates],
  getRecurrenceTemplateById: (id: string): RecurrenceTemplate | undefined => recurrenceTemplates.find(t => t.id === id),
  saveRecurrenceTemplate: (template: RecurrenceTemplate): void => {
    const index = recurrenceTemplates.findIndex(t => t.id === template.id);
    if (index > -1) {
      recurrenceTemplates[index] = template;
    } else {
      recurrenceTemplates.push(template);
    }
  },

  // Schedule Blocks
  getScheduleBlocks: (): ScheduleBlock[] => [...scheduleBlocks],
  saveScheduleBlock: (block: ScheduleBlock): void => {
    const index = scheduleBlocks.findIndex(b => b.id === block.id);
    if (index > -1) {
      scheduleBlocks[index] = block;
    } else {
      scheduleBlocks.push(block);
    }
  },
  deleteScheduleBlock: (id: string): void => {
    scheduleBlocks = scheduleBlocks.filter(block => block.id !== id);
  },

  // Waitlist
  getWaitlistEntries: (): WaitlistEntry[] => [...waitlistEntries],
  getWaitlistEntryById: (id: string): WaitlistEntry | undefined => waitlistEntries.find(entry => entry.id === id),
  saveWaitlistEntry: (entry: WaitlistEntry): void => {
    const index = waitlistEntries.findIndex(e => e.id === entry.id);
    if (index > -1) {
      waitlistEntries[index] = entry;
    } else {
      waitlistEntries.push(entry);
    }
  },
  deleteWaitlistEntry: (id: string): void => {
    waitlistEntries = waitlistEntries.filter(entry => entry.id !== id);
  },

  // Scheduling Alerts
  getSchedulingAlerts: (): SchedulingAlert[] => [...schedulingAlerts],
  saveSchedulingAlert: (alert: SchedulingAlert): void => {
    const index = schedulingAlerts.findIndex(a => a.id === alert.id);
    if (index > -1) {
      schedulingAlerts[index] = alert;
    } else {
      schedulingAlerts.push(alert);
    }
  },
  resolveSchedulingAlert: (id: string): void => {
    schedulingAlerts = schedulingAlerts.map(alert => alert.id === id ? { ...alert, resolved: true, resolvedAt: new Date() } : alert);
  },
  deleteSchedulingAlert: (id: string): void => {
    schedulingAlerts = schedulingAlerts.filter(alert => alert.id !== id);
  },

  // SoapNotes
  getSoapNotes: (): SoapNote[] => [...soapNotes],
  saveSoapNote: (note: SoapNote): void => {
     const index = soapNotes.findIndex(n => n.id === note.id);
     if (index > -1) {
         soapNotes[index] = note;
     } else {
         soapNotes.unshift(note);
     }
  },
  
  // Treatment Plans
  getTreatmentPlans: (): TreatmentPlan[] => [...treatmentPlans],
  updateTreatmentPlan: (updatedPlan: TreatmentPlan): void => {
      const index = treatmentPlans.findIndex(p => p.id === updatedPlan.id);
      if (index > -1) {
          treatmentPlans[index] = updatedPlan;
      }
  },
  
  // Exercise Prescriptions
  getExercisePrescriptions: (): ExercisePrescription[] => [...exercisePrescriptions],
  setExercisePrescriptionsForPlan: (planId: string, newExercises: ExercisePrescription[]): void => {
      // Remove old and add new
      exercisePrescriptions = exercisePrescriptions.filter(ex => ex.treatmentPlanId !== planId);
      exercisePrescriptions.push(...newExercises);
  },
};
