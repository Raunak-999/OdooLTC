import { useRoute } from 'wouter';
import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Layout } from '@/components/layout/Layout';
import { getQuestion } from '@/services/questions';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatTimeAgo } from '@/utils/formatters';
import { Question } from '@/types';
import { AnswerList } from '@/components/answers/AnswerList';
import { AnswerForm } from '@/components/answers/AnswerForm';

function BreadcrumbNav({ questionTitle }: { questionTitle?: string }) {
  const truncatedTitle = questionTitle
    ? questionTitle.length > 50
      ? questionTitle.substring(0, 50) + '...'
      : questionTitle
    : 'Loading...';
  return (
    <nav className="bg-gray-900 border-b border-gray-700 px-6 py-3 mb-8">
      <div className="max-w-4xl mx-auto flex items-center space-x-2 text-sm">
        <Link href="/">
          <span className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors">Questions</span>
        </Link>
        <span className="text-gray-500">&gt;</span>
        <span className="text-gray-300 truncate max-w-md">{truncatedTitle}</span>
      </div>
    </nav>
  );
}

export default function QuestionDetailPage() {
  // Get the question ID from the URL
  const [match, params] = useRoute('/questions/:id');
  const questionId = params?.id;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshAnswers, setRefreshAnswers] = useState(0);

  useEffect(() => {
    if (!questionId) return;
    setLoading(true);
    getQuestion(questionId)
      .then((q: Question | null) => {
        setQuestion(q);
        setLoading(false);
      })
      .catch(err => {
        setError('Question not found or failed to load.');
        setLoading(false);
      });
  }, [questionId, refreshAnswers]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Layout showSidebar={false}>
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav questionTitle={question?.title} />
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Main Question Display */}
          <div className="mb-8 bg-gray-900 border border-gray-700 rounded-lg p-8 text-white">
            {loading ? (
              <div className="text-gray-400">Loading question...</div>
            ) : error ? (
              <div className="text-red-400">{error}</div>
            ) : question ? (
              <div className="flex gap-6">
                {/* Vote Section */}
                <div className="flex flex-col items-center space-y-2 mr-8 bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-default)] shadow-sm">
                  <VoteButtons
                    targetId={question.id}
                    targetType="question"
                    voteCount={question.voteCount}
                    className=""
                    size="lg"
                  />
                </div>
                {/* Question Content */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white mb-6 leading-tight">{question.title}</h1>
                  <div className="text-gray-300 text-base leading-relaxed mb-6">
                    <div dangerouslySetInnerHTML={{ __html: question.description }} />
                  </div>
                  {/* Tags */}
                  {question.tags && question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {question.tags.map((tag: string, index: number) => (
                        <span
                          key={`${tag}-${index}`}
                          className="px-3 py-1 bg-blue-900 text-blue-200 text-xs font-medium rounded-full border border-blue-800 cursor-pointer hover:bg-blue-800 transition-colors"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6 border border-[var(--border-default)]">
                        <AvatarImage src={question.authorPhotoURL} alt={question.authorName} />
                        <AvatarFallback className="text-xs bg-gray-700 text-white">
                          {question.authorName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-blue-400">{question.authorName}</span>
                      <span>•</span>
                      <span>asked {formatTimeAgo(question.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span>👁 {question.viewCount || 0} views</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
          {/* Answers List */}
          <div className="mb-8 bg-gray-900 border border-gray-700 rounded-lg p-8 text-white">
            {question && (
              <AnswerList 
                questionId={question.id} 
                acceptedAnswerId={question.acceptedAnswerId}
                question={question}
                onAnswerAccepted={() => setRefreshAnswers(r => r + 1)}
              />
            )}
          </div>
          {/* Answer Submission Form */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 text-white">
            {question && (
              <>
                <h3 className="text-lg font-semibold text-white mb-4">Submit Your Answer</h3>
                <AnswerForm questionId={question.id} onSuccess={() => setRefreshAnswers(r => r + 1)} />
              </>
            )}
          </div>
        </div>
      </Layout>
    </div>
  );
}
