/**
 * Sports Rehabilitation Module Types
 * Tipos para Módulo de Reabilitação Esportiva
 */
// Tipos de esportes
export var SportType;
(function (SportType) {
    SportType["Soccer"] = "soccer";
    SportType["Basketball"] = "basketball";
    SportType["Volleyball"] = "volleyball";
    SportType["Tennis"] = "tennis";
    SportType["Running"] = "running";
    SportType["Swimming"] = "swimming";
    SportType["Cycling"] = "cycling";
    SportType["MartialArts"] = "martial_arts";
    SportType["Gymnastics"] = "gymnastics";
    SportType["CrossFit"] = "crossfit";
    SportType["WeightLifting"] = "weight_lifting";
    SportType["Other"] = "other";
})(SportType || (SportType = {}));
// Níveis de competição
export var CompetitionLevel;
(function (CompetitionLevel) {
    CompetitionLevel["Recreational"] = "recreational";
    CompetitionLevel["Amateur"] = "amateur";
    CompetitionLevel["SemiProfessional"] = "semi_professional";
    CompetitionLevel["Professional"] = "professional";
    CompetitionLevel["Elite"] = "elite";
})(CompetitionLevel || (CompetitionLevel = {}));
// Status de clearance para retorno
export var ClearanceStatus;
(function (ClearanceStatus) {
    ClearanceStatus["NotReady"] = "not_ready";
    ClearanceStatus["PartialClearance"] = "partial_clearance";
    ClearanceStatus["FullClearance"] = "full_clearance";
    ClearanceStatus["ReturnToPlay"] = "return_to_play";
})(ClearanceStatus || (ClearanceStatus = {}));
// Fases de reabilitação esportiva
export var RehabPhase;
(function (RehabPhase) {
    RehabPhase["Phase1_Acute"] = "phase1_acute";
    RehabPhase["Phase2_Intermediate"] = "phase2_intermediate";
    RehabPhase["Phase3_Advanced"] = "phase3_advanced";
    RehabPhase["Phase4_SportSpecific"] = "phase4_sport";
    RehabPhase["Phase5_ReturnToPlay"] = "phase5_rtp"; // Retorno ao jogo
})(RehabPhase || (RehabPhase = {}));
