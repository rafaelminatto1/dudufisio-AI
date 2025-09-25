/**
 * Recurso FHIR: Encounter
 * Implementação do recurso Encounter seguindo padrões HL7 FHIR R4
 */

import { z } from 'zod';

// Schema de validação FHIR Encounter
export const FHIREncounterSchema = z.object({
  resourceType: z.literal('Encounter'),
  id: z.string().optional(),
  meta: z.object({
    versionId: z.string().optional(),
    lastUpdated: z.string().optional(),
    profile: z.array(z.string()).optional(),
    security: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    })).optional(),
    tag: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    })).optional()
  }).optional(),
  
  identifier: z.array(z.object({
    use: z.enum(['usual', 'official', 'temp', 'secondary']).optional(),
    type: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    }).optional(),
    system: z.string().optional(),
    value: z.string().optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional(),
    assigner: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }).optional()
  })).optional(),
  
  status: z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']),
  
  statusHistory: z.array(z.object({
    status: z.enum(['planned', 'arrived', 'triaged', 'in-progress', 'onleave', 'finished', 'cancelled', 'entered-in-error', 'unknown']),
    period: z.object({
      start: z.string(),
      end: z.string().optional()
    })
  })).optional(),
  
  class: z.object({
    system: z.string(),
    code: z.string(),
    display: z.string().optional()
  }),
  
  classHistory: z.array(z.object({
    class: z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    }),
    period: z.object({
      start: z.string(),
      end: z.string().optional()
    })
  })).optional(),
  
  type: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    })).optional(),
    text: z.string().optional()
  })).optional(),
  
  serviceType: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    })).optional(),
    text: z.string().optional()
  }).optional(),
  
  priority: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    })).optional(),
    text: z.string().optional()
  }).optional(),
  
  subject: z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  }).optional(),
  
  episodeOfCare: z.array(z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  })).optional(),
  
  basedOn: z.array(z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  })).optional(),
  
  participant: z.array(z.object({
    type: z.array(z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    })).optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional(),
    individual: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }).optional()
  })).optional(),
  
  appointment: z.array(z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  })).optional(),
  
  period: z.object({
    start: z.string().optional(),
    end: z.string().optional()
  }).optional(),
  
  length: z.object({
    value: z.number().optional(),
    unit: z.string().optional(),
    system: z.string().optional(),
    code: z.string().optional()
  }).optional(),
  
  reasonCode: z.array(z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    })).optional(),
    text: z.string().optional()
  })).optional(),
  
  reasonReference: z.array(z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  })).optional(),
  
  diagnosis: z.array(z.object({
    condition: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }),
    use: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    }).optional(),
    rank: z.number().optional()
  })).optional(),
  
  account: z.array(z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  })).optional(),
  
  hospitalization: z.object({
    preAdmissionIdentifier: z.object({
      use: z.enum(['usual', 'official', 'temp', 'secondary']).optional(),
      type: z.object({
        coding: z.array(z.object({
          system: z.string(),
          code: z.string(),
          display: z.string().optional()
        })).optional(),
        text: z.string().optional()
      }).optional(),
      system: z.string().optional(),
      value: z.string().optional(),
      period: z.object({
        start: z.string().optional(),
        end: z.string().optional()
      }).optional(),
      assigner: z.object({
        reference: z.string().optional(),
        display: z.string().optional()
      }).optional()
    }).optional(),
    origin: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }).optional(),
    admitSource: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    }).optional(),
    reAdmission: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    }).optional(),
    dietPreference: z.array(z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    })).optional(),
    specialCourtesy: z.array(z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    })).optional(),
    specialArrangement: z.array(z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    })).optional(),
    destination: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }).optional(),
    dischargeDisposition: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    }).optional()
  }).optional(),
  
  location: z.array(z.object({
    location: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }),
    status: z.enum(['planned', 'active', 'reserved', 'completed']).optional(),
    physicalType: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    }).optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  })).optional(),
  
  serviceProvider: z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  }).optional(),
  
  partOf: z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  }).optional()
});

export type FHIREncounter = z.infer<typeof FHIREncounterSchema>;

export class Encounter {
  private data: FHIREncounter;

  constructor(data: FHIREncounter) {
    this.data = data;
  }

