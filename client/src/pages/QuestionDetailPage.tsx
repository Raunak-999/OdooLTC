import { useParams } from 'wouter';
import { QuestionDetail } from '@/components/questions/QuestionDetail';
import { AnswerList } from '@/components/answers/AnswerList';
import { AnswerForm } from '@/components/answers/AnswerForm';
import { Layout } from '@/components/layout/Layout';
import { useQuestion } from '@/hooks/useQuestions';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

export default function QuestionDetailPage() {
  const params = useParams();
  const questionId = params.id as string;
  const { question, loading, error } = useQuestion(questionId);

  if (loading) {
    return (
      <Layout showSidebar={false}>
        <div className="space-y-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex gap-6">
              <div className="flex flex-col items-center space-y-2">
                <Skeleton className="h-10 w-10" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-10 w-10" />
              </div>
              <div className="flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-32 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-16 w-64" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !question) {
    return (
      <Layout showSidebar={false}>
        <div className="flex items-center justify-center p-8 text-gray-500">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>Question not found or failed to load.</span>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={false}>
      <div className="space-y-8">
        {/* Question Detail */}
        <QuestionDetail question={question} />

        {/* Answers Section */}
        <div className="border-t border-gray-200 pt-8">
          <AnswerList
            questionId={question.id}
            acceptedAnswerId={question.acceptedAnswerId}
          />
        </div>

        {/* Answer Form */}
        <div className="border-t border-gray-200 pt-8">
          <AnswerForm questionId={question.id} />
        </div>
      </div>
    </Layout>
  );
}
