import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { createAnswer } from '@/services/answers';
import { validateAnswer } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

const answerSchema = z.object({
  content: z.string().min(10, 'Answer must be at least 10 characters'),
});

type AnswerFormData = z.infer<typeof answerSchema>;

interface AnswerFormProps {
  questionId: string;
  onSuccess?: () => void;
}

export function AnswerForm({ questionId, onSuccess }: AnswerFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AnswerFormData>({
    resolver: zodResolver(answerSchema),
    defaultValues: {
      content: '',
    },
  });

  const onSubmit = async (data: AnswerFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post an answer.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateAnswer(data.content);
    if (!validation.isValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createAnswer(
        {
          content: data.content,
          questionId,
        },
        user.uid,
        user.displayName
      );

      toast({
        title: "Answer posted!",
        description: "Your answer has been posted successfully.",
      });

      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating answer:', error);
      toast({
        title: "Error",
        description: "Failed to post your answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">You must be logged in to post an answer.</p>
        <Button variant="outline">Sign In</Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Your Answer</h4>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-4">
          <Label htmlFor="content" className="sr-only">Answer content</Label>
          <Textarea
            id="content"
            placeholder="Write your answer here..."
            rows={8}
            {...form.register('content')}
            className={`resize-vertical ${form.formState.errors.content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}`}
          />
          {form.formState.errors.content && (
            <p className="text-red-600 text-sm mt-1">{form.formState.errors.content.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Minimum 10 characters required</p>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            <span>{form.watch('content')?.length || 0} characters</span>
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Your Answer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
