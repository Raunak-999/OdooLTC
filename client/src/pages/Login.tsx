import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  
  // Check URL parameters to determine if signup or signin mode
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  const redirect = urlParams.get('redirect');
  const message = urlParams.get('message');
  const [isLogin, setIsLogin] = useState(mode !== 'signup');

  useEffect(() => {
    if (user) {
      // If user is authenticated and there's a redirect URL, go there
      if (redirect) {
        setLocation(redirect);
      } else {
        setLocation('/');
      }
    }
  }, [user, setLocation, redirect]);

  const handleSuccess = () => {
    // After successful login/signup, redirect to the intended destination
    if (redirect) {
      setLocation(redirect);
    } else {
      setLocation('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">
            <h2 className="text-section-title text-gray-900">
              {isLogin ? 'Sign In' : 'Sign Up'}
            </h2>
            {redirect && (
              <p className="text-sm text-gray-600 mt-2">
                {isLogin ? 'Sign in to continue' : 'Create an account to continue'}
              </p>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Show message if provided */}
          {message && (
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertDescription>
                {message}
              </AlertDescription>
            </Alert>
          )}
          
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
