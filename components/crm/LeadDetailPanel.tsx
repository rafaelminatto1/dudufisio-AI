/**
 * Lead Detail Panel - Painel lateral com detalhes completos do lead
 * Activity Fisioterapia Integration - Fase 1
 */

import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  User,
  MessageSquare,
  Tag,
  AlertCircle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { Lead, LeadStatus } from '@/types/crm';
import { LeadService } from '@/services/api/crm/leadService';
import { InteractionService } from '@/services/api/crm/interactionService';
import type { LeadInteraction } from '@/types/crm';

interface LeadDetailPanelProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: () => void;
}

export const LeadDetailPanel: React.FC<LeadDetailPanelProps> = ({
  lead,
  onClose,
  onUpdate,
}) => {
  const [interactions, setInteractions] = useState<LeadInteraction[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead.status);

  useEffect(() => {
    loadInteractions();
  }, [lead.id]);

  const loadInteractions = async () => {
    try {
      const data = await InteractionService.getLeadInteractions(lead.id, 20);
      setInteractions(data);
    } catch (err) {
      console.error('Erro ao carregar interações:', err);
    }
  };

  const handleStatusChange = async () => {
    if (selectedStatus === lead.status) return;

    try {
      setLoading(true);
      await LeadService.updateLead(lead.id, { status: selectedStatus });
      onUpdate();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setLoading(true);
      await LeadService.addNote(lead.id, newNote);
      setNewNote('');
      onUpdate();
    } catch (err) {
      console.error('Erro ao adicionar nota:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      setLoading(true);
      await LeadService.addTag(lead.id, newTag);
      setNewTag('');
      onUpdate();
    } catch (err) {
      console.error('Erro ao adicionar tag:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConvert = async () => {
    if (!confirm('Deseja converter este lead em paciente?')) return;

    try {
      setLoading(true);
      await LeadService.convertLeadToPatient(lead.id);
      alert('Lead convertido com sucesso!');
      onUpdate();
    } catch (err) {
      console.error('Erro ao converter lead:', err);
      alert('Erro ao converter lead');
    } finally {
      setLoading(false);
    }
  };

  const urgencyColors = {
    urgente: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    alta: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    media: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    baixa: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {lead.name}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Lead desde {new Date(lead.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Informações de Contato */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Contato
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Phone className="w-4 h-4" />
              <span>{lead.phone}</span>
            </div>
            {lead.email && (
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail className="w-4 h-4" />
                <span>{lead.email}</span>
              </div>
            )}
          </div>
        </section>

        {/* Status e Urgência */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Status e Urgência
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                onBlur={handleStatusChange}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="novo">Novo</option>
                <option value="contatado">Contatado</option>
                <option value="qualificado">Qualificado</option>
                <option value="agendado">Agendado</option>
                <option value="convertido">Convertido</option>
                <option value="perdido">Perdido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Urgência
              </label>
              <span
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium ${
                  urgencyColors[lead.urgency_level as keyof typeof urgencyColors]
                }`}
              >
                <AlertCircle className="w-4 h-4 mr-1" />
                {lead.urgency_level}
              </span>
            </div>
          </div>
        </section>

        {/* Informações Clínicas */}
        {lead.pain_description && (
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Informações Clínicas
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
              {lead.pain_location && (
                <p>
                  <span className="font-medium">Local da dor:</span> {lead.pain_location}
                </p>
              )}
              {lead.pain_duration && (
                <p>
                  <span className="font-medium">Duração:</span> {lead.pain_duration}
                </p>
              )}
              {lead.sport_activity && (
                <p>
                  <span className="font-medium">Atividade:</span> {lead.sport_activity}
                </p>
              )}
              <p className="pt-2">
                <span className="font-medium">Descrição:</span>
                <br />
                {lead.pain_description}
              </p>
            </div>
          </section>
        )}

        {/* Tags */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Tags</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {lead.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
              placeholder="Nova tag..."
              className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            />
            <button
              onClick={handleAddTag}
              disabled={loading || !newTag.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Timeline de Interações */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Histórico ({interactions.length})
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {interactions.map((interaction) => (
              <div
                key={interaction.id}
                className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {interaction.interaction_type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(interaction.created_at).toLocaleString('pt-BR')}
                  </span>
                </div>
                {interaction.message_content && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {interaction.message_content}
                  </p>
                )}
                {interaction.detected_intent && (
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs rounded">
                    {interaction.detected_intent}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Adicionar Nota */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
            Adicionar Nota
          </h3>
          <div className="space-y-3">
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Digite sua nota..."
              rows={3}
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
            />
            <button
              onClick={handleAddNote}
              disabled={loading || !newNote.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Adicionar Nota
            </button>
          </div>
        </section>

        {/* Ações */}
        <section>
          <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Ações</h3>
          <div className="flex gap-3">
            <button
              onClick={handleConvert}
              disabled={loading || lead.status === 'convertido'}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Converter em Paciente
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

