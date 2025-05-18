import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import TrendingPosts from '../components/TrendingPosts';
import TweetCard from '../components/TweetCard';
import { users, auth, posts } from '../services/api';
import { motion } from 'framer-motion';
import CreateTweet from '../components/CreateTweet';
import { useRecoilState } from 'recoil';
import { followState } from '../context/followState';
import { ShareIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  width: 100%;
  padding: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const ProfileHeader = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 247, 247, 0.8)'};
  backdrop-filter: blur(10px);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const ProfileInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const UserInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0; // Prevents flex item from overflowing
`;

const UserActionsRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  flex-wrap: wrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const Avatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    width: 80px;
    height: 80px;
    font-size: 2rem;
  }
`;

const Username = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 1.25rem;
  }
`;

const Bio = styled.p`
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  margin: ${({ theme }) => theme.spacing.sm} 0 0;
  word-break: break-word;
  line-height: 1.4;
`;

const Stats = styled.div`
  display: flex;
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 70%;
    width: 1px;
    background-color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  }
`;

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-top: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.error};
  font-size: 1.1rem;
`;

const FollowButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  background: ${({ theme, isFollowing }) => isFollowing ? 'transparent' : theme.colors.primary};
  color: ${({ theme, isFollowing }) => isFollowing ? theme.colors.primary : 'white'};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  white-space: nowrap;
  
  &:hover {
    background: ${({ theme, isFollowing }) => isFollowing ? 'rgba(59, 130, 246, 0.1)' : theme.colors.secondary};
    border-color: ${({ theme, isFollowing }) => isFollowing ? theme.colors.secondary : theme.colors.secondary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
    font-size: 0.875rem;
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
  padding: 0.5rem;
  min-width: 2.5rem;
  min-height: 2.5rem;
  justify-content: center;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }

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
  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    display: none;
  }
