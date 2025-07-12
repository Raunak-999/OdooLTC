import { useState, useEffect } from 'react';
import { Answer } from '@/types';
import { subscribeToAnswers } from '@/services/answers';

export function useAnswers(questionId: string | null) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) {
      setAnswers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToAnswers(questionId, (newAnswers) => {
      setAnswers(newAnswers);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, [questionId]);

  return { answers, loading, error };
}
