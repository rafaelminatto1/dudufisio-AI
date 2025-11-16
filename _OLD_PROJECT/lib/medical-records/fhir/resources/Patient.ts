/**
 * Recurso FHIR: Patient
 * Implementação do recurso Patient seguindo padrões HL7 FHIR R4
 */

import { z } from 'zod';

// Schema de validação FHIR Patient
export const FHIRPatientSchema = z.object({
  resourceType: z.literal('Patient'),
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
  
  active: z.boolean().optional(),
  
  name: z.array(z.object({
    use: z.enum(['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden']).optional(),
    family: z.string().optional(),
    given: z.array(z.string()).optional(),
    prefix: z.array(z.string()).optional(),
    suffix: z.array(z.string()).optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  })).optional(),
  
  telecom: z.array(z.object({
    system: z.enum(['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other']).optional(),
    value: z.string().optional(),
    use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional(),
    rank: z.number().optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  })).optional(),
  
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  
  birthDate: z.string().optional(),
  
  deceasedBoolean: z.boolean().optional(),
  deceasedDateTime: z.string().optional(),
  
  address: z.array(z.object({
    use: z.enum(['home', 'work', 'temp', 'old', 'billing']).optional(),
    type: z.enum(['postal', 'physical', 'both']).optional(),
    text: z.string().optional(),
    line: z.array(z.string()).optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  })).optional(),
  
  maritalStatus: z.object({
    coding: z.array(z.object({
      system: z.string(),
      code: z.string(),
      display: z.string().optional()
    })).optional(),
    text: z.string().optional()
  }).optional(),
  
  multipleBirthBoolean: z.boolean().optional(),
  multipleBirthInteger: z.number().optional(),
  
  photo: z.array(z.object({
    contentType: z.string().optional(),
    language: z.string().optional(),
    data: z.string().optional(),
    url: z.string().optional(),
    size: z.number().optional(),
    hash: z.string().optional(),
    title: z.string().optional(),
    creation: z.string().optional()
  })).optional(),
  
  contact: z.array(z.object({
    relationship: z.array(z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    })).optional(),
    name: z.object({
      use: z.enum(['usual', 'official', 'temp', 'nickname', 'anonymous', 'old', 'maiden']).optional(),
      family: z.string().optional(),
      given: z.array(z.string()).optional(),
      prefix: z.array(z.string()).optional(),
      suffix: z.array(z.string()).optional(),
      period: z.object({
        start: z.string().optional(),
        end: z.string().optional()
      }).optional()
    }).optional(),
    telecom: z.array(z.object({
      system: z.enum(['phone', 'fax', 'email', 'pager', 'url', 'sms', 'other']).optional(),
      value: z.string().optional(),
      use: z.enum(['home', 'work', 'temp', 'old', 'mobile']).optional(),
      rank: z.number().optional(),
      period: z.object({
        start: z.string().optional(),
        end: z.string().optional()
      }).optional()
    })).optional(),
    address: z.object({
      use: z.enum(['home', 'work', 'temp', 'old', 'billing']).optional(),
      type: z.enum(['postal', 'physical', 'both']).optional(),
      text: z.string().optional(),
      line: z.array(z.string()).optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
      period: z.object({
        start: z.string().optional(),
        end: z.string().optional()
      }).optional()
    }).optional(),
    gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
    organization: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }).optional(),
    period: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  })).optional(),
  
  communication: z.array(z.object({
    language: z.object({
      coding: z.array(z.object({
        system: z.string(),
        code: z.string(),
        display: z.string().optional()
      })).optional(),
      text: z.string().optional()
    }),
    preferred: z.boolean().optional()
  })).optional(),
  
  generalPractitioner: z.array(z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  })).optional(),
  
  managingOrganization: z.object({
    reference: z.string().optional(),
    display: z.string().optional()
  }).optional(),
  
  link: z.array(z.object({
    other: z.object({
      reference: z.string().optional(),
      display: z.string().optional()
    }),
    type: z.enum(['replaced-by', 'replaces', 'refer', 'seealso'])
  })).optional()
});

