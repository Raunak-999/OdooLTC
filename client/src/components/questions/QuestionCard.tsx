import { Link } from 'wouter';
import { MessageCircleIcon, EyeIcon, CheckCircleIcon } from 'lucide-react';
import { Question } from '@/types';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { formatTimeAgo, pluralize } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface QuestionCardProps {
  question: Question;
}

function safeDateConversion(dateValue: any): Date {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (dateValue && typeof dateValue.toDate === 'function') return dateValue.toDate();
  try { return new Date(dateValue); } catch { return new Date(); }
}

function isValidQuestion(question: any): question is Question {
  return question && typeof question === 'object' && typeof question.id === 'string' && typeof question.title === 'string';
}

// Status badge helper
function getQuestionStatus(question: Question) {
  if (question.isResolved || question.acceptedAnswerId) {
    return {
      type: 'answered',
      label: 'Answered',
      icon: (
        <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-green-900/30',
      borderColor: 'border-green-600',
      textColor: 'text-green-400',
    };
  }
  if (question.answerCount > 0) {
    return {
      type: 'pending',
      label: 'Pending',
      icon: (
        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      bgColor: 'bg-yellow-900/30',
      borderColor: 'border-yellow-600',
      textColor: 'text-yellow-400',
    };
  }
  return {
    type: 'unanswered',
    label: 'Unanswered',
    icon: (
      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
      </svg>
    ),
    bgColor: 'bg-gray-800',
    borderColor: 'border-gray-600',
    textColor: 'text-gray-400',
  };
}

function QuestionStatusBadge({ question }: { question: Question }) {
  const status = getQuestionStatus(question);
  return (
    <div className={`flex items-center space-x-1 px-2 py-1 ${status.bgColor} ${status.borderColor} border rounded-md ml-2`}>
      {status.icon}
      <span className={`text-xs font-medium ${status.textColor}`}>{status.label}</span>
    </div>
  );
}

export function QuestionCard({ question }: QuestionCardProps) {
  if (!isValidQuestion(question)) {
    console.warn('Invalid question object passed to QuestionCard:', question);
    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-6 text-red-300 text-center">
        <p>Unable to display question - invalid data</p>
      </div>
    );
  }

  const {
    id = '',
    title = 'Untitled Question',
    description = 'No description available',
    tags = [],
    authorName = 'Anonymous',
    authorPhotoURL,
    voteCount = 0,
    answerCount = 0,
    viewCount = 0,
    isResolved = false,
    createdAt
  } = question;

  const safeCreatedAt = safeDateConversion(createdAt);
  const safeTags = Array.isArray(tags) ? tags : [];
  const safeVoteCount = typeof voteCount === 'number' ? voteCount : 0;
  const safeAnswerCount = typeof answerCount === 'number' ? answerCount : 0;
  const safeViewCount = typeof viewCount === 'number' ? viewCount : 0;
  const displayTitle = title.length > 100 ? `${title.substring(0, 100)}...` : title;
  const displayDescription = description.length > 200 ? `${description.substring(0, 200)}...` : description;

  return (
    <div
      className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-200 hover:border-[var(--accent-blue)] mb-8"
      style={{ boxShadow: 'var(--shadow-default)' }}
    >
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Vote Section */}
        <div className="flex flex-col items-center space-y-2 mr-8 bg-[var(--bg-tertiary)] rounded-lg p-4 border border-[var(--border-default)] shadow-sm">
          <VoteButtons
            targetId={id}
            targetType="question"
            voteCount={safeVoteCount}
            className=""
            size="lg"
          />
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-start justify-between mb-2">
            <Link href={`/questions/${id}`}>
              <h3 className="text-xl font-bold leading-7 text-white hover:text-[var(--accent-blue)] transition-colors cursor-pointer underline-offset-4 hover:underline">
                {displayTitle}
              </h3>
            </Link>
            {/* Status badge replaces old isResolved badge */}
            <QuestionStatusBadge question={question} />
          </div>

          <div
            className="text-gray-300 text-base leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{ __html: displayDescription }}
          />

          {/* Tags */}
          {safeTags.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
              {safeTags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="px-3 py-1 bg-blue-900 text-blue-200 text-xs font-medium rounded-full border border-blue-800 cursor-pointer hover:bg-blue-800 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/?search=${encodeURIComponent(tag)}`;
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-6 text-xs gap-2">
            <div className="flex items-center space-x-6">
              <Link href={`/questions/${id}`}>
                <span className="flex items-center space-x-1 text-[var(--text-muted)] hover:text-blue-400 cursor-pointer transition-colors">
                  <MessageCircleIcon className="h-4 w-4" />
                  <span>{pluralize(safeAnswerCount, 'answer')}</span>
                </span>
              </Link>
              <Link href={`/questions/${id}`}>
                <span className="flex items-center space-x-1 text-[var(--text-muted)] hover:text-blue-400 cursor-pointer transition-colors">
                  <EyeIcon className="h-4 w-4" />
                  <span>{pluralize(safeViewCount, 'view')}</span>
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Avatar className="h-6 w-6 border border-[var(--border-default)]">
                <AvatarImage src={authorPhotoURL} alt={authorName} />
                <AvatarFallback className="text-xs bg-gray-700 text-white">
                  {authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-[var(--accent-blue)]">{authorName}</span>
              <span>•</span>
              <span className="text-xs text-[var(--text-muted)]">asked {formatTimeAgo(safeCreatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