  /**
   * Cria um novo Encounter FHIR
   */
  static create(encounterData: {
    id?: string;
    status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown';
    class: {
      system: string;
      code: string;
      display?: string;
    };
    type?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    }>;
    subject?: {
      reference: string;
      display?: string;
    };
    participant?: Array<{
      type: Array<{
        coding: Array<{
          system: string;
          code: string;
          display?: string;
        }>;
      }>;
      individual: {
        reference: string;
        display?: string;
      };
    }>;
    period?: {
      start: string;
      end?: string;
    };
    reasonCode?: Array<{
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    }>;
    diagnosis?: Array<{
      condition: {
        reference: string;
        display?: string;
      };
      use?: {
        coding: Array<{
          system: string;
          code: string;
          display?: string;
        }>;
      };
      rank?: number;
    }>;
  }): Encounter {
    const fhirEncounter: FHIREncounter = {
      resourceType: 'Encounter',
      id: encounterData.id,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Encounter']
      },
      status: encounterData.status,
      class: encounterData.class,
      type: encounterData.type,
      subject: encounterData.subject,
      participant: encounterData.participant,
      period: encounterData.period,
      reasonCode: encounterData.reasonCode,
      diagnosis: encounterData.diagnosis
    };

    return new Encounter(fhirEncounter);
  }

  /**
   * Valida o Encounter FHIR
   */
  validate(): { isValid: boolean; errors: string[] } {
    try {
      FHIREncounterSchema.parse(this.data);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { isValid: false, errors: ['Erro de validação desconhecido'] };
    }
  }

  /**
   * Obtém o ID do encounter
   */
  getId(): string | undefined {
    return this.data.id;
  }

  /**
   * Obtém o status do encounter
   */
  getStatus(): string {
    return this.data.status;
  }

  /**
   * Obtém a classe do encounter
   */
  getClass(): { system: string; code: string; display?: string } {
    return this.data.class;
  }

  /**
   * Obtém o período do encounter
   */
  getPeriod(): { start?: string; end?: string } {
    return this.data.period || {};
  }

  /**
   * Obtém a duração do encounter
   */
  getDuration(): number | undefined {
    const period = this.getPeriod();
    if (!period.start) return undefined;
    
    const start = new Date(period.start);
    const end = period.end ? new Date(period.end) : new Date();
    
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // em minutos
  }

  /**
   * Obtém o paciente do encounter
   */
  getPatient(): { reference?: string; display?: string } {
    return this.data.subject || {};
  }

  /**
   * Obtém os participantes do encounter
   */
  getParticipants(): Array<{
    type: Array<{
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    }>;
    individual: {
      reference?: string;
      display?: string;
    };
  }> {
    return this.data.participant || [];
  }

  /**
   * Obtém o terapeuta responsável
   */
  getTherapist(): { reference?: string; display?: string } | undefined {
    const therapist = this.data.participant?.find(p => 
      p.type?.some(t => 
        t.coding?.some(c => c.code === 'ATND' || c.code === 'PPRF')
      )
    );
    return therapist?.individual;
  }

  /**
   * Obtém os códigos de motivo
   */
  getReasonCodes(): Array<{
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  }> {
    return this.data.reasonCode || [];
  }

  /**
   * Obtém os diagnósticos
   */
  getDiagnoses(): Array<{
    condition: {
      reference?: string;
      display?: string;
    };
    use?: {
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    };
    rank?: number;
  }> {
    return this.data.diagnosis || [];
  }

  /**
   * Obtém os tipos de encounter
   */
  getTypes(): Array<{
    coding: Array<{
      system: string;
      code: string;
      display?: string;
    }>;
  }> {
    return this.data.type || [];
  }

  /**
   * Verifica se o encounter está ativo
   */
  isActive(): boolean {
    return this.data.status === 'in-progress';
  }

  /**
   * Verifica se o encounter foi finalizado
   */
  isFinished(): boolean {
    return this.data.status === 'finished';
  }

  /**
   * Verifica se o encounter foi cancelado
   */
  isCancelled(): boolean {
    return this.data.status === 'cancelled';
  }

  /**
   * Atualiza o status do encounter
   */
  updateStatus(status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled' | 'entered-in-error' | 'unknown'): Encounter {
    const statusHistory = this.data.statusHistory || [];
    const currentStatus = this.data.status;
    
    // Adicionar ao histórico se o status mudou
    if (currentStatus !== status) {
      statusHistory.push({
        status: currentStatus,
        period: {
          start: this.data.period?.start || new Date().toISOString(),
          end: new Date().toISOString()
        }
      });
    }

    const updatedData = {
      ...this.data,
      status,
      statusHistory,
      meta: {
        ...this.data.meta,
        lastUpdated: new Date().toISOString(),
        versionId: this.data.meta?.versionId ? 
          (parseInt(this.data.meta.versionId) + 1).toString() : '1'
      }
    };

    return new Encounter(updatedData);
  }

  /**
   * Adiciona um diagnóstico
   */
  addDiagnosis(diagnosis: {
    condition: {
      reference: string;
      display?: string;
    };
    use?: {
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    };
    rank?: number;
  }): Encounter {
    const currentDiagnoses = this.data.diagnosis || [];
    const updatedDiagnoses = [...currentDiagnoses, diagnosis];

    return new Encounter({
      ...this.data,
      diagnosis: updatedDiagnoses,
      meta: {
        ...this.data.meta,
        lastUpdated: new Date().toISOString(),
        versionId: this.data.meta?.versionId ? 
          (parseInt(this.data.meta.versionId) + 1).toString() : '1'
      }
    });
  }

  /**
   * Adiciona um participante
   */
  addParticipant(participant: {
    type: Array<{
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    }>;
    individual: {
      reference: string;
      display?: string;
    };
    period?: {
      start?: string;
      end?: string;
    };
  }): Encounter {
    const currentParticipants = this.data.participant || [];
    const updatedParticipants = [...currentParticipants, participant];

    return new Encounter({
      ...this.data,
      participant: updatedParticipants,
      meta: {
        ...this.data.meta,
        lastUpdated: new Date().toISOString(),
        versionId: this.data.meta?.versionId ? 
          (parseInt(this.data.meta.versionId) + 1).toString() : '1'
      }
    });
  }

  /**
   * Finaliza o encounter
   */
  finish(endTime?: string): Encounter {
    const end = endTime || new Date().toISOString();
    
    return this.updateStatus('finished').update({
      period: {
        ...this.data.period,
        end
      }
    });
  }

  /**
   * Atualiza informações do encounter
   */
  update(updates: Partial<FHIREncounter>): Encounter {
    const updatedData = {
      ...this.data,
      ...updates,
      meta: {
        ...this.data.meta,
        lastUpdated: new Date().toISOString(),
        versionId: this.data.meta?.versionId ? 
          (parseInt(this.data.meta.versionId) + 1).toString() : '1'
      }
    };

    return new Encounter(updatedData);
  }

  /**
   * Converte para JSON
   */
  toJSON(): FHIREncounter {
    return this.data;
  }

  /**
   * Converte para string JSON
   */
  toString(): string {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Cria a partir de JSON
   */
  static fromJSON(json: string | object): Encounter {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new Encounter(data as FHIREncounter);
  }

  /**
   * Cria a partir de dados do sistema interno
   */
  static fromInternalData(internalData: {
    id: string;
    patientId: string;
    therapistId: string;
    startTime: Date;
    endTime?: Date;
    status: 'planned' | 'in-progress' | 'finished' | 'cancelled';
    type: 'evaluation' | 'treatment' | 're_evaluation' | 'discharge' | 'follow_up';
    specialty: string;
    reason?: string;
    diagnosis?: Array<{
      condition: string;
      rank?: number;
    }>;
  }): Encounter {
    const encounterClass = {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'AMB',
      display: 'ambulatory'
    };

    const encounterType = {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/encounter-type',
        code: internalData.type,
        display: internalData.type.replace('_', ' ').toUpperCase()
      }]
    };

    const reasonCode = internalData.reason ? [{
      coding: [{
        system: 'http://snomed.info/sct',
        code: '185349003',
        display: internalData.reason
      }]
    }] : undefined;

    const diagnosis = internalData.diagnosis?.map(d => ({
      condition: {
        reference: `Condition/${d.condition}`,
        display: d.condition
      },
      rank: d.rank
    }));

    return Encounter.create({
      id: internalData.id,
      status: internalData.status,
      class: encounterClass,
      type: [encounterType],
      subject: {
        reference: `Patient/${internalData.patientId}`,
        display: `Patient ${internalData.patientId}`
      },
      participant: [{
        type: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
            code: 'ATND',
            display: 'attending'
          }]
        }],
        individual: {
          reference: `Practitioner/${internalData.therapistId}`,
          display: `Therapist ${internalData.therapistId}`
        }
      }],
      period: {
        start: internalData.startTime.toISOString(),
        end: internalData.endTime?.toISOString()
      },
      reasonCode,
      diagnosis
    });
  }

  /**
   * Converte para dados do sistema interno
   */
  toInternalData(): {
    id: string;
    patientId: string;
    therapistId: string;
    startTime: Date;
    endTime?: Date;
    status: 'planned' | 'in-progress' | 'finished' | 'cancelled';
    type: 'evaluation' | 'treatment' | 're_evaluation' | 'discharge' | 'follow_up';
    specialty: string;
    reason?: string;
    diagnosis?: Array<{
      condition: string;
      rank?: number;
    }>;
  } {
    const patientRef = this.getPatient().reference;
    const therapistRef = this.getTherapist()?.reference;
    const period = this.getPeriod();
    const types = this.getTypes();
    const diagnoses = this.getDiagnoses();

    return {
      id: this.data.id || '',
      patientId: patientRef?.replace('Patient/', '') || '',
      therapistId: therapistRef?.replace('Practitioner/', '') || '',
      startTime: period.start ? new Date(period.start) : new Date(),
      endTime: period.end ? new Date(period.end) : undefined,
      status: this.data.status as 'planned' | 'in-progress' | 'finished' | 'cancelled',
      type: types[0]?.coding?.[0]?.code as 'evaluation' | 'treatment' | 're_evaluation' | 'discharge' | 'follow_up' || 'treatment',
      specialty: types[0]?.coding?.[0]?.display || '',
      reason: this.getReasonCodes()[0]?.coding?.[0]?.display,
      diagnosis: diagnoses.map(d => ({
        condition: d.condition.display || d.condition.reference || '',
        rank: d.rank
      }))
    };
  }
}

