import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { posts } from '../services/api';
import styled from 'styled-components';

const CommentInput = styled.input`
    flex: 1;
    border-radius: 9999px;
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

const CommentButton = styled.button`
    border-radius: 9999px;
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

const CommentCard = styled(motion.div)`
    margin-bottom: 0.75rem;
    border-radius: 0.5rem;
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

const CommentSection = ({ postId, comments: initialComments = [], onCommentAdded }) => {
    const [comments, setComments] = useState(Array.isArray(initialComments) ? initialComments : []);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const currentUserId = localStorage.getItem('userId');

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const response = await posts.addComment(postId, newComment);
            // Refresh the post to get updated comments
            const postResponse = await posts.getPostComments(postId);
            setComments(postResponse.data || []);
            setNewComment('');
            if (onCommentAdded) {
                onCommentAdded(response.data);
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const response = await posts.likeComment(commentId);
            // Update the specific comment in the comments array
            setComments(prevComments =>
                prevComments.map(comment =>
                    comment._id === commentId
                        ? { ...comment, likes: response.data.likes }
                        : comment
                )
            );
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    return (
        <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
            <form onSubmit={handleSubmitComment} className="mb-4" onClick={e => e.stopPropagation()}>
                <div className="flex gap-2">
                    <CommentInput
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        onClick={e => e.stopPropagation()}
                    />
                    <CommentButton
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        onClick={e => e.stopPropagation()}
                    >
                        {isSubmitting ? 'Posting...' : 'Post'}
                    </CommentButton>
                </div>
            </form>

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
                                <div className="flex items-center gap-2">
                                    <CommentUsername>{comment.user?.username || 'User'}</CommentUsername>
                                    <CommentTimestamp>
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </CommentTimestamp>
                                </div>
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
                            </div>
                        </div>
                    </CommentCard>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default CommentSection; 