/**
 * Family Portal Types
 * Tipos para Portal de Família/Cuidadores
 */
// Tipos de relacionamento
export var FamilyRelationship;
(function (FamilyRelationship) {
    FamilyRelationship["Parent"] = "parent";
    FamilyRelationship["Spouse"] = "spouse";
    FamilyRelationship["Child"] = "child";
    FamilyRelationship["Sibling"] = "sibling";
    FamilyRelationship["Caregiver"] = "caregiver";
    FamilyRelationship["Guardian"] = "guardian";
    FamilyRelationship["Other"] = "other";
})(FamilyRelationship || (FamilyRelationship = {}));
// Níveis de acesso
export var AccessLevel;
(function (AccessLevel) {
    AccessLevel["ViewOnly"] = "view_only";
    AccessLevel["ViewProgress"] = "view_progress";
    AccessLevel["ViewCommunicate"] = "view_communicate";
    AccessLevel["Full"] = "full"; // Acesso completo (exceto modificações)
})(AccessLevel || (AccessLevel = {}));
// Status de consentimento
export var ConsentStatus;
(function (ConsentStatus) {
    ConsentStatus["Pending"] = "pending";
    ConsentStatus["Approved"] = "approved";
    ConsentStatus["Denied"] = "denied";
    ConsentStatus["Revoked"] = "revoked";
    ConsentStatus["Expired"] = "expired";
})(ConsentStatus || (ConsentStatus = {}));
