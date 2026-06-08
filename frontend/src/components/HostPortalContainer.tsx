import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

export default function HostPortalContainer() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage on mount
    const saved = localStorage.getItem('adminToken');
    if (saved) setToken(saved);
    setIsLoading(false);
  }, []);

  const handleLogin = (newToken: string) => {
    localStorage.setItem('adminToken', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken(null);
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {!token ? (
        <AdminLogin onLoginSuccess={handleLogin} />
      ) : (
        <AdminDashboard token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}
