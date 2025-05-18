import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
`;

const Modal = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.mode === 'dark' ? '#1E1E1E' : '#FFFFFF'};
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  z-index: 2100;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  min-width: 320px;
  max-width: 90vw;
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
`;

const Message = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const AuthButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  justify-content: center;
`;

const AuthButton = styled(Link)`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-weight: 600;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.default};
  background: ${({ primary }) => primary ? '#3B82F6' : 'transparent'};
  color: ${({ primary }) => primary ? 'white' : '#3B82F6'};
  border: 2px solid #3B82F6;
  text-decoration: none;
  
  &:hover {
    background: ${({ primary }) => primary ? '#2563EB' : 'rgba(59, 130, 246, 0.1)'};
  }
`;

const AuthModal = ({ open, onClose, message = 'Please sign in or create an account to continue.' }) => (
  <AnimatePresence>
    {open && (
      <>
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <Modal
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          <Title>Sign in to continue</Title>
          <Message>{message}</Message>
          <AuthButtons>
            <AuthButton to="/login">Sign In</AuthButton>
            <AuthButton to="/register" primary>Sign Up</AuthButton>
          </AuthButtons>
        </Modal>
      </>
    )}
  </AnimatePresence>
);

export default AuthModal; 