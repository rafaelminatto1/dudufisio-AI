// Mapeadores: Supabase -> Aplicação
export function mapSupabasePatientToPatient(supabasePatient) {
    return {
        id: supabasePatient.id,
        name: supabasePatient.name,
        phone: supabasePatient.phone,
        email: supabasePatient.email,
        birthDate: supabasePatient.birth_date,
        userId: supabasePatient.user_id,
        createdAt: supabasePatient.created_at,
        updatedAt: supabasePatient.updated_at,
        createdBy: supabasePatient.created_by,
    };
}
export function mapSupabaseUserToUser(supabaseUser) {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email,
        fullName: supabaseUser.full_name,
        role: supabaseUser.role,
        isActive: supabaseUser.is_active,
        permissions: supabaseUser.permissions,
        profileSettings: supabaseUser.profile_settings,
        createdAt: supabaseUser.created_at,
        updatedAt: supabaseUser.updated_at,
        lastLoginAt: supabaseUser.last_login_at,
    };
}
export function mapSupabaseBodyPointToBodyPoint(supabaseBodyPoint) {
    return {
        id: supabaseBodyPoint.id,
        patientId: supabaseBodyPoint.patient_id,
        bodySide: supabaseBodyPoint.body_side,
        painLevel: supabaseBodyPoint.pain_level,
        notes: supabaseBodyPoint.notes || null, // Field may not exist in current schema
        createdAt: supabaseBodyPoint.created_at,
        updatedAt: supabaseBodyPoint.updated_at,
    };
}
export function mapSupabaseExerciseToExercise(supabaseExercise) {
    return {
        id: supabaseExercise.id,
        name: supabaseExercise.name,
        description: supabaseExercise.description,
        category: supabaseExercise.category,
        difficultyLevel: supabaseExercise.difficulty_level,
        benefits: supabaseExercise.benefits,
        contraindications: supabaseExercise.contraindications,
        instructions: Array.isArray(supabaseExercise.instructions)
            ? supabaseExercise.instructions.join('\n')
            : supabaseExercise.instructions,
        videoUrl: supabaseExercise.video_url,
        imageUrl: Array.isArray(supabaseExercise.image_urls) && supabaseExercise.image_urls.length > 0
            ? supabaseExercise.image_urls[0]
            : null,
        createdAt: supabaseExercise.created_at,
        updatedAt: supabaseExercise.updated_at,
        createdBy: supabaseExercise.created_by,
    };
}
// Mapeadores: Aplicação -> Supabase (para inserts/updates)
export function mapPatientToSupabaseInsert(patient) {
    return {
        id: patient.id,
        name: patient.name || '',
        phone: patient.phone,
        email: patient.email,
        birth_date: patient.birthDate,
        user_id: patient.userId,
        created_by: patient.createdBy,
    };
}
export function mapPatientToSupabaseUpdate(patient) {
    return {
        name: patient.name,
        phone: patient.phone,
        email: patient.email,
        birth_date: patient.birthDate,
        updated_at: new Date().toISOString(),
    };
}
export function mapUserToSupabaseInsert(user) {
    return {
        id: user.id,
        email: user.email || '',
        full_name: user.fullName,
        role: user.role,
        is_active: user.isActive,
        permissions: user.permissions,
        profile_settings: user.profileSettings,
    };
}
export function mapUserToSupabaseUpdate(user) {
    return {
        full_name: user.fullName,
        role: user.role,
        is_active: user.isActive,
        permissions: user.permissions,
        profile_settings: user.profileSettings,
        updated_at: new Date().toISOString(),
    };
}
// Utilitários para conversão em lote
export function mapSupabasePatientsToPatients(supabasePatients) {
    return supabasePatients.map(mapSupabasePatientToPatient);
}
export function mapSupabaseUsersToUsers(supabaseUsers) {
    return supabaseUsers.map(mapSupabaseUserToUser);
}
export function mapSupabaseBodyPointsToBodyPoints(supabaseBodyPoints) {
    return supabaseBodyPoints.map(mapSupabaseBodyPointToBodyPoint);
}
export function mapSupabaseExercisesToExercises(supabaseExercises) {
    return supabaseExercises.map(mapSupabaseExerciseToExercise);
}
export function createApiResponse(data, error = null) {
    return {
        data,
        error,
        success: error === null,
    };
}
// Utilitários para validação de dados
export function isValidPatient(patient) {
    return (typeof patient === 'object' &&
        patient !== null &&
        typeof patient.id === 'string' &&
        typeof patient.name === 'string');
}
export function isValidUser(user) {
    return (typeof user === 'object' &&
        user !== null &&
        typeof user.id === 'string' &&
        typeof user.email === 'string');
}
