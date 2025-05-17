import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import TrendingPosts from '../components/TrendingPosts';
import TweetCard from '../components/TweetCard';
import { posts } from '../services/api';

const PostContainer = styled.div`
  max-width: 680px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  width: 100%;

  @media (max-width: 768px) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'};
  }
`;

const SinglePost = () => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                setLoading(true);
                const response = await posts.getById(postId);
                setPost(response.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch post');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [postId]);

    const handleLike = async () => {
        try {
            await posts.like(postId);
            const response = await posts.getById(postId);
            setPost(response.data);
        } catch (err) {
            console.error('Failed to like post:', err);
        }
    };

    const handleComment = () => {
        // Comment functionality is handled by TweetCard
    };

    const handleBack = () => {
        navigate(-1);
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

    if (!post) {
        return (
            <Layout
                leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
                rightSidebar={<TrendingPosts posts={trendingPosts} />}
            >
                <div className="text-center text-gray-500">Post not found</div>
            </Layout>
        );
    }

    return (
        <Layout
            leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
            rightSidebar={<TrendingPosts posts={trendingPosts} />}
        >
            <PostContainer>
                <BackButton onClick={handleBack}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </BackButton>
                <TweetCard
                    tweet={post}
                    onLike={handleLike}
                    onComment={handleComment}
                    showComments={true}
                    isSinglePost={true}
                />
            </PostContainer>
        </Layout>
    );
};

export default SinglePost; 