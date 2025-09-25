import {
  PatientId,
  HealthScreeningAnswers,
  HealthScreeningResult,
  RiskFactor
} from '../../../types/checkin';

export class HealthScreeningResultImpl implements HealthScreeningResult {
  constructor(
    public isApproved: boolean,
    public issues?: string[],
    public requiresReview?: boolean,
    public riskFactors?: RiskFactor[]
  ) {}

  static approved(): HealthScreeningResult {
    return new HealthScreeningResultImpl(true);
  }

  static rejected(reason: string): HealthScreeningResult {
    return new HealthScreeningResultImpl(false, [reason]);
  }

  static requiresReview(riskFactors: RiskFactor[]): HealthScreeningResult {
    return new HealthScreeningResultImpl(false, undefined, true, riskFactors);
  }
}

export class HealthScreening {
  private covidSymptoms = [
    'fever',
    'cough',
    'shortness_of_breath',
    'loss_of_taste',
    'loss_of_smell',
    'body_aches',
    'headache',
    'sore_throat',
    'nausea',
    'diarrhea'
  ];

  private highRiskSymptoms = [
    'chest_pain',
    'difficulty_breathing',
    'severe_headache',
    'confusion',
    'severe_dizziness'
  ];

  constructor(
    private patientId: PatientId,
    private answers: HealthScreeningAnswers
  ) {}

  hasCovidSymptoms(): boolean {
    return this.answers.hasSymptoms &&
           this.answers.symptoms.some(symptom =>
             this.covidSymptoms.includes(symptom.toLowerCase())
           );
  }

  hasElevatedTemperature(): boolean {
    return this.answers.temperature !== undefined && this.answers.temperature >= 37.5;
  }

  hasHighRiskSymptoms(): boolean {
    return this.answers.hasSymptoms &&
           this.answers.symptoms.some(symptom =>
             this.highRiskSymptoms.includes(symptom.toLowerCase())
           );
  }

  assessRiskFactors(): RiskAssessment {
    const riskFactors: RiskFactor[] = [];

    // COVID-related risks
    if (this.hasCovidSymptoms()) {
      riskFactors.push({
        type: 'covid_symptoms',
        severity: 'high',
        description: 'Patient reports COVID-19 like symptoms'
      });
    }

    if (this.answers.hasBeenExposed) {
      riskFactors.push({
        type: 'covid_exposure',
        severity: 'medium',
        description: 'Patient has been exposed to COVID-19'
      });
    }

    if (!this.answers.isVaccinated) {
      riskFactors.push({
        type: 'unvaccinated',
        severity: 'low',
        description: 'Patient is not vaccinated against COVID-19'
      });
    }

    // Temperature risk
    if (this.hasElevatedTemperature()) {
      riskFactors.push({
        type: 'elevated_temperature',
        severity: 'high',
        description: `Temperature: ${this.answers.temperature}°C`
      });
    }

    // High-risk symptoms
    if (this.hasHighRiskSymptoms()) {
      riskFactors.push({
        type: 'high_risk_symptoms',
        severity: 'high',
        description: 'Patient reports high-risk symptoms requiring immediate attention'
      });
    }

    // General symptoms
    if (this.answers.hasSymptoms && this.answers.symptoms.length > 0) {
      riskFactors.push({
        type: 'general_symptoms',
        severity: 'low',
        description: `Reported symptoms: ${this.answers.symptoms.join(', ')}`
      });
    }

    return new RiskAssessment(riskFactors);
  }

  async performScreening(): Promise<HealthScreeningResult> {
    // Check for immediate disqualifiers
    if (this.hasCovidSymptoms()) {
      return HealthScreeningResultImpl.rejected('COVID-19 symptoms detected - appointment should be rescheduled');
    }

    if (this.hasElevatedTemperature()) {
      return HealthScreeningResultImpl.rejected(`Elevated temperature (${this.answers.temperature}°C) - please reschedule when fever-free for 24 hours`);
    }

    if (this.hasHighRiskSymptoms()) {
      return HealthScreeningResultImpl.rejected('High-risk symptoms detected - please seek immediate medical attention');
    }

    // Assess risk factors
    const riskAssessment = this.assessRiskFactors();

    if (riskAssessment.isHighRisk()) {
      return HealthScreeningResultImpl.requiresReview(riskAssessment.riskFactors);
    }

    if (riskAssessment.isMediumRisk()) {
      // Allow appointment but with precautions
      return new HealthScreeningResultImpl(
        true,
        ['Additional precautions required'],
        false,
        riskAssessment.riskFactors
      );
    }

    return HealthScreeningResultImpl.approved();
  }

  generateRecommendations(): string[] {
    const recommendations: string[] = [];

    if (this.answers.hasSymptoms) {
      recommendations.push('Please inform your healthcare provider about your symptoms');
    }

    if (this.hasElevatedTemperature()) {
      recommendations.push('Please reschedule your appointment when fever-free for 24 hours');
      recommendations.push('Take fever-reducing medication and rest');
    }

    if (this.answers.hasBeenExposed) {
      recommendations.push('Please follow quarantine guidelines');
      recommendations.push('Consider getting tested for COVID-19');
    }

    if (!this.answers.isVaccinated) {
      recommendations.push('Consider getting vaccinated against COVID-19');
    }

    if (this.hasHighRiskSymptoms()) {
      recommendations.push('Seek immediate medical attention');
      recommendations.push('Consider visiting emergency department');
    }

    return recommendations;
  }
}

class RiskAssessment {
  constructor(public riskFactors: RiskFactor[]) {}

  isHighRisk(): boolean {
    return this.riskFactors.some(factor => factor.severity === 'high');
  }

  isMediumRisk(): boolean {
    return !this.isHighRisk() &&
           this.riskFactors.some(factor => factor.severity === 'medium');
  }

  isLowRisk(): boolean {
    return !this.isHighRisk() && !this.isMediumRisk();
  }

  getRiskScore(): number {
    let score = 0;
    for (const factor of this.riskFactors) {
      switch (factor.severity) {
        case 'high': score += 10; break;
        case 'medium': score += 5; break;
        case 'low': score += 1; break;
      }
    }
    return score;
  }

  getHighestSeverity(): 'low' | 'medium' | 'high' | null {
    if (this.riskFactors.length === 0) return null;

    if (this.isHighRisk()) return 'high';
    if (this.isMediumRisk()) return 'medium';
    return 'low';
  }

  getSummary(): string {
    const severity = this.getHighestSeverity();
    const factorCount = this.riskFactors.length;

    if (severity === 'high') {
      return `High-risk patient with ${factorCount} risk factors`;
    } else if (severity === 'medium') {
      return `Medium-risk patient with ${factorCount} risk factors`;
    } else if (severity === 'low') {
      return `Low-risk patient with ${factorCount} minor risk factors`;
    }

    return 'No risk factors identified';
  }
}