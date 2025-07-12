import { useState, useEffect } from 'react';
import { Vote } from '@/types';
import { getUserVote, castVote } from '@/services/votes';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useVote(targetId: string, targetType: 'question' | 'answer', initialVoteCount: number) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<Vote | null>(null);
  const [userVoteType, setUserVoteType] = useState<1 | -1 | null>(null);
  const [voteCount, setVoteCount] = useState<number>(initialVoteCount);
  const [loading, setLoading] = useState(false);

  // Fetch user vote and set state
  useEffect(() => {
    if (!user || !targetId) {
      setUserVote(null);
      setUserVoteType(null);
      return;
    }
    getUserVote(user.uid, targetId)
      .then(vote => {
        setUserVote(vote);
        setUserVoteType(vote ? vote.voteType : null);
      })
      .catch(() => {
        setUserVote(null);
        setUserVoteType(null);
      });
  }, [user, targetId]);

  // Real-time subscription to vote changes
  useEffect(() => {
    if (!user || !targetId) return;
    const voteQuery = doc(db, 'votes', `${user.uid}_${targetId}`);
    const unsubscribe = onSnapshot(voteQuery, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setUserVote({
          id: doc.id,
          ...data,
          createdAt: new Date(data.createdAt?.toDate?.() || data.createdAt),
        } as Vote);
        setUserVoteType(data.voteType);
      } else {
        setUserVote(null);
        setUserVoteType(null);
      }
    });
    return () => unsubscribe();
  }, [user, targetId]);

  // Helper to calculate vote delta
  const calculateVoteDelta = (currentVote: 1 | -1 | null, newVote: 1 | -1 | null) => {
    return (newVote ?? 0) - (currentVote ?? 0);
  };

  // Main vote handler
  const handleVote = async (clickedVoteType: 1 | -1) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote.",
        variant: "destructive",
      });
      return;
    }
    const currentVote = userVoteType;
    let newVoteType: 1 | -1 | null;
    if (currentVote === clickedVoteType) {
      newVoteType = null; // Remove vote
    } else {
      newVoteType = clickedVoteType; // New or changed vote
    }
    const voteDelta = calculateVoteDelta(currentVote, newVoteType);
    // Optimistically update UI
    setUserVoteType(newVoteType);
    setVoteCount(prev => prev + voteDelta);
    setLoading(true);
    try {
      await castVote(user.uid, targetId, targetType, newVoteType ?? clickedVoteType);
      toast({
        title: "Vote recorded",
        description: "Your vote has been recorded successfully.",
      });
    } catch (error) {
      // Revert UI on error
      setUserVoteType(currentVote);
      setVoteCount(prev => prev - voteDelta);
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
    userVoteType, // 1, -1, or null
    voteCount,
    loading,
    handleVote,
  };
}
