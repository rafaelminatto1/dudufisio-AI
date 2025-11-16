const AGENDA_FIRST_ROLES = new Set([
  'admin',
  'therapist',
  'fisioterapeuta',
  'estagiario',
  'intern',
]);

export const getDefaultLandingRoute = (role?: string | null): '/agenda' | '/dashboard' => {
  if (!role) {
    return '/dashboard';
  }

  const normalized = role.toLowerCase();
  return AGENDA_FIRST_ROLES.has(normalized) ? '/agenda' : '/dashboard';
};

