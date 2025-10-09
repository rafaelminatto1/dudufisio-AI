import { db } from './mockDb';
import { eventService } from './eventService';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getPlanByPatientId = async (patientId) => {
    await delay(300);
    const plan = db.getTreatmentPlans().find(p => p.patientId === patientId);
    if (plan) {
        const exercises = await getExercisesByPlanId(plan.id);
        return { ...plan, exercises };
    }
    return undefined;
};
export const getExercisesByPlanId = async (planId) => {
    await delay(300);
    return db.getExercisePrescriptions().filter(ex => ex.treatmentPlanId === planId);
};
export const updatePlan = async (patientId, updates) => {
    await delay(400);
    const plans = db.getTreatmentPlans();
    const index = plans.findIndex(p => p.patientId === patientId);
    if (index > -1) {
        const existingPlan = plans[index];
        const newExercises = (updates.exercises || []).map((ex, i) => ({
            id: `ex_${Date.now()}_${i}`,
            treatmentPlanId: existingPlan.id,
            exerciseName: ex.exerciseName,
            sets: ex.sets,
            repetitions: ex.repetitions,
            resistanceLevel: 'A definir',
            progressionCriteria: 'A definir',
        }));
        const updatedPlan = {
            ...existingPlan,
            treatmentGoals: updates.treatmentGoals || existingPlan.treatmentGoals,
            exercises: newExercises.length > 0 ? newExercises : existingPlan.exercises,
        };
        db.updateTreatmentPlan(updatedPlan);
        db.setExercisePrescriptionsForPlan(existingPlan.id, newExercises);
        eventService.emit('treatmentPlans:changed');
        return updatedPlan;
    }
    throw new Error("Plano de tratamento não encontrado para este paciente.");
};
