/**
 * Calendar Preferences Form Component
 * Formulário de preferências de calendário para pacientes
 */

import React, { useState, useEffect } from 'react';
import { CalendarPreferences } from '../../types';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { useToast } from '../../contexts/ToastContext';
import { Loader } from 'lucide-react';

interface CalendarPreferencesFormProps {
  patientId: string;
  onSave?: () => void;
}

export function CalendarPreferencesForm({ patientId, onSave }: CalendarPreferencesFormProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<CalendarPreferences>({
    id: '',
    patient_id: patientId,
    auto_send_calendar_invite: true,
    preferred_calendar: 'google',
    send_via_whatsapp: true,
    send_via_email: true,
    send_via_sms: false,
    reminder_hours_before: [24, 2],
    timezone: 'America/Sao_Paulo'
  });

  useEffect(() => {
    loadPreferences();
  }, [patientId]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const prefs = await calendarPreferencesService.getPatientPreferences(patientId);
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await calendarPreferencesService.updatePreferences(patientId, preferences);
      showToast('Preferências salvas com sucesso!', 'success');
      onSave?.();
    } catch (error: any) {
      showToast('Erro ao salvar preferências', 'error');
      console.error('Error saving preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof CalendarPreferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Preferências de Calendário</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure como deseja receber convites de calendário para suas consultas.
        </p>
      </div>

      {/* Auto-send toggle */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <Label htmlFor="auto-send" className="text-base font-medium cursor-pointer">
            Enviar convites automaticamente
          </Label>
          <p className="text-sm text-gray-600 mt-1">
            Convites serão enviados automaticamente ao agendar consultas
          </p>
        </div>
        <Switch
          id="auto-send"
          checked={preferences.auto_send_calendar_invite}
          onCheckedChange={(checked) => handleToggle('auto_send_calendar_invite', checked)}
        />
      </div>

      {/* Channels */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Enviar via:</Label>
        
        <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
          <Checkbox
            id="whatsapp"
            checked={preferences.send_via_whatsapp}
            onCheckedChange={(checked) => handleToggle('send_via_whatsapp', checked as boolean)}
          />
          <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-lg">💬</span>
              <div>
                <div className="font-medium">WhatsApp</div>
                <div className="text-sm text-gray-600">Receber links via WhatsApp</div>
              </div>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
          <Checkbox
            id="email"
            checked={preferences.send_via_email}
            onCheckedChange={(checked) => handleToggle('send_via_email', checked as boolean)}
          />
          <Label htmlFor="email" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-lg">📧</span>
              <div>
                <div className="font-medium">Email</div>
                <div className="text-sm text-gray-600">Receber links via email</div>
              </div>
            </div>
          </Label>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
          <Checkbox
            id="sms"
            checked={preferences.send_via_sms}
            onCheckedChange={(checked) => handleToggle('send_via_sms', checked as boolean)}
          />
          <Label htmlFor="sms" className="flex-1 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-lg">📱</span>
              <div>
                <div className="font-medium">SMS</div>
                <div className="text-sm text-gray-600">Receber links via SMS</div>
              </div>
            </div>
          </Label>
        </div>
      </div>

      {/* Preferred calendar */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Calendário preferido:</Label>
        <div className="grid grid-cols-2 gap-3">
          {(['google', 'apple', 'outlook', 'yahoo'] as const).map((calendar) => (
            <button
              key={calendar}
              type="button"
              onClick={() => handleToggle('preferred_calendar', calendar)}
              className={`p-3 border rounded-lg text-center transition-colors ${
                preferences.preferred_calendar === calendar
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-2xl mb-1">
                {calendar === 'google' && '📅'}
                {calendar === 'apple' && '🍎'}
                {calendar === 'outlook' && '📧'}
                {calendar === 'yahoo' && '✉️'}
              </div>
              <div className="text-sm font-medium capitalize">
                {calendar === 'google' && 'Google'}
                {calendar === 'apple' && 'Apple'}
                {calendar === 'outlook' && 'Outlook'}
                {calendar === 'yahoo' && 'Yahoo'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end pt-4 border-t">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Preferências'
          )}
        </Button>
      </div>
    </div>
  );
}

