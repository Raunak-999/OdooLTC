import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail, validatePassword } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export function SignupForm({ onSuccess, onSwitchToLogin }: SignupFormProps) {
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    if (!validateEmail(data.email)) {
      form.setError('email', { message: 'Please enter a valid email address' });
      return;
    }

    if (!validatePassword(data.password)) {
      form.setError('password', { message: 'Password must be at least 6 characters' });
      return;
    }

    if (data.password !== data.confirmPassword) {
      form.setError('confirmPassword', { message: "Passwords don't match" });
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(data.email, data.password, data.displayName);
      
      toast({
        title: "Welcome to StackIt!",
        description: "Your account has been created successfully.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setLocation('/');
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      }

      toast({
        title: "Sign up failed",
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
        <Label htmlFor="displayName" className="text-sm font-medium text-gray-700 mb-2 block">
          Display Name
        </Label>
        <Input
          id="displayName"
          placeholder="Enter your display name"
          {...form.register('displayName')}
          className={form.formState.errors.displayName ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        />
        {form.formState.errors.displayName && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.displayName.message}</p>
        )}
      </div>

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

      <div>
        <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 mb-2 block">
          Confirm Password
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...form.register('confirmPassword')}
          className={form.formState.errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        />
        {form.formState.errors.confirmPassword && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Sign Up'}
      </Button>

      {onSwitchToLogin && (
        <div className="text-center">
          <span className="text-sm text-gray-500">Already have an account? </span>
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Sign in
          </button>
        </div>
      )}
    </form>
  );
}
