import React, { memo } from 'react';
import styled from 'styled-components';
import { useLocation } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  justify-content: center;
  padding: 0;
  margin: 0;
  width: 100%;
  gap: 10px;
`;

const MainContent = styled.main`
  flex: 1 1 600px;
  max-width: 600px;
  min-width: 0;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  min-height: 100vh;
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding-bottom: 85px; /* 👈 add padding to clear space for MobileBottomNav */
    max-width: 100%;
  }
`;


const SidebarContainer = styled.div`
  width: 280px;
  display: none;

  @media (min-width: 1024px) {
    display: block;
    height: calc(100vh - 64px);
    overflow: hidden;
  }
`;

const SidebarContent = styled.div`
  height: 100%;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
    border-radius: 2px;
  }
`;

const MobileTrendingSection = styled.div`
  display: none;
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: 1024px) {
    display: ${({ showOnMobile }) => (showOnMobile ? 'block' : 'none')};
  }
`;

const MobileBottomNav = styled.nav`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(18, 18, 18, 0.95)' : 'rgba(255, 255, 255, 0.95)'};
  backdrop-filter: blur(10px);
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
  padding: ${({ theme }) => theme.spacing.sm};
  z-index: 1000;

  @media (max-width: 768px) {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }
`;

const Layout = memo(({ children, leftSidebar, rightSidebar }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <Container>
      {leftSidebar && (
        <SidebarContainer>
          <SidebarContent>{leftSidebar}</SidebarContent>
        </SidebarContainer>
      )}
      <MainContent>
        <MobileTrendingSection showOnMobile={isHomePage}>
          {rightSidebar}
        </MobileTrendingSection>
        {children}
      </MainContent>
      {rightSidebar && (
        <SidebarContainer>
          <SidebarContent>{rightSidebar}</SidebarContent>
        </SidebarContainer>
      )}
      <MobileBottomNav>
        {leftSidebar}
      </MobileBottomNav>
    </Container>
  );
});

export default Layout; 