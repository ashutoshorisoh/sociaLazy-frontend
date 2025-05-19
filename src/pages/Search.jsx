import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import TweetCard from '../components/TweetCard';
import UserCard from '../components/UserCard';
import { posts } from '../services/api';

const Search = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [searchResults, setSearchResults] = useState({ posts: [], users: [] });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, 300); // 300ms delay

        return () => clearTimeout(timer);
    }, [query]);

    // Update URL when debounced query changes
    useEffect(() => {
        if (debouncedQuery) {
            setSearchParams({ q: debouncedQuery });
        }
    }, [debouncedQuery, setSearchParams]);

    // Perform search when debounced query changes
    useEffect(() => {
        if (debouncedQuery) {
            handleSearch(debouncedQuery);
        } else {
            setSearchResults({ posts: [], users: [] });
        }
    }, [debouncedQuery]);

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log('Searching for:', searchQuery);
            const response = await posts.search(searchQuery);
            console.log('Raw search response:', response);
            console.log('Response data:', response.data);
            console.log('Posts in response:', response.data.posts);
            console.log('Users in response:', response.data.users);

            // The response data is directly in the response
            const results = {
                posts: response.data.posts || [],
                users: response.data.users || []
            };
            console.log('Setting search results:', results);
            setSearchResults(results);
        } catch (err) {
            console.error('Search error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                config: err.config
            });
            setError('Failed to fetch search results');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter users whose username starts with the search query (case-insensitive)
    const trimmedQuery = query.trim().toLowerCase();
    const filteredUsers = searchResults.users.filter(user =>
        trimmedQuery && user.username.toLowerCase().startsWith(trimmedQuery)
    );

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="relative mb-6">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search posts and users..."
                    className="w-full rounded-full border border-gray-300 py-4 pl-10 pr-4 focus:border-blue-500 focus:outline-none text-base"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {error ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-red-500 text-center"
                    >
                        {error}
                    </motion.div>
                ) : (
                    <>
                        {filteredUsers.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <h2 className="text-xl font-bold m-0">Users</h2>
                                <div className="flex flex-col gap-4 mt-2">
                                    {filteredUsers.map((user) => (
                                        <UserCard key={user._id} user={user} />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {!isLoading && query && filteredUsers.length === 0 && searchResults.posts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-gray-500"
                            >
                                No results found for "{query}"
                            </motion.div>
                        )}
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Search; 