import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)'};
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin: ${({ theme }) => theme.spacing.md};
`;

const Modal = styled.div`
  background-color: ${props => props.theme.background};
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 90%;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
`;

const Title = styled.h2`
  color: ${props => props.theme.text};
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
`;

const Message = styled.p`
  color: ${props => props.theme.textSecondary};
  margin-bottom: 1.5rem;
  font-size: 0.875rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.75rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 0.875rem;

  &.cancel {
    background-color: ${props => props.theme.backgroundSecondary};
    color: ${props => props.theme.text};
    &:hover {
      background-color: ${props => props.theme.backgroundHover};
    }
  }

  &.delete {
    background-color: #dc2626;
    color: white;
    &:hover {
      background-color: #b91c1c;
    }
  }
`;

const DeleteConfirmationOverlay = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}) => {
  if (!isOpen) return null;

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <Title>{title}</Title>
        <Message>{message}</Message>
        <ButtonGroup>
          <Button className="cancel" onClick={onClose}>
            Cancel
          </Button>
          <Button className="delete" onClick={onConfirm}>
            Delete
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  );
};

export default DeleteConfirmationOverlay; 