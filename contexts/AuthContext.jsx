import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../services/authService';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const checkSession = async () => {
            try {
                const sessionUser = authService.getSession();
                if (sessionUser) {
                    setUser(sessionUser);
                }
            }
            catch (error) {
                console.error("Session check failed:", error);
                setUser(null);
            }
            finally {
                setIsLoading(false);
            }
        };
        checkSession();
    }, []);
    const login = async (email, password) => {
        const loggedInUser = await authService.login(email, password);
        setUser(loggedInUser);
        return loggedInUser;
    };
    const logout = () => {
        authService.logout();
        setUser(null);
    };
    return (<AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>);
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
