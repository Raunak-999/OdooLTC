import { useState, useEffect } from 'react';
import { Question } from '@/types';
import { getQuestions, subscribeToQuestions, getQuestion, subscribeToQuestion } from '@/services/questions';

export function useQuestions(limit: number = 20) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToQuestions((newQuestions) => {
      setQuestions(newQuestions);
      setLoading(false);
      setError(null);
    }, limit);

    return unsubscribe;
  }, [limit]);

  return { questions, loading, error };
}

export function useQuestion(questionId: string | null) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!questionId) {
      setQuestion(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToQuestion(questionId, (newQuestion) => {
      setQuestion(newQuestion);
      setLoading(false);
      setError(newQuestion ? null : 'Question not found');
    });

    return unsubscribe;
  }, [questionId]);

  return { question, loading, error };
}
