import { ChevronUpIcon, ChevronDownIcon } from 'lucide-react';
import { useVote } from '@/hooks/useVotes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import React, { useState } from 'react';

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
  const { user } = useAuth();
  // Use the new useVote API with three-state logic
  const { userVoteType, voteCount: liveVoteCount, loading, handleVote } = useVote(targetId, targetType, voteCount);
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState('');

  const buttonSize = size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  const iconSize = size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';

  
  console.log('🗳️ VoteButtons:', {
    targetId,
    targetType,
    voteCount,
    userVoteType,
    liveVoteCount,
    loading,
    hasUser: !!user,
    userId: user?.uid
  });

  // Unified vote handler for upvote/downvote
  const onVote = async (voteType: 1 | -1) => {
    setError('');
    setIsVoting(true);
    try {
      await handleVote(voteType);
    } catch (error: any) {
      setError(`Failed to record your vote: ${error.message}`);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={cn(
      "flex flex-col items-center w-8 space-y-1",
      className
    )}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-6 h-6 p-1 border border-gray-600 bg-gray-800 rounded-sm flex items-center justify-center transition-colors duration-100",
          userVoteType === 1
            ? "border-green-500 bg-green-900/20 text-green-400"
            : "hover:border-green-500 hover:bg-green-900/20 text-gray-400",
          "focus:outline-none"
        )}
        onClick={() => onVote(1)}
        disabled={loading || isVoting}
        title="Upvote"
        style={{ borderRadius: 2 }}
      >
        <ChevronUpIcon 
          className={cn(
            "w-3 h-3",
            userVoteType === 1 ? "text-green-400" : "text-gray-400 group-hover:text-green-300"
          )} 
        />
      </Button>
      <span className="text-xs font-medium text-gray-300 py-0.5 min-w-0 text-center select-none">
        {liveVoteCount}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "w-6 h-6 p-1 border border-gray-600 bg-gray-800 rounded-sm flex items-center justify-center transition-colors duration-100",
          userVoteType === -1
            ? "border-red-500 bg-red-900/20 text-red-400"
            : "hover:border-red-500 hover:bg-red-900/20 text-gray-400",
          "focus:outline-none"
        )}
        onClick={() => onVote(-1)}
        disabled={loading || isVoting}
        title="Downvote"
        style={{ borderRadius: 2 }}
      >
        <ChevronDownIcon 
          className={cn(
            "w-3 h-3",
            userVoteType === -1 ? "text-red-400" : "text-gray-400 group-hover:text-red-300"
          )} 
        />
      </Button>
      {error && (
        <div className="text-xs text-red-400 mt-1">{error}</div>
      )}
    </div>
  );
}
