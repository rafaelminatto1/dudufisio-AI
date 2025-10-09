// components/video/CommentSection.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MessageCircle, Heart, Reply, Edit, Trash2, Send, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from '../ui/dropdown-menu';
import { commentService } from '../../services/commentService';
import { useToast } from '../../contexts/ToastContext';
export const CommentSection = ({ videoId, currentUserId = 'current-user', currentUserName = 'Usuário Atual', className = '', }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [editingComment, setEditingComment] = useState(null);
    const [editText, setEditText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const loadComments = useCallback(async () => {
        setIsLoading(true);
        try {
            const loadedComments = await commentService.getCommentsByVideo(videoId);
            setComments(loadedComments);
        }
        catch (error) {
            showToast('Erro ao carregar comentários', 'error');
        }
        finally {
            setIsLoading(false);
        }
    }, [videoId, showToast]);
    useEffect(() => {
        loadComments();
    }, [loadComments]);
    const handleAddComment = useCallback(async () => {
        if (!newComment.trim())
            return;
        try {
            await commentService.createComment({
                videoId,
                userId: currentUserId,
                userName: currentUserName,
                content: newComment,
            });
            setNewComment('');
            await loadComments();
            showToast('Comentário adicionado!', 'success');
        }
        catch (error) {
            showToast('Erro ao adicionar comentário', 'error');
        }
    }, [newComment, videoId, currentUserId, currentUserName, loadComments, showToast]);
    const handleReply = useCallback(async (parentId) => {
        if (!replyText.trim())
            return;
        try {
            await commentService.createComment({
                videoId,
                userId: currentUserId,
                userName: currentUserName,
                content: replyText,
                parentId,
            });
            setReplyText('');
            setReplyingTo(null);
            await loadComments();
            showToast('Resposta adicionada!', 'success');
        }
        catch (error) {
            showToast('Erro ao adicionar resposta', 'error');
        }
    }, [replyText, videoId, currentUserId, currentUserName, loadComments, showToast]);
    const handleEdit = useCallback(async (commentId) => {
        if (!editText.trim())
            return;
        try {
            await commentService.updateComment(commentId, editText);
            setEditText('');
            setEditingComment(null);
            await loadComments();
            showToast('Comentário editado!', 'success');
        }
        catch (error) {
            showToast('Erro ao editar comentário', 'error');
        }
    }, [editText, loadComments, showToast]);
    const handleDelete = useCallback(async (commentId) => {
        try {
            await commentService.deleteComment(commentId);
            await loadComments();
            showToast('Comentário removido!', 'success');
        }
        catch (error) {
            showToast('Erro ao remover comentário', 'error');
        }
    }, [loadComments, showToast]);
    const handleLike = useCallback(async (commentId) => {
        try {
            await commentService.likeComment(commentId);
            await loadComments();
        }
        catch (error) {
            showToast('Erro ao curtir comentário', 'error');
        }
    }, [loadComments, showToast]);
    const formatTimeAgo = (date) => {
        const now = new Date();
        const commentDate = new Date(date);
        const diffMs = now.getTime() - commentDate.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Agora mesmo';
        if (diffMins < 60)
            return `${diffMins}m atrás`;
        if (diffHours < 24)
            return `${diffHours}h atrás`;
        if (diffDays < 7)
            return `${diffDays}d atrás`;
        return commentDate.toLocaleDateString('pt-BR');
    };
    const renderComment = (comment, isReply = false) => (<div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-4'}`}>
      <div className="flex space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage src={comment.userAvatar} alt={comment.userName}/>
          <AvatarFallback>{comment.userName[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm">{comment.userName}</span>
                <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                {comment.isEdited && (<Badge variant="outline" className="text-xs">
                    editado
                  </Badge>)}
              </div>

              {comment.userId === currentUserId && (<DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <MoreVertical className="w-4 h-4"/>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => {
                setEditingComment(comment.id);
                setEditText(comment.content);
            }}>
                      <Edit className="w-4 h-4 mr-2"/>
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(comment.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4 mr-2"/>
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>)}
            </div>

            {editingComment === comment.id ? (<div className="space-y-2">
                <Textarea value={editText} onChange={e => setEditText(e.target.value)} className="min-h-[60px]"/>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleEdit(comment.id)}>
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                setEditingComment(null);
                setEditText('');
            }}>
                    Cancelar
                  </Button>
                </div>
              </div>) : (<p className="text-sm">{comment.content}</p>)}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 mt-2">
            <button onClick={() => handleLike(comment.id)} className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-red-500 transition-colors" aria-label="Curtir comentário">
              <Heart className="w-4 h-4"/>
              <span>{comment.likes > 0 && comment.likes}</span>
            </button>

            {!isReply && (<button onClick={() => {
                setReplyingTo(comment.id);
                setReplyText('');
            }} className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-blue-500 transition-colors">
                <Reply className="w-4 h-4"/>
                <span>Responder</span>
              </button>)}
          </div>

          {/* Reply Form */}
          {replyingTo === comment.id && (<div className="mt-3 ml-3 space-y-2">
              <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Escreva uma resposta..." className="min-h-[80px]"/>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => handleReply(comment.id)}>
                  <Send className="w-4 h-4 mr-1"/>
                  Responder
                </Button>
                <Button size="sm" variant="outline" onClick={() => setReplyingTo(null)}>
                  Cancelar
                </Button>
              </div>
            </div>)}

          {/* Replies */}
          {comment.replies.length > 0 && (<div className="mt-3">{comment.replies.map(reply => renderComment(reply, true))}</div>)}
        </div>
      </div>
    </div>);
    return (<Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2"/>
          Comentários ({comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* New Comment Form */}
        <div className="mb-6">
          <div className="flex space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>{currentUserName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Adicione um comentário..." className="min-h-[80px]"/>
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="w-4 h-4 mr-2"/>
                Comentar
              </Button>
            </div>
          </div>
        </div>

        {/* Comments List */}
        {isLoading ? (<div className="text-center text-muted-foreground py-8">Carregando comentários...</div>) : comments.length === 0 ? (<div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50"/>
            <p>Nenhum comentário ainda.</p>
            <p className="text-sm mt-1">Seja o primeiro a comentar!</p>
          </div>) : (<div className="space-y-4">{comments.map(comment => renderComment(comment))}</div>)}
      </CardContent>
    </Card>);
};
export default CommentSection;
