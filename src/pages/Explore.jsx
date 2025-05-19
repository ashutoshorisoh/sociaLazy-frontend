import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import TrendingPosts from '../components/TrendingPosts';
import TweetCard from '../components/TweetCard';
import UserCard from '../components/UserCard';
import { posts } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const ExploreContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  padding: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  padding-left: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: 1px solid ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  background: ${({ theme }) =>
    theme.mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 247, 247, 0.8)'};
  backdrop-filter: blur(10px);
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  height: 48px; /* <-- Set fixed height */

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: 0.75rem 1rem 0.75rem 36px; /* Slightly larger vertical padding */
    font-size: 1rem; /* Keep consistent with desktop */
    height: 44px; /* Slightly smaller but still tall */
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;


const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
`;

const LoadingSpinner = styled.div`
  position: absolute;
  right: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Explore = () => {
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchTweets();
    }, []);

    useEffect(() => {
        const searchPosts = async () => {
            if (!searchQuery.trim()) {
                setSearchResults({ posts: [], users: [] });
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const response = await posts.search(searchQuery);
                setSearchResults(response.data);
            } catch (err) {
                setError('Failed to fetch search results');
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(searchPosts, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchTweets = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await posts.getAll();
            if (response && response.data && response.data.posts) {
                setTweets(response.data.posts);
            } else {
                setTweets([]);
            }
        } catch (error) {
            console.error('Error fetching tweets:', error);
            setError('Failed to load tweets. Please try again later.');
            setTweets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (tweetId) => {
        try {
            await posts.like(tweetId);
            fetchTweets(); // Refresh tweets after liking
        } catch (error) {
            console.error('Error liking tweet:', error);
            setError('Failed to like tweet. Please try again.');
        }
    };

    const handleComment = (tweetId) => {
        // Comment functionality to be implemented
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

    // Filter users whose username starts with the search query (case-insensitive)
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const filteredUsers = searchResults.users.filter(user =>
        trimmedQuery && user.username.toLowerCase().startsWith(trimmedQuery)
    );

    if (loading) {
        return (
            <Layout
                leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
                rightSidebar={<TrendingPosts posts={trendingPosts} />}
            >
                <div className="flex justify-center items-center h-screen">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
            rightSidebar={<TrendingPosts posts={trendingPosts} />}
        >
            <ExploreContainer>
                <SearchContainer>
                    <SearchInput
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts and users..."
                    />
                    <SearchIcon>
                        <MagnifyingGlassIcon className="h-5 w-5" />
                    </SearchIcon>
                    {isLoading && (
                        <LoadingSpinner>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                        </LoadingSpinner>
                    )}
                </SearchContainer>

                <AnimatePresence>
                    {error ? (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-center"
                        >
                            {error}
                        </motion.div>
                    ) : (
                        <>
                            {searchQuery ? (
                                <>
                                    {filteredUsers.length > 0 && (
  <div className="mb-6">
    <SectionTitle className="mb-2">Users</SectionTitle>
    <div className="space-y-2">
      {filteredUsers.map((user) => (
        <UserCard key={user._id} user={user} />
      ))}
    </div>
  </div>
)}


                                    {searchResults.posts.length > 0 && (
                                        <div>
                                            <SectionTitle>Posts</SectionTitle>
                                            <div className="space-y-4">
                                                {searchResults.posts.map((post) => (
                                                    <TweetCard
                                                        key={post._id}
                                                        tweet={post}
                                                        onLike={handleLike}
                                                        onComment={handleComment}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {!isLoading && searchQuery && filteredUsers.length === 0 && searchResults.posts.length === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-center text-gray-500"
                                        >
                                            No results found for "{searchQuery}"
                                        </motion.div>
                                    )}
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {tweets.map((tweet) => (
                                        <TweetCard
                                            key={tweet._id}
                                            tweet={tweet}
                                            onLike={handleLike}
                                            onComment={handleComment}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </AnimatePresence>
            </ExploreContainer>
        </Layout>
    );
};

export default Explore; 