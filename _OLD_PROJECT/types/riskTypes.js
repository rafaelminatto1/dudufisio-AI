/**
 * Risk Stratification System Types
 * Sistema de Estratificação de Risco para DuduFisio-AI
 */
export var RiskLevel;
(function (RiskLevel) {
    RiskLevel["Low"] = "low";
    RiskLevel["Moderate"] = "moderate";
    RiskLevel["High"] = "high";
    RiskLevel["Critical"] = "critical";
})(RiskLevel || (RiskLevel = {}));
export var RiskType;
(function (RiskType) {
    RiskType["Fall"] = "fall";
    RiskType["Deconditioning"] = "deconditioning";
    RiskType["Abandonment"] = "abandonment";
    RiskType["Complication"] = "complication";
    RiskType["NoShow"] = "no_show";
    RiskType["Readmission"] = "readmission";
    RiskType["ChronicPain"] = "chronic_pain";
    RiskType["FunctionalDecline"] = "functional_decline"; // Risco de declínio funcional
})(RiskType || (RiskType = {}));
