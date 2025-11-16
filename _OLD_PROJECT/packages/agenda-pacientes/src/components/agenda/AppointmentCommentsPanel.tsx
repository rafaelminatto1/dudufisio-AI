import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { AppointmentComment } from '../../types/comments';
import { commentService } from '../../services/commentService';
import {
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Edit2,
  Trash2,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

interface AppointmentCommentsPanelProps {
  appointmentId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: string;
  onCommentsChange?: () => void;
}

const AppointmentCommentsPanel: React.FC<AppointmentCommentsPanelProps> = ({
  appointmentId,
  currentUserId,
  currentUserName,
  currentUserRole,
  onCommentsChange
}) => {
  const [comments, setComments] = useState<AppointmentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    loadComments();
  }, [appointmentId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await commentService.getCommentsByAppointment(appointmentId);
      setComments(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      await commentService.addComment({
        appointmentId,
        userId: currentUserId,
        userName: currentUserName,
        userRole: currentUserRole,
        content: newComment.trim()
      });
      
      setNewComment('');
      await loadComments();
      onCommentsChange?.();
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editContent.trim()) return;

    try {
      await commentService.updateComment(id, editContent.trim());
      setEditingId(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      await commentService.deleteComment(id);
      await loadComments();
      onCommentsChange?.();
    } catch (error) {
      console.error('Erro ao excluir comentário:', error);
    }
  };

  const startEdit = (comment: AppointmentComment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg">Comentários</h3>
        <Badge variant="secondary">{comments.length}</Badge>
      </div>

      {/* Comments List */}
      <div className="space-y-4 mb-6">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm">Nenhum comentário ainda</p>
            <p className="text-slate-400 text-xs">Seja o primeiro a comentar</p>
          </div>
        ) : (
          comments.map(comment => (
            <div
              key={comment.id}
              className={cn(
                "p-4 rounded-lg border transition-all",
                comment.userId === currentUserId
                  ? "bg-blue-50 border-blue-200"
                  : "bg-slate-50 border-slate-200"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">
                      {comment.userName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {format(comment.createdAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      {comment.isEdited && ' (editado)'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {comment.userRole}
                  </Badge>
                </div>

                {comment.userId === currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(comment)}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(comment.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {editingId === comment.id ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editContent.trim()}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={cancelEdit}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-700 whitespace-pre-wrap">{comment.content}</p>
              )}

              {comment.attachments && comment.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {comment.attachments.map(attachment => (
                    <Badge key={attachment.id} variant="secondary" className="gap-1">
                      <Paperclip className="w-3 h-3" />
                      {attachment.name}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder="Adicione um comentário..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={submitting}
        />
        
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled
          >
            <Paperclip className="w-4 h-4" />
            Anexar
          </Button>

          <Button
            type="submit"
            size="sm"
            className="gap-2"
            disabled={!newComment.trim() || submitting}
          >
            {submitting ? (
              <>Enviando...</>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Comentar
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AppointmentCommentsPanel;

