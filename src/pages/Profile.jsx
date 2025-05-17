import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const ProfileHeader = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 247, 247, 0.8)'};
  backdrop-filter: blur(10px);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`;

const ProfileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
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

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
`;

const Username = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Bio = styled.p`
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Stats = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const Stat = styled.div`
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
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
  
  &:hover {
    background: ${({ theme, isFollowing }) => isFollowing ? 'rgba(59, 130, 246, 0.1)' : theme.colors.secondary};
    border-color: ${({ theme, isFollowing }) => isFollowing ? theme.colors.secondary : theme.colors.secondary};
  }
`;

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const loggedInUserId = localStorage.getItem('userId');
    const isOwnProfile = userId === 'me' || !userId;
    const idToFetch = isOwnProfile ? loggedInUserId : userId;
    const [profile, setProfile] = useState(null);
    const [userTweets, setUserTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isLoadingFollow, setIsLoadingFollow] = useState(false);
    const [followStateValue, setFollowState] = useRecoilState(followState);

    const isFollowing = profile ? followStateValue[profile._id] || false : false;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                setError(null);

                let response;
                if (isOwnProfile) {
                    response = await auth.getCurrentUserProfile();
                } else {
                    response = await users.getProfile(idToFetch);
                    // Check following status for other users' profiles
                    const followingResponse = await users.checkFollowing(idToFetch);
                    if (followingResponse.data) {
                        setFollowState(prev => ({
                            ...prev,
                            [idToFetch]: followingResponse.data.isFollowing
                        }));
                    }
                }

                if (!response.data || !response.data.user) {
                    throw new Error('Invalid response format');
                }
                setProfile(response.data.user);
                setUserTweets(response.data.posts || []);
            } catch (error) {
                if (error.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError(error.response?.data?.message || error.message || 'Failed to load user profile');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [idToFetch, navigate, isOwnProfile, setFollowState]);

    const handleFollowToggle = async () => {
        if (!profile || isOwnProfile) return;
        
        try {
            setIsLoadingFollow(true);
            if (isFollowing) {
                await users.unfollow(profile._id);
            } else {
                await users.follow(profile._id);
            }
            
            // Update Recoil state
            setFollowState(prev => ({
                ...prev,
                [profile._id]: !isFollowing
            }));

            // Update the followers array in the profile
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
                        <UserInfo>
                            <div className="flex items-center justify-between">
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
                            </div>
                            <Bio>{profile?.bio || 'No bio yet'}</Bio>
                            <Stats>
                                <Stat>
                                    <StatValue>{userTweets.length} posts</StatValue>
                                    <StatLabel>Posts</StatLabel>
                                </Stat>
                                <Stat>
                                    <StatValue>{profile?.followers?.length || 0} followers</StatValue>
                                    <StatLabel>Followers</StatLabel>
                                </Stat>
                                <Stat>
                                    <StatValue>{profile?.following?.length || 0} following</StatValue>
                                    <StatLabel>Following</StatLabel>
                                </Stat>
                            </Stats>
                        </UserInfo>
                    </ProfileInfo>
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