`;

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const loggedInUserId = localStorage.getItem('userId');
    const isOwnProfile = userId === 'me' || !userId;
    const idToFetch = isOwnProfile ? loggedInUserId : userId;
    const [profile, setProfile] = useState(null);
    const [userTweets, setUserTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [followStateValue, setFollowState] = useRecoilState(followState);
    const [showShareMessage, setShowShareMessage] = useState(false);

    const isFollowing = profile ? followStateValue[profile._id] || false : false;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                let response;
                if (isOwnProfile) {
                    if (!isAuthenticated) {
                        navigate('/login', { state: { from: location.pathname } });
                        return;
                    }
                    response = await auth.getCurrentUserProfile();
                } else {
                    response = await users.getProfile(idToFetch);
                    // Check following status for other users' profiles
                    if (isAuthenticated) {
                        const followingResponse = await users.checkFollowing(idToFetch);
                        if (followingResponse.data) {
                            setFollowState(prev => ({
                                ...prev,
                                [idToFetch]: followingResponse.data.isFollowing
                            }));
                        }
                    }
                }

                if (!response.data || !response.data.user) {
                    throw new Error('Invalid response format');
                }
                setProfile(response.data.user);
                setUserTweets(response.data.posts || []);
            } catch (error) {
                if (error.response?.status === 401 && isOwnProfile) {
                    navigate('/login', { state: { from: location.pathname } });
                } else {
                    setError(error.response?.data?.message || error.message || 'Failed to load user profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [idToFetch, navigate, isOwnProfile, setFollowState, isAuthenticated, location.pathname]);

    const handleFollowToggle = async () => {
        if (!profile || isOwnProfile) return;
        if (!isAuthenticated) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }
        try {
            setIsLoadingFollow(true);
            if (isFollowing) {
                await users.unfollow(profile._id);
            } else {
                await users.follow(profile._id);
            }
            setFollowState(prev => ({
                ...prev,
                [profile._id]: !isFollowing
            }));
            setProfile(prev => ({
                ...prev,
                followers: isFollowing
                    ? prev.followers.filter(id => id !== loggedInUserId)
                    : [...(prev.followers || []), loggedInUserId]
            }));
        } catch (error) {
            console.error('Error toggling follow:', error);
            setError(error.response?.data?.message || 'Failed to update follow status');
        } finally {
            setIsLoadingFollow(false);
        }
    };

    const handleComment = (tweetId) => {
        // Comment functionality to be implemented
    };

    const handleNewTweet = async ({ content, image }) => {
        try {
            await posts.create(content, image);
            const response = isOwnProfile
                ? await auth.getCurrentUserProfile()
                : await users.getProfile(idToFetch);
            setUserTweets(response.data.posts || []);
        } catch (error) {
            console.error('Error creating tweet:', error);
        }
    };

    const trendingPosts = [
        {
            id: 1,
            title: "Most Popular React Libraries",
            author: "John Doe",
            date: "1 hour ago"
        },
        {
            id: 2,
            title: "Best Practices for TypeScript",
            author: "Jane Smith",
            date: "3 hours ago"
        }
    ];

    const sidebarLinks = [
        {
            path: '/',
            label: 'Home',
            icon: '🏠'
        },
        {
            path: '/explore',
            label: 'Explore',
            icon: '🔍'
        },
        {
            path: '/notifications',
            label: 'Notifications',
            icon: '🔔'
        },
        {
            path: '/profile',
            label: 'Profile',
            icon: '👤'
        }
    ];

    if (loading) {
        return (
            <Layout>
                <LoadingContainer>
                    <LoadingSpinner />
                </LoadingContainer>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <ErrorContainer>
                    {error}
                </ErrorContainer>
            </Layout>
        );
    }

    if (!profile) {
        return (
            <Layout
                leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
                rightSidebar={<TrendingPosts posts={trendingPosts} />}
            >
                <div className="flex justify-center items-center h-screen bg-white">
                    <div className="text-gray-500">User not found</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
            rightSidebar={<TrendingPosts posts={trendingPosts} />}
        >
            <ProfileContainer>
                <ProfileHeader>
                    <ProfileInfo>
                        <Avatar>
                            {profile?.profilePicture ? (
                                <img src={profile.profilePicture} alt={profile.username} />
                            ) : (
                                profile?.username?.charAt(0).toUpperCase() || 'U'
                            )}
                        </Avatar>
                        <UserInfoContainer>
                            <UserActionsRow>
                                <Username>{profile?.username}</Username>
                                {!isOwnProfile && (
                                    <FollowButton
                                        isFollowing={isFollowing}
                                        onClick={handleFollowToggle}
                                        disabled={isLoadingFollow}
                                    >
                                        {isLoadingFollow ? (
                                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : isFollowing ? (
                                            'Unfollow'
                                        ) : (
                                            'Follow'
                                        )}
                                    </FollowButton>
                                )}
                                <ShareButton
                                    onClick={() => {
                                        const shareUrl = `${window.location.origin}/profile/${isOwnProfile ? 'me' : profile?._id}`;
                                        navigator.clipboard.writeText(shareUrl);
                                        setShowShareMessage(true);
                                        setTimeout(() => setShowShareMessage(false), 2000);
                                    }}
                                    type="button"
                                >
                                    <ShareIcon className="h-5 w-5" />
                                    <ShareMessage show={showShareMessage}>Profile link copied!</ShareMessage>
                                </ShareButton>
                            </UserActionsRow>
                            <Bio>{profile?.bio || 'No bio yet'}</Bio>
                        </UserInfoContainer>
                    </ProfileInfo>
                    <Stats>
                        <Stat>
                            <StatValue>{userTweets.length}</StatValue>
                            <StatLabel>Posts</StatLabel>
                        </Stat>
                        <Stat>
                            <StatValue>{profile?.followers?.length || 0}</StatValue>
                            <StatLabel>Followers</StatLabel>
                        </Stat>
                        <Stat>
                            <StatValue>{profile?.following?.length || 0}</StatValue>
                            <StatLabel>Following</StatLabel>
                        </Stat>
                    </Stats>
                </ProfileHeader>
                <div className="space-y-4">
                    {isOwnProfile && (
                        <CreateTweet onSubmit={handleNewTweet} />
                    )}
                    {userTweets.map((tweet) => (
                        <TweetCard
                            key={tweet._id}
                            tweet={tweet}
                            hideFollowButton={true}
                        />
                    ))}
                </div>
            </ProfileContainer>
        </Layout>
    );
};

export default Profile;