import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const UserCard = ({ user }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors"
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
                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{user.username}</h3>
                    {user.bio && (
                        <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                    )}
                </div>
            </Link>
        </motion.div>
    );
};

export default UserCard; 