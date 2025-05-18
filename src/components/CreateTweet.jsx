import React, { useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

const MAX_LENGTH = 280;

const Card = styled(motion.div)`
  background: ${({ theme }) => theme.mode === 'dark' ? '#1E1E1E' : '#F8F9FA'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2D2D2D' : '#F0F0F0'};
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TweetTextarea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  border: 1.5px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  resize: none;
  transition: ${({ theme }) => theme.transitions.default};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.secondary}22;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
`;

const ActionButton = styled(motion.button)`
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.primary};
  background: none;
  border: none;
  transition: ${({ theme }) => theme.transitions.default};
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const SubmitButton = styled(motion.button)`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: none;
  font-weight: 600;
  font-size: 1rem;
  transition: ${({ theme }) => theme.transitions.default};

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CharCount = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.875rem;
`;

const CreateTweet = memo(({ onSubmit }) => {
    const [content, setContent] = useState('');
    const username = localStorage.getItem('username');

    const handleContentChange = useCallback((e) => {
        if (e.target.value.length <= MAX_LENGTH) {
            setContent(e.target.value);
        }
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!content.trim()) return;
        if (typeof onSubmit === 'function') {
            onSubmit({ content });
        }
        setContent('');
    }, [content, onSubmit]);

    return (
        <Card initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: 16 }}>
                    <Avatar>
                        {username ? username.charAt(0).toUpperCase() : 'U'}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <TweetTextarea
                            placeholder="What's happening?"
                            value={content}
                            onChange={handleContentChange}
                            maxLength={MAX_LENGTH}
                            rows={3}
                            aria-label="Tweet content"
                        />
                    </div>
                </div>

                <ActionBar>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <CharCount>
                            {content.length}/{MAX_LENGTH}
                        </CharCount>
                    </div>
                    <SubmitButton
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!content.trim()}
                    >
                        Post
                    </SubmitButton>
                </ActionBar>
            </Form>
        </Card>
    );
});

export default CreateTweet; 