

'use client';
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../contexts/AppContext';
import PageLoader from './ui/PageLoader';
import { Role } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: Role[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    // Use window.location for navigation as fallback
    window.location.href = '/login';
    return <PageLoader />;
  }
  
  if (!allowedRoles.includes(user!.role)) {
    // If user is logged in but tries to access a page they don't have permission for,
    // redirect them to their default dashboard.
    const defaultRoute = user!.role === Role.Patient ? '/portal/dashboard' : '/dashboard';
    window.location.href = defaultRoute;
    return <PageLoader />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;