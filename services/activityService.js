import { mockPatients } from '../data/mockData';
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getRecentActivities = async () => {
    await delay(400);
    // Create activities from patient pain points
    const allPainPoints = mockPatients.flatMap(p => (p.painPoints || []).map(pp => ({ ...pp, patient: p }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const activities = allPainPoints.slice(0, 5).map(point => ({
        id: `act_pp_${point.id}`,
        type: 'pain_point',
        patientId: point.patient.id,
        patientName: point.patient.name,
        patientAvatarUrl: point.patient.avatarUrl,
        summary: `Registrou dor em uma área (nível ${point.intensity})`,
        timestamp: new Date(point.date),
    }));
    // Sort by most recent
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
