import { Link } from 'wouter';
import { MessageCircleIcon, EyeIcon, CheckCircleIcon } from 'lucide-react';
import { Question } from '@/types';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { formatTimeAgo, pluralize } from '@/utils/formatters';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface QuestionCardProps {
  question: Question;
}

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="question-card transition-all duration-200 hover:shadow-lg hover:border-blue-200 border border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Vote Section */}
          <VoteButtons
            targetId={question.id}
            targetType="question"
            voteCount={question.voteCount}
            className="flex-shrink-0"
          />

          {/* Question Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <Link href={`/questions/${question.id}`}>
                <h3 className="text-card-title text-gray-900 hover:text-blue-600 transition-colors font-semibold cursor-pointer">
                  {question.title}
                </h3>
              </Link>
              {question.isResolved && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 flex-shrink-0 ml-2">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Answered
                </Badge>
              )}
            </div>

            <p className="text-body text-gray-700 mb-4 line-clamp-2">
              {question.description}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {question.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = `/?search=${encodeURIComponent(tag)}`;
                  }}
                >
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Metadata */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-caption gap-2">
              <div className="flex items-center space-x-4">
                <span className="flex items-center space-x-1">
                  <MessageCircleIcon className="h-4 w-4" />
                  <span>{pluralize(question.answerCount, 'answer')}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <EyeIcon className="h-4 w-4" />
                  <span>{pluralize(question.viewCount, 'view')}</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={question.authorPhotoURL} alt={question.authorName || 'Anonymous'} />
                  <AvatarFallback className="text-xs">
                    {(question.authorName || 'A').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{question.authorName || 'Anonymous'}</span>
                <span>asked {formatTimeAgo(question.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
