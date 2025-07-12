import { useQuestions } from '@/hooks/useQuestions';
import { QuestionCard } from './QuestionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { useMemo } from 'react';

interface QuestionListProps {
  searchQuery?: string;
  sortBy?: 'newest' | 'oldest' | 'most-voted' | 'most-answered' | 'unanswered';
}

export function QuestionList({ searchQuery, sortBy = 'newest' }: QuestionListProps) {
  const { questions, loading, error } = useQuestions();

  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = questions;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = questions.filter(question => 
        question.title.toLowerCase().includes(query) ||
        question.description.toLowerCase().includes(query) ||
        question.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortBy) {
      case 'oldest':
        sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most-voted':
        sorted.sort((a, b) => b.voteCount - a.voteCount);
        break;
      case 'most-answered':
        sorted.sort((a, b) => b.answerCount - a.answerCount);
        break;
      case 'unanswered':
        return sorted.filter(q => q.answerCount === 0);
      case 'newest':
      default:
        sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return sorted;
  }, [questions, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <div className="flex justify-between">
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-gray-500">
        <AlertCircle className="h-5 w-5 mr-2" />
        <span>Failed to load questions. Please try again.</span>
      </div>
    );
  }

  if (filteredAndSortedQuestions.length === 0) {
    if (searchQuery) {
      return (
        <div className="text-center p-8 text-gray-500">
          <h3 className="text-lg font-medium mb-2">No questions found</h3>
          <p>No questions match your search for "{searchQuery}"</p>
        </div>
      );
    }
    return (
      <div className="text-center p-8 text-gray-500">
        <h3 className="text-lg font-medium mb-2">No questions yet</h3>
        <p>Be the first to ask a question!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredAndSortedQuestions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}
