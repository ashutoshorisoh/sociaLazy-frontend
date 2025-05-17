import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatBubbleLeftIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import styled from 'styled-components';

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

const CommentSectionSinglePost = ({ postId, comments = [], onLikeComment }) => {
    const currentUserId = localStorage.getItem('userId');

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
                                <div className="flex items-center gap-2">
                                    <CommentUsername>{comment.user?.username || 'User'}</CommentUsername>
                                    <CommentTimestamp>
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </CommentTimestamp>
                                </div>
                                <CommentContent>{comment.content}</CommentContent>
                                <div className="mt-2 flex items-center gap-4">
                                    <LikeButton
                                        onClick={() => {


                                            onLikeComment && onLikeComment(comment._id)
                                        }

                                        }
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
            {comments.length === 0 && (
                <div className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</div>
            )}
        </div>
    );
};

export default CommentSectionSinglePost; 