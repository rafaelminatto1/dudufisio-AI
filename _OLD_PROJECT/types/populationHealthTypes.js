/**
 * Population Health Analytics Types
 * Tipos para Análise de Saúde da População
 */
// Tipos de análise populacional
export var PopulationMetricType;
(function (PopulationMetricType) {
    PopulationMetricType["Demographics"] = "demographics";
    PopulationMetricType["ClinicalOutcomes"] = "clinical_outcomes";
    PopulationMetricType["TreatmentEffectiveness"] = "treatment_effectiveness";
    PopulationMetricType["ServiceUtilization"] = "service_utilization";
    PopulationMetricType["RiskDistribution"] = "risk_distribution";
    PopulationMetricType["Adherence"] = "adherence";
    PopulationMetricType["SatisfactionQuality"] = "satisfaction_quality";
})(PopulationMetricType || (PopulationMetricType = {}));
