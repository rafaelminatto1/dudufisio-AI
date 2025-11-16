
import { User } from '../types';
import { Role } from '../types/enums';
import { mockUsers } from '../data/mockData';

const SESSION_KEY = 'fisioflow_user_session';

export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = mockUsers.find(u => u.email === email);
      // In a real app, you would hash and compare the password
      if (user && password === 'password123') {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
        resolve(user);
      } else {
        reject(new Error('Credenciais inválidas.'));
      }
    }, 500);
  });
};

export const logout = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const getSession = (): User | null => {
  const userJson = sessionStorage.getItem(SESSION_KEY);
  if (userJson) {
    try {
      return JSON.parse(userJson) as User;
    } catch (error) {
      // JSON corrompido, limpar sessão inválida
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
  return null;
};