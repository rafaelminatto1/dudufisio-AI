'use client';

import React, { useCallback, useEffect, useState, useRef } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Bell,
  Calendar,
  Database,
  Loader2,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import NotificationSettings from '../components/alerts/NotificationSettings';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { useToast } from '../contexts/ToastContext';
import userService, { UserProfile } from '../services/userService';
import DemoDataManager from '../components/settings/DemoDataManager';
import ErrorBoundary from '../components/ErrorBoundary';

type SectionId = 'profile' | 'security' | 'notifications' | 'agenda' | 'crm' | 'advanced' | 'demo-data';
type AgendaView = 'week' | 'day' | 'month' | 'list';
type AppointmentView = 'compact' | 'detailed' | 'list';
type ReminderChannel = 'email' | 'sms' | 'push';
type EducatorFormat = 'video' | 'pdf' | 'live';
type ExportFormat = 'pdf' | 'csv' | 'xlsx';

interface ProfileSettings {
  phone?: string;
  bio?: string;
  department?: string;
  license_number?: string;
  specialties?: string[];
  working_hours?: {
    start: string;
    end: string;
    days: number[];
  };
  notification_preferences?: {
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  agenda_preferences?: {
    showSunday: boolean;
    defaultView: AgendaView;
    appointmentView: AppointmentView;
    defaultDuration: number;
    allowOverbooking: boolean;
    autoAssignTherapist: boolean;
  };
  crm_preferences?: {
    defaultPipelineStage: string;
    autoAssignLeads: boolean;
    notifyOnNewLead: boolean;
    dailyDigest: boolean;
    followUpReminderDays: number;
    defaultTags?: string[];
  };
  patient_preferences?: {
    preferredLanguage: string;
    reminderChannel: ReminderChannel;
    shareProgressWithFamily: boolean;
  };
  educator_preferences?: {
    availableForWorkshops: boolean;
    expertiseAreas: string[];
    acceptsRemoteSessions: boolean;
    preferredContentFormat: EducatorFormat;
  };
  admin_preferences?: {
    clinicName?: string;
    enableAuditEmails: boolean;
    allowBetaFeatures: boolean;
    defaultExportFormat: ExportFormat;
    dailySummaryTime: string;
  };
}

const WORKING_DAYS = [
  { label: 'Dom', value: 0 },
  { label: 'Seg', value: 1 },
  { label: 'Ter', value: 2 },
  { label: 'Qua', value: 3 },
  { label: 'Qui', value: 4 },
  { label: 'Sex', value: 5 },
  { label: 'Sab', value: 6 },
];

const DEFAULT_WORKING_HOURS = {
  start: '08:00',
  end: '18:00',
  days: [1, 2, 3, 4, 5] as number[],
};

const DEFAULT_AGENDA_PREFERENCES: ProfileSettings['agenda_preferences'] = {
  showSunday: false,
  defaultView: 'week',
  appointmentView: 'detailed',
  defaultDuration: 60,
  allowOverbooking: false,
  autoAssignTherapist: true,
};

const DEFAULT_CRM_PREFERENCES: ProfileSettings['crm_preferences'] = {
  defaultPipelineStage: 'triagem',
  autoAssignLeads: true,
  notifyOnNewLead: true,
  dailyDigest: true,
  followUpReminderDays: 2,
  defaultTags: [],
};

const DEFAULT_PATIENT_PREFERENCES: ProfileSettings['patient_preferences'] = {
  preferredLanguage: 'pt-BR',
  reminderChannel: 'email',
  shareProgressWithFamily: false,
};

const DEFAULT_EDUCATOR_PREFERENCES: ProfileSettings['educator_preferences'] = {
  availableForWorkshops: false,
  expertiseAreas: [],
  acceptsRemoteSessions: true,
  preferredContentFormat: 'video',
};

const DEFAULT_ADMIN_PREFERENCES: ProfileSettings['admin_preferences'] = {
  clinicName: '',
  enableAuditEmails: true,
  allowBetaFeatures: false,
  defaultExportFormat: 'csv',
  dailySummaryTime: '18:00',
};

const NAVIGATION_SECTIONS: Array<{ id: SectionId; label: string; icon: LucideIcon }> = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'security', label: 'Seguranca', icon: Shield },
  { id: 'notifications', label: 'Notificacoes', icon: Bell },
  { id: 'agenda', label: 'Agenda', icon: Calendar },
  { id: 'crm', label: 'CRM', icon: BarChart3 },
  { id: 'advanced', label: 'Outros Perfis', icon: Users },
  { id: 'demo-data', label: 'Dados Demo', icon: Database },
];

const parseProfileSettings = (raw: UserProfile['profile_settings']): ProfileSettings => {
  if (!raw) {
    return {};
  }
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as ProfileSettings;
    } catch (error) {
      console.warn('Falha ao converter profile_settings.', error);
      return {};
    }
  }
  return raw as ProfileSettings;
};

