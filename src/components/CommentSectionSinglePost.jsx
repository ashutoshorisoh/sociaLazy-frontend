import React, { useState, useCallback, memo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, HeartIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import styled from 'styled-components';
import { posts } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const CommentCard = styled(motion.div)`
    margin-bottom: 0.75rem;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    padding: 0.75rem;
    background: ${({ theme }) => theme.mode === 'dark' ? '#252525' : '#FFFFFF'};
    border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
    transition: ${({ theme }) => theme.transitions.default};

    &:hover {
        background: ${({ theme }) => theme.mode === 'dark' ? '#2D2D2D' : '#F8F9FA'};
        transform: translateX(4px);
    }
`;

const CommentUsername = styled.span`
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
`;

const CommentTimestamp = styled.span`
    font-size: 0.875rem;
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
`;

const CommentContent = styled.p`
    margin-top: 0.25rem;
    color: ${({ theme }) => theme.colors.text};
`;

const LikeButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
    transition: ${({ theme }) => theme.transitions.default};
    
    &:hover {
        color: #EF4444;
    }
`;

const CommentForm = styled.form`
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
`;

const CommentInput = styled.input`
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    padding: 0.5rem 1rem;
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'white'};
    color: ${({ theme }) => theme.colors.text};
    
    &:focus {
        outline: none;
        border-color: ${({ theme }) => theme.colors.primary};
    }
    
    &::placeholder {
        color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
    }
`;

const SubmitButton = styled.button`
    align-self: flex-end;
    border-radius: ${({ theme }) => theme.borderRadius.lg};
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    padding: 0.5rem 1rem;
    transition: ${({ theme }) => theme.transitions.default};
    
    &:hover {
        background: ${({ theme }) => theme.colors.secondary};
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const DeleteConfirmation = styled.div`
  background-color: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`;

const DeleteTitle = styled.h2`
  color: ${props => props.theme.text};
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
`;

const DeleteMessage = styled.p`
  color: ${props => props.theme.textSecondary};
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;

  &.cancel {
    background-color: ${props => props.theme.backgroundSecondary};
    color: ${props => props.theme.text};
    &:hover {
      background-color: ${props => props.theme.backgroundHover};
    }
  }

  &.delete {
    background-color: #dc2626;
    color: white;
    &:hover {
      background-color: #b91c1c;
    }
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  transition: ${({ theme }) => theme.transitions.default};
  
  &:hover {
    color: #EF4444;
  }
`;

const CommentSectionSinglePost = memo(({ postId, comments = [], onLikeComment, onCommentAdded }) => {
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [commentToDelete, setCommentToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const currentUserId = localStorage.getItem('userId');
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleCommentChange = useCallback((e) => {
        setComment(e.target.value);
    }, []);

    const handleSubmitComment = useCallback(async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        if (!comment.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const response = await posts.addComment(postId, comment);
            if (response.data) {
                setComment('');
                if (onCommentAdded) {
                    onCommentAdded(response.data);
                }
            }
        } catch (error) {
            // Silent error handling
        } finally {
            setIsSubmitting(false);
        }
    }, [comment, postId, onCommentAdded, isSubmitting, isAuthenticated, navigate, location.pathname]);

    const handleLikeComment = useCallback((commentId) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        onLikeComment && onLikeComment(commentId);
    }, [isAuthenticated, navigate, location.pathname, onLikeComment]);

    const handleDeleteComment = useCallback(async (commentId) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        setCommentToDelete(commentId);
        setShowDeleteConfirmation(true);
    }, [isAuthenticated, navigate, location.pathname]);

    const confirmDelete = async () => {
        if (!commentToDelete) return;
        try {
            setIsDeleting(true);
            await posts.delete(commentToDelete);
            if (onCommentAdded) {
                onCommentAdded(null, commentToDelete);
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirmation(false);
            setCommentToDelete(null);
        }
    };

    return (
        <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
            <AnimatePresence>
                {Array.isArray(comments) && comments.map((comment) => (
                    <CommentCard
                        key={comment._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <div className="flex items-start gap-2">
                            {comment.user?.profilePicture ? (
                                <img
                                    src={comment.user.profilePicture}
                                    alt={comment.user?.username || 'User'}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-sm font-semibold">
                                        {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <CommentUsername>{comment.user?.username || 'User'}</CommentUsername>
                                       
                                    </div>
                                    {comment.user?._id === currentUserId && (
                                        <DeleteButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteComment(comment._id);
                                            }}
                                            disabled={isDeleting}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </DeleteButton>
                                    )}
                                </div>
                                {showDeleteConfirmation && commentToDelete === comment._id ? (
                                    <DeleteConfirmation>
                                        <DeleteTitle>Delete Comment</DeleteTitle>
                                        <DeleteMessage>Are you sure you want to delete this comment? This action cannot be undone.</DeleteMessage>
                                        <ButtonGroup>
                                            <Button className="cancel" onClick={() => {
                                                setShowDeleteConfirmation(false);
                                                setCommentToDelete(null);
                                            }}>
                                                Cancel
                                            </Button>
                                            <Button className="delete" onClick={confirmDelete} disabled={isDeleting}>
                                                {isDeleting ? 'Deleting...' : 'Delete'}
                                            </Button>
                                        </ButtonGroup>
                                    </DeleteConfirmation>
                                ) : (
                                    <>  <CommentTimestamp>
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </CommentTimestamp>
                                        <CommentContent>{comment.content}</CommentContent>
                                        <div className="mt-2 flex items-center gap-4">
                                            <LikeButton
                                                onClick={() => handleLikeComment(comment._id)}
                                            >
                                                {comment.likes?.includes(currentUserId) ? (
                                                    <HeartSolidIcon className="h-5 w-5 text-red-500" />
                                                ) : (
                                                    <HeartIcon className="h-5 w-5" />
                                                )}
                                                <span>{comment.likes?.length || 0}</span>
                                            </LikeButton>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </CommentCard>
                ))}
            </AnimatePresence>
            {comments.length === 0 && (
                <div className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</div>
            )}
            <CommentForm onSubmit={handleSubmitComment}>
                <CommentInput
                    value={comment}
                    onChange={handleCommentChange}
                    placeholder="Write a comment..."
                    disabled={isSubmitting}
                />
                <SubmitButton type="submit" disabled={isSubmitting || !comment.trim()}>
                    {isSubmitting ? 'Posting...' : 'Post'}
                </SubmitButton>
            </CommentForm>
        </div>
    );
});

export default CommentSectionSinglePost; 