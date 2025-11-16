import { ScheduleBlock, ScheduleBlockType } from '../../types';
import { db } from '../mockDb';
import { appointmentsOverlap } from './schedulingUtils';

type BlockMetadata = Record<string, unknown>;

export interface BlockInput {
  therapistId: string;
  startTime: Date;
  endTime: Date;
  reason?: string;
  blockType?: ScheduleBlockType;
  recurrenceRule?: ScheduleBlock['recurrenceRule'];
  metadata?: BlockMetadata;
}

function validateBlock(block: BlockInput): void {
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

function hasConflict(block: BlockInput): boolean {
  const appointments = db.getAppointments();
  return appointments.some(appointment => {
    if (appointment.therapistId !== block.therapistId) {
      return false;
    }
    return appointmentsOverlap(
      { startTime: appointment.startTime, endTime: appointment.endTime },
      { startTime: block.startTime, endTime: block.endTime }
    );
  });
}

export const blockService = {
  async listBlocks(): Promise<ScheduleBlock[]> {
    return db.getScheduleBlocks();
  },

  async createBlock(input: BlockInput): Promise<ScheduleBlock> {
    validateBlock(input);
    if (hasConflict(input)) {
      throw new Error('Há agendamentos existentes neste intervalo');
    }

    const block: ScheduleBlock = {
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

  async deleteBlock(id: string): Promise<void> {
    db.deleteScheduleBlock(id);
  },

  async createBlocks(blocks: BlockInput[]): Promise<ScheduleBlock[]> {
    const created: ScheduleBlock[] = [];
    for (const block of blocks) {
      const result = await this.createBlock(block);
      created.push(result);
    }
    return created;
  },
};

