// lib/medical-records/fhir/resources/Observation.ts
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

export interface FHIRQuantity {
  value?: number;
  comparator?: '<' | '<=' | '>=' | '>' | 'ad';
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRRange {
  low?: FHIRQuantity;
  high?: FHIRQuantity;
}

export interface FHIRRatio {
  numerator?: FHIRQuantity;
  denominator?: FHIRQuantity;
}

export interface FHIRSampledData {
  origin: FHIRQuantity;
  period: number;
  factor?: number;
  lowerLimit?: number;
  upperLimit?: number;
  dimensions: number;
  data?: string;
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

export interface FHIRObservation {
  resourceType: 'Observation';
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
  partOf?: FHIRReference[];
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  focus?: FHIRReference[];
  encounter?: FHIRReference;
  effectiveDateTime?: string; // dateTime
  effectivePeriod?: FHIRPeriod;
  effectiveTiming?: any; // Timing
  effectiveInstant?: string; // instant
  issued?: string; // instant
  performer?: FHIRReference[];
  valueQuantity?: FHIRQuantity;
  valueCodeableConcept?: FHIRCodeableConcept;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueRange?: FHIRRange;
  valueRatio?: FHIRRatio;
  valueSampledData?: FHIRSampledData;
  valueTime?: string; // time
  valueDateTime?: string; // dateTime
  valuePeriod?: FHIRPeriod;
  dataAbsentReason?: FHIRCodeableConcept;
  interpretation?: FHIRCodeableConcept[];
  note?: Array<{
    authorString?: string;
    authorReference?: FHIRReference;
    time?: string; // dateTime
    text: string;
  }>;
  bodySite?: FHIRCodeableConcept;
  method?: FHIRCodeableConcept;
  specimen?: FHIRReference;
  device?: FHIRReference;
  referenceRange?: Array<{
    low?: FHIRQuantity;
    high?: FHIRQuantity;
    type?: FHIRCodeableConcept;
    appliesTo?: FHIRCodeableConcept[];
    age?: FHIRRange;
    text?: string;
  }>;
  hasMember?: FHIRReference[];
  derivedFrom?: FHIRReference[];
  component?: Array<{
    code: FHIRCodeableConcept;
    valueQuantity?: FHIRQuantity;
    valueCodeableConcept?: FHIRCodeableConcept;
    valueString?: string;
    valueBoolean?: boolean;
    valueInteger?: number;
    valueRange?: FHIRRange;
    valueRatio?: FHIRRatio;
    valueSampledData?: FHIRSampledData;
    valueTime?: string; // time
    valueDateTime?: string; // dateTime
    valuePeriod?: FHIRPeriod;
    dataAbsentReason?: FHIRCodeableConcept;
    interpretation?: FHIRCodeableConcept[];
  }>;
}
