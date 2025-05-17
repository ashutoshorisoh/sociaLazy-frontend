import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import TrendingPosts from '../components/TrendingPosts';
import TweetCard from '../components/TweetCard';
import CreateTweet from '../components/CreateTweet';
import { posts } from '../services/api';
import { motion } from 'framer-motion';

const FeedContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PostCard = styled.div`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(26, 26, 26, 0.8)' : 'rgba(247, 247, 247, 0.8)'};
  backdrop-filter: blur(10px);
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`;

const Home = () => {
    const [tweets, setTweets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTweets();
    }, []);

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
            setError('Failed to like tweet. Please try again.');
        }
    };

    const handleComment = (tweetId) => {
    };

    const handleNewTweet = async ({ content, image }) => {
        try {
          await posts.create(content, image); // This sends the new post to the backend
          await fetchTweets(); // Refresh the feed
        } catch (error) {
          setError('Failed to create tweet. Please try again.');
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

    if (error) {
        return (
            <Layout
                leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
                rightSidebar={<TrendingPosts posts={trendingPosts} />}
            >
                <div className="text-red-500 text-center">{error}</div>
            </Layout>
        );
    }

    return (
        <Layout
            leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
            rightSidebar={<TrendingPosts posts={trendingPosts} />}
        >
            <FeedContainer>
             
               
                        <CreateTweet onSubmit={handleNewTweet} />
                  
               
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
            </FeedContainer>
        </Layout>
    );
};

export default Home; 