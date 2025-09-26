import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Target,
  Zap,
  Filter,
  Plus,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  FileText,
  MessageSquare,
  Paperclip,
  Activity
} from 'lucide-react';

import { 
  Project, 
  ProjectStatus, 
  ProjectType, 
  ProjectPriority,
  ProjectTemplate
} from '../types';
import projectService from '../services/projectService';
import ProjectKanbanBoard from '../components/projects/ProjectKanbanBoard';
import ProjectDetailModal from '../components/projects/ProjectDetailModal';
import ProjectTemplateSelector from '../components/projects/ProjectTemplateSelector';
import ResearchProjectForm from '../components/projects/ResearchProjectForm';
import ClinicalCaseForm from '../components/projects/ClinicalCaseForm';
import ImprovementProjectForm from '../components/projects/ImprovementProjectForm';

interface ProjectsOverview {
  totalProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  projectsByType: Record<ProjectType, number>;
  projectsByPriority: Record<ProjectPriority, number>;
  avgCompletionRate: number;
  totalBudgetSpent: number;
  totalHoursSpent: number;
  upcomingDeadlines: { projectId: string; projectTitle: string; milestone: string; dueDate: string; }[];
}

const ProjectsActivePage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [overview, setOverview] = useState<ProjectsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'overview' | 'list' | 'kanban'>('overview');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [currentProjectType, setCurrentProjectType] = useState<ProjectType | null>(null);
  const [filters, setFilters] = useState({
    status: [] as ProjectStatus[],
    type: [] as ProjectType[],
    priority: [] as ProjectPriority[],
    search: ''
  });

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [projectsData, overviewData] = await Promise.all([
          projectService.getProjects(),
          projectService.getProjectsOverview()
        ]);
        setProjects(projectsData);
        setOverview(overviewData);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (filters.status.length && !filters.status.includes(project.status)) return false;
      if (filters.type.length && !filters.type.includes(project.type)) return false;
      if (filters.priority.length && !filters.priority.includes(project.priority)) return false;
      if (filters.search) {
        const search = filters.search.toLowerCase();
        return project.title.toLowerCase().includes(search) ||
               project.description.toLowerCase().includes(search) ||
               project.tags.some(tag => tag.toLowerCase().includes(search));
      }
      return true;
    });
  }, [projects, filters]);

  const handleProjectUpdate = async (projectId: string, updates: Partial<Project>) => {
    try {
      const updatedProject = await projectService.updateProject(projectId, updates);
      if (updatedProject) {
        setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p));
      }
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
    }
  };

  const handleProjectView = (project: Project) => {
    setSelectedProject(project);
    setIsDetailModalOpen(true);
  };

  const handleProjectEdit = (project: Project) => {
    setSelectedProject(project);
    setCurrentProjectType(project.type);
    setIsProjectFormOpen(true);
  };

  const handleProjectDelete = async (projectId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este projeto?')) {
      try {
        const success = await projectService.deleteProject(projectId);
        if (success) {
          setProjects(prev => prev.filter(p => p.id !== projectId));
        }
      } catch (error) {
        console.error('Erro ao excluir projeto:', error);
      }
    }
  };

  const handleTemplateSelect = async (template: ProjectTemplate) => {
    setIsTemplateSelectorOpen(false);
    // Here you would typically open a form to customize the project from template
    console.log('Selected template:', template.name);
    // For now, let's create the project directly from template
    try {
      const projectData = await projectService.createProjectFromTemplate(template.id, {
        title: `${template.name} - ${new Date().toLocaleDateString('pt-BR')}`,
        description: template.description,
        startDate: new Date().toISOString().split('T')[0],
        assignedTo: ['user_1'] // This would come from user context
      });
      setProjects(prev => [...prev, projectData]);
    } catch (error) {
      console.error('Erro ao criar projeto do template:', error);
    }
  };

  const handleCreateFromScratch = (type: ProjectType) => {
    setIsTemplateSelectorOpen(false);
    setCurrentProjectType(type);
    setSelectedProject(null);
    setIsProjectFormOpen(true);
  };

  const handleProjectSave = async (projectData: Partial<Project>) => {
    try {
      if (selectedProject) {
        // Update existing project
        const updatedProject = await projectService.updateProject(selectedProject.id, projectData);
        if (updatedProject) {
          setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
        }
      } else {
        // Create new project
        const newProject = await projectService.createProject({
          ...projectData,
          assignedTo: ['user_1'], // This would come from user context
          resources: [],
          team: [{
            userId: 'user_1',
            role: 'Responsável',
            hoursAllocated: 40,
            hoursWorked: 0
          }],
          milestones: [],
          attachments: [],
          comments: []
        } as Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>);
        setProjects(prev => [...prev, newProject]);
      }
      
      setIsProjectFormOpen(false);
      setSelectedProject(null);
      setCurrentProjectType(null);
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
    }
  };

  const handleProjectFormClose = () => {
    setIsProjectFormOpen(false);
    setSelectedProject(null);
    setCurrentProjectType(null);
  };

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
        return <FileText className="w-4 h-4" />;
      case ProjectType.ClinicalCase:
        return <Activity className="w-4 h-4" />;
      case ProjectType.Operational:
        return <Zap className="w-4 h-4" />;
      case ProjectType.Innovation:
        return <Target className="w-4 h-4" />;
      case ProjectType.Training:
        return <Users className="w-4 h-4" />;
      default:
        return <BarChart3 className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
                <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projetos Ativos</h1>
          <p className="text-slate-600 mt-1">
            Gestão completa de projetos de pesquisa, casos clínicos e melhorias operacionais
          </p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsTemplateSelectorOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total de Projetos</p>
                <p className="text-3xl font-bold text-slate-900">{overview.totalProjects}</p>
              </div>
              <div className="p-3 bg-sky-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-sky-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                {Math.round(overview.avgCompletionRate)}% concluído
              </span>
              <span className="text-slate-600 ml-1">em média</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Orçamento Utilizado</p>
                <p className="text-3xl font-bold text-slate-900">
                  {new Intl.NumberFormat('pt-BR', { 
                    style: 'currency', 
                    currency: 'BRL',
                    maximumFractionDigits: 0 
                  }).format(overview.totalBudgetSpent)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="w-4 h-4 text-slate-600 mr-1" />
              <span className="text-slate-600">
                {overview.totalHoursSpent.toLocaleString()} horas investidas
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Em Andamento</p>
                <p className="text-3xl font-bold text-slate-900">
                  {(overview.projectsByStatus[ProjectStatus.InProgress] || 0) + 
                   (overview.projectsByStatus[ProjectStatus.Active] || 0)}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">
                {overview.projectsByStatus[ProjectStatus.Concluded] || 0} concluídos
              </span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Próximos Prazos</p>
                <p className="text-3xl font-bold text-slate-900">{overview.upcomingDeadlines.length}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Calendar className="w-4 h-4 text-slate-600 mr-1" />
              <span className="text-slate-600">nos próximos 7 dias</span>
            </div>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setSelectedView('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'overview' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setSelectedView('list')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'list' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setSelectedView('kanban')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === 'kanban' 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kanban
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
          <button className="flex items-center space-x-2 px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Projects List */}
      {selectedView === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Todos os Projetos ({filteredProjects.length})
            </h3>
          </div>
          <div className="divide-y divide-slate-200">
            {filteredProjects.map((project) => (
              <div key={project.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(project.type)}
                        <h4 className="text-lg font-semibold text-slate-900">{project.title}</h4>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                    </div>
                    
                    <p className="text-slate-600 mb-3 line-clamp-2">{project.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-slate-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(project.startDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{project.assignedTo.length} membros</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{project.progress}% concluído</span>
                      </div>
                      {project.comments.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{project.comments.length} comentários</span>
                        </div>
                      )}
                      {project.attachments.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Paperclip className="w-4 h-4" />
                          <span>{project.attachments.length} anexos</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-slate-600">Progresso</span>
                        <span className="text-xs font-medium text-slate-600">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-sky-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Tags */}
                    {project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {project.tags.slice(0, 4).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">
                            {tag}
                          </span>
                        ))}
                        {project.tags.length > 4 && (
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-md">
                            +{project.tags.length - 4} mais
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button 
                      onClick={() => handleProjectView(project)}
                      className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {selectedView === 'kanban' && (
        <div>
          <ProjectKanbanBoard
            projects={filteredProjects}
            onProjectUpdate={handleProjectUpdate}
            onProjectView={handleProjectView}
            onProjectEdit={handleProjectEdit}
            onProjectDelete={handleProjectDelete}
          />
        </div>
      )}

      {/* Upcoming Deadlines */}
      {overview && overview.upcomingDeadlines.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="text-lg font-semibold text-slate-900">Próximos Prazos</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {overview.upcomingDeadlines.map((deadline, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <h4 className="font-semibold text-slate-900">{deadline.projectTitle}</h4>
                    <p className="text-sm text-slate-600">{deadline.milestone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">
                      {new Date(deadline.dueDate).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-slate-500">
                      {Math.ceil((new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProject(null);
          }}
          onEdit={handleProjectEdit}
          onDelete={handleProjectDelete}
          onAddComment={(projectId, comment) => {
            // Handle adding comment
            console.log('Adding comment to project:', projectId, comment);
          }}
          onUpdateMilestone={(projectId, milestoneId, completed) => {
            // Handle milestone update
            console.log('Updating milestone:', projectId, milestoneId, completed);
          }}
        />
      )}

      {/* Template Selector Modal */}
      <ProjectTemplateSelector
        isOpen={isTemplateSelectorOpen}
        onClose={() => setIsTemplateSelectorOpen(false)}
        onSelectTemplate={handleTemplateSelect}
        onCreateFromScratch={handleCreateFromScratch}
      />

      {/* Project Forms */}
      {currentProjectType === ProjectType.Research && (
        <ResearchProjectForm
          project={selectedProject || undefined}
          isOpen={isProjectFormOpen}
          onClose={handleProjectFormClose}
          onSave={handleProjectSave}
        />
      )}

      {currentProjectType === ProjectType.ClinicalCase && (
        <ClinicalCaseForm
          project={selectedProject || undefined}
          isOpen={isProjectFormOpen}
          onClose={handleProjectFormClose}
          onSave={handleProjectSave}
        />
      )}

      {(currentProjectType === ProjectType.Operational || 
        currentProjectType === ProjectType.Quality ||
        currentProjectType === ProjectType.Training ||
        currentProjectType === ProjectType.Expansion) && (
        <ImprovementProjectForm
          project={selectedProject || undefined}
          isOpen={isProjectFormOpen}
          onClose={handleProjectFormClose}
          onSave={handleProjectSave}
        />
      )}
    </div>
  );
};

export default ProjectsActivePage;