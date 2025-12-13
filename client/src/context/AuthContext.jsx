import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial check
    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
            setUser(res.data.user);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const res = await axios.post('http://localhost:5000/api/auth/login', { email, password }, {
            withCredentials: true
        });
        setUser(res.data.user);
        return res.data;
    };

    const register = async (userData) => {
        const res = await axios.post('http://localhost:5000/api/auth/register', userData, {
            withCredentials: true
        });
        setUser(res.data.user);
        return res.data;
    };

    const logout = async () => {
        await axios.get('http://localhost:5000/api/auth/logout', { withCredentials: true });
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
