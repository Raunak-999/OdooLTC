import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginUser } from '@/services/auth';
import { validateEmail, validatePassword } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToSignup }: LoginFormProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    if (!validateEmail(data.email)) {
      form.setError('email', { message: 'Please enter a valid email address' });
      return;
    }

    if (!validatePassword(data.password)) {
      form.setError('password', { message: 'Password must be at least 6 characters' });
      return;
    }

    setIsSubmitting(true);
    try {
      await loginUser(data.email, data.password);
      
      toast({
        title: "Welcome back!",
        description: "You have been successfully logged in.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setLocation('/');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in. Please try again.';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }

      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          {...form.register('email')}
          className={form.formState.errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        />
        {form.formState.errors.email && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="password" className="text-sm font-medium text-gray-700 mb-2 block">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          {...form.register('password')}
          className={form.formState.errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        />
        {form.formState.errors.password && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign In'}
      </Button>

      {onSwitchToSignup && (
        <div className="text-center">
          <span className="text-sm text-gray-500">Don't have an account? </span>
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Sign up
          </button>
        </div>
      )}
    </form>
  );
}