export type FHIRPatient = z.infer<typeof FHIRPatientSchema>;

export class Patient {
  private data: FHIRPatient;

  constructor(data: FHIRPatient) {
    this.data = data;
  }

  /**
   * Cria um novo Patient FHIR
   */
  static create(patientData: {
    id?: string;
    name: {
      family: string;
      given: string[];
    };
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate?: string;
    identifier?: Array<{
      system: string;
      value: string;
      use?: 'usual' | 'official' | 'temp' | 'secondary';
    }>;
    telecom?: Array<{
      system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
      value: string;
      use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
    }>;
    address?: Array<{
      line: string[];
      city: string;
      state: string;
      postalCode: string;
      country: string;
    }>;
  }): Patient {
    const fhirPatient: FHIRPatient = {
      resourceType: 'Patient',
      id: patientData.id,
      meta: {
        lastUpdated: new Date().toISOString(),
        profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
      },
      active: true,
      name: [{
        use: 'official',
        family: patientData.name.family,
        given: patientData.name.given
      }],
      gender: patientData.gender,
      birthDate: patientData.birthDate,
      identifier: patientData.identifier,
      telecom: patientData.telecom,
      address: patientData.address
    };

    return new Patient(fhirPatient);
  }

  /**
   * Valida o Patient FHIR
   */
  validate(): { isValid: boolean; errors: string[] } {
    try {
      FHIRPatientSchema.parse(this.data);
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
   * Obtém o ID do paciente
   */
  getId(): string | undefined {
    return this.data.id;
  }

  /**
   * Obtém o nome completo do paciente
   */
  getFullName(): string {
    const name = this.data.name?.[0];
    if (!name) return 'Nome não informado';
    
    const given = name.given?.join(' ') || '';
    const family = name.family || '';
    
    return `${given} ${family}`.trim();
  }

  /**
   * Obtém o gênero do paciente
   */
  getGender(): string {
    return this.data.gender || 'unknown';
  }

  /**
   * Obtém a data de nascimento
   */
  getBirthDate(): Date | undefined {
    if (!this.data.birthDate) return undefined;
    return new Date(this.data.birthDate);
  }

  /**
   * Calcula a idade do paciente
   */
  getAge(): number | undefined {
    const birthDate = this.getBirthDate();
    if (!birthDate) return undefined;
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Obtém telefone do paciente
   */
  getPhone(): string | undefined {
    const phone = this.data.telecom?.find(t => t.system === 'phone');
    return phone?.value;
  }

  /**
   * Obtém email do paciente
   */
  getEmail(): string | undefined {
    const email = this.data.telecom?.find(t => t.system === 'email');
    return email?.value;
  }

  /**
   * Obtém endereço do paciente
   */
  getAddress(): string | undefined {
    const address = this.data.address?.[0];
    if (!address) return undefined;
    
    const parts = [
      address.line?.join(', '),
      address.city,
      address.state,
      address.postalCode,
      address.country
    ].filter(Boolean);
    
    return parts.join(', ');
  }

  /**
   * Obtém identificadores do paciente
   */
  getIdentifiers(): Array<{ system: string; value: string; use?: string }> {
    return this.data.identifier?.map(id => ({
      system: id.system || '',
      value: id.value || '',
      use: id.use
    })) || [];
  }

  /**
   * Obtém CPF do paciente
   */
  getCPF(): string | undefined {
    const cpf = this.data.identifier?.find(id => 
      id.system === 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRIdentificador' &&
      id.type?.coding?.[0]?.code === 'CPF'
    );
    return cpf?.value;
  }

  /**
   * Obtém CNS do paciente
   */
  getCNS(): string | undefined {
    const cns = this.data.identifier?.find(id => 
      id.system === 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRIdentificador' &&
      id.type?.coding?.[0]?.code === 'CNS'
    );
    return cns?.value;
  }

  /**
   * Verifica se o paciente está ativo
   */
  isActive(): boolean {
    return this.data.active !== false;
  }

  /**
   * Atualiza informações do paciente
   */
  update(updates: Partial<FHIRPatient>): Patient {
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

    return new Patient(updatedData);
  }

  /**
   * Adiciona um novo identificador
   */
  addIdentifier(identifier: {
    system: string;
    value: string;
    use?: 'usual' | 'official' | 'temp' | 'secondary';
    type?: {
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    };
  }): Patient {
    const currentIdentifiers = this.data.identifier || [];
    const updatedIdentifiers = [...currentIdentifiers, identifier];

    return this.update({ identifier: updatedIdentifiers });
  }

  /**
   * Adiciona um novo contato
   */
  addContact(contact: {
    relationship: Array<{
      coding: Array<{
        system: string;
        code: string;
        display?: string;
      }>;
    }>;
    name?: {
      family: string;
      given: string[];
    };
    telecom?: Array<{
      system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
      value: string;
      use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
    }>;
  }): Patient {
    const currentContacts = this.data.contact || [];
    const updatedContacts = [...currentContacts, contact];

    return this.update({ contact: updatedContacts });
  }

  /**
   * Converte para JSON
   */
  toJSON(): FHIRPatient {
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
  static fromJSON(json: string | object): Patient {
    const data = typeof json === 'string' ? JSON.parse(json) : json;
    return new Patient(data as FHIRPatient);
  }

  /**
   * Cria a partir de dados do sistema interno
   */
  static fromInternalData(internalData: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    birthDate?: Date;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    cpf?: string;
    cns?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }): Patient {
    const nameParts = internalData.name.split(' ');
    const family = nameParts[nameParts.length - 1];
    const given = nameParts.slice(0, -1);

    const identifiers = [];
    if (internalData.cpf) {
      identifiers.push({
        system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRIdentificador',
        value: internalData.cpf,
        use: 'official' as const,
        type: {
          coding: [{
            system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRIdentificador',
            code: 'CPF',
            display: 'CPF'
          }]
        }
      });
    }

    if (internalData.cns) {
      identifiers.push({
        system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRIdentificador',
        value: internalData.cns,
        use: 'official' as const,
        type: {
          coding: [{
            system: 'http://www.saude.gov.br/fhir/r4/CodeSystem/BRIdentificador',
            code: 'CNS',
            display: 'CNS'
          }]
        }
      });
    }

    const telecom = [];
    if (internalData.email) {
      telecom.push({
        system: 'email' as const,
        value: internalData.email,
        use: 'home' as const
      });
    }

    if (internalData.phone) {
      telecom.push({
        system: 'phone' as const,
        value: internalData.phone,
        use: 'home' as const
      });
    }

    const address = internalData.address ? [{
      line: [internalData.address.street],
      city: internalData.address.city,
      state: internalData.address.state,
      postalCode: internalData.address.zipCode,
      country: internalData.address.country
    }] : undefined;

    return Patient.create({
      id: internalData.id,
      name: { family, given },
      gender: internalData.gender || 'unknown',
      birthDate: internalData.birthDate?.toISOString().split('T')[0],
      identifier: identifiers,
      telecom,
      address
    });
  }

  /**
   * Converte para dados do sistema interno
   */
  toInternalData(): {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    birthDate?: Date;
    gender?: 'male' | 'female' | 'other' | 'unknown';
    cpf?: string;
    cns?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  } {
    const address = this.data.address?.[0];
    
    return {
      id: this.data.id || '',
      name: this.getFullName(),
      email: this.getEmail(),
      phone: this.getPhone(),
      birthDate: this.getBirthDate(),
      gender: this.data.gender,
      cpf: this.getCPF(),
      cns: this.getCNS(),
      address: address ? {
        street: address.line?.join(', ') || '',
        city: address.city || '',
        state: address.state || '',
        zipCode: address.postalCode || '',
        country: address.country || ''
      } : undefined
    };
  }
}

