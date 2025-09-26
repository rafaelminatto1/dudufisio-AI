import React, { useState, useCallback } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from 'react-beautiful-dnd';
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  MessageSquare,
  Paperclip,
  AlertTriangle,
  Target,
  MoreHorizontal,
  Plus,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

import { 
  Project, 
  ProjectStatus, 
  ProjectType, 
  ProjectPriority 
} from '../../types';

interface ProjectKanbanBoardProps {
  projects: Project[];
  onProjectUpdate: (projectId: string, updates: Partial<Project>) => void;
  onProjectView: (project: Project) => void;
  onProjectEdit: (project: Project) => void;
  onProjectDelete: (projectId: string) => void;
}

const statusColumns = [
  {
    id: ProjectStatus.Planning,
    title: 'Planejamento',
    color: 'bg-blue-100 border-blue-200',
    headerColor: 'bg-blue-600'
  },
  {
    id: ProjectStatus.InProgress,
    title: 'Em Andamento',
    color: 'bg-orange-100 border-orange-200',
    headerColor: 'bg-orange-600'
  },
  {
    id: ProjectStatus.Review,
    title: 'Revisão',
    color: 'bg-purple-100 border-purple-200',
    headerColor: 'bg-purple-600'
  },
  {
    id: ProjectStatus.Concluded,
    title: 'Concluído',
    color: 'bg-green-100 border-green-200',
    headerColor: 'bg-green-600'
  }
];

const ProjectCard: React.FC<{
  project: Project;
  index: number;
  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
}> = ({ project, index, onView, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const getPriorityColor = (priority: ProjectPriority) => {
    switch (priority) {
      case ProjectPriority.Critical:
        return 'bg-red-500';
      case ProjectPriority.High:
        return 'bg-orange-500';
      case ProjectPriority.Medium:
        return 'bg-yellow-500';
      case ProjectPriority.Low:
        return 'bg-green-500';
      default:
        return 'bg-slate-400';
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
      currency: 'BRL',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  const getDaysUntilDeadline = () => {
    if (!project.estimatedEndDate) return null;
    const today = new Date();
    const deadline = new Date(project.estimatedEndDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDeadline = getDaysUntilDeadline();

  return (
    <Draggable draggableId={project.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow ${
            snapshot.isDragging ? 'shadow-lg rotate-1' : ''
          }`}
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getTypeIcon(project.type)}</span>
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(project.priority)}`} />
            </div>
            
            {showActions && (
              <div className="flex items-center space-x-1 opacity-0 animate-fade-in">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(project);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(project);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(project.id);
                  }}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 
            className="font-semibold text-slate-900 mb-2 line-clamp-2 text-sm cursor-pointer hover:text-sky-600"
            onClick={() => onView(project)}
          >
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-600 mb-3 line-clamp-2">
            {project.description}
          </p>

          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-medium text-slate-600">Progresso</span>
              <span className="text-xs font-medium text-slate-600">{project.progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className="bg-sky-600 h-1.5 rounded-full transition-all duration-300" 
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-slate-600">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{project.assignedTo.length}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3" />
              <span>{project.metrics.milestonesCompleted}/{project.metrics.totalMilestones}</span>
            </div>
            {project.budget && (
              <div className="flex items-center space-x-1">
                <DollarSign className="w-3 h-3" />
                <span>{formatBudget(project.budget.actual)}</span>
              </div>
            )}
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{project.metrics.hoursSpent}h</span>
            </div>
          </div>

          {/* Deadline Warning */}
          {daysUntilDeadline !== null && daysUntilDeadline <= 7 && (
            <div className={`flex items-center space-x-1 text-xs mb-2 ${
              daysUntilDeadline < 0 ? 'text-red-600' : daysUntilDeadline <= 3 ? 'text-orange-600' : 'text-yellow-600'
            }`}>
              <AlertTriangle className="w-3 h-3" />
              <span>
                {daysUntilDeadline < 0 
                  ? `${Math.abs(daysUntilDeadline)} dias atrasado`
                  : daysUntilDeadline === 0 
                    ? 'Vence hoje'
                    : `${daysUntilDeadline} dias restantes`
                }
              </span>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              {project.comments.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <MessageSquare className="w-3 h-3" />
                  <span>{project.comments.length}</span>
                </div>
              )}
              {project.attachments.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Paperclip className="w-3 h-3" />
                  <span>{project.attachments.length}</span>
                </div>
              )}
            </div>
            
            <div className="text-xs text-slate-500">
              {new Date(project.startDate).toLocaleDateString('pt-BR')}
            </div>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {project.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                  {tag}
                </span>
              ))}
              {project.tags.length > 2 && (
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded">
                  +{project.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({
  projects,
  onProjectUpdate,
  onProjectView,
  onProjectEdit,
  onProjectDelete
}) => {
  const [localProjects, setLocalProjects] = useState(projects);

  // Update local state when props change
  React.useEffect(() => {
    setLocalProjects(projects);
  }, [projects]);

  const onDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as ProjectStatus;
    const projectToUpdate = localProjects.find(p => p.id === draggableId);
    
    if (!projectToUpdate) return;

    // Update local state immediately for better UX
    const updatedProjects = localProjects.map(project =>
      project.id === draggableId
        ? { ...project, status: newStatus }
        : project
    );
    setLocalProjects(updatedProjects);

    // Call the parent update function
    onProjectUpdate(draggableId, { status: newStatus });
  }, [localProjects, onProjectUpdate]);

  const getProjectsByStatus = (status: ProjectStatus) => {
    return localProjects.filter(project => project.status === status);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => {
          const columnProjects = getProjectsByStatus(column.id);
          
          return (
            <div key={column.id} className={`rounded-lg border-2 ${column.color}`}>
              {/* Column Header */}
              <div className={`${column.headerColor} text-white px-4 py-3 rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{column.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {columnProjects.length}
                    </span>
                    <button className="text-white/80 hover:text-white p-1 rounded">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column Content */}
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`p-4 min-h-[500px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-50' : ''
                    }`}
                  >
                    {columnProjects.map((project, index) => (
                      <ProjectCard
                        key={project.id}
                        project={project}
                        index={index}
                        onView={onProjectView}
                        onEdit={onProjectEdit}
                        onDelete={onProjectDelete}
                      />
                    ))}
                    {provided.placeholder}
                    
                    {columnProjects.length === 0 && (
                      <div className="text-center py-8 text-slate-400">
                        <div className="text-4xl mb-2">📋</div>
                        <p className="text-sm">Nenhum projeto nesta fase</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default ProjectKanbanBoard;