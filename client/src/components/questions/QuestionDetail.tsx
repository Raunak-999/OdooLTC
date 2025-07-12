import { BookmarkIcon, CheckCircleIcon } from 'lucide-react';
import { Question } from '@/types';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { formatTimeAgo, formatDateTime } from '@/utils/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';

interface QuestionDetailProps {
  question: Question;
}

export function QuestionDetail({ question }: QuestionDetailProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex gap-6">
        {/* Vote Section */}
        <VoteButtons
          targetId={question.id}
          targetType="question"
          voteCount={question.voteCount}
          size="lg"
          className="flex-shrink-0"
        />

        {/* Question Body */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-page-title text-gray-900 pr-8">{question.title}</h1>
            {question.isResolved && (
              <Badge className="bg-green-100 text-green-700 flex-shrink-0">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Resolved
              </Badge>
            )}
          </div>

          {/* Question Meta */}
          <div className="flex items-center space-x-4 mb-6 text-caption">
            <span>Asked {formatTimeAgo(question.createdAt)}</span>
            <span>Modified {formatTimeAgo(question.updatedAt)}</span>
            <span>Viewed {question.viewCount} times</span>
          </div>

          {/* Question Content */}
          <div className="prose max-w-none mb-6">
            <div className="whitespace-pre-wrap text-body">{question.description}</div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {question.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Author Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Avatar className="h-12 w-12">
                <AvatarImage src={question.authorPhotoURL} alt={question.authorName || 'Anonymous'} />
                <AvatarFallback className="text-lg">
                  {(question.authorName || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium text-gray-900">{question.authorName || 'Anonymous'}</div>
                <div className="text-xs text-gray-500">
                  asked {formatDateTime(question.createdAt)}
                </div>
              </div>
            </div>

            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-yellow-500">
              <BookmarkIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
