import { useAnswers } from '@/hooks/useAnswers';
import { AnswerItem } from './AnswerItem';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { pluralize } from '@/utils/formatters';

interface AnswerListProps {
  questionId: string;
  acceptedAnswerId?: string;
}

export function AnswerList({ questionId, acceptedAnswerId }: AnswerListProps) {
  const { answers, loading, error } = useAnswers(questionId);

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex gap-6">
              <div className="flex flex-col items-center space-y-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
              <div className="flex-1 space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-16 w-48" />
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
        <span>Failed to load answers. Please try again.</span>
      </div>
    );
  }

  if (answers.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <h3 className="text-lg font-medium mb-2">No answers yet</h3>
        <p>Be the first to answer this question!</p>
      </div>
    );
  }

  // Sort answers: accepted first, then by vote count
  const sortedAnswers = [...answers].sort((a, b) => {
    if (a.id === acceptedAnswerId) return -1;
    if (b.id === acceptedAnswerId) return 1;
    return b.voteCount - a.voteCount;
  });

  return (
    <div className="space-y-6">
      <h3 className="text-section-title text-gray-900">
        {pluralize(answers.length, 'Answer')}
      </h3>
      
      {sortedAnswers.map((answer) => (
        <AnswerItem
          key={answer.id}
          answer={answer}
          isAccepted={answer.id === acceptedAnswerId}
        />
      ))}
    </div>
  );
}
