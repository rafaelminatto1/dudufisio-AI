/**
 * Gerador de Relatórios Clínicos
 * Sistema completo para geração de relatórios de progresso e alta
 */
export class ClinicalReportGenerator {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Gera relatório de progresso
     */
    async generateProgressReport(patientId, period, generatedBy) {
        try {
            // Buscar dados do paciente
            const patient = await this.repository.getPatient(patientId);
            if (!patient) {
                throw new Error(`Patient not found: ${patientId}`);
            }
            // Buscar avaliação inicial
            const initialAssessment = await this.repository.getInitialAssessment(patientId);
            if (!initialAssessment) {
                throw new Error(`Initial assessment not found for patient: ${patientId}`);
            }
            // Buscar evoluções do período
            const sessionEvolutions = await this.repository.getSessionEvolutions(patientId, period);
            // Buscar histórico do mapa corporal
            const bodyMapHistory = await this.repository.getBodyMapHistory(patientId, period);
            // Gerar análises
            const painEvolution = this.analyzePainEvolution(bodyMapHistory, sessionEvolutions);
            const functionalProgress = this.analyzeFunctionalProgress(initialAssessment, sessionEvolutions);
            const treatmentCompliance = this.calculateCompliance(sessionEvolutions);
            const recommendations = this.generateRecommendations(sessionEvolutions, painEvolution, functionalProgress);
            const report = {
                patient: {
                    id: patient.id,
                    name: patient.name,
                    age: patient.age,
                    gender: patient.gender,
                    diagnosis: initialAssessment.diagnosis.primaryDiagnosis
                },
                initialAssessment,
                sessionEvolutions,
                painEvolution,
                functionalProgress,
                treatmentCompliance,
                recommendations,
                generatedAt: new Date(),
                generatedBy
            };
            return report;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            throw new Error(`Failed to generate progress report: ${err.message}`);
        }
    }
    /**
     * Gera relatório de alta
     */
    async generateDischargeReport(patientId, generatedBy) {
        try {
            // Buscar histórico completo
            const fullHistory = await this.repository.getCompleteHistory(patientId);
            if (!fullHistory) {
                throw new Error(`Complete history not found for patient: ${patientId}`);
            }
            const { patient, initialAssessment, sessionEvolutions, bodyMapHistory } = fullHistory;
            // Gerar resumo do tratamento
            const treatmentSummary = this.summarizeTreatment(initialAssessment, sessionEvolutions);
            // Calcular medidas de resultado
            const outcomeMeasures = this.calculateOutcomes(initialAssessment, sessionEvolutions);
            // Gerar recomendações finais
            const finalRecommendations = this.generateFinalRecommendations(sessionEvolutions, outcomeMeasures);
            // Criar plano de acompanhamento
            const followUpPlan = this.createFollowUpPlan(sessionEvolutions, outcomeMeasures);
            const report = {
                patient: {
                    id: patient.id,
                    name: patient.name,
                    age: patient.age,
                    gender: patient.gender,
                    diagnosis: initialAssessment.diagnosis.primaryDiagnosis
                },
                treatmentSummary,
                outcomeMeasures,
                finalRecommendations,
                followUpPlan,
                generatedAt: new Date(),
                generatedBy
            };
            return report;
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            throw new Error(`Failed to generate discharge report: ${err.message}`);
        }
    }
    /**
     * Analisa evolução da dor
     */
    analyzePainEvolution(bodyMapHistory, sessionEvolutions) {
        const painDataPoints = [];
        // Extrair dados de dor das evoluções
        sessionEvolutions.forEach(evolution => {
            if (evolution.painLevelBefore !== undefined) {
                painDataPoints.push({
                    date: evolution.createdAt,
                    level: evolution.painLevelBefore,
                    location: 'geral' // Pode ser expandido para localizações específicas
                });
            }
        });
        // Extrair dados do mapa corporal
        bodyMapHistory.forEach(entry => {
            if (entry.painLevel !== undefined) {
                painDataPoints.push({
                    date: entry.timestamp,
                    level: entry.painLevel,
                    location: entry.location || 'específico'
                });
            }
        });
        // Ordenar por data
        painDataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
        // Calcular estatísticas
        const initialLevel = painDataPoints[0]?.level || 0;
        const finalLevel = painDataPoints[painDataPoints.length - 1]?.level || 0;
        const improvement = initialLevel - finalLevel;
        const improvementPercentage = initialLevel > 0 ? (improvement / initialLevel) * 100 : 0;
        // Determinar tendência
        let trend = 'stable';
        if (improvementPercentage > 10) {
            trend = 'improving';
        }
        else if (improvementPercentage < -10) {
            trend = 'worsening';
        }
        return {
            initialLevel,
            finalLevel,
            improvement,
            trend,
            dataPoints: painDataPoints
        };
    }
    /**
     * Analisa progresso funcional
     */
    analyzeFunctionalProgress(initialAssessment, sessionEvolutions) {
        // Medidas iniciais (exemplo simplificado)
        const initialMeasures = {
            painLevel: initialAssessment.chiefComplaint.characteristics.intensity,
            functionalTests: initialAssessment.functionalTests.length,
            rangeOfMotion: this.calculateAverageROM(initialAssessment.physicalExam.rangeOfMotion),
            muscleStrength: this.calculateAverageStrength(initialAssessment.physicalExam.muscleStrength)
        };
        // Medidas finais (da última evolução)
        const lastEvolution = sessionEvolutions[sessionEvolutions.length - 1];
        const finalMeasures = {
            painLevel: lastEvolution?.painLevelAfter || 0,
            functionalTests: lastEvolution?.measurements?.functionalTests || 0,
            rangeOfMotion: lastEvolution?.measurements?.rangeOfMotion || 0,
            muscleStrength: lastEvolution?.measurements?.muscleStrength || 0
        };
        // Calcular melhorias
        const improvements = {
            painLevel: initialMeasures.painLevel - finalMeasures.painLevel,
            functionalTests: finalMeasures.functionalTests - initialMeasures.functionalTests,
            rangeOfMotion: finalMeasures.rangeOfMotion - initialMeasures.rangeOfMotion,
            muscleStrength: finalMeasures.muscleStrength - initialMeasures.muscleStrength
        };
        // Contar metas alcançadas
        const goalsAchieved = initialAssessment.goals.filter((goal) => {
            // Lógica simplificada para determinar se meta foi alcançada
            return this.isGoalAchieved(goal, improvements);
        }).length;
        return {
            initialMeasures,
            finalMeasures,
            improvements,
            goalsAchieved,
            totalGoals: initialAssessment.goals.length
        };
    }
    /**
     * Calcula compliance do tratamento
     */
    calculateCompliance(sessionEvolutions) {
        const totalSessions = sessionEvolutions.length;
        const completedSessions = sessionEvolutions.filter(evolution => evolution.patientResponse && evolution.patientResponse.length > 0).length;
        const attendanceRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;
        // Calcular compliance com exercícios (exemplo simplificado)
        const exerciseCompliance = sessionEvolutions.reduce((sum, evolution) => {
            const homeExercises = evolution.homeExercises?.length || 0;
            const performedExercises = evolution.exercisesPerformed?.length || 0;
            return sum + (homeExercises > 0 ? (performedExercises / homeExercises) * 100 : 100);
        }, 0) / totalSessions;
        // Compliance geral (média ponderada)
        const overallCompliance = (attendanceRate * 0.4) + (exerciseCompliance * 0.6);
        return {
            attendanceRate,
            exerciseCompliance,
            homeProgramAdherence: exerciseCompliance, // Simplificado
            overallCompliance
        };
    }
    /**
     * Gera recomendações baseadas na evolução
     */
    generateRecommendations(sessionEvolutions, painEvolution, functionalProgress) {
        const recommendations = [];
        // Recomendações baseadas na evolução da dor
        if (painEvolution.trend === 'improving') {
            recommendations.push('Continuar com o plano de tratamento atual devido à melhora da dor');
        }
        else if (painEvolution.trend === 'worsening') {
            recommendations.push('Reavaliar o plano de tratamento devido ao agravamento da dor');
        }
        else {
            recommendations.push('Considerar ajustes no plano de tratamento para melhorar a resposta');
        }
        // Recomendações baseadas no progresso funcional
        if (functionalProgress.goalsAchieved / functionalProgress.totalGoals > 0.8) {
            recommendations.push('Excelente progresso funcional - considerar alta em breve');
        }
        else if (functionalProgress.goalsAchieved / functionalProgress.totalGoals < 0.3) {
            recommendations.push('Progresso funcional limitado - intensificar intervenções');
        }
        // Recomendações baseadas na compliance
        const lastEvolution = sessionEvolutions[sessionEvolutions.length - 1];
        if (lastEvolution?.patientResponse?.toLowerCase().includes('dificuldade')) {
            recommendations.push('Orientar paciente sobre importância da aderência ao tratamento');
        }
        // Recomendações específicas baseadas nas técnicas aplicadas
        const mostUsedTechniques = this.getMostUsedTechniques(sessionEvolutions);
        if (mostUsedTechniques.includes('mobilização')) {
            recommendations.push('Continuar com mobilizações articulares');
        }
        return recommendations;
    }
    /**
     * Resume o tratamento
     */
    summarizeTreatment(initialAssessment, sessionEvolutions) {
        const startDate = initialAssessment.createdAt;
        const endDate = sessionEvolutions[sessionEvolutions.length - 1]?.createdAt || new Date();
        const totalSessions = sessionEvolutions.length;
        const completedSessions = sessionEvolutions.filter(evolution => evolution.patientResponse && evolution.patientResponse.length > 0).length;
        // Extrair intervenções primárias
        const allTechniques = sessionEvolutions.flatMap(evolution => evolution.techniquesApplied?.map((technique) => technique.name) || []);
        const techniqueCounts = this.countOccurrences(allTechniques);
        const primaryInterventions = Object.keys(techniqueCounts)
            .sort((a, b) => techniqueCounts[b] - techniqueCounts[a])
            .slice(0, 5);
        // Extrair resultados
        const outcomes = this.extractOutcomes(sessionEvolutions);
        return {
            startDate,
            endDate,
            totalSessions,
            completedSessions,
            primaryInterventions,
            outcomes
        };
    }
    /**
     * Calcula medidas de resultado
     */
    calculateOutcomes(initialAssessment, sessionEvolutions) {
        const outcomes = [];
        // Medida de dor
        const initialPain = initialAssessment.chiefComplaint.characteristics.intensity;
        const finalPain = sessionEvolutions[sessionEvolutions.length - 1]?.painLevelAfter || 0;
        outcomes.push({
            name: 'Escala Visual Analógica de Dor',
            initialScore: initialPain,
            finalScore: finalPain,
            improvement: initialPain - finalPain,
            unit: 'pontos (0-10)'
        });
        // Medida de amplitude de movimento (exemplo simplificado)
        const initialROM = this.calculateAverageROM(initialAssessment.physicalExam.rangeOfMotion);
        const finalROM = sessionEvolutions[sessionEvolutions.length - 1]?.measurements?.rangeOfMotion || initialROM;
        outcomes.push({
            name: 'Amplitude de Movimento',
            initialScore: initialROM,
            finalScore: finalROM,
            improvement: finalROM - initialROM,
            unit: 'graus'
        });
        // Medida de força muscular (exemplo simplificado)
        const initialStrength = this.calculateAverageStrength(initialAssessment.physicalExam.muscleStrength);
        const finalStrength = sessionEvolutions[sessionEvolutions.length - 1]?.measurements?.muscleStrength || initialStrength;
        outcomes.push({
            name: 'Força Muscular',
            initialScore: initialStrength,
            finalScore: finalStrength,
            improvement: finalStrength - initialStrength,
            unit: 'escala 0-5'
        });
        return outcomes;
    }
    /**
     * Gera recomendações finais
     */
    generateFinalRecommendations(sessionEvolutions, outcomeMeasures) {
        const recommendations = [];
        // Analisar resultados
        const painImprovement = outcomeMeasures.find(m => m.name.includes('Dor'))?.improvement || 0;
        const functionalImprovement = outcomeMeasures.find(m => m.name.includes('Amplitude'))?.improvement || 0;
        if (painImprovement > 3) {
            recommendations.push('Excelente melhora da dor - paciente pode retornar às atividades normais');
        }
        else if (painImprovement > 1) {
            recommendations.push('Boa melhora da dor - continuar com exercícios domiciliares');
        }
        else {
            recommendations.push('Melhora limitada da dor - considerar reavaliação em 30 dias');
        }
        if (functionalImprovement > 20) {
            recommendations.push('Significativa melhora funcional - alta com sucesso');
        }
        else if (functionalImprovement > 10) {
            recommendations.push('Melhora funcional moderada - continuar acompanhamento');
        }
        else {
            recommendations.push('Melhora funcional limitada - intensificar tratamento');
        }
        // Recomendações baseadas na última evolução
        const lastEvolution = sessionEvolutions[sessionEvolutions.length - 1];
        if (lastEvolution?.recommendations) {
            recommendations.push(lastEvolution.recommendations);
        }
        return recommendations;
    }
    /**
     * Cria plano de acompanhamento
     */
    createFollowUpPlan(sessionEvolutions, outcomeMeasures) {
        const lastEvolution = sessionEvolutions[sessionEvolutions.length - 1];
        // Exercícios domiciliares da última sessão
        const homeProgram = lastEvolution?.homeExercises || [];
        // Precauções baseadas no diagnóstico e evolução
        const precautions = [];
        const painLevel = lastEvolution?.painLevelAfter || 0;
        if (painLevel > 5) {
            precautions.push('Evitar atividades que agravem a dor');
        }
        if (outcomeMeasures.some(m => m.name.includes('Força') && m.finalScore < 3)) {
            precautions.push('Evitar carregar peso excessivo');
        }
        // Recomendações gerais
        const recommendations = [
            'Continuar com exercícios domiciliares conforme orientado',
            'Retornar em caso de agravamento dos sintomas',
            'Manter atividade física regular dentro das limitações'
        ];
        // Próxima consulta (se necessário)
        const nextAppointment = this.calculateNextAppointment(outcomeMeasures);
        return {
            recommendations,
            nextAppointment,
            homeProgram,
            precautions
        };
    }
    // Métodos auxiliares
    calculateAverageROM(rangeOfMotion) {
        // Implementação simplificada - calcular média de todas as amplitudes
        let total = 0;
        let count = 0;
        Object.values(rangeOfMotion).forEach((joints) => {
            if (Array.isArray(joints)) {
                joints.forEach((joint) => {
                    if (joint.flexion) {
                        total += joint.flexion;
                        count++;
                    }
                    if (joint.extension) {
                        total += joint.extension;
                        count++;
                    }
                    if (joint.rotation) {
                        total += joint.rotation;
                        count++;
                    }
                });
            }
        });
        return count > 0 ? total / count : 0;
    }
    calculateAverageStrength(muscleStrength) {
        // Implementação simplificada - calcular média de todas as forças
        let total = 0;
        let count = 0;
        Object.values(muscleStrength).forEach((muscles) => {
            if (Array.isArray(muscles)) {
                muscles.forEach((muscle) => {
                    total += muscle.strength;
                    count++;
                });
            }
        });
        return count > 0 ? total / count : 0;
    }
    isGoalAchieved(goal, improvements) {
        // Lógica simplificada para determinar se meta foi alcançada
        // Em implementação real, seria mais específica baseada no tipo de meta
        return goal.measurable && improvements.painLevel > 2;
    }
    getMostUsedTechniques(sessionEvolutions) {
        const allTechniques = sessionEvolutions.flatMap(evolution => evolution.techniquesApplied?.map((technique) => technique.name) || []);
        const techniqueCounts = this.countOccurrences(allTechniques);
        return Object.keys(techniqueCounts)
            .sort((a, b) => techniqueCounts[b] - techniqueCounts[a])
            .slice(0, 3);
    }
    countOccurrences(items) {
        return items.reduce((counts, item) => {
            counts[item] = (counts[item] || 0) + 1;
            return counts;
        }, {});
    }
    extractOutcomes(sessionEvolutions) {
        const outcomes = [];
        const lastEvolution = sessionEvolutions[sessionEvolutions.length - 1];
        if (lastEvolution?.patientResponse?.toLowerCase().includes('melhor')) {
            outcomes.push('Melhora subjetiva relatada pelo paciente');
        }
        if (lastEvolution?.painLevelAfter < lastEvolution?.painLevelBefore) {
            outcomes.push('Redução da intensidade da dor');
        }
        return outcomes;
    }
    calculateNextAppointment(outcomeMeasures) {
        const painImprovement = outcomeMeasures.find(m => m.name.includes('Dor'))?.improvement || 0;
        if (painImprovement < 2) {
            // Retornar em 30 dias se melhora limitada
            const nextAppointment = new Date();
            nextAppointment.setDate(nextAppointment.getDate() + 30);
            return nextAppointment;
        }
        return undefined; // Não precisa de retorno se melhora adequada
    }
}
