// lib/medical-records/fhir/transformers/FHIRTransformer.ts
import { FHIRPatient } from '../resources/Patient';
import { FHIREncounter } from '../resources/Encounter';
import { FHIRObservation } from '../resources/Observation';
import { FHIRDiagnosticReport } from '../resources/DiagnosticReport';
import { 
  PatientId, 
  DocumentType, 
  DocumentContent,
  ChiefComplaint,
  PhysicalExam,
  PhysiotherapyDiagnosis,
  TreatmentPlan
} from '../../../../types/medical-records';

export class FHIRTransformer {
  /**
   * Transform patient data to FHIR Patient resource
   */
  static toFHIRPatient(patientData: {
    id: PatientId;
    name: {
      given: string[];
      family: string;
    };
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate: string;
    address?: {
      line: string[];
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    telecom?: Array<{
      system: 'phone' | 'email';
      value: string;
      use: 'home' | 'work' | 'mobile';
    }>;
  }): FHIRPatient {
    return {
      resourceType: 'Patient',
      id: patientData.id,
      name: [{
        use: 'official',
        family: patientData.name.family,
        given: patientData.name.given
      }],
      gender: patientData.gender,
      birthDate: patientData.birthDate,
      address: patientData.address ? [{
        use: 'home',
        line: patientData.address.line,
        city: patientData.address.city,
        state: patientData.address.state,
        postalCode: patientData.address.postalCode,
        country: patientData.address.country
      }] : undefined,
      telecom: patientData.telecom?.map(contact => ({
        system: contact.system,
        value: contact.value,
        use: contact.use
      }))
    };
  }

  /**
   * Transform appointment data to FHIR Encounter resource
   */
  static toFHIREncounter(appointmentData: {
    id: string;
    patientId: PatientId;
    therapistId: string;
    startTime: string;
    endTime: string;
    status: 'planned' | 'arrived' | 'in-progress' | 'finished' | 'cancelled';
    type: string;
    specialty: string;
  }): FHIREncounter {
    return {
      resourceType: 'Encounter',
      id: appointmentData.id,
      status: appointmentData.status,
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'AMB',
        display: 'ambulatory'
      },
      type: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/encounter-type',
          code: appointmentData.type,
          display: appointmentData.specialty
        }]
      }],
      subject: {
        reference: `Patient/${appointmentData.patientId}`,
        display: `Patient ${appointmentData.patientId}`
      },
      participant: [{
        individual: {
          reference: `Practitioner/${appointmentData.therapistId}`,
          display: `Therapist ${appointmentData.therapistId}`
        }
      }],
      period: {
        start: appointmentData.startTime,
        end: appointmentData.endTime
      }
    };
  }

  /**
   * Transform clinical assessment to FHIR Observation
   */
  static toFHIRObservation(assessmentData: {
    id: string;
    patientId: PatientId;
    encounterId?: string;
    code: string;
    display: string;
    value: string | number | boolean;
    effectiveDateTime: string;
    category: string;
    interpretation?: string;
  }): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: assessmentData.id,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: assessmentData.category,
          display: assessmentData.category
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: assessmentData.code,
          display: assessmentData.display
        }]
      },
      subject: {
        reference: `Patient/${assessmentData.patientId}`,
        display: `Patient ${assessmentData.patientId}`
      },
      encounter: assessmentData.encounterId ? {
        reference: `Encounter/${assessmentData.encounterId}`,
        display: `Encounter ${assessmentData.encounterId}`
      } : undefined,
      effectiveDateTime: assessmentData.effectiveDateTime,
      valueString: typeof assessmentData.value === 'string' ? assessmentData.value : undefined,
      valueQuantity: typeof assessmentData.value === 'number' ? {
        value: assessmentData.value,
        unit: 'score'
      } : undefined,
      valueBoolean: typeof assessmentData.value === 'boolean' ? assessmentData.value : undefined,
      interpretation: assessmentData.interpretation ? [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
          code: assessmentData.interpretation,
          display: assessmentData.interpretation
        }]
      }] : undefined
    };
  }

  /**
   * Transform clinical document to FHIR DiagnosticReport
   */
  static toFHIRDiagnosticReport(documentData: {
    id: string;
    patientId: PatientId;
    encounterId?: string;
    documentType: DocumentType;
    content: DocumentContent;
    effectiveDateTime: string;
    issued: string;
    performerId: string;
    conclusion?: string;
  }): FHIRDiagnosticReport {
    const getDocumentCode = (type: DocumentType): { code: string; display: string } => {
      switch (type) {
        case 'initial_assessment':
          return { code: '11450-4', display: 'Problem list Reported' };
        case 'session_evolution':
          return { code: '11502-2', display: 'Laboratory report' };
        case 'treatment_plan':
          return { code: '18776-5', display: 'Plan of care note' };
        case 'discharge_summary':
          return { code: '18842-5', display: 'Discharge summary' };
        case 'referral_letter':
          return { code: '11488-4', display: 'Consult note' };
        case 'progress_report':
          return { code: '11506-3', display: 'Progress note' };
        default:
          return { code: '11450-4', display: 'Problem list Reported' };
      }
    };

    const documentCode = getDocumentCode(documentData.documentType);

    return {
      resourceType: 'DiagnosticReport',
      id: documentData.id,
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
          code: 'LAB',
          display: 'Laboratory'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: documentCode.code,
          display: documentCode.display
        }]
      },
      subject: {
        reference: `Patient/${documentData.patientId}`,
        display: `Patient ${documentData.patientId}`
      },
      encounter: documentData.encounterId ? {
        reference: `Encounter/${documentData.encounterId}`,
        display: `Encounter ${documentData.encounterId}`
      } : undefined,
      effectiveDateTime: documentData.effectiveDateTime,
      issued: documentData.issued,
      performer: [{
        reference: `Practitioner/${documentData.performerId}`,
        display: `Practitioner ${documentData.performerId}`
      }],
      conclusion: documentData.conclusion || this.generateConclusion(documentData.content, documentData.documentType),
      presentedForm: [{
        contentType: 'application/json',
        data: Buffer.from(JSON.stringify(documentData.content)).toString('base64'),
        title: `${documentCode.display} - ${documentData.id}`
      }]
    };
  }

  /**
   * Transform FHIR Patient back to internal patient data
   */
  static fromFHIRPatient(fhirPatient: FHIRPatient): {
    id: PatientId;
    name: {
      given: string[];
      family: string;
    };
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate: string;
    address?: {
      line: string[];
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  } {
    const primaryName = fhirPatient.name?.[0];
    const primaryAddress = fhirPatient.address?.[0];

    return {
      id: fhirPatient.id,
      name: {
        given: primaryName?.given || [],
        family: primaryName?.family || ''
      },
      gender: fhirPatient.gender || 'unknown',
      birthDate: fhirPatient.birthDate || '',
      address: primaryAddress ? {
        line: primaryAddress.line || [],
        city: primaryAddress.city || '',
        state: primaryAddress.state || '',
        postalCode: primaryAddress.postalCode || '',
        country: primaryAddress.country || ''
      } : undefined
    };
  }

  /**
   * Generate conclusion from document content
   */
  private static generateConclusion(content: DocumentContent, type: DocumentType): string {
    switch (type) {
      case 'initial_assessment':
        return `Initial assessment completed. Chief complaint: ${content.chiefComplaint || 'Not specified'}. Diagnosis: ${content.diagnosis || 'Pending'}.`;
      case 'session_evolution':
        return `Session evolution recorded. Techniques applied: ${content.techniquesApplied?.join(', ') || 'Not specified'}. Patient response: ${content.patientResponse || 'Not documented'}.`;
      case 'treatment_plan':
        return `Treatment plan established. Interventions: ${content.interventions?.join(', ') || 'Not specified'}. Duration: ${content.duration || 'Not specified'}.`;
      case 'discharge_summary':
        return `Discharge summary. Treatment completed. Final recommendations: ${content.finalRecommendations || 'Not specified'}.`;
      default:
        return `Clinical document of type ${type} completed.`;
    }
  }

  /**
   * Transform clinical data to multiple FHIR resources
   */
  static transformClinicalDataToFHIR(data: {
    patient: any;
    encounter: any;
    assessments: any[];
    documents: any[];
  }): {
    patient: FHIRPatient;
    encounter: FHIREncounter;
    observations: FHIRObservation[];
    diagnosticReports: FHIRDiagnosticReport[];
  } {
    return {
      patient: this.toFHIRPatient(data.patient),
      encounter: this.toFHIREncounter(data.encounter),
      observations: data.assessments.map(assessment => 
        this.toFHIRObservation(assessment)
      ),
      diagnosticReports: data.documents.map(document => 
        this.toFHIRDiagnosticReport(document)
      )
    };
  }
}
