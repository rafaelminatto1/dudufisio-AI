/**
 * Quality Assurance and Compliance Types
 * Tipos para Dashboard de Garantia de Qualidade e Conformidade
 */
// Tipos de métricas de qualidade
export var QualityMetricType;
(function (QualityMetricType) {
    QualityMetricType["ClinicalOutcome"] = "clinical_outcome";
    QualityMetricType["PatientSafety"] = "patient_safety";
    QualityMetricType["PatientSatisfaction"] = "patient_satisfaction";
    QualityMetricType["Compliance"] = "compliance";
    QualityMetricType["Documentation"] = "documentation";
    QualityMetricType["ProcessEfficiency"] = "process_efficiency";
    QualityMetricType["StaffPerformance"] = "staff_performance";
    QualityMetricType["ResourceUtilization"] = "resource_utilization";
})(QualityMetricType || (QualityMetricType = {}));
// Status de conformidade
export var ComplianceStatus;
(function (ComplianceStatus) {
    ComplianceStatus["Compliant"] = "compliant";
    ComplianceStatus["PartiallyCompliant"] = "partially_compliant";
    ComplianceStatus["NonCompliant"] = "non_compliant";
    ComplianceStatus["UnderReview"] = "under_review";
    ComplianceStatus["ActionRequired"] = "action_required";
})(ComplianceStatus || (ComplianceStatus = {}));
// Severidade de não conformidade
export var NonComplianceSeverity;
(function (NonComplianceSeverity) {
    NonComplianceSeverity["Critical"] = "critical";
    NonComplianceSeverity["Major"] = "major";
    NonComplianceSeverity["Minor"] = "minor";
    NonComplianceSeverity["Observation"] = "observation";
})(NonComplianceSeverity || (NonComplianceSeverity = {}));
// Frameworks de conformidade
export var ComplianceFramework;
(function (ComplianceFramework) {
    ComplianceFramework["COFFITO"] = "COFFITO";
    ComplianceFramework["LGPD"] = "LGPD";
    ComplianceFramework["ISO9001"] = "ISO9001";
    ComplianceFramework["ANS"] = "ANS";
    ComplianceFramework["ANVISA"] = "ANVISA";
    ComplianceFramework["InternalPolicy"] = "internal_policy";
})(ComplianceFramework || (ComplianceFramework = {}));
