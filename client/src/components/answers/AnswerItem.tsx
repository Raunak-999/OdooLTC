import { CheckCircleIcon } from 'lucide-react';
import { Answer } from '@/types';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { formatTimeAgo, formatDateTime } from '@/utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnswerItemProps {
  answer: Answer;
  isAccepted?: boolean;
}

export function AnswerItem({ answer, isAccepted = false }: AnswerItemProps) {
  return (
    <div className={cn(
      "p-6 border border-gray-200 rounded-lg",
      isAccepted ? "bg-green-50 border-green-200" : "bg-white"
    )}>
      {isAccepted && (
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <Badge className="bg-green-100 text-green-700">Accepted Answer</Badge>
        </div>
      )}

      <div className="flex gap-6">
        {/* Vote Section */}
        <VoteButtons
          targetId={answer.id}
          targetType="answer"
          voteCount={answer.voteCount}
          className="flex-shrink-0"
        />

        {/* Answer Content */}
        <div className="flex-1">
          <div className="prose max-w-none mb-4">
            <div className="whitespace-pre-wrap text-body">{answer.content}</div>
          </div>

          {/* Author Info */}
          <div className="flex items-center space-x-3 p-3 bg-white rounded border">
            <Avatar className="h-8 w-8">
              <AvatarImage src={answer.authorPhotoURL} alt={answer.authorName || 'Anonymous'} />
              <AvatarFallback className="text-sm">
                {(answer.authorName || 'A').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-medium text-gray-900">{answer.authorName || 'Anonymous'}</div>
              <div className="text-xs text-gray-500">
                answered {formatDateTime(answer.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
