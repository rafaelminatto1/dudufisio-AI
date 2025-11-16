export class DataTransformer {
    transformPatientData(rawData) {
        try {
            const transformedData = rawData.map(patient => ({
                patient_id: patient.id,
                name: this.cleanString(patient.name),
                email: this.normalizeEmail(patient.email),
                phone: this.normalizePhone(patient.phone),
                age: this.calculateAge(patient.birth_date),
                age_group: this.categorizeAge(this.calculateAge(patient.birth_date)),
                gender: this.normalizeGender(patient.gender),
                address: this.cleanString(patient.address),
                registration_date: patient.created_at,
                last_update: patient.updated_at,
                status: this.normalizeStatus(patient.status),
                data_quality_score: this.calculateDataQualityScore(patient)
            }));
            return {
                recordsTransformed: transformedData.length,
                status: 'success',
                data: transformedData
            };
        }
        catch (error) {
            return {
                recordsTransformed: 0,
                status: 'error',
                data: []
            };
        }
    }
    transformAppointmentData(rawData) {
        try {
            const transformedData = rawData.map(appointment => ({
                appointment_id: appointment.id,
                patient_id: appointment.patient_id,
                therapist_id: appointment.therapist_id,
                appointment_date: appointment.appointment_date,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                duration_minutes: this.calculateDuration(appointment.start_time, appointment.end_time),
                status: this.normalizeAppointmentStatus(appointment.status),
                type: this.normalizeAppointmentType(appointment.type),
                is_no_show: appointment.no_show || false,
                is_cancelled: appointment.status === 'cancelled',
                is_rescheduled: !!appointment.rescheduled_from,
                cancellation_reason: appointment.cancellation_reason,
                day_of_week: this.getDayOfWeek(appointment.appointment_date),
                time_slot: this.categorizeTimeSlot(appointment.start_time),
                created_at: appointment.created_at,
                updated_at: appointment.updated_at
            }));
            return {
                recordsTransformed: transformedData.length,
                status: 'success',
                data: transformedData
            };
        }
        catch (error) {
            return {
                recordsTransformed: 0,
                status: 'error',
                data: []
            };
        }
    }
    transformFinancialData(rawData) {
        try {
            const transformedData = rawData.map(transaction => ({
                transaction_id: transaction.id,
                patient_id: transaction.patient_id,
                appointment_id: transaction.appointment_id,
                gross_amount: parseFloat(transaction.amount) || 0,
                net_amount: this.calculateNetAmount(transaction.amount, transaction.discount_amount, transaction.tax_amount),
                discount_amount: parseFloat(transaction.discount_amount) || 0,
                tax_amount: parseFloat(transaction.tax_amount) || 0,
                transaction_type: this.normalizeTransactionType(transaction.transaction_type),
                payment_method: this.normalizePaymentMethod(transaction.payment_method),
                transaction_date: transaction.transaction_date,
                status: this.normalizeTransactionStatus(transaction.status),
                description: this.cleanString(transaction.description),
                is_revenue: this.isRevenueTransaction(transaction.transaction_type),
                is_refund: this.isRefundTransaction(transaction.transaction_type),
                created_at: transaction.created_at,
                updated_at: transaction.updated_at
            }));
            return {
                recordsTransformed: transformedData.length,
                status: 'success',
                data: transformedData
            };
        }
        catch (error) {
            return {
                recordsTransformed: 0,
                status: 'error',
                data: []
            };
        }
    }
    transformTreatmentData(rawData) {
        try {
            const transformedData = rawData.map(session => ({
                session_id: session.id,
                patient_id: session.patient_id,
                therapist_id: session.therapist_id,
                appointment_id: session.appointment_id,
                session_date: session.session_date,
                duration_minutes: session.duration_minutes || 60,
                treatment_type: this.normalizeTreatmentType(session.treatment_type),
                pre_pain_level: this.normalizePainLevel(session.pre_session_pain_level),
                post_pain_level: this.normalizePainLevel(session.post_session_pain_level),
                pain_improvement: this.calculatePainImprovement(session.pre_session_pain_level, session.post_session_pain_level),
                session_effectiveness: this.calculateSessionEffectiveness(session.pre_session_pain_level, session.post_session_pain_level),
                patient_satisfaction: this.normalizePatientSatisfaction(session.patient_satisfaction),
                exercises_count: this.countExercises(session.exercises_performed),
                has_homework: !!session.homework_assigned,
                session_notes: this.cleanString(session.session_notes),
                created_at: session.created_at,
                updated_at: session.updated_at
            }));
            return {
                recordsTransformed: transformedData.length,
                status: 'success',
                data: transformedData
            };
        }
        catch (error) {
            return {
                recordsTransformed: 0,
                status: 'error',
                data: []
            };
        }
    }
    transformTherapistData(rawData) {
        try {
            const transformedData = rawData.map(therapist => ({
                therapist_id: therapist.id,
                name: this.cleanString(therapist.name),
                email: this.normalizeEmail(therapist.email),
                specialization: this.normalizeSpecialization(therapist.specialization),
                license_number: therapist.license_number,
                experience_years: therapist.experience_years || 0,
                experience_level: this.categorizeExperience(therapist.experience_years),
                hourly_rate: parseFloat(therapist.hourly_rate) || 0,
                status: this.normalizeStatus(therapist.status),
                registration_date: therapist.created_at,
                last_update: therapist.updated_at
            }));
            return {
                recordsTransformed: transformedData.length,
                status: 'success',
                data: transformedData
            };
        }
        catch (error) {
            return {
                recordsTransformed: 0,
                status: 'error',
                data: []
            };
        }
    }
    transformEngagementData(rawData) {
        try {
            const transformedData = rawData.map(engagement => ({
                engagement_id: engagement.id,
                patient_id: engagement.patient_id,
                engagement_date: engagement.engagement_date,
                engagement_type: this.normalizeEngagementType(engagement.engagement_type),
                channel: this.normalizeChannel(engagement.channel),
                content_viewed: this.cleanString(engagement.content_viewed),
                time_spent_minutes: engagement.time_spent_minutes || 0,
                interaction_score: this.normalizeInteractionScore(engagement.interaction_score),
                engagement_level: this.categorizeEngagementLevel(engagement.interaction_score),
                created_at: engagement.created_at,
                updated_at: engagement.updated_at
            }));
            return {
                recordsTransformed: transformedData.length,
                status: 'success',
                data: transformedData
            };
        }
        catch (error) {
            return {
                recordsTransformed: 0,
                status: 'error',
                data: []
            };
        }
    }
    // Utility methods for data cleaning and normalization
    cleanString(value) {
        if (!value)
            return '';
        return value.trim().replace(/\s+/g, ' ');
    }
    normalizeEmail(email) {
        if (!email)
            return '';
        return email.toLowerCase().trim();
    }
    normalizePhone(phone) {
        if (!phone)
            return '';
        return phone.replace(/\D/g, '');
    }
    calculateAge(birthDate) {
        if (!birthDate)
            return 0;
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    }
    categorizeAge(age) {
        if (age < 18)
            return 'Criança/Adolescente';
        if (age < 30)
            return 'Jovem Adulto';
        if (age < 50)
            return 'Adulto';
        if (age < 65)
            return 'Meia-idade';
        return 'Idoso';
    }
    normalizeGender(gender) {
        if (!gender)
            return 'Não informado';
        const normalized = gender.toLowerCase();
        if (normalized.includes('m') || normalized.includes('masc'))
            return 'M';
        if (normalized.includes('f') || normalized.includes('fem'))
            return 'F';
        return 'Outro';
    }
    normalizeStatus(status) {
        if (!status)
            return 'unknown';
        return status.toLowerCase().replace(/\s+/g, '_');
    }
    calculateDataQualityScore(patient) {
        let score = 0;
        let maxScore = 0;
        const fields = ['name', 'email', 'phone', 'birth_date', 'gender', 'address'];
        fields.forEach(field => {
            maxScore++;
            if (patient[field] && patient[field].toString().trim().length > 0) {
                score++;
            }
        });
        return maxScore > 0 ? (score / maxScore) * 100 : 0;
    }
    calculateDuration(startTime, endTime) {
        if (!startTime || !endTime)
            return 60; // default duration
        const start = new Date(`2000-01-01 ${startTime}`);
        const end = new Date(`2000-01-01 ${endTime}`);
        return Math.abs((end.getTime() - start.getTime()) / (1000 * 60));
    }
    normalizeAppointmentStatus(status) {
        if (!status)
            return 'unknown';
        return status.toLowerCase().replace(/\s+/g, '_');
    }
    normalizeAppointmentType(type) {
        if (!type)
            return 'standard';
        return type.toLowerCase().replace(/\s+/g, '_');
    }
    getDayOfWeek(date) {
        const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return days[new Date(date).getDay()];
    }
    categorizeTimeSlot(time) {
        if (!time)
            return 'unknown';
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12)
            return 'Manhã';
        if (hour < 18)
            return 'Tarde';
        return 'Noite';
    }
    calculateNetAmount(gross, discount, tax) {
        const grossAmount = parseFloat(gross) || 0;
        const discountAmount = parseFloat(discount) || 0;
        const taxAmount = parseFloat(tax) || 0;
        return grossAmount - discountAmount + taxAmount;
    }
    normalizeTransactionType(type) {
        if (!type)
            return 'unknown';
        return type.toLowerCase().replace(/\s+/g, '_');
    }
    normalizePaymentMethod(method) {
        if (!method)
            return 'unknown';
        return method.toLowerCase().replace(/\s+/g, '_');
    }
    normalizeTransactionStatus(status) {
        if (!status)
            return 'unknown';
        return status.toLowerCase().replace(/\s+/g, '_');
    }
    isRevenueTransaction(type) {
        const revenueTypes = ['payment', 'consultation_fee', 'treatment_fee'];
        return revenueTypes.includes(type?.toLowerCase());
    }
    isRefundTransaction(type) {
        const refundTypes = ['refund', 'chargeback'];
        return refundTypes.includes(type?.toLowerCase());
    }
    normalizePainLevel(level) {
        if (level === null || level === undefined)
            return 0;
        const numLevel = parseInt(level);
        return Math.max(0, Math.min(10, numLevel || 0));
    }
    calculatePainImprovement(prePain, postPain) {
        const pre = this.normalizePainLevel(prePain);
        const post = this.normalizePainLevel(postPain);
        return pre - post;
    }
    calculateSessionEffectiveness(prePain, postPain) {
        const improvement = this.calculatePainImprovement(prePain, postPain);
        if (improvement >= 3)
            return 'Alta';
        if (improvement >= 1)
            return 'Média';
        if (improvement > 0)
            return 'Baixa';
        return 'Nenhuma';
    }
    normalizeTreatmentType(type) {
        if (!type)
            return 'geral';
        return type.toLowerCase().replace(/\s+/g, '_');
    }
    normalizePatientSatisfaction(satisfaction) {
        if (satisfaction === null || satisfaction === undefined)
            return 0;
        const numSatisfaction = parseFloat(satisfaction);
        return Math.max(0, Math.min(10, numSatisfaction || 0));
    }
    countExercises(exercises) {
        if (!exercises)
            return 0;
        return exercises.split(',').filter(ex => ex.trim().length > 0).length;
    }
    normalizeSpecialization(specialization) {
        if (!specialization)
            return 'geral';
        return specialization.toLowerCase().replace(/\s+/g, '_');
    }
    categorizeExperience(years) {
        if (years < 2)
            return 'Junior';
        if (years < 5)
            return 'Pleno';
        if (years < 10)
            return 'Senior';
        return 'Especialista';
    }
    normalizeEngagementType(type) {
        if (!type)
            return 'unknown';
        return type.toLowerCase().replace(/\s+/g, '_');
    }
    normalizeChannel(channel) {
        if (!channel)
            return 'unknown';
        return channel.toLowerCase().replace(/\s+/g, '_');
    }
    normalizeInteractionScore(score) {
        if (score === null || score === undefined)
            return 0;
        const numScore = parseFloat(score);
        return Math.max(0, Math.min(100, numScore || 0));
    }
    categorizeEngagementLevel(score) {
        const numScore = this.normalizeInteractionScore(score);
        if (numScore >= 80)
            return 'Alto';
        if (numScore >= 50)
            return 'Médio';
        if (numScore >= 20)
            return 'Baixo';
        return 'Muito Baixo';
    }
}
