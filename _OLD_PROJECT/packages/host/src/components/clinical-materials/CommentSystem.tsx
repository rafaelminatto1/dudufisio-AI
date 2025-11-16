import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Check, X, Trash2, Edit, Reply, MoreVertical } from 'lucide-react';
import { MaterialComment } from '../../types';
import materialCommentService from '../../services/materialCommentService';

interface CommentSystemProps {
  materialId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserAvatar?: string;
}

export const CommentSystem: React.FC<CommentSystemProps> = ({
  materialId,
  currentUserId,
  currentUserName,
  currentUserAvatar,
}) => {
  const [comments, setComments] = useState<MaterialComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    loadComments();
  }, [materialId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await materialCommentService.getCommentsByMaterialId(materialId);
      setComments(data);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComment = async (parentId?: string) => {
    const text = parentId ? editText : newCommentText;
    if (!text.trim()) return;

    try {
      await materialCommentService.createComment({
        materialId,
        userId: currentUserId,
        userName: currentUserName,
        userAvatar: currentUserAvatar,
        content: text,
        parentCommentId: parentId,
        isResolved: false,
      });

      if (parentId) {
        setReplyingTo(null);
        setEditText('');
      } else {
        setNewCommentText('');
      }

      await loadComments();
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      await materialCommentService.updateComment(commentId, editText);
      setEditingComment(null);
      setEditText('');
      await loadComments();
    } catch (error) {
      console.error('Erro ao atualizar comentário:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) return;

    try {
      await materialCommentService.deleteComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
    }
  };

  const handleResolveComment = async (commentId: string) => {
    try {
      await materialCommentService.resolveComment(commentId, currentUserId);
      await loadComments();
    } catch (error) {
      console.error('Erro ao resolver comentário:', error);
    }
  };

  const handleReopenComment = async (commentId: string) => {
    try {
      await materialCommentService.reopenComment(commentId);
      await loadComments();
    } catch (error) {
      console.error('Erro ao reabrir comentário:', error);
    }
  };

  const unresolvedCount = comments.filter(c => !c.isResolved).length;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-600" />
          Comentários ({comments.length})
        </h3>
        {unresolvedCount > 0 && (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            {unresolvedCount} não resolvido{unresolvedCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Nova caixa de comentário */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            {currentUserAvatar ? (
              <img
                src={currentUserAvatar}
                alt={currentUserName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-medium">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Adicione um comentário..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={() => handleCreateComment()}
                disabled={!newCommentText.trim()}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Comentar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de comentários */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhum comentário ainda</p>
          <p className="text-sm mt-1">Seja o primeiro a comentar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onReply={() => setReplyingTo(comment.id)}
              onEdit={() => {
                setEditingComment(comment.id);
                setEditText(comment.content);
              }}
              onDelete={() => handleDeleteComment(comment.id)}
              onResolve={() => handleResolveComment(comment.id)}
              onReopen={() => handleReopenComment(comment.id)}
              isReplying={replyingTo === comment.id}
              isEditing={editingComment === comment.id}
              replyText={editText}
              onReplyTextChange={setEditText}
              onSubmitReply={() => handleCreateComment(comment.id)}
              onCancelReply={() => {
                setReplyingTo(null);
                setEditText('');
              }}
              editText={editText}
              onEditTextChange={setEditText}
              onSubmitEdit={() => handleUpdateComment(comment.id)}
              onCancelEdit={() => {
                setEditingComment(null);
                setEditText('');
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CommentItemProps {
  comment: MaterialComment;
  currentUserId: string;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResolve: () => void;
  onReopen: () => void;
  isReplying: boolean;
  isEditing: boolean;
  replyText: string;
  onReplyTextChange: (text: string) => void;
  onSubmitReply: () => void;
  onCancelReply: () => void;
  editText: string;
  onEditTextChange: (text: string) => void;
  onSubmitEdit: () => void;
  onCancelEdit: () => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onReopen,
  isReplying,
  isEditing,
  replyText,
  onReplyTextChange,
  onSubmitReply,
  onCancelReply,
  editText,
  onEditTextChange,
  onSubmitEdit,
  onCancelEdit,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const isOwnComment = comment.userId === currentUserId;

  return (
    <div className={`${comment.isResolved ? 'opacity-60' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.userAvatar ? (
            <img
              src={comment.userAvatar}
              alt={comment.userName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-medium">
              {comment.userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-medium text-gray-900">{comment.userName}</span>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(comment.createdAt).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>

              {/* Menu de ações */}
              {isOwnComment && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                      <button
                        onClick={() => {
                          onEdit();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Deletar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Conteúdo do comentário */}
            {isEditing ? (
              <div>
                <textarea
                  value={editText}
                  onChange={(e) => onEditTextChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={onSubmitEdit}
                    className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={onCancelEdit}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            )}

            {/* Status resolvido */}
            {comment.isResolved && (
              <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                <Check className="w-4 h-4" />
                Resolvido {comment.resolvedAt && `em ${new Date(comment.resolvedAt).toLocaleDateString()}`}
              </div>
            )}
          </div>

          {/* Ações do comentário */}
          <div className="flex items-center gap-4 mt-2 text-sm">
            <button
              onClick={onReply}
              className="text-gray-600 hover:text-emerald-600 flex items-center gap-1"
            >
              <Reply className="w-4 h-4" />
              Responder
            </button>

            {!comment.isResolved ? (
              <button
                onClick={onResolve}
                className="text-gray-600 hover:text-green-600 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Marcar como resolvido
              </button>
            ) : (
              <button
                onClick={onReopen}
                className="text-gray-600 hover:text-yellow-600 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Reabrir
              </button>
            )}
          </div>

          {/* Caixa de resposta */}
          {isReplying && (
            <div className="mt-3 ml-4">
              <textarea
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                rows={3}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={onSubmitReply}
                  disabled={!replyText.trim()}
                  className="px-3 py-1 bg-emerald-600 text-white rounded text-sm hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4 inline mr-1" />
                  Responder
                </button>
                <button
                  onClick={onCancelReply}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-6 mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  onReply={() => {}}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onResolve={onResolve}
                  onReopen={onReopen}
                  isReplying={false}
                  isEditing={false}
                  replyText=""
                  onReplyTextChange={() => {}}
                  onSubmitReply={() => {}}
                  onCancelReply={() => {}}
                  editText=""
                  onEditTextChange={() => {}}
                  onSubmitEdit={() => {}}
                  onCancelEdit={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSystem;

