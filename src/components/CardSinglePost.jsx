import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { posts, users } from '../services/api';
import CommentSectionSinglePost from './CommentSectionSinglePost';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { followState } from '../context/followState';
import axios from 'axios';

const HeartOverlay = styled(motion.div)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.3));
  pointer-events: none;
`;

const TweetContainer = styled(motion.div)`
  position: relative;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  transition: ${({ theme }) => theme.transitions.default};
  background: ${({ theme }) => theme.mode === 'dark' ? '#1E1E1E' : '#F8F9FA'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: ${({ theme }) => theme.spacing.md};
  cursor: pointer;

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

const CardSinglePost = ({ tweet, hideFollowButton = false }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [followStateValue, setFollowState] = useRecoilState(followState);
    const currentUserId = localStorage.getItem('userId');
    const isOwnTweet = tweet && tweet.user._id === currentUserId;
    const lastTapTime = useRef(0);

    const isFollowing = tweet ? (followStateValue[tweet.user._id] || false) : false;

    useEffect(() => {
        if (tweet && tweet.likes) {
            setIsLiked(tweet.likes.includes(currentUserId));
            setLikesCount(tweet.likes.length);
        }
    }, [tweet, currentUserId]);

    useEffect(() => {
        const fetchComments = async () => {
            if (tweet && tweet._id) {
                setIsLoadingComments(true);
                try {
                    console.log('Fetching comments for', tweet._id);
                    const response = await posts.getPostComments(tweet._id);
                    setComments(response.data || []);
                } catch (err) {
                    setComments([]);
                } finally {
                    setIsLoadingComments(false);
                }
            }
        };
        fetchComments();
    }, [tweet]);

    const handleLike = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isLiking) return;
        try {
            setIsLiking(true);
            const response = await axios.put(`http://localhost:5001/api/posts/like/${tweet._id}`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.status === 200) {
                setIsLiked(!isLiked);
                setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
            }
        } catch (error) {
            // Silent error handling
        } finally {
            setTimeout(() => setIsLiking(false), 1000);
        }
    }, [tweet, isLiked, isLiking]);

    const handleDoubleTap = useCallback((e) => {
        // Don't call preventDefault on touch events
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
            if (!isLiked && !isLiking) {
                handleLike();
                setShowHeartAnimation(true);
                setTimeout(() => setShowHeartAnimation(false), 1000);
            }
            lastTapTime.current = 0;
        } else {
            lastTapTime.current = now;
        }
    }, [isLiked, isLiking, handleLike]);

    const handleFollowToggle = async (e) => {
        e.stopPropagation();
        if (isOwnTweet) return;
        try {
            setIsLoadingFollow(true);
            if (isFollowing) {
                await users.unfollow(tweet.user._id);
            } else {
                await users.follow(tweet.user._id);
            }
            setFollowState(prev => ({
                ...prev,
                [tweet.user._id]: !isFollowing
            }));
        } catch (error) {
            // Silent error handling
        } finally {
            setIsLoadingFollow(false);
        }
    };

    const handleAddComment = async (content) => {
        try {
            const response = await posts.addComment(tweet._id, content);
            let newComment = response.data;
            if (!newComment.user || !newComment.user.username) {
                newComment.user = {
                    username: localStorage.getItem('username') || 'You',
                    profilePicture: localStorage.getItem('profilePicture') || '',
                    _id: localStorage.getItem('userId') || '',
                };
            }
            // Always re-fetch comments after adding
            if (tweet && tweet._id) {
                setIsLoadingComments(true);
                try {
                    const res = await posts.getPostComments(tweet._id);
                    setComments(res.data || []);
                } catch (err) {
                    setComments([]);
                } finally {
                    setIsLoadingComments(false);
                }
            }
        } catch (error) {
            // Silent error handling
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
            // Silent error handling
        }
    };

    if (!tweet || !tweet._id) return null;

    return (
        <TweetContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onTouchStart={handleDoubleTap}
            style={{ cursor:'default' }}
        >
            <AnimatePresence>
                {showHeartAnimation && (
                    <HeartOverlay
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <HeartIconSolid className="h-24 w-24 text-red-500" />
                    </HeartOverlay>
                )}
            </AnimatePresence>
            <div className="flex space-x-3">
                <Link to={`/profile/${isOwnTweet ? 'me' : tweet.user._id}`} className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
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
                        <Username to={`/profile/${isOwnTweet ? 'me' : tweet.user._id}`} onClick={(e) => e.stopPropagation()}>
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
                    </div>
                    <div>
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
                            type="button"
                        >
                            {isLiked ? (
                                <HeartIconSolid className="h-5 w-5 text-red-500" />
                            ) : (
                                <HeartIcon className="h-5 w-5" />
                            )}
                            <span>{likesCount}</span>
                        </ActionButton>
                        <ActionButton
                            color="#3B82F6"
                        >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span>{tweet.comments.length}</span>
                        </ActionButton>
                    </div>
                    <CommentSectionSinglePost
                        postId={tweet._id}
                        comments={comments}
                        onAddComment={handleAddComment}
                        onLikeComment={handleLikeComment}
                        isLoading={isLoadingComments}
                    />
                </div>
            </div>
        </TweetContainer>
    );
};

export default CardSinglePost; 