import { mockPurchasedVouchers, mockPatients, mockSoapNotes, mockPartners, sampleVoucherPlans } from '../data/mockData';
const partners = [...mockPartners];
const delay = (ms) => new Promise(res => setTimeout(res, ms));
export const getPartners = async () => {
    await delay(300);
    return [...partners];
};
export const savePartner = async (partnerData) => {
    await delay(400);
    if (partnerData.id) {
        const index = partners.findIndex(p => p.id === partnerData.id);
        if (index > -1) {
            const updatedPartner = { ...partners[index], ...partnerData };
            partners[index] = updatedPartner;
            return updatedPartner;
        }
        throw new Error("Partner not found");
    }
    else {
        const newPartner = {
            id: `partner_${Date.now()}`,
            ...partnerData,
            avatarUrl: `https://i.pravatar.cc/150?u=${partnerData.userId}`
        };
        partners.push(newPartner);
        return newPartner;
    }
};
export const sellVoucher = async (patientId, partnerId, planId) => {
    await delay(600);
    const plan = sampleVoucherPlans.find(p => p.id === planId);
    if (!plan)
        throw new Error("Plano não encontrado.");
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + plan.durationDays);
    const newVoucher = {
        id: `voucher_${Date.now()}`,
        code: `VF-CLINIC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        patientId,
        plan,
        status: 'activated',
        purchaseDate: today,
        activationDate: today,
        expiryDate,
        remainingCredits: plan.credits,
    };
    mockPurchasedVouchers.unshift(newVoucher);
    return newVoucher;
};
export const getEducatorClients = async (educatorId) => {
    await delay(500);
    const clients = [];
    for (const voucher of mockPurchasedVouchers) {
        // In a real system, you'd filter by educatorId. Here we assume all vouchers are for the one educator.
        const patient = mockPatients.find(p => p.id === voucher.patientId);
        if (patient) {
            clients.push({ patient, voucher });
        }
    }
    return clients;
};
export const getIntegratedClientHistory = async (clientId, educatorId) => {
    await delay(700);
    const voucher = mockPurchasedVouchers.find(v => v.patientId === clientId);
    const patient = mockPatients.find(p => p.id === clientId);
    if (!voucher || !patient) {
        return null;
    }
    // Simulate fetching related data
    const soapNotes = mockSoapNotes.filter(note => note.patientId === clientId);
    return {
        patient,
        voucher,
        soapNotes,
    };
};
