import React, { useCallback, memo } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Navigation from './components/Navigation';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider, useTheme } from './context/ThemeContext';
import { lightTheme, darkTheme } from './styles/theme';
import styled from 'styled-components';
import TweetCard from './components/TweetCard';
import SinglePost from './pages/SinglePost';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: ${({ isProfileRoute }) => isProfileRoute ? 'auto' : 'smooth'};
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    transition: ${({ theme }) => theme.transitions.default};
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 4px;
    
    &:hover {
      background: ${({ theme }) => theme.colors.secondary};
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    cursor: pointer;
    font-family: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
  }
`;

const MainContent = styled.main`
  padding-top: calc(64px + ${({ theme }) => theme.spacing.xl});
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.spacing.md};
  padding-right: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-top: calc(56px + ${({ theme }) => theme.spacing.lg});
    padding-left: ${({ theme }) => theme.spacing.sm};
    padding-right: ${({ theme }) => theme.spacing.sm};
  }
`;

const AuthContent = styled.main`
  min-height: 100vh;
  width: 100%;
`;

const PrivateRoute = memo(({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
});

const AppRoutes = memo(() => {
    const { isAuthenticated } = useAuth();
    const { isDarkMode } = useTheme();
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isProfileRoute = location.pathname.startsWith('/profile');

    return (
        <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
            <GlobalStyle isProfileRoute={isProfileRoute} />
            {!isAuthPage && <Navigation />}
            {isAuthPage ? (
                <AuthContent>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </AuthContent>
            ) : (
                <MainContent>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/explore" element={<Explore />} />
                        <Route path="/profile/me" element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        } />
                        <Route path="/profile/:userId" element={<Profile />} />
                        <Route path="/profile" element={<Navigate to="/profile/me" replace />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/post/:postId" element={<SinglePost />} />
                    </Routes>
                </MainContent>
            )}
        </ThemeProvider>
    );
});

const App = memo(() => {
    return (
        <CustomThemeProvider>
            <AuthProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </AuthProvider>
        </CustomThemeProvider>
    );
});

export default App; 