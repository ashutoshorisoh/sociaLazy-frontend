import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import styled from 'styled-components';
import { notificationService } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const DrawerOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'};
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const DrawerContent = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: ${({ theme }) => theme.colors.background};
  z-index: 1001;
  padding: ${({ theme }) => theme.spacing.lg};
  border-right: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  display: flex;
  flex-direction: column;
`;

const MobileBottomNav = styled(motion.div)`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  backdrop-filter: blur(10px);
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.sm};
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const NavItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.text};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: ${({ theme }) => theme.transitions.default};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'};
  }
`;

const MobileNavItem = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.text};
  text-decoration: none;
  font-size: 0.75rem;
`;

const ModalOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 16px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  height: 100vh;
  width: 100vw;
`;

const ModalContent = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100000;
  margin: 0;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    top: 40%;
    max-height: 70vh;

  }
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

const ModalActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
  flex-direction: row;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
    width: 100%;
  }
`;

const ModalButton = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  flex: 1;
  min-width: 120px;
  
  &.cancel {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
    color: ${({ theme }) => theme.colors.text};
    border: none;
    
    &:hover {
      background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'};
    }
  }
  
  &.confirm {
    background: #dc2626;
    color: white;
    border: none;
    
    &:hover {
      background: #b91c1c;
    }
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.mode === 'dark' ? '#FF4B2B' : '#B91C1C'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: ${({ theme }) => theme.transitions.default};
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,75,43,0.08)' : 'rgba(185,28,28,0.08)'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#FF4B2B' : '#B91C1C'};
  }
`;

const MobileLogoutButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.mode === 'dark' ? '#FF4B2B' : '#B91C1C'};
  text-decoration: none;
  font-size: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    opacity: 0.8;
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,75,43,0.08)' : 'rgba(185,28,28,0.08)'};
  }
`;

const SidebarTitle = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid ${({ theme }) => theme.colors.background};
`;

const NavItemContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const LoginButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.mode === 'dark' ? '#FF4B2B' : '#B91C1C'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: ${({ theme }) => theme.transitions.default};
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,75,43,0.08)' : 'rgba(185,28,28,0.08)'};
    color: ${({ theme }) => theme.mode === 'dark' ? '#FF4B2B' : '#B91C1C'};
  }
`;

const MobileLoginButton = styled(LoginButton)`
  flex-direction: column;
  font-size: 0.75rem;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  width: auto;
`;

const LoginIcon = (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H9m0 0l3-3m-3 3l3 3" />
  </svg>
);

const Sidebar = memo(() => {
    const location = useLocation();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { isAuthenticated, logout } = useAuth();

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await notificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            setUnreadCount(0);
        }
    }, []);

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    const isActive = useCallback((path) => {
        return location.pathname === path;
    }, [location.pathname]);

    const handleLogout = useCallback(() => {
        logout();
        window.location.href = '/login';
    }, [logout]);

    const handleDrawerOpen = useCallback(() => setIsDrawerOpen(true), []);
    const handleDrawerClose = useCallback(() => setIsDrawerOpen(false), []);

    const navItems = [
        {
            path: '/',
            label: 'Home',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ),
        },
        {
            path: '/explore',
            label: 'Explore',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
        },
        {
            path: '/notifications',
            label: 'Notifications',
            icon: (
                <NavItemContainer>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
                </NavItemContainer>
            ),
        },
        {
            path: '/profile/me',
            label: 'Profile',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
        },
    ];

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden md:flex flex-col w-64 p-6"
                style={{ display: window.innerWidth <= 768 ? 'none' : undefined }}
            >
                <nav className="space-y-2">
                    {navItems.map((item, index) => (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <NavItem to={item.path} active={isActive(item.path) ? 1 : 0}>
                                {item.icon}
                                <span>{item.label}</span>
                            </NavItem>
                        </motion.div>
                    ))}
                    {isAuthenticated ? (
                        <LogoutButton onClick={handleLogout}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </LogoutButton>
                    ) : (
                        <LoginButton as={Link} to="/login">
                            {LoginIcon}
                            <span>Login</span>
                        </LoginButton>
                    )}
                </nav>
            </motion.aside>

            {/* Mobile Drawer */}
            <AnimatePresence>
                {isDrawerOpen && window.innerWidth > 768 && (
                    <>
                        <DrawerOverlay
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={handleDrawerClose}
                        />
                        <DrawerContent
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", damping: 20 }}
                        >
                            <div className="mb-8">
                                <h1 className="text-2xl font-bold text-blue-500">sociaLazy</h1>
                            </div>
                            <nav className="space-y-2">
                                {navItems.map((item) => (
                                    <NavItem
                                        key={item.path}
                                        to={item.path}
                                        active={isActive(item.path) ? 1 : 0}
                                        onClick={handleDrawerClose}
                                    >
                                        {item.icon}
                                        <span>{item.label}</span>
                                    </NavItem>
                                ))}
                                {isAuthenticated ? (
                                    <LogoutButton onClick={handleLogout}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Logout</span>
                                    </LogoutButton>
                                ) : (
                                    <LoginButton as={Link} to="/login">
                                        {LoginIcon}
                                        <span>Login</span>
                                    </LoginButton>
                                )}
                            </nav>
                        </DrawerContent>
                    </>
                )}
            </AnimatePresence>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav>
                <div className="flex justify-around items-center">
                    {navItems.map((item) => (
                        <MobileNavItem
                            key={item.path}
                            to={item.path}
                            active={isActive(item.path) ? 1 : 0}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                        </MobileNavItem>
                    ))}
                    {isAuthenticated ? (
                        <MobileLogoutButton onClick={handleLogout}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            <span>Logout</span>
                        </MobileLogoutButton>
                    ) : (
                        <MobileLoginButton as={Link} to="/login">
                            {LoginIcon}
                            <span>Login</span>
                        </MobileLoginButton>
                    )}
                </div>
            </MobileBottomNav>
        </>
    );
});

export default Sidebar;