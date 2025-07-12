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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const questionSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(255, 'Title must be less than 255 characters'),
  description: z.string(),
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
  // Add a state for the rich text editor
  const [editorValue, setEditorValue] = useState('');

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
    console.log('=== QUESTION SUBMISSION START ===');
    console.log('1. Form data received:', data);
    console.log('2. Tags state:', tags);
    console.log('3. User state:', {
      hasUser: !!user,
      userId: user?.uid,
      userName: user?.displayName,
      userEmail: user?.email
    });

    if (!user) {
      console.error('4. ERROR: User not authenticated');
      toast({
        title: "Authentication required",
        description: "You must be logged in to ask a question.",
        variant: "destructive",
      });
      return;
    }

    console.log('4. User authentication verified');

    // Validate form data
    console.log('5. Validating form data...');
    const validation = validateQuestion(data.title, editorValue, tags);
    if (!validation.isValid) {
      console.error('6. ERROR: Form validation failed:', validation.errors);
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

    console.log('6. Form validation passed');

    // Prepare question data
    console.log('7. Preparing question data...');
    const questionData = {
      title: data.title.trim(),
      description: editorValue,
      tags: tags,
      authorId: user.uid,
      authorName: user.displayName || user.email || 'Anonymous'
    };

    console.log('8. Question data prepared:', questionData);

    setIsSubmitting(true);
    
    try {
      console.log('9. Calling question creation service...');
      const questionId = await createQuestion(
        {
          title: data.title,
          description: editorValue,
          tags,
        },
        user.uid,
        user.displayName
      );

      console.log('10. Question created successfully with ID:', questionId);

      toast({
        title: "Question posted!",
        description: "Your question has been posted successfully.",
      });

      if (onSuccess) {
        console.log('11. Calling onSuccess callback');
        onSuccess();
      } else {
        console.log('11. Navigating to question detail page');
        setLocation(`/questions/${questionId}`);
      }

      console.log('=== QUESTION SUBMISSION SUCCESS ===');

    } catch (error: any) {
      console.error('=== QUESTION SUBMISSION ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
      console.error('Error stack:', error.stack);
      console.error('Full error object:', error);

      // Show specific error message
      let errorMessage = 'Failed to post your question. Please try again.';
      
      if (error.message) {
        if (error.message.includes('permission-denied')) {
          errorMessage = 'Permission denied. Please check your authentication.';
        } else if (error.message.includes('unavailable')) {
          errorMessage = 'Service temporarily unavailable. Please try again.';
        } else if (error.message.includes('not-found')) {
          errorMessage = 'Database not found. Please contact support.';
        } else {
          errorMessage = `Question creation failed: ${error.message}`;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      console.log('12. Form submission completed');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto bg-[var(--bg-secondary)] p-8 rounded-xl border border-[var(--border-default)] shadow-lg">
      {/* Title Field */}
      <div>
        <Label htmlFor="title" className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Be specific and imagine you're asking a question to another person"
          {...form.register('title')}
          className={form.formState.errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-white placeholder-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:ring-1 focus:ring-[var(--accent-blue)] rounded-lg'}
        />
        {form.formState.errors.title && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.title.message}</p>
        )}
        <p className="text-xs text-[var(--text-muted)] mt-1">10-255 characters. Be descriptive but concise.</p>
      </div>

      {/* Description Field */}
      <div>
        <Label htmlFor="description" className="text-sm font-medium text-[var(--text-primary)] mb-2 block">
          Description
        </Label>
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)] focus-within:border-[var(--accent-blue)] focus-within:ring-1 focus-within:ring-[var(--accent-blue)]">
          <ReactQuill
            value={editorValue}
            onChange={setEditorValue}
            theme="snow"
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ['bold', 'italic', 'underline', 'blockquote', 'code-block'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link'],
                ['clean']
              ]
            }}
            formats={['header', 'bold', 'italic', 'underline', 'blockquote', 'code-block', 'list', 'bullet', 'link']}
            className="dark-quill-editor min-h-[200px] text-white"
            style={{ background: 'transparent', color: 'white', minHeight: 200 }}
          />
        </div>
        {form.formState.errors.description && (
          <p className="text-red-600 text-sm mt-1">{form.formState.errors.description.message}</p>
        )}
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
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition-colors duration-200"
        >
          {isSubmitting ? 'Posting...' : 'Post Question'}
        </Button>
      </div>
    </form>
  );
}
