import { mockPatients, mockAppointments, mockSoapNotes, mockTreatmentPlans, mockExercisePrescriptions, mockRecurrenceTemplates, mockWaitlistEntries, mockScheduleBlocks, mockSchedulingAlerts, } from '../data/mockData';
// Create mutable copies of the mock data to act as our "database"
let patients = [...mockPatients];
let appointments = [...mockAppointments];
const soapNotes = [...mockSoapNotes];
const treatmentPlans = [...mockTreatmentPlans];
let exercisePrescriptions = [...mockExercisePrescriptions];
const recurrenceTemplates = [...(mockRecurrenceTemplates || [])];
let waitlistEntries = [...(mockWaitlistEntries || [])];
let scheduleBlocks = [...(mockScheduleBlocks || [])];
let schedulingAlerts = [...(mockSchedulingAlerts || [])];
// A central place to manage all mock data, ensuring consistency.
export const db = {
    // Patients
    getPatients: () => [...patients],
    getPatientById: (id) => patients.find(p => p.id === id),
    addPatient: (patient) => { patients.unshift(patient); },
    updatePatient: (updatedPatient) => {
        patients = patients.map(p => p.id === updatedPatient.id ? updatedPatient : p);
    },
    // Appointments
    getAppointments: () => [...appointments],
    saveAppointment: (appointmentData) => {
        const index = appointments.findIndex(a => a.id === appointmentData.id);
        if (index > -1) {
            appointments[index] = appointmentData;
        }
        else {
            appointments.push(appointmentData);
        }
    },
    deleteAppointment: (id) => {
        appointments = appointments.filter(a => a.id !== id);
    },
    deleteAppointmentSeries: (seriesId, fromDate) => {
        appointments = appointments.filter(a => !(a.seriesId === seriesId && a.startTime >= fromDate));
    },
    // Recurrence Templates
    getRecurrenceTemplates: () => [...recurrenceTemplates],
    getRecurrenceTemplateById: (id) => recurrenceTemplates.find(t => t.id === id),
    saveRecurrenceTemplate: (template) => {
        const index = recurrenceTemplates.findIndex(t => t.id === template.id);
        if (index > -1) {
            recurrenceTemplates[index] = template;
        }
        else {
            recurrenceTemplates.push(template);
        }
    },
    // Schedule Blocks
    getScheduleBlocks: () => [...scheduleBlocks],
    saveScheduleBlock: (block) => {
        const index = scheduleBlocks.findIndex(b => b.id === block.id);
        if (index > -1) {
            scheduleBlocks[index] = block;
        }
        else {
            scheduleBlocks.push(block);
        }
    },
    deleteScheduleBlock: (id) => {
        scheduleBlocks = scheduleBlocks.filter(block => block.id !== id);
    },
    // Waitlist
    getWaitlistEntries: () => [...waitlistEntries],
    getWaitlistEntryById: (id) => waitlistEntries.find(entry => entry.id === id),
    saveWaitlistEntry: (entry) => {
        const index = waitlistEntries.findIndex(e => e.id === entry.id);
        if (index > -1) {
            waitlistEntries[index] = entry;
        }
        else {
            waitlistEntries.push(entry);
        }
    },
    deleteWaitlistEntry: (id) => {
        waitlistEntries = waitlistEntries.filter(entry => entry.id !== id);
    },
    // Scheduling Alerts
    getSchedulingAlerts: () => [...schedulingAlerts],
    saveSchedulingAlert: (alert) => {
        const index = schedulingAlerts.findIndex(a => a.id === alert.id);
        if (index > -1) {
            schedulingAlerts[index] = alert;
        }
        else {
            schedulingAlerts.push(alert);
        }
    },
    resolveSchedulingAlert: (id) => {
        schedulingAlerts = schedulingAlerts.map(alert => alert.id === id ? { ...alert, resolved: true, resolvedAt: new Date() } : alert);
    },
    deleteSchedulingAlert: (id) => {
        schedulingAlerts = schedulingAlerts.filter(alert => alert.id !== id);
    },
    // SoapNotes
    getSoapNotes: () => [...soapNotes],
    saveSoapNote: (note) => {
        const index = soapNotes.findIndex(n => n.id === note.id);
        if (index > -1) {
            soapNotes[index] = note;
        }
        else {
            soapNotes.unshift(note);
        }
    },
    // Treatment Plans
    getTreatmentPlans: () => [...treatmentPlans],
    updateTreatmentPlan: (updatedPlan) => {
        const index = treatmentPlans.findIndex(p => p.id === updatedPlan.id);
        if (index > -1) {
            treatmentPlans[index] = updatedPlan;
        }
    },
    // Exercise Prescriptions
    getExercisePrescriptions: () => [...exercisePrescriptions],
    setExercisePrescriptionsForPlan: (planId, newExercises) => {
        // Remove old and add new
        exercisePrescriptions = exercisePrescriptions.filter(ex => ex.treatmentPlanId !== planId);
        exercisePrescriptions.push(...newExercises);
    },
};
