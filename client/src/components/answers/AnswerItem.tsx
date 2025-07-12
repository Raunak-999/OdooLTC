import { CheckCircleIcon } from 'lucide-react';
import { Answer } from '@/types';
import { VoteButtons } from '@/components/voting/VoteButtons';
import { formatTimeAgo, formatDateTime } from '@/utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { acceptAnswer } from '@/services/answers';
import { useToast } from '@/hooks/use-toast';

interface AnswerItemProps {
  answer: Answer;
  isAccepted?: boolean;
  questionAuthorId?: string;
  questionId?: string;
  onAccept?: () => void;
}

export function AnswerItem({ 
  answer, 
  isAccepted = false, 
  questionAuthorId,
  questionId,
  onAccept 
}: AnswerItemProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  
  console.log('💬 AnswerItem:', {
    answerId: answer.id,
    isAccepted,
    questionAuthorId,
    currentUserId: user?.uid,
    canAccept: user?.uid === questionAuthorId && !isAccepted
  });

  const handleAcceptAnswer = async () => {
    if (!user || !questionId || !answer.id) {
      console.error('💬 AnswerItem: Cannot accept answer - missing data');
      return;
    }

    if (user.uid !== questionAuthorId) {
      console.error('💬 AnswerItem: User is not question author');
      return;
    }

    try {
      console.log('💬 AnswerItem: Accepting answer:', answer.id);
      await acceptAnswer(answer.id, questionId);
      
      toast({
        title: "Answer accepted!",
        description: "This answer has been marked as the accepted solution.",
      });

      if (onAccept) {
        onAccept();
      }
    } catch (error) {
      console.error('💬 AnswerItem: Error accepting answer:', error);
      toast({
        title: "Error",
        description: "Failed to accept the answer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const canAccept = user?.uid === questionAuthorId && !isAccepted;

  return (
    <div className={cn(
      "bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6 transition-all duration-200",
      isAccepted ? "ring-2 ring-green-700" : ""
    )}>
      {isAccepted && (
        <div className="flex items-center space-x-2 mb-4">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <Badge className="bg-green-900 text-green-400 border border-green-700">Accepted Answer</Badge>
        </div>
      )}

      <div className="flex gap-4">
        {/* Vote Section */}
        <div className="flex flex-col items-center w-8 mr-3">
          <VoteButtons
            targetId={answer.id}
            targetType="answer"
            voteCount={answer.voteCount}
            className=""
            size="sm"
          />
        </div>
        {/* Answer Content */}
        <div className="flex-1">
          <div className="text-gray-300 text-base leading-relaxed mb-4">
            <div className="whitespace-pre-wrap">{answer.content}</div>
          </div>
          {/* Author Info and Actions */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{answer.authorName || 'Anonymous'}</span>
              <span>•</span>
              <span>answered {formatDateTime(answer.createdAt)}</span>
            </div>
            {/* Accept Button - Only show to question author if not already accepted */}
            {canAccept && (
              <button
                onClick={handleAcceptAnswer}
                className="flex items-center space-x-2 px-3 py-1 border border-green-600 text-green-400 bg-green-900/20 rounded-lg hover:bg-green-900/30 transition-colors"
              >
                <CheckCircleIcon className="h-4 w-4" />
                <span>Accept Answer</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
