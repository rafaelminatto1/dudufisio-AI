import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Target,
  MessageSquare,
  Paperclip,
  AlertTriangle,
  CheckCircle,
  FileText,
  TrendingUp,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal
} from 'lucide-react';

import { 
  Project, 
  ProjectStatus, 
  ProjectType, 
  ProjectPriority,
  ProjectComment,
  ProjectAttachment,
  ProjectMilestone
} from '../../types';

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  onAddComment?: (projectId: string, comment: string) => void;
  onUpdateMilestone?: (projectId: string, milestoneId: string, completed: boolean) => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onAddComment,
  onUpdateMilestone
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'team' | 'files' | 'comments'>('overview');
  const [newComment, setNewComment] = useState('');

  if (!isOpen) return null;

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.Active:
      case ProjectStatus.InProgress:
        return 'text-green-600 bg-green-100';
      case ProjectStatus.Planning:
        return 'text-blue-600 bg-blue-100';
      case ProjectStatus.Review:
        return 'text-orange-600 bg-orange-100';
      case ProjectStatus.Paused:
        return 'text-yellow-600 bg-yellow-100';
      case ProjectStatus.Concluded:
        return 'text-slate-600 bg-slate-100';
      case ProjectStatus.Cancelled:
        return 'text-red-600 bg-red-100';
      default:
        return 'text-slate-600 bg-slate-100';
    }
  };

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.Critical:
        return 'text-red-600';
      case ProjectPriority.High:
        return 'text-orange-600';
      case ProjectPriority.Medium:
        return 'text-yellow-600';
      case ProjectPriority.Low:
        return 'text-green-600';
      default:
        return 'text-slate-600';
    }
  };

  const getTypeIcon = (type: ProjectType) => {
    switch (type) {
      case ProjectType.Research:
        return '🔬';
      case ProjectType.ClinicalCase:
        return '🏥';
      case ProjectType.Operational:
        return '⚙️';
      case ProjectType.Innovation:
        return '💡';
      case ProjectType.Training:
        return '📚';
      default:
        return '📊';
    }
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const handleAddComment = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(project.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleMilestoneToggle = (milestoneId: string, completed: boolean) => {
    if (onUpdateMilestone) {
      onUpdateMilestone(project.id, milestoneId, completed);
    }
  };

  const getDaysUntilDeadline = (dateString: string) => {
    const today = new Date();
    const deadline = new Date(dateString);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(project.type)}</span>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{project.title}</h2>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                    <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                      Prioridade {project.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onEdit(project)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-slate-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Visão Geral' },
                { id: 'milestones', label: 'Marcos' },
                { id: 'team', label: 'Equipe' },
                { id: 'files', label: 'Arquivos' },
                { id: 'comments', label: 'Comentários' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-sky-500 text-sky-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'comments' && project.comments.length > 0 && (
                    <span className="ml-2 bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full text-xs">
                      {project.comments.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Descrição</h3>
                  <p className="text-slate-600">{project.description}</p>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">Progresso</h3>
                    <span className="text-2xl font-bold text-sky-600">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div 
                      className="bg-sky-600 h-3 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Target className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Marcos</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">
                      {project.metrics.milestonesCompleted}/{project.metrics.totalMilestones}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Horas</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{project.metrics.hoursSpent}</p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-medium text-slate-600">Equipe</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{project.assignedTo.length}</p>
                  </div>

                  {project.budget && (
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-medium text-slate-600">Orçamento</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {formatBudget(project.budget.actual)}
                      </p>
                      <p className="text-xs text-slate-500">
                        de {formatBudget(project.budget.planned)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Data de Início</h4>
                    <p className="text-slate-600">{formatDate(project.startDate)}</p>
                  </div>
                  {project.estimatedEndDate && (
                    <div>
                      <h4 className="font-medium text-slate-900 mb-2">Data Prevista</h4>
                      <p className="text-slate-600">{formatDate(project.estimatedEndDate)}</p>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-sky-100 text-sky-800 text-sm rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Milestones Tab */}
            {activeTab === 'milestones' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Marcos do Projeto</h3>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                    <Plus className="w-4 h-4" />
                    <span>Novo Marco</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {project.milestones.map((milestone) => {
                    const daysUntilDeadline = getDaysUntilDeadline(milestone.dueDate);
                    const isOverdue = daysUntilDeadline < 0 && !milestone.completed;
                    
                    return (
                      <div key={milestone.id} className={`border rounded-lg p-4 ${
                        milestone.completed ? 'bg-green-50 border-green-200' : 
                        isOverdue ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <button
                              onClick={() => handleMilestoneToggle(milestone.id, !milestone.completed)}
                              className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                milestone.completed 
                                  ? 'bg-green-600 border-green-600' 
                                  : 'border-slate-300 hover:border-slate-400'
                              }`}
                            >
                              {milestone.completed && <CheckCircle className="w-3 h-3 text-white" />}
                            </button>
                            
                            <div className="flex-1">
                              <h4 className={`font-medium ${
                                milestone.completed ? 'text-green-800 line-through' : 'text-slate-900'
                              }`}>
                                {milestone.title}
                              </h4>
                              <p className="text-sm text-slate-600 mt-1">{milestone.description}</p>
                              
                              <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                                <span>Prazo: {formatDate(milestone.dueDate)}</span>
                                {milestone.completed && milestone.completedAt && (
                                  <span>Concluído em: {formatDate(milestone.completedAt)}</span>
                                )}
                                {!milestone.completed && (
                                  <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                                    {isOverdue ? `${Math.abs(daysUntilDeadline)} dias atrasado` :
                                     daysUntilDeadline === 0 ? 'Vence hoje' :
                                     `${daysUntilDeadline} dias restantes`}
                                  </span>
                                )}
                              </div>

                              {milestone.deliverables.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs font-medium text-slate-700 mb-1">Entregas:</p>
                                  <ul className="text-xs text-slate-600 space-y-1">
                                    {milestone.deliverables.map((deliverable, index) => (
                                      <li key={index} className="flex items-center space-x-1">
                                        <span>•</span>
                                        <span>{deliverable}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <button className="p-1 text-slate-400 hover:text-slate-600">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Team Tab */}
            {activeTab === 'team' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Equipe do Projeto</h3>
                
                <div className="space-y-3">
                  {project.team.map((member) => (
                    <div key={member.userId} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                          <span className="text-sky-600 font-medium">
                            {member.userId.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{member.userId}</h4>
                          <p className="text-sm text-slate-600">{member.role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">
                          {member.hoursWorked}h / {member.hoursAllocated}h
                        </p>
                        <div className="w-24 bg-slate-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-sky-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, (member.hoursWorked / member.hoursAllocated) * 100)}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Files Tab */}
            {activeTab === 'files' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Arquivos do Projeto</h3>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700">
                    <Plus className="w-4 h-4" />
                    <span>Upload</span>
                  </button>
                </div>

                {project.attachments.length > 0 ? (
                  <div className="space-y-3">
                    {project.attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-8 h-8 text-slate-400" />
                          <div>
                            <h4 className="font-medium text-slate-900">{attachment.name}</h4>
                            <p className="text-sm text-slate-500">
                              {(attachment.size / 1024 / 1024).toFixed(1)} MB • 
                              Enviado em {formatDate(attachment.uploadedAt)}
                            </p>
                          </div>
                        </div>
                        <button className="text-sky-600 hover:text-sky-700 font-medium">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4" />
                    <p>Nenhum arquivo anexado ainda</p>
                  </div>
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Comentários</h3>
                
                {/* Add Comment */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Adicionar um comentário..."
                    className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Comentar
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                            <span className="text-sky-600 font-medium text-sm">
                              {comment.authorName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-900">{comment.authorName}</h4>
                            <p className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-700">{comment.content}</p>
                      
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {comment.attachments.map((attachment) => (
                            <div key={attachment.id} className="flex items-center space-x-2 text-sm text-sky-600">
                              <Paperclip className="w-4 h-4" />
                              <span>{attachment.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {project.comments.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                      <p>Nenhum comentário ainda</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailModal;