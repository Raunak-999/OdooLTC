import { useState } from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  const handleSuccess = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <h2 className="text-section-title text-gray-900">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h2>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={() => setIsLogin(false)}
            />
          ) : (
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setIsLogin(true)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
