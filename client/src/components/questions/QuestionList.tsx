import { useQuestions } from '@/hooks/useQuestions';
import { QuestionCard } from './QuestionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export function QuestionList() {
  const { questions, loading, error } = useQuestions();

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

  if (questions.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <h3 className="text-lg font-medium mb-2">No questions yet</h3>
        <p>Be the first to ask a question!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question) => (
        <QuestionCard key={question.id} question={question} />
      ))}
    </div>
  );
}
