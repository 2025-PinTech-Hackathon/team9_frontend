import { useState, useEffect } from 'react';
import { customFetch } from '../utils/fetch';
import config from '../../config.json';

export const useUserInfo = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                throw new Error('No token found');
            }

            const response = await customFetch(`${config.hostname}/auth/info`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            const userInfo = data.user;
            setUserInfo(userInfo);
            setError(null);
        } catch (err) {
            setError(err.message);
            setUserInfo(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUserInfo();
    }, []);

    return { userInfo, isLoading, error, refetch: fetchUserInfo };
}; 