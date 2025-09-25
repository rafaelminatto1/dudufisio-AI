// lib/medical-records/fhir/resources/DiagnosticReport.ts
import { PatientId } from '../../../../types/medical-records';

export interface FHIRCodeableConcept {
  coding?: Array<{
    system?: string;
    code?: string;
    display?: string;
    version?: string;
    userSelected?: boolean;
  }>;
  text?: string;
}

export interface FHIRReference {
  reference?: string;
  type?: string;
  identifier?: {
    use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
    type?: FHIRCodeableConcept;
    system?: string;
    value?: string;
    period?: {
      start?: string;
      end?: string;
    };
    assigner?: FHIRReference;
  };
  display?: string;
}

export interface FHIRAttachment {
  contentType?: string;
  language?: string;
  data?: string; // base64Binary
  url?: string;
  size?: number;
  hash?: string; // base64Binary
  title?: string;
  creation?: string; // dateTime
}

export interface FHIRPeriod {
  start?: string; // dateTime
  end?: string; // dateTime
}

export interface FHIRDiagnosticReport {
  resourceType: 'DiagnosticReport';
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
    security?: FHIRCodeableConcept[];
    tag?: FHIRCodeableConcept[];
  };
  text?: {
    status?: 'generated' | 'extensions' | 'additional' | 'empty';
    div?: string;
  };
  identifier?: Array<{
    use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old';
    type?: FHIRCodeableConcept;
    system?: string;
    value?: string;
    period?: {
      start?: string;
      end?: string;
    };
    assigner?: FHIRReference;
  }>;
  basedOn?: FHIRReference[];
  status: 'registered' | 'partial' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  encounter?: FHIRReference;
  effectiveDateTime?: string; // dateTime
  effectivePeriod?: FHIRPeriod;
  issued?: string; // instant
  performer?: FHIRReference[];
  resultsInterpreter?: FHIRReference[];
  specimen?: FHIRReference[];
  result?: FHIRReference[];
  imagingStudy?: FHIRReference[];
  media?: Array<{
    comment?: string;
    link: FHIRReference;
  }>;
  conclusion?: string;
  conclusionCode?: FHIRCodeableConcept[];
  presentedForm?: FHIRAttachment[];
}
