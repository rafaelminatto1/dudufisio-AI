/**
 * Predictive Analytics Types
 * Tipos para Análise Preditiva de Resultados de Pacientes
 */
// Tipos de predição
export var PredictionType;
(function (PredictionType) {
    PredictionType["TreatmentOutcome"] = "treatment_outcome";
    PredictionType["RecoveryTime"] = "recovery_time";
    PredictionType["OptimalFrequency"] = "optimal_frequency";
    PredictionType["RiskOfComplications"] = "risk_of_complications";
    PredictionType["Adherence"] = "adherence";
    PredictionType["PatientSatisfaction"] = "patient_satisfaction";
    PredictionType["CostEffectiveness"] = "cost_effectiveness";
    PredictionType["FunctionalImprovement"] = "functional_improvement";
})(PredictionType || (PredictionType = {}));
// Algoritmos de ML
export var MLAlgorithm;
(function (MLAlgorithm) {
    MLAlgorithm["LinearRegression"] = "linear_regression";
    MLAlgorithm["LogisticRegression"] = "logistic_regression";
    MLAlgorithm["RandomForest"] = "random_forest";
    MLAlgorithm["NeuralNetwork"] = "neural_network";
    MLAlgorithm["GradientBoosting"] = "gradient_boosting";
    MLAlgorithm["SVM"] = "svm";
    MLAlgorithm["KNN"] = "knn";
    MLAlgorithm["DecisionTree"] = "decision_tree";
})(MLAlgorithm || (MLAlgorithm = {}));
