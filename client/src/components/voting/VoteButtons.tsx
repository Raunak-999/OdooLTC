import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { useVote } from '@/hooks/useVotes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  targetId: string;
  targetType: 'question' | 'answer';
  voteCount: number;
  className?: string;
  size?: 'sm' | 'lg';
}

export function VoteButtons({ 
  targetId, 
  targetType, 
  voteCount, 
  className,
  size = 'sm'
}: VoteButtonsProps) {
  const { userVote, loading, upvote, downvote } = useVote(targetId, targetType);

  const buttonSize = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  return (
    <div className={cn("flex flex-col items-center space-y-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "vote-button p-1 rounded-md hover:bg-gray-100 transition-all border border-gray-200",
          buttonSize,
          userVote?.voteType === 1 && "text-green-600 bg-green-50 border-green-200"
        )}
        onClick={upvote}
        disabled={loading}
      >
        <ChevronUpIcon 
          className={cn(
            iconSize,
            userVote?.voteType === 1 ? "text-green-600" : "text-gray-600 hover:text-green-600"
          )} 
        />
      </Button>
      
      <span className={cn(
        "font-bold text-gray-900 min-w-8 text-center py-1",
        size === 'lg' ? "text-2xl" : "text-lg"
      )}>
        {voteCount}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "vote-button p-1 rounded-md hover:bg-gray-100 transition-all border border-gray-200",
          buttonSize,
          userVote?.voteType === -1 && "text-red-600 bg-red-50 border-red-200"
        )}
        onClick={downvote}
        disabled={loading}
      >
        <ChevronDownIcon 
          className={cn(
            iconSize,
            userVote?.voteType === -1 ? "text-red-600" : "text-gray-600 hover:text-red-600"
          )} 
        />
      </Button>
    </div>
  );
}
