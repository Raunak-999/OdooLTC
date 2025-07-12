import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { createQuestion } from '@/services/questions';
import { validateQuestion, validateTag } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  onSuccess?: () => void;
}

export function QuestionForm({ onSuccess }: QuestionFormProps) {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  const addTag = (tagName: string) => {
    const trimmedTag = tagName.trim().toLowerCase();
    if (!trimmedTag || tags.includes(trimmedTag) || tags.length >= 5) {
      return;
    }

    if (!validateTag(trimmedTag)) {
      toast({
        title: "Invalid tag",
        description: "Tags must be 2-20 characters and contain only letters, numbers, and hyphens.",
        variant: "destructive",
      });
      return;
    }

    setTags([...tags, trimmedTag]);
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const onSubmit = async (data: QuestionFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to ask a question.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateQuestion(data.title, data.description, tags);
    if (!validation.isValid) {
      Object.entries(validation.errors).forEach(([field, message]) => {
        if (field === 'tags') {
          toast({
            title: "Validation error",
            description: message,
            variant: "destructive",
          });
        }
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const questionId = await createQuestion(
        {
          title: data.title,
          description: data.description,
          tags,
        },
        user.uid,
        user.displayName
      );

      toast({
        title: "Question posted!",
        description: "Your question has been posted successfully.",
      });

      if (onSuccess) {
        onSuccess();
      } else {
        setLocation(`/questions/${questionId}`);
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: "Error",
        description: "Failed to post your question. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Title Field */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Be specific and imagine you're asking a question to another person"
          {...form.register('title')}
          className={form.formState.errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        />
        {form.formState.errors.title && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">10-255 characters. Be descriptive but concise.</p>
      </div>

      {/* Description Field */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
          Description
        </Label>
        <Textarea
          id="description"
          placeholder="Include all the information someone would need to answer your question"
          rows={8}
          {...form.register('description')}
          className={form.formState.errors.description ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
        />
        {form.formState.errors.description && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.description.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Minimum 50 characters. Include code examples, error messages, and what you've tried.
        </p>
      </div>

      {/* Tags Field */}
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">Tags</Label>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md min-h-10 focus-within:ring-2 focus-within:ring-primary-500">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <Input
              placeholder="Add a tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              className="flex-1 min-w-24 border-0 focus:ring-0 p-0 text-sm shadow-none"
              disabled={tags.length >= 5}
            />
          </div>
          <p className="text-xs text-gray-500">
            Add 1-5 tags to describe what your question is about. Press Enter to add a tag.
          </p>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          Review your question and make sure it's clear and specific.
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Question'}
        </Button>
      </div>
    </form>
  );
}
