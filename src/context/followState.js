import { atom } from 'recoil';

export const followState = atom({
    key: 'followState',
    default: {}, // Will store userId: boolean pairs
});

export const updateFollowState = (userId, isFollowing) => {
    return (setFollowState) => {
        setFollowState((prevState) => ({
            ...prevState,
            [userId]: isFollowing
        }));
    };
}; 