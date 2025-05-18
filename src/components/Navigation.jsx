import React, { useState, useCallback, memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

const Nav = styled.nav`
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  padding: ${({ theme }) => theme.spacing.md};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  box-shadow: ${({ theme }) => theme.shadows.md};
  border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
`;

const NavContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 ${({ theme }) => theme.spacing.md};
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.default};
  
  img {
    height: 40px;
    width: auto;
    transition: transform 0.2s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    img {
      height: 32px;
    }
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  align-items: center;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: ${({ theme }) => theme.colors.background};
    padding: ${({ theme }) => theme.spacing.md};
    box-shadow: ${({ theme }) => theme.shadows.lg};
    border-bottom: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme, active }) => active ? theme.colors.primary : theme.colors.text};
  text-decoration: none;
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: ${({ theme }) => theme.transitions.default};
  font-size: 1rem;
  
  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    text-align: center;
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const MobileControls = styled.div`
  display: none;
  align-items: center;
  gap: 8px;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: flex;
  }
`;

const DesktopThemeToggle = styled.div`
  display: none;
  margin-left: ${({ theme }) => theme.spacing.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
  }
`;

const Navigation = memo(() => {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const handleNavLinkClick = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <Nav>
      <NavContainer>
        <Logo to="/">
          <img src="/socialazy-logo.svg" alt="sociaLazy" />
        </Logo>
        <MobileControls>
          <ThemeToggle />
          <MenuButton onClick={toggleMenu}>
            {isMenuOpen ? '✕' : '☰'}
          </MenuButton>
        </MobileControls>
        <NavLinks isOpen={isMenuOpen}>
          <NavLink
            to="/"
            active={location.pathname === '/' ? 1 : 0}
            onClick={handleNavLinkClick}
          >
            Home
          </NavLink>
          <NavLink
            to="/explore"
            active={location.pathname === '/explore' ? 1 : 0}
            onClick={handleNavLinkClick}
          >
            Explore
          </NavLink>
          <NavLink
            to="/notifications"
            active={location.pathname === '/notifications' ? 1 : 0}
            onClick={handleNavLinkClick}
          >
            Notifications
          </NavLink>
          <NavLink
            to="/profile"
            active={location.pathname === '/profile' ? 1 : 0}
            onClick={handleNavLinkClick}
          >
            Profile
          </NavLink>
          <DesktopThemeToggle>
            <ThemeToggle />
          </DesktopThemeToggle>
        </NavLinks>
      </NavContainer>
    </Nav>
  );
});

export default Navigation; 