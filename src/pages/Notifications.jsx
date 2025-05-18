import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Layout from '../components/Layout';
import Sidebar from '../components/Sidebar';
import TrendingPosts from '../components/TrendingPosts';
import { notifications } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';

const NotificationsContainer = styled.div`
  width: 100%;
  padding: 0;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const NotificationCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  &.unread {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'};
    border-left: 4px solid ${({ theme }) => theme.colors.primary};

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: -4px;
      transform: translateY(-50%);
      width: 8px;
      height: 8px;
      background: ${({ theme }) => theme.colors.primary};
      border-radius: 50%;
    }

    .notification-content {
      opacity: 1;
    }
  }

  &.read {
    opacity: 0.8;
    border-left: 4px solid transparent;
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'};

    .notification-content {
      opacity: 0.7;
    }
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const NotificationContent = styled.div`
  flex: 1;
  transition: opacity 0.3s ease;
`;

const Username = styled(Link)`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  text-decoration: none;
  margin-right: ${({ theme }) => theme.spacing.xs};

  &:hover {
    text-decoration: underline;
  }
`;

const NotificationText = styled.p`
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  line-height: 1.5;
`;

const Timestamp = styled.span`
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'};
  font-size: 0.875rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const PaginationButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const MarkAllReadButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  margin-bottom: ${({ theme }) => theme.spacing.lg};

  &:hover {
    opacity: 0.9;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)'};
`;

const EmptyStateTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const EmptyStateText = styled.p`
  font-size: 1rem;
  margin: 0;
`;

const ReadStatusToggle = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.xs};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all 0.2s ease;
  font-size: 0.875rem;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }
`;

const LoginMessage = styled.div`
  color: ${({ theme }) => theme.mode === 'dark' ? '#FFFFFF' : '#000000'};
  font-size: 0.875rem;
  text-align: center;
  padding: ${({ theme }) => theme.spacing.sm};
//   background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-top: ${({ theme }) => theme.spacing.sm};

  a {
    color: ${({ theme }) => theme.mode === 'dark' ? '#FFFFFF' : '#000000'};
    text-decoration: underline;
    font-weight: 600;
    margin-left: 4px;
    text-transform: uppercase;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleLoginClick = (e) => {
        e.preventDefault();
        navigate('/login', { state: { from: location.pathname } });
    };

    const fetchNotifications = async (page) => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const data = await notificationService.getNotifications(page);
            setNotifications(data.notifications);
            setCurrentPage(data.currentPage);
            setTotalPages(data.totalPages);
            setError(null);
        } catch (err) {
            setError('Failed to fetch notifications');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [currentPage, isAuthenticated]);

    const handleMarkAsRead = async (notificationId, event) => {
        event.stopPropagation(); // Prevent card click event
        try {
            await notificationService.markNotificationAsRead(notificationId);
            setNotifications(notifications.map(notification =>
                notification._id === notificationId
                    ? { ...notification, read: true }
                    : notification
            ));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllNotificationsAsRead();
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handleNotificationClick = async (notification) => {
        try {
            // Mark notification as read if it's unread
            if (!notification.read) {
                await notificationService.markNotificationAsRead(notification._id);
                setNotifications(notifications.map(n =>
                    n._id === notification._id ? { ...n, read: true } : n
                ));
            }
            
            // Navigate to the post using the post._id
            if (notification.post && notification.post._id) {
                navigate(`/post/${notification.post._id}`);
            }
        } catch (err) {
            console.error('Failed to handle notification click:', err);
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

    if (!isAuthenticated) {
        return (
            <Layout
                leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
                rightSidebar={<TrendingPosts posts={trendingPosts} />}
            >
                <NotificationsContainer>
                    <EmptyState>
                        <EmptyStateTitle>Notifications</EmptyStateTitle>
                        <LoginMessage>
                            To view your notifications, please <a href="/login" onClick={handleLoginClick}>login</a>
                        </LoginMessage>
                    </EmptyState>
                </NotificationsContainer>
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

    const hasUnreadNotifications = notifications.some(notification => !notification.read);

    return (
        <Layout
            leftSidebar={<Sidebar title="Navigation" links={sidebarLinks} />}
            rightSidebar={<TrendingPosts posts={trendingPosts} />}
        >
            <NotificationsContainer>
                {notifications.length === 0 ? (
                    <EmptyState>
                        <EmptyStateTitle>No notifications yet</EmptyStateTitle>
                        <EmptyStateText>When you get notifications, they'll show up here.</EmptyStateText>
                    </EmptyState>
                ) : (
                    <>
                        {hasUnreadNotifications && (
                            <MarkAllReadButton onClick={handleMarkAllAsRead}>
                                Mark All as Read
                            </MarkAllReadButton>
                        )}

                        {notifications.map((notification) => (
                            <NotificationCard
                                key={notification._id}
                                className={notification.read ? 'read' : 'unread'}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <NotificationHeader>
                                    <Avatar>
                                        {notification.sender.profilePicture ? (
                                            <img src={notification.sender.profilePicture} alt={notification.sender.username} />
                                        ) : (
                                            notification.sender.username?.charAt(0).toUpperCase() || 'U'
                                        )}
                                    </Avatar>
                                    <NotificationContent className="notification-content">
                                        <Username to={`/profile/${notification.sender._id}`}>
                                            {notification.sender.username}
                                        </Username>
                                        <NotificationText>{notification.content}</NotificationText>
                                        <Timestamp>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </Timestamp>
                                    </NotificationContent>
                                    {!notification.read && (
                                        <ReadStatusToggle onClick={(e) => {
                                            e.stopPropagation();
                                            handleMarkAsRead(notification._id, e);
                                        }}>
                                            Mark as Read
                                        </ReadStatusToggle>
                                    )}
                                </NotificationHeader>
                            </NotificationCard>
                        ))}

                        {totalPages > 1 && (
                            <PaginationContainer>
                                <PaginationButton
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    Previous
                                </PaginationButton>
                                <PaginationButton
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next
                                </PaginationButton>
                            </PaginationContainer>
                        )}
                    </>
                )}
            </NotificationsContainer>
        </Layout>
    );
};

export default Notifications; 