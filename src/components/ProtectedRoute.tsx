import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../../components/LoginPage';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} onBack={() => {}} />;
  }

  return <>{children}</>;
};