interface SectionCardProps {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = React.memo(({ id, icon, title, description, children }) => (
  <section
    id={id}
    className="rounded-cardLarge border border-neutral-border bg-white shadow-card transition hover:shadow-cardHover"
  >
    <div className="flex items-center gap-md border-b border-slate-100 px-lg py-5">
      <div className="flex h-12 w-12 items-center justify-center rounded-card bg-primary-light text-primary">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-neutral-text">{title}</h2>
        <p className="text-sm text-neutral-textSecondary">{description}</p>
      </div>
    </div>
    <div className="space-y-xl px-lg py-xl">{children}</div>
  </section>
));

interface WorkingDayToggleProps {
  label: string;
  active: boolean;
  onToggle: () => void;
}

const WorkingDayToggle: React.FC<WorkingDayToggleProps> = React.memo(({ label, active, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className={`flex h-9 items-center justify-center rounded-full border text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
      active
        ? 'border-sky-500 bg-primary-light text-primary'
        : 'border-neutral-border text-neutral-textSecondary hover:border-sky-200 hover:text-primary'
    }`}
  >
    {label}
  </button>
));

interface BooleanFieldProps {
  id: string;
  label: string;
  description?: string;
  value: boolean;
  onChange: (checked: boolean) => void;
}

const BooleanField: React.FC<BooleanFieldProps> = React.memo(({ id, label, description, value, onChange }) => (
  <div className="flex items-center justify-between rounded-lg border border-neutral-border bg-neutral-bgAlt/70 px-md py-3">
    <div className="max-w-[75%]">
      <Label htmlFor={id} className="text-sm font-medium text-neutral-text">
        {label}
      </Label>
      {description && <p className="text-xs text-neutral-textSecondary">{description}</p>}
    </div>
    <Switch id={id} checked={value} onCheckedChange={onChange} />
  </div>
));

const SettingsPage: React.FC = () => {
  const { user, updateProfile, updatePassword } = useSupabaseAuth();
  const { showToast } = useToast();
  const userId = user?.id ?? null;

  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileSaving, setProfileSaving] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [agendaSaving, setAgendaSaving] = useState(false);
  const [crmSaving, setCrmSaving] = useState(false);
  const [patientSaving, setPatientSaving] = useState(false);
  const [educatorSaving, setEducatorSaving] = useState(false);
  const [adminSaving, setAdminSaving] = useState(false);

  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    licenseNumber: '',
    specialties: '',
    bio: '',
    workingStart: DEFAULT_WORKING_HOURS.start,
    workingEnd: DEFAULT_WORKING_HOURS.end,
    workingDays: [...DEFAULT_WORKING_HOURS.days],
  });

  const [agendaForm, setAgendaForm] = useState({
    showSunday: DEFAULT_AGENDA_PREFERENCES.showSunday,
    defaultView: DEFAULT_AGENDA_PREFERENCES.defaultView,
    appointmentView: DEFAULT_AGENDA_PREFERENCES.appointmentView,
    defaultDuration: DEFAULT_AGENDA_PREFERENCES.defaultDuration,
    allowOverbooking: DEFAULT_AGENDA_PREFERENCES.allowOverbooking,
    autoAssignTherapist: DEFAULT_AGENDA_PREFERENCES.autoAssignTherapist,
  });

  const [crmForm, setCrmForm] = useState({
    defaultPipelineStage: DEFAULT_CRM_PREFERENCES.defaultPipelineStage,
    autoAssignLeads: DEFAULT_CRM_PREFERENCES.autoAssignLeads,
    notifyOnNewLead: DEFAULT_CRM_PREFERENCES.notifyOnNewLead,
    dailyDigest: DEFAULT_CRM_PREFERENCES.dailyDigest,
    followUpReminderDays: DEFAULT_CRM_PREFERENCES.followUpReminderDays,
    defaultTags: '',
  });

  const [patientForm, setPatientForm] = useState({
    preferredLanguage: DEFAULT_PATIENT_PREFERENCES.preferredLanguage,
    reminderChannel: DEFAULT_PATIENT_PREFERENCES.reminderChannel,
    shareProgressWithFamily: DEFAULT_PATIENT_PREFERENCES.shareProgressWithFamily,
  });

  const [educatorForm, setEducatorForm] = useState({
    availableForWorkshops: DEFAULT_EDUCATOR_PREFERENCES.availableForWorkshops,
    expertiseAreas: '',
    acceptsRemoteSessions: DEFAULT_EDUCATOR_PREFERENCES.acceptsRemoteSessions,
    preferredContentFormat: DEFAULT_EDUCATOR_PREFERENCES.preferredContentFormat,
  });

  const [adminForm, setAdminForm] = useState({
    clinicName: DEFAULT_ADMIN_PREFERENCES.clinicName ?? '',
    enableAuditEmails: DEFAULT_ADMIN_PREFERENCES.enableAuditEmails,
    allowBetaFeatures: DEFAULT_ADMIN_PREFERENCES.allowBetaFeatures,
    defaultExportFormat: DEFAULT_ADMIN_PREFERENCES.defaultExportFormat,
    dailySummaryTime: DEFAULT_ADMIN_PREFERENCES.dailySummaryTime,
  });

  const [securityForm, setSecurityForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const hydrateForms = useCallback((profile: UserProfile) => {
    const settings = parseProfileSettings(profile.profile_settings);

    setProfileForm({
      fullName: profile.full_name ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? settings.phone ?? '',
      department: settings.department ?? '',
      licenseNumber: settings.license_number ?? '',
      specialties: (settings.specialties ?? []).join(', '),
      bio: settings.bio ?? '',
      workingStart: settings.working_hours?.start ?? DEFAULT_WORKING_HOURS.start,
      workingEnd: settings.working_hours?.end ?? DEFAULT_WORKING_HOURS.end,
      workingDays: [...(settings.working_hours?.days ?? DEFAULT_WORKING_HOURS.days)],
    });

    setAgendaForm({
      showSunday: settings.agenda_preferences?.showSunday ?? DEFAULT_AGENDA_PREFERENCES.showSunday,
      defaultView: settings.agenda_preferences?.defaultView ?? DEFAULT_AGENDA_PREFERENCES.defaultView,
      appointmentView:
        settings.agenda_preferences?.appointmentView ?? DEFAULT_AGENDA_PREFERENCES.appointmentView,
      defaultDuration:
        settings.agenda_preferences?.defaultDuration ?? DEFAULT_AGENDA_PREFERENCES.defaultDuration,
      allowOverbooking:
        settings.agenda_preferences?.allowOverbooking ?? DEFAULT_AGENDA_PREFERENCES.allowOverbooking,
      autoAssignTherapist:
        settings.agenda_preferences?.autoAssignTherapist ?? DEFAULT_AGENDA_PREFERENCES.autoAssignTherapist,
    });

    setCrmForm({
      defaultPipelineStage:
        settings.crm_preferences?.defaultPipelineStage ?? DEFAULT_CRM_PREFERENCES.defaultPipelineStage,
      autoAssignLeads:
        settings.crm_preferences?.autoAssignLeads ?? DEFAULT_CRM_PREFERENCES.autoAssignLeads,
      notifyOnNewLead:
        settings.crm_preferences?.notifyOnNewLead ?? DEFAULT_CRM_PREFERENCES.notifyOnNewLead,
      dailyDigest: settings.crm_preferences?.dailyDigest ?? DEFAULT_CRM_PREFERENCES.dailyDigest,
      followUpReminderDays:
        settings.crm_preferences?.followUpReminderDays ?? DEFAULT_CRM_PREFERENCES.followUpReminderDays,
      defaultTags: (settings.crm_preferences?.defaultTags ?? []).join(', '),
    });

    setPatientForm({
      preferredLanguage:
        settings.patient_preferences?.preferredLanguage ?? DEFAULT_PATIENT_PREFERENCES.preferredLanguage,
      reminderChannel:
        settings.patient_preferences?.reminderChannel ?? DEFAULT_PATIENT_PREFERENCES.reminderChannel,
      shareProgressWithFamily:
        settings.patient_preferences?.shareProgressWithFamily ??
        DEFAULT_PATIENT_PREFERENCES.shareProgressWithFamily,
    });

    setEducatorForm({
      availableForWorkshops:
        settings.educator_preferences?.availableForWorkshops ??
        DEFAULT_EDUCATOR_PREFERENCES.availableForWorkshops,
      expertiseAreas: (settings.educator_preferences?.expertiseAreas ?? []).join(', '),
      acceptsRemoteSessions:
        settings.educator_preferences?.acceptsRemoteSessions ??
        DEFAULT_EDUCATOR_PREFERENCES.acceptsRemoteSessions,
      preferredContentFormat:
        settings.educator_preferences?.preferredContentFormat ??
        DEFAULT_EDUCATOR_PREFERENCES.preferredContentFormat,
    });

    setAdminForm({
      clinicName: settings.admin_preferences?.clinicName ?? DEFAULT_ADMIN_PREFERENCES.clinicName ?? '',
      enableAuditEmails:
        settings.admin_preferences?.enableAuditEmails ?? DEFAULT_ADMIN_PREFERENCES.enableAuditEmails,
      allowBetaFeatures:
        settings.admin_preferences?.allowBetaFeatures ?? DEFAULT_ADMIN_PREFERENCES.allowBetaFeatures,
      defaultExportFormat:
        settings.admin_preferences?.defaultExportFormat ?? DEFAULT_ADMIN_PREFERENCES.defaultExportFormat,
      dailySummaryTime:
        settings.admin_preferences?.dailySummaryTime ?? DEFAULT_ADMIN_PREFERENCES.dailySummaryTime,
    });
  }, []);

  // Usar ref para evitar dependência circular
  const hydrateFormsRef = useRef(hydrateForms);
  hydrateFormsRef.current = hydrateForms;

  const mergeSettings = useCallback(
    (partial: Partial<ProfileSettings>): ProfileSettings => {
      const current = profileData ? parseProfileSettings(profileData.profile_settings) : {};
      const merged: ProfileSettings = {
        ...current,
        working_hours: {
          ...DEFAULT_WORKING_HOURS,
          ...(current.working_hours ?? {}),
        },
        notification_preferences: {
          ...(current.notification_preferences ?? {}),
        },
        agenda_preferences: {
          ...DEFAULT_AGENDA_PREFERENCES,
          ...(current.agenda_preferences ?? {}),
        },
        crm_preferences: {
          ...DEFAULT_CRM_PREFERENCES,
          ...(current.crm_preferences ?? {}),
        },
        patient_preferences: {
          ...DEFAULT_PATIENT_PREFERENCES,
          ...(current.patient_preferences ?? {}),
        },
        educator_preferences: {
          ...DEFAULT_EDUCATOR_PREFERENCES,
          ...(current.educator_preferences ?? {}),
        },
        admin_preferences: {
          ...DEFAULT_ADMIN_PREFERENCES,
          ...(current.admin_preferences ?? {}),
        },
      };

      if (partial.phone !== undefined) {
        merged.phone = partial.phone;
      }
      if (partial.bio !== undefined) {
        merged.bio = partial.bio;
      }
      if (partial.department !== undefined) {
        merged.department = partial.department;
      }
      if (partial.license_number !== undefined) {
        merged.license_number = partial.license_number;
      }
      if (partial.specialties !== undefined) {
        merged.specialties = [...partial.specialties];
      } else if (merged.specialties) {
        merged.specialties = [...merged.specialties];
      }

      if (partial.working_hours) {
        merged.working_hours = {
          ...merged.working_hours,
          ...partial.working_hours,
          days: partial.working_hours.days
            ? [...partial.working_hours.days]
            : [...(merged.working_hours?.days ?? DEFAULT_WORKING_HOURS.days)],
        };
      } else if (merged.working_hours) {
        merged.working_hours = {
          ...merged.working_hours,
          days: [...(merged.working_hours.days ?? DEFAULT_WORKING_HOURS.days)],
        };
      }

      if (partial.notification_preferences) {
        merged.notification_preferences = {
          ...(merged.notification_preferences ?? {}),
          ...partial.notification_preferences,
        };
      }

      if (partial.agenda_preferences) {
        merged.agenda_preferences = {
          ...merged.agenda_preferences,
          ...partial.agenda_preferences,
        };
      }

      if (partial.crm_preferences) {
        merged.crm_preferences = {
          ...merged.crm_preferences,
          ...partial.crm_preferences,
          defaultTags: partial.crm_preferences.defaultTags
            ? [...partial.crm_preferences.defaultTags]
            : [...(merged.crm_preferences?.defaultTags ?? [])],
        };
      } else if (merged.crm_preferences?.defaultTags) {
        merged.crm_preferences.defaultTags = [...merged.crm_preferences.defaultTags];
      }

      if (partial.patient_preferences) {
        merged.patient_preferences = {
          ...merged.patient_preferences,
          ...partial.patient_preferences,
        };
      }

      if (partial.educator_preferences) {
        merged.educator_preferences = {
          ...merged.educator_preferences,
          ...partial.educator_preferences,
          expertiseAreas: partial.educator_preferences.expertiseAreas
            ? [...partial.educator_preferences.expertiseAreas]
            : [...(merged.educator_preferences?.expertiseAreas ?? [])],
        };
      } else if (merged.educator_preferences?.expertiseAreas) {
        merged.educator_preferences.expertiseAreas = [...merged.educator_preferences.expertiseAreas];
      }

      if (partial.admin_preferences) {
        merged.admin_preferences = {
          ...merged.admin_preferences,
          ...partial.admin_preferences,
        };
      }

      return merged;
    },
    [profileData],
  );

  const loadProfile = useCallback(async () => {
    if (!userId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const profile = await userService.getUserById(userId);
      if (!profile) {
        throw new Error('Nao foi possivel carregar o perfil.');
      }
      setProfileData(profile);
      hydrateFormsRef.current(profile);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro inesperado ao carregar configuracoes.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      setProfileData(null);
      return;
    }
    loadProfile();
  }, [userId]); // Removido loadProfile das dependências para evitar loop infinito

  useEffect(() => {
    if (loading) {
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveSection(visible.target.id as SectionId);
        }
      },
      {
        rootMargin: '-45% 0px -45% 0px',
        threshold: [0.15, 0.35, 0.6],
      },
    );

    NAVIGATION_SECTIONS.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [loading]);

  const handleNavigate = useCallback((sectionId: SectionId) => {
    setActiveSection(sectionId);
    if (typeof window === 'undefined') {
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleToggleWorkingDay = useCallback((dayValue: number) => {
    setProfileForm(prev => {
      const exists = prev.workingDays.includes(dayValue);
      const days = exists
        ? prev.workingDays.filter(day => day !== dayValue)
        : [...prev.workingDays, dayValue];
      return {
        ...prev,
        workingDays: days.sort((a, b) => a - b),
      };
    });
  }, []);

  // Handlers memoizados para evitar re-renders desnecessários
  const handleProfileChange = useCallback((field: string, value: string) => {
    setProfileForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAgendaChange = useCallback((field: string, value: any) => {
    setAgendaForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleCrmChange = useCallback((field: string, value: any) => {
    setCrmForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePatientChange = useCallback((field: string, value: any) => {
    setPatientForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleEducatorChange = useCallback((field: string, value: any) => {
    setEducatorForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleAdminChange = useCallback((field: string, value: any) => {
    setAdminForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSaveProfile = async () => {
    if (!profileData) {
      return;
    }
    setProfileSaving(true);
    setError(null);

    try {
      const specialties = profileForm.specialties
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const normalizedDays =
        profileForm.workingDays.length > 0
          ? [...profileForm.workingDays]
          : [...DEFAULT_WORKING_HOURS.days];

      const nextSettings = mergeSettings({
        phone: profileForm.phone.trim() || undefined,
        department: profileForm.department.trim() || undefined,
        license_number: profileForm.licenseNumber.trim() || undefined,
        specialties,
        bio: profileForm.bio.trim() || undefined,
        working_hours: {
          start: profileForm.workingStart,
          end: profileForm.workingEnd,
          days: normalizedDays,
        },
      });

      const updated = await userService.updateUser(profileData.id, {
        full_name: profileForm.fullName.trim() || profileData.full_name || '',
        profile_settings: nextSettings,
      });

      try {
        await updateProfile({
          name: profileForm.fullName,
          phone: profileForm.phone,
        });
      } catch (syncError) {
        console.warn('Falha ao sincronizar perfil na autenticacao.', syncError);
      }

      setProfileData(updated);
      hydrateForms(updated);
      showToast('Perfil atualizado com sucesso.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nao foi possivel salvar o perfil.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!securityForm.newPassword) {
      const message = 'Informe a nova senha.';
      setError(message);
      showToast(message, 'error');
      return;
    }
    if (securityForm.newPassword.length < 8) {
      const message = 'A senha precisa ter pelo menos 8 caracteres.';
      setError(message);
      showToast(message, 'error');
      return;
    }
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      const message = 'As senhas informadas nao coincidem.';
      setError(message);
      showToast(message, 'error');
      return;
    }

    setSecuritySaving(true);
    setError(null);

    try {
      await updatePassword(securityForm.newPassword);
      setSecurityForm({ newPassword: '', confirmPassword: '' });
      showToast('Senha atualizada com sucesso.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Nao foi possivel atualizar a senha.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setSecuritySaving(false);
    }
  };

  const handleSaveAgenda = async () => {
    if (!profileData) {
      return;
    }

    setAgendaSaving(true);
    setError(null);

    try {
      const nextSettings = mergeSettings({
        agenda_preferences: {
          showSunday: agendaForm.showSunday,
          defaultView: agendaForm.defaultView,
          appointmentView: agendaForm.appointmentView,
          defaultDuration: agendaForm.defaultDuration,
          allowOverbooking: agendaForm.allowOverbooking,
          autoAssignTherapist: agendaForm.autoAssignTherapist,
        },
      });

      const updated = await userService.updateUser(profileData.id, {
        profile_settings: nextSettings,
      });

      setProfileData(updated);
      hydrateForms(updated);
      showToast('Preferencias da agenda salvas.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar preferencias da agenda.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setAgendaSaving(false);
    }
  };

  const handleSaveCrm = async () => {
    if (!profileData) {
      return;
    }

    setCrmSaving(true);
    setError(null);

    try {
      const defaultTags = crmForm.defaultTags
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const nextSettings = mergeSettings({
        crm_preferences: {
          defaultPipelineStage: crmForm.defaultPipelineStage,
          autoAssignLeads: crmForm.autoAssignLeads,
          notifyOnNewLead: crmForm.notifyOnNewLead,
          dailyDigest: crmForm.dailyDigest,
          followUpReminderDays: crmForm.followUpReminderDays,
          defaultTags,
        },
      });

      const updated = await userService.updateUser(profileData.id, {
        profile_settings: nextSettings,
      });

      setProfileData(updated);
      hydrateForms(updated);
      showToast('Preferencias do CRM salvas.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar preferencias do CRM.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setCrmSaving(false);
    }
  };

  const handleSavePatient = async () => {
    if (!profileData) {
      return;
    }

    setPatientSaving(true);
    setError(null);

    try {
      const nextSettings = mergeSettings({
        patient_preferences: {
          preferredLanguage: patientForm.preferredLanguage,
          reminderChannel: patientForm.reminderChannel,
          shareProgressWithFamily: patientForm.shareProgressWithFamily,
        },
      });

      const updated = await userService.updateUser(profileData.id, {
        profile_settings: nextSettings,
      });

      setProfileData(updated);
      hydrateForms(updated);
      showToast('Preferencias do paciente salvas.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar preferencias do paciente.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setPatientSaving(false);
    }
  };

  const handleSaveEducator = async () => {
    if (!profileData) {
      return;
    }

    setEducatorSaving(true);
    setError(null);

    try {
      const expertiseAreas = educatorForm.expertiseAreas
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

      const nextSettings = mergeSettings({
        educator_preferences: {
          availableForWorkshops: educatorForm.availableForWorkshops,
          expertiseAreas,
          acceptsRemoteSessions: educatorForm.acceptsRemoteSessions,
          preferredContentFormat: educatorForm.preferredContentFormat,
        },
      });

      const updated = await userService.updateUser(profileData.id, {
        profile_settings: nextSettings,
      });

      setProfileData(updated);
      hydrateForms(updated);
      showToast('Preferencias do educador salvas.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar preferencias do educador.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setEducatorSaving(false);
    }
  };

  const handleSaveAdmin = async () => {
    if (!profileData) {
      return;
    }

    setAdminSaving(true);
    setError(null);

    try {
      const nextSettings = mergeSettings({
        admin_preferences: {
          clinicName: adminForm.clinicName || undefined,
          enableAuditEmails: adminForm.enableAuditEmails,
          allowBetaFeatures: adminForm.allowBetaFeatures,
          defaultExportFormat: adminForm.defaultExportFormat,
          dailySummaryTime: adminForm.dailySummaryTime,
        },
      });

      const updated = await userService.updateUser(profileData.id, {
        profile_settings: nextSettings,
      });

      setProfileData(updated);
      hydrateForms(updated);
      showToast('Configuracoes administrativas salvas.', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao salvar configuracoes administrativas.';
      setError(message);
      showToast(message, 'error');
    } finally {
      setAdminSaving(false);
    }
  };

  return (
    <ErrorBoundary fallback={<div className="flex h-64 items-center justify-center text-red-500">Erro ao carregar configurações. Tente recarregar a página.</div>}>
      <div className="min-h-screen bg-neutral-bgAlt">
        <div className="border-b border-neutral-border bg-white">
          <div className="mx-auto max-w-6xl px-md py-3xl sm:px-lg lg:px-xl">
            <div className="flex items-start gap-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-card bg-primary-light text-primary">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <PageHeader
                  title="Configuracoes"
                  subtitle="Personalize sua experiencia, agenda e comunicacoes."
                />
              </div>
            </div>
          </div>
        </div>

        <main className="mx-auto max-w-6xl px-md py-10 sm:px-lg lg:px-xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
          </div>
        ) : !userId ? (
          <Alert variant="destructive">
            <AlertDescription>
              E necessario estar autenticado para acessar as configuracoes.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="grid gap-xl lg:grid-cols-[250px_1fr]">
            <aside className="h-fit space-y-xl rounded-cardLarge border border-neutral-border bg-white p-lg">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-textTertiary">
                  Navegacao
                </p>
                <div className="mt-md flex flex-col gap-1">
                  {NAVIGATION_SECTIONS.map(section => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => handleNavigate(section.id)}
                        className={`flex items-center gap-md rounded-lg px-md py-sm text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 ${
                          isActive
                            ? 'bg-primary-light text-primary'
                            : 'text-neutral-textSecondary hover:bg-neutral-bgAlt'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {section.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="space-y-10">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-wrap gap-sm lg:hidden">
                {NAVIGATION_SECTIONS.map(section => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => handleNavigate(section.id)}
                      className={`flex items-center gap-sm rounded-full border px-md py-1.5 text-xs font-medium transition ${
                        isActive
                          ? 'border-sky-500 bg-primary-light text-primary'
                          : 'border-neutral-border text-neutral-textSecondary hover:border-sky-300 hover:text-primary'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {section.label}
                    </button>
                  );
                })}
              </div>

              <SectionCard
                id="profile"
                icon={<User className="h-5 w-5" />}
                title="Perfil profissional"
                description="Atualize suas informacoes pessoais, contato e disponibilidade."
              >
                <div className="grid gap-md sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <Input
                      id="fullName"
                      value={profileForm.fullName}
                      onChange={event =>
                        setProfileForm(prev => ({ ...prev, fullName: event.target.value }))
                      }
                      placeholder="Ex.: Dra. Maria Souza"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" value={profileForm.email} disabled />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={event =>
                        setProfileForm(prev => ({ ...prev, phone: event.target.value }))
                      }
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={profileForm.department}
                      onChange={event =>
                        setProfileForm(prev => ({ ...prev, department: event.target.value }))
                      }
                      placeholder="Fisioterapia esportiva"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="licenseNumber">Registro profissional</Label>
                    <Input
                      id="licenseNumber"
                      value={profileForm.licenseNumber}
                      onChange={event =>
                        setProfileForm(prev => ({ ...prev, licenseNumber: event.target.value }))
                      }
                      placeholder="CREFITO-3/123456-F"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="specialties">Especialidades</Label>
                    <Input
                      id="specialties"
                      value={profileForm.specialties}
                      onChange={event =>
                        setProfileForm(prev => ({ ...prev, specialties: event.target.value }))
                      }
                      placeholder="Ortopedia, Pilates, RPG"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={profileForm.bio}
                      onChange={event =>
                        setProfileForm(prev => ({ ...prev, bio: event.target.value }))
                      }
                      placeholder="Compartilhe sua trajetoria e principais destaques."
                    />
                  </div>
                </div>

                <div className="rounded-cardLarge border border-neutral-border bg-neutral-bgAlt/60 p-md">
                  <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-text">
                        Janela de atendimento
                      </h3>
                      <p className="text-xs text-neutral-textSecondary">
                        Defina o horario padrao usado para sugestoes de agenda.
                      </p>
                    </div>
                    <div className="grid gap-md sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="workingStart">Inicio</Label>
                        <Input
                          id="workingStart"
                          type="time"
                          value={profileForm.workingStart}
                          onChange={event =>
                            setProfileForm(prev => ({
                              ...prev,
                              workingStart: event.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="workingEnd">Fim</Label>
                        <Input
                          id="workingEnd"
                          type="time"
                          value={profileForm.workingEnd}
                          onChange={event =>
                            setProfileForm(prev => ({
                              ...prev,
                              workingEnd: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-md">
                    <p className="text-sm font-medium text-neutral-text">Dias de atendimento</p>
                    <div className="mt-3 grid grid-cols-2 gap-sm sm:grid-cols-7">
                      {WORKING_DAYS.map(day => (
                        <WorkingDayToggle
                          key={day.value}
                          label={day.label}
                          active={profileForm.workingDays.includes(day.value)}
                          onToggle={() => handleToggleWorkingDay(day.value)}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={profileSaving}
                    className="w-full sm:w-auto"
                  >
                    {profileSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar perfil
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                id="security"
                icon={<Shield className="h-5 w-5" />}
                title="Seguranca"
                description="Atualize a senha e mantenha sua conta protegida."
              >
                <div className="grid gap-md sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="newPassword">Nova senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={securityForm.newPassword}
                      onChange={event =>
                        setSecurityForm(prev => ({ ...prev, newPassword: event.target.value }))
                      }
                      placeholder="Informe uma senha segura"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={event =>
                        setSecurityForm(prev => ({ ...prev, confirmPassword: event.target.value }))
                      }
                      placeholder="Repita a nova senha"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveSecurity}
                    disabled={securitySaving}
                    className="w-full sm:w-auto"
                  >
                    {securitySaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Atualizar senha
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                id="notifications"
                icon={<Bell className="h-5 w-5" />}
                title="Notificacoes"
                description="Controle canais, frequencia e janelas silenciosas."
              >
                <div className="rounded-cardLarge border border-neutral-border">
                  {profileData ? (
                    <NotificationSettings userId={profileData.id} />
                  ) : (
                    <div className="flex items-center justify-center p-xl text-sm text-neutral-textSecondary">
                      Carregando preferencias de notificacao...
                    </div>
                  )}
                </div>
              </SectionCard>

              <SectionCard
                id="agenda"
                icon={<Calendar className="h-5 w-5" />}
                title="Agenda inteligente"
                description="Defina como a agenda se comporta para novos agendamentos."
              >
                <div className="grid gap-md sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultView">Visao padrao</Label>
                    <select
                      id="defaultView"
                      value={agendaForm.defaultView}
                      onChange={event =>
                        setAgendaForm(prev => ({
                          ...prev,
                          defaultView: event.target.value as AgendaView,
                        }))
                      }
                      className="h-10 w-full rounded-md border border-neutral-border bg-white px-md text-sm shadow-card focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="day">Dia</option>
                      <option value="week">Semana</option>
                      <option value="month">Mes</option>
                      <option value="list">Lista</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="appointmentView">Exibicao dos atendimentos</Label>
                    <select
                      id="appointmentView"
                      value={agendaForm.appointmentView}
                      onChange={event =>
                        setAgendaForm(prev => ({
                          ...prev,
                          appointmentView: event.target.value as AppointmentView,
                        }))
                      }
                      className="h-10 w-full rounded-md border border-neutral-border bg-white px-md text-sm shadow-card focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <option value="detailed">Detalhada</option>
                      <option value="compact">Compacta</option>
                      <option value="list">Lista</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultDuration">Duracao padrao (min)</Label>
                    <Input
                      id="defaultDuration"
                      type="number"
                      min={15}
                      step={5}
                      value={agendaForm.defaultDuration}
                      onChange={event =>
                        setAgendaForm(prev => ({
                          ...prev,
                          defaultDuration:
                            Number(event.target.value) || DEFAULT_AGENDA_PREFERENCES.defaultDuration,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="grid gap-md md:grid-cols-2">
                  <BooleanField
                    id="showSunday"
                    label="Exibir domingo"
                    description="Inclui domingos nas visoes semanais."
                    value={agendaForm.showSunday}
                    onChange={checked =>
                      setAgendaForm(prev => ({ ...prev, showSunday: checked }))
                    }
                  />
                  <BooleanField
                    id="allowOverbooking"
                    label="Permitir sobreposicao"
                    description="Autoriza agendar mesmo com horario ocupado."
                    value={agendaForm.allowOverbooking}
                    onChange={checked =>
                      setAgendaForm(prev => ({ ...prev, allowOverbooking: checked }))
                    }
                  />
                  <BooleanField
                    id="autoAssignTherapist"
                    label="Sugestao automatica de terapeuta"
                    description="O sistema indica o melhor profissional disponivel."
                    value={agendaForm.autoAssignTherapist}
                    onChange={checked =>
                      setAgendaForm(prev => ({ ...prev, autoAssignTherapist: checked }))
                    }
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveAgenda}
                    disabled={agendaSaving}
                    className="w-full sm:w-auto"
                  >
                    {agendaSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar agenda
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                id="crm"
                icon={<BarChart3 className="h-5 w-5" />}
                title="CRM e funil"
                description="Configure regras para leads, funil e lembretes de follow-up."
              >
                <div className="grid gap-md sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="defaultPipelineStage">Estagio inicial</Label>
                    <Input
                      id="defaultPipelineStage"
                      value={crmForm.defaultPipelineStage}
                      onChange={event =>
                        setCrmForm(prev => ({
                          ...prev,
                          defaultPipelineStage: event.target.value,
                        }))
                      }
                      placeholder="Triagem, onboarding..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="followUpReminderDays">Dias para lembrete</Label>
                    <Input
                      id="followUpReminderDays"
                      type="number"
                      min={0}
                      value={crmForm.followUpReminderDays}
                      onChange={event =>
                        setCrmForm(prev => ({
                          ...prev,
                          followUpReminderDays:
                            Number(event.target.value) || DEFAULT_CRM_PREFERENCES.followUpReminderDays,
                        }))
                      }
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="defaultTags">Tags padrao</Label>
                    <Input
                      id="defaultTags"
                      value={crmForm.defaultTags}
                      onChange={event =>
                        setCrmForm(prev => ({ ...prev, defaultTags: event.target.value }))
                      }
                      placeholder="Saude, Esportes, Pos-operatorio"
                    />
                  </div>
                </div>
                <div className="grid gap-md md:grid-cols-2">
                  <BooleanField
                    id="autoAssignLeads"
                    label="Distribuir leads automaticamente"
                    description="Reparte novos leads conforme disponibilidade."
                    value={crmForm.autoAssignLeads}
                    onChange={checked =>
                      setCrmForm(prev => ({ ...prev, autoAssignLeads: checked }))
                    }
                  />
                  <BooleanField
                    id="notifyOnNewLead"
                    label="Notificar novos leads"
                    description="Envia alerta imediato quando chegar um lead."
                    value={crmForm.notifyOnNewLead}
                    onChange={checked =>
                      setCrmForm(prev => ({ ...prev, notifyOnNewLead: checked }))
                    }
                  />
                  <BooleanField
                    id="dailyDigest"
                    label="Resumo diario"
                    description="Receba consolidado de leads por e-mail diariamente."
                    value={crmForm.dailyDigest}
                    onChange={checked =>
                      setCrmForm(prev => ({ ...prev, dailyDigest: checked }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSaveCrm}
                    disabled={crmSaving}
                    className="w-full sm:w-auto"
                  >
                    {crmSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    Salvar CRM
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                id="advanced"
                icon={<Users className="h-5 w-5" />}
                title="Ajustes por perfil"
                description="Aplique configuracoes especificas para pacientes, educadores e administradores."
              >
                <div className="grid gap-lg lg:grid-cols-2">
                  <div className="space-y-md rounded-cardLarge border border-neutral-border p-md">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-text">Portal do paciente</h3>
                      <p className="text-xs text-neutral-textSecondary">
                        Experiencia aplicada ao acesso do paciente na plataforma.
                      </p>
                    </div>
                    <div className="space-y-md">
                      <div className="space-y-1.5">
                        <Label htmlFor="preferredLanguage">Idioma preferencial</Label>
                        <select
                          id="preferredLanguage"
                          value={patientForm.preferredLanguage}
                          onChange={event =>
                            setPatientForm(prev => ({
                              ...prev,
                              preferredLanguage: event.target.value,
                            }))
                          }
                          className="h-10 w-full rounded-md border border-neutral-border bg-white px-md text-sm shadow-card focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        >
                          <option value="pt-BR">Portugues (Brasil)</option>
                          <option value="en-US">Ingles</option>
                          <option value="es-ES">Espanhol</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="reminderChannel">Canal de lembrete</Label>
                        <select
                          id="reminderChannel"
                          value={patientForm.reminderChannel}
                          onChange={event =>
                            setPatientForm(prev => ({
                              ...prev,
                              reminderChannel: event.target.value as ReminderChannel,
                            }))
                          }
                          className="h-10 w-full rounded-md border border-neutral-border bg-white px-md text-sm shadow-card focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        >
                          <option value="email">E-mail</option>
                          <option value="sms">SMS</option>
                          <option value="push">Push</option>
                        </select>
                      </div>
                      <BooleanField
                        id="shareProgressWithFamily"
                        label="Compartilhar progresso com familiares"
                        description="Permite enviar evolucao automaticamente para familiares autorizados."
                        value={patientForm.shareProgressWithFamily}
                        onChange={checked =>
                          setPatientForm(prev => ({ ...prev, shareProgressWithFamily: checked }))
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleSavePatient}
                        disabled={patientSaving}
                        className="w-full sm:w-auto"
                      >
                        {patientSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Salvar paciente
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-md rounded-cardLarge border border-neutral-border p-md">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-text">Educador</h3>
                      <p className="text-xs text-neutral-textSecondary">
                        Ajustes voltados ao perfil de conteudo e workshops.
                      </p>
                    </div>
                    <div className="space-y-md">
                      <BooleanField
                        id="availableForWorkshops"
                        label="Disponivel para workshops"
                        description="Inclui este profissional na listagem de eventos."
                        value={educatorForm.availableForWorkshops}
                        onChange={checked =>
                          setEducatorForm(prev => ({ ...prev, availableForWorkshops: checked }))
                        }
                      />
                      <BooleanField
                        id="acceptsRemoteSessions"
                        label="Aceita sessoes remotas"
                        description="Permite agendamentos via teleatendimento."
                        value={educatorForm.acceptsRemoteSessions}
                        onChange={checked =>
                          setEducatorForm(prev => ({ ...prev, acceptsRemoteSessions: checked }))
                        }
                      />
                      <div className="space-y-1.5">
                        <Label htmlFor="preferredContentFormat">Formato preferencial</Label>
                        <select
                          id="preferredContentFormat"
                          value={educatorForm.preferredContentFormat}
                          onChange={event =>
                            setEducatorForm(prev => ({
                              ...prev,
                              preferredContentFormat: event.target.value as EducatorFormat,
                            }))
                          }
                          className="h-10 w-full rounded-md border border-neutral-border bg-white px-md text-sm shadow-card focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        >
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="live">Ao vivo</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="expertiseAreas">Areas de expertise</Label>
                        <Textarea
                          id="expertiseAreas"
                          rows={3}
                          value={educatorForm.expertiseAreas}
                          onChange={event =>
                            setEducatorForm(prev => ({
                              ...prev,
                              expertiseAreas: event.target.value,
                            }))
                          }
                          placeholder="Ex.: Reabilitacao neurologica, Pilates clinico"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleSaveEducator}
                        disabled={educatorSaving}
                        className="w-full sm:w-auto"
                      >
                        {educatorSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Salvar educador
                      </Button>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-md rounded-cardLarge border border-neutral-border p-md">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-text">Administrativo</h3>
                      <p className="text-xs text-neutral-textSecondary">
                        Configuracoes aplicadas aos perfis de administracao da clinica.
                      </p>
                    </div>
                    <div className="grid gap-md sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="clinicName">Nome da clinica</Label>
                        <Input
                          id="clinicName"
                          value={adminForm.clinicName}
                          onChange={event =>
                            setAdminForm(prev => ({ ...prev, clinicName: event.target.value }))
                          }
                          placeholder="DuduFisio Unidade Centro"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="defaultExportFormat">Formato de exportacao</Label>
                        <select
                          id="defaultExportFormat"
                          value={adminForm.defaultExportFormat}
                          onChange={event =>
                            setAdminForm(prev => ({
                              ...prev,
                              defaultExportFormat: event.target.value as ExportFormat,
                            }))
                          }
                          className="h-10 w-full rounded-md border border-neutral-border bg-white px-md text-sm shadow-card focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
                        >
                          <option value="csv">CSV</option>
                          <option value="pdf">PDF</option>
                          <option value="xlsx">XLSX</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="dailySummaryTime">Horario do resumo diario</Label>
                        <Input
                          id="dailySummaryTime"
                          type="time"
                          value={adminForm.dailySummaryTime}
                          onChange={event =>
                            setAdminForm(prev => ({
                              ...prev,
                              dailySummaryTime: event.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="grid gap-md md:grid-cols-2">
                      <BooleanField
                        id="enableAuditEmails"
                        label="Enviar relatorios de auditoria"
                        description="Encaminha logs de acesso diariamente."
                        value={adminForm.enableAuditEmails}
                        onChange={checked =>
                          setAdminForm(prev => ({ ...prev, enableAuditEmails: checked }))
                        }
                      />
                      <BooleanField
                        id="allowBetaFeatures"
                        label="Habilitar recursos beta"
                        description="Permite testar funcionalidades em desenvolvimento."
                        value={adminForm.allowBetaFeatures}
                        onChange={checked =>
                          setAdminForm(prev => ({ ...prev, allowBetaFeatures: checked }))
                        }
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={handleSaveAdmin}
                        disabled={adminSaving}
                        className="w-full sm:w-auto"
                      >
                        {adminSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                        Salvar administrativo
                      </Button>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                id="demo-data"
                icon={<Database className="h-5 w-5" />}
                title="Dados de Demonstração"
                description="Popule o sistema com dados de exemplo ou limpe tudo de uma vez."
              >
                <DemoDataManager />
              </SectionCard>
            </div>
          </div>
        )}
      </main>
      </div>
    </ErrorBoundary>
  );
};

export default SettingsPage;
