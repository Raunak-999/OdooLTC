import { useState, useEffect } from 'react';
import { Vote } from '@/types';
import { getUserVote, castVote } from '@/services/votes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useVote(targetId: string, targetType: 'question' | 'answer') {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !targetId) {
      setUserVote(null);
      return;
    }

    getUserVote(user.uid, targetId).then(setUserVote);
  }, [user, targetId]);

  const vote = async (voteType: 1 | -1) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await castVote(user.uid, targetId, targetType, voteType);
      
      // Update local state optimistically
      if (userVote?.voteType === voteType) {
        // Remove vote
        setUserVote(null);
      } else {
        // Add or change vote
        setUserVote({
          id: userVote?.id || '',
          userId: user.uid,
          targetId,
          targetType,
          voteType,
          createdAt: new Date(),
        });
      }
      
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully.",
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    userVote,
    loading,
    upvote: () => vote(1),
    downvote: () => vote(-1),
  };
}
