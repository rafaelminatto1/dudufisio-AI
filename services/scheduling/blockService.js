import { db } from '../mockDb';
import { appointmentsOverlap } from './schedulingUtils';
function validateBlock(block) {
    if (!block.therapistId) {
        throw new Error('Bloqueio de agenda precisa de um terapeuta');
    }
    if (!block.startTime || !block.endTime) {
        throw new Error('Intervalo de início e fim é obrigatório');
    }
    if (block.endTime <= block.startTime) {
        throw new Error('Horário de término deve ser posterior ao início');
    }
}
function hasConflict(block) {
    const appointments = db.getAppointments();
    return appointments.some(appointment => {
        if (appointment.therapistId !== block.therapistId) {
            return false;
        }
        return appointmentsOverlap({ startTime: appointment.startTime, endTime: appointment.endTime }, { startTime: block.startTime, endTime: block.endTime });
    });
}
export const blockService = {
    async listBlocks() {
        return db.getScheduleBlocks();
    },
    async createBlock(input) {
        validateBlock(input);
        if (hasConflict(input)) {
            throw new Error('Há agendamentos existentes neste intervalo');
        }
        const block = {
            id: `block_${Date.now()}`,
            therapistId: input.therapistId,
            startTime: input.startTime,
            endTime: input.endTime,
            blockType: input.blockType || 'ausencia',
            reason: input.reason,
            recurrenceRule: input.recurrenceRule,
            metadata: input.metadata,
        };
        db.saveScheduleBlock(block);
        return block;
    },
    async deleteBlock(id) {
        db.deleteScheduleBlock(id);
    },
    async createBlocks(blocks) {
        const created = [];
        for (const block of blocks) {
            const result = await this.createBlock(block);
            created.push(result);
        }
        return created;
    },
};
