import { mockUsers } from '../data/mockData';
const SESSION_KEY = 'fisioflow_user_session';
export const login = (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.email === email);
            // In a real app, you would hash and compare the password
            if (user && password === 'password123') {
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
                resolve(user);
            }
            else {
                reject(new Error('Credenciais inválidas.'));
            }
        }, 500);
    });
};
export const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
};
export const getSession = () => {
    const userJson = sessionStorage.getItem(SESSION_KEY);
    if (userJson) {
        return JSON.parse(userJson);
    }
    return null;
};
