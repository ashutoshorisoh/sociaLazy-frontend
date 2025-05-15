import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { posts, users } from '../services/api';
import CommentSection from './CommentSection';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { followState } from '../context/followState';

const TweetContainer = styled(motion.div)`
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  transition: ${({ theme }) => theme.transitions.default};
  background: ${({ theme }) => theme.mode === 'dark' ? '#1E1E1E' : '#F8F9FA'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: ${({ theme }) => theme.spacing.md};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2D2D2D' : '#F0F0F0'};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const Username = styled(Link)`
  color: ${({ theme }) => theme.colors.text};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

const Timestamp = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const Content = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

const ActionButton = styled.button`
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    color: ${({ color }) => color};
  }
`;

const FollowButton = styled.button`
  margin-left: ${({ theme }) => theme.spacing.sm};
  padding: 0 ${({ theme }) => theme.spacing.md};
  height: 28px;
  font-size: 0.95rem;
  font-weight: 500;
  border: none;
  border-radius: 999px;
  background: ${({ theme, isFollowing }) => isFollowing ? theme.colors.secondary : theme.colors.primary};
  color: #fff;
  cursor: pointer;
  transition: background 0.2s, box-shadow 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 72px;

  &:hover {
    background: ${({ theme, isFollowing }) => isFollowing ? theme.colors.primary : theme.colors.secondary};
    box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const TweetCard = ({ tweet, onLike, onComment, hideFollowButton = false }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [followStateValue, setFollowState] = useRecoilState(followState);
    const currentUserId = localStorage.getItem('userId');
    const isOwnTweet = tweet.user._id === currentUserId;

    const isFollowing = followStateValue[tweet.user._id] || false;

    useEffect(() => {
        if (tweet.likes) {
            setIsLiked(tweet.likes.includes(currentUserId));
            setLikesCount(tweet.likes.length);
        }
    }, [tweet.likes, currentUserId]);

    useEffect(() => {
        const checkFollowingStatus = async () => {
            if (!isOwnTweet && !hideFollowButton) {
                try {
                    const response = await users.checkFollowing(tweet.user._id);
                    if (response.data) {
                        setFollowState(prev => ({
                            ...prev,
                            [tweet.user._id]: response.data.isFollowing
                        }));
                    }
                } catch (error) {
                    console.error('Error checking follow status:', error);
                }
            }
        };

        checkFollowingStatus();
    }, [tweet.user._id, isOwnTweet, hideFollowButton, setFollowState]);

    const handleLike = async () => {
        try {
            await posts.like(tweet._id);
            setIsLiked(!isLiked);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
            if (onLike) {
                onLike(tweet._id);
            }
        } catch (error) {
            console.error('Error liking tweet:', error);
        }
    };

    const handleFollowToggle = async () => {
        if (isOwnTweet) return;
        
        try {
            setIsLoadingFollow(true);
            if (isFollowing) {
                await users.unfollow(tweet.user._id);
            } else {
                await users.follow(tweet.user._id);
            }
            
            // Update Recoil state
            setFollowState(prev => ({
                ...prev,
                [tweet.user._id]: !isFollowing
            }));
        } catch (error) {
            console.error('Error toggling follow:', error);
        } finally {
            setIsLoadingFollow(false);
        }
    };

    const handleCommentClick = async () => {
        if (!showComments) {
            try {
                const response = await posts.getPostComments(tweet._id);
                setComments(response.data || []);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        }
        setShowComments(!showComments);
    };

    const handleAddComment = async (content) => {
        try {
            const response = await posts.addComment(tweet._id, content);
            let newComment = response.data;
            // If user object is missing or incomplete, fill it from localStorage
            if (!newComment.user || !newComment.user.username) {
                newComment.user = {
                    username: localStorage.getItem('username') || 'You',
                    profilePicture: localStorage.getItem('profilePicture') || '',
                    _id: localStorage.getItem('userId') || '',
                };
            }
            setComments(prev => [...prev, newComment]);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const response = await posts.likeComment(commentId);
            setComments(prev =>
                prev.map(comment =>
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
        <TweetContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="flex space-x-3">
                <Link to={`/profile/${isOwnTweet ? 'me' : tweet.user._id}`} className="flex-shrink-0">
                    {tweet.user.profilePicture ? (
                        <img
                            src={tweet.user.profilePicture}
                            alt={tweet.user.username}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-lg font-semibold">
                                {tweet.user.username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </Link>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                        <Username to={`/profile/${isOwnTweet ? 'me' : tweet.user._id}`}>
                            {tweet.user.username}
                        </Username>
                        {!isOwnTweet && !hideFollowButton && (
                            <FollowButton
                                isFollowing={isFollowing}
                                onClick={handleFollowToggle}
                                disabled={isLoadingFollow}
                            >
                                {isLoadingFollow ? (
                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : isFollowing ? (
                                    'Unfollow'
                                ) : (
                                    'Follow'
                                )}
                            </FollowButton>
                        )}
                        <span className="text-gray-500">·</span>
                        <Timestamp>
                            {formatDistanceToNow(new Date(tweet.createdAt), { addSuffix: true })}
                        </Timestamp>
                    </div>
                    <Content>{tweet.content}</Content>
                    {tweet.image && (
                        <div className="mt-2 rounded-lg overflow-hidden">
                            <img
                                src={tweet.image}
                                alt="Post attachment"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}
                    <div className="flex items-center space-x-6 mt-3">
                        <ActionButton
                            onClick={handleLike}
                            color="#EF4444"
                        >
                            {isLiked ? (
                                <HeartIconSolid className="h-5 w-5 text-red-500" />
                            ) : (
                                <HeartIcon className="h-5 w-5" />
                            )}
                            <span>{likesCount}</span>
                        </ActionButton>
                        <ActionButton
                            onClick={handleCommentClick}
                            color="#3B82F6"
                        >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span>{tweet.comments.length}</span>
                        </ActionButton>
                    </div>
                    {showComments && (
                        <CommentSection
                            postId={tweet._id}
                            comments={comments}
                            onAddComment={handleAddComment}
                            onLikeComment={handleLikeComment}
                        />
                    )}
                </div>
            </div>
        </TweetContainer>
    );
};

export default TweetCard; 