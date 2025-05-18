import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { posts, users } from '../services/api';
import CommentSection from './CommentSection';
import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import { followState } from '../context/followState';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

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
  border-radius: ${({ theme }) => theme.borderRadius.lg};
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

const ShareButton = styled.button`
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  transition: ${({ theme }) => theme.transitions.default};
  background: none;
  border: none;
  cursor: pointer;

  &:hover {
    color: #10B981;
  }
`;

const ShareMessage = styled.span`
  color: #10B981;
  font-size: 0.875rem;
  margin-left: ${({ theme }) => theme.spacing.xs};
  opacity: ${({ show }) => show ? 1 : 0};
  transition: opacity 0.2s ease;
`;

const AuthPrompt = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.mode === 'dark' ? '#1E1E1E' : '#FFFFFF'};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`;

const AuthButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

const AuthButton = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  background: ${({ primary }) => primary ? '#3B82F6' : 'transparent'};
  color: ${({ primary }) => primary ? 'white' : '#3B82F6'};
  border: 2px solid #3B82F6;
  
  &:hover {
    background: ${({ primary }) => primary ? '#2563EB' : 'rgba(59, 130, 246, 0.1)'};
  }
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
`;

const TweetCard = memo(({ tweet, hideFollowButton = false, showComments = false, isSinglePost = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [isCommentsVisible, setIsCommentsVisible] = useState(isSinglePost ? true : showComments);
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [followStateValue, setFollowState] = useRecoilState(followState);
    const currentUserId = localStorage.getItem('userId');
    const isOwnTweet = tweet.user._id === currentUserId;
    const lastTapTime = useRef(0);
    const [showShareMessage, setShowShareMessage] = useState(false);

    const isFollowing = followStateValue[tweet.user._id] || false;
    const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth <= 1024;

    useEffect(() => {
        if (tweet.likes) {
            setIsLiked(tweet.likes.includes(currentUserId));
            setLikesCount(tweet.likes.length);
        }
    }, [tweet.likes, currentUserId]);

    useEffect(() => {
        if (isSinglePost) {
            setIsCommentsVisible(true);
            fetchComments();
        }
        // eslint-disable-next-line
    }, [isSinglePost, tweet._id]);

    const fetchComments = useCallback(async () => {
        setIsLoadingComments(true);
        try {
            const response = await posts.getPostComments(tweet._id);
            setComments(response.data || []);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        } finally {
            setIsLoadingComments(false);
        }
    }, [tweet._id]);

    const handleInteraction = useCallback((action) => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        action();
    }, [isAuthenticated, navigate, location.pathname]);

    const handleLike = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        handleInteraction(async () => {
            if (isLiking) return;
            try {
                setIsLiking(true);
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/posts/like/${tweet._id}`, {}, {
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
                console.error('Error liking tweet:', error);
            } finally {
                setTimeout(() => setIsLiking(false), 1000);
            }
        });
    }, [tweet._id, isLiked, isLiking, handleInteraction]);

    const handleShare = useCallback(async (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        handleInteraction(async () => {
            try {
                const shareUrl = `${window.location.origin}/post/${tweet._id}`;
                await navigator.clipboard.writeText(shareUrl);
                setShowShareMessage(true);
                setTimeout(() => setShowShareMessage(false), 2000);
            } catch (error) {
                console.error('Error sharing tweet:', error);
            }
        });
    }, [tweet._id, handleInteraction]);

    const handleTweetClick = useCallback((e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') {
            return;
        }
        if (!isMobileOrTablet) {
            navigate(`/post/${tweet._id}`);
        }
    }, [navigate, tweet._id, isMobileOrTablet]);

    const handleDoubleTap = useCallback((e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;
        
        e.preventDefault();
        
        if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
            if (!isLiked && !isLiking) {
                handleLike();
                setShowHeartAnimation(true);
                setTimeout(() => setShowHeartAnimation(false), 1000);
            }
            lastTapTime.current = 0;
            if (isMobileOrTablet) {
                navigate(`/post/${tweet._id}`);
            }
        } else {
            lastTapTime.current = now;
        }
    }, [isLiked, isLiking, handleLike, isMobileOrTablet, tweet._id, navigate]);

    const handleFollowToggle = useCallback(async (e) => {
        e.stopPropagation();
        if (isOwnTweet) return;
        handleInteraction(async () => {
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
        });
    }, [isOwnTweet, isFollowing, tweet.user._id, setFollowState, handleInteraction]);

    const handleCommentClick = useCallback(async (e) => {
        e.stopPropagation();
        if (isSinglePost) return;
        if (!isCommentsVisible) {
            await fetchComments();
        }
        setIsCommentsVisible(!isCommentsVisible);
    }, [isSinglePost, isCommentsVisible, fetchComments]);

    const handleAddComment = useCallback(async (content) => {
        try {
            const response = await posts.addComment(tweet._id, content);
            let newComment = response.data;
            if (!newComment.user || !newComment.user.username) {
                newComment.user = {
                    username: localStorage.getItem('username') || 'You',
                    profilePicture: localStorage.getItem('profilePicture') || '',
                };
            }
            setComments(prev => [newComment, ...prev]);
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    }, [tweet._id]);

    const handleLikeComment = useCallback(async (commentId) => {
        try {
            await posts.likeComment(commentId);
            setComments(prev => prev.map(comment => {
                if (comment._id === commentId) {
                    const isLiked = comment.likes.includes(currentUserId);
                    return {
                        ...comment,
                        likes: isLiked
                            ? comment.likes.filter(id => id !== currentUserId)
                            : [...comment.likes, currentUserId]
                    };
                }
                return comment;
            }));
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    }, [currentUserId]);

    return (
        <>
            <TweetContainer
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onClick={handleTweetClick}
                onTouchStart={handleDoubleTap}
                style={{ cursor: isSinglePost ? 'default' : 'pointer' }}
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
                            {/* <span className="text-gray-500"></span> */}
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
                                onClick={handleCommentClick}
                                color="#3B82F6"
                            >
                                <ChatBubbleLeftIcon className="h-5 w-5" />
                                <span>{tweet.comments.length}</span>
                            </ActionButton>
                            <ShareButton
                                onClick={handleShare}
                                type="button"
                            >
                                <ShareIcon className="h-5 w-5" />
                                <ShareMessage show={showShareMessage}>Post link copied!</ShareMessage>
                            </ShareButton>
                        </div>
                        {isCommentsVisible && (
                            <CommentSection
                                postId={tweet._id}
                                comments={comments}
                                onAddComment={handleAddComment}
                                onLikeComment={handleLikeComment}
                                isLoading={isLoadingComments}
                            />
                        )}
                    </div>
                </div>
            </TweetContainer>
        </>
    );
});

export default TweetCard; 