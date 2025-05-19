import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import styled from 'styled-components';

const Card = styled(motion.div)`
  position: relative;
  border: 1px solid ${({ theme }) => theme.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.md};
  transition: ${({ theme }) => theme.transitions.default};
  background: ${({ theme }) => theme.mode === 'dark' ? '#1E1E1E' : '#F8F9FA'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.mode === 'dark' ? '#2D2D2D' : '#F0F0F0'};
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const Username = styled.h3`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const Bio = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const UserCard = memo(({ user }) => {
    return (
        <Card
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <Link to={`/profile/${user._id}`} className="flex items-center space-x-3">
                {user.profilePicture ? (
                    <img
                        src={user.profilePicture}
                        alt={user.username}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-lg font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
                <div className="flex-1">
                    <Username>{user.username}</Username>
                    {user.bio && <Bio>{user.bio}</Bio>}
                </div>
            </Link>
        </Card>
    );
});

export default UserCard; 