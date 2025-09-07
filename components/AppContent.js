
'use client';

import { useAuth } from './AuthProvider';
import LoginForm from './LoginForm';
import LibraryApp from './LibraryApp';
import LoadingSpinner from './LoadingSpinner';

export default function AppContent() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="loading">
        <LoadingSpinner size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <LibraryApp user={user} />;
}
