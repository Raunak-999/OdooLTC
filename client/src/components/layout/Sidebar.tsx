import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuestions } from '@/hooks/useQuestions';

export function Sidebar() {
  const { questions } = useQuestions();

  // Calculate stats from questions
  const totalQuestions = questions.length;
  const totalAnswers = questions.reduce((sum, q) => sum + q.answerCount, 0);
  const resolvedQuestions = questions.filter(q => q.isResolved).length;

  // Extract popular tags
  const tagCounts: { [key: string]: number } = {};
  questions.forEach(question => {
    question.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  const popularTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([tag]) => tag);

  return (
    <aside className="lg:w-64 flex-shrink-0 space-y-6 bg-[var(--bg-tertiary)] p-6 rounded-xl shadow-md border border-[var(--border-default)]">
      {/* Quick Stats */}
      <div className="bg-[var(--bg-secondary)] rounded-lg shadow p-4 border border-[var(--border-default)]">
        <div className="text-lg font-semibold text-white mb-3">Quick Stats</div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Questions</span>
            <span className="text-sm font-medium text-white">{totalQuestions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Answers</span>
            <span className="text-sm font-medium text-white">{totalAnswers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--text-muted)]">Resolved</span>
            <span className="text-sm font-medium text-white">{resolvedQuestions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Popular Tags */}
      <div className="bg-[var(--bg-secondary)] rounded-lg shadow p-4 border border-[var(--border-default)]">
        <div className="text-lg font-semibold text-white mb-3">Popular Tags</div>
        <div className="flex flex-wrap gap-2">
          {popularTags.length > 0 ? (
            popularTags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-blue-900 text-blue-200 text-xs font-medium rounded-full border border-blue-800 cursor-pointer hover:bg-blue-800 transition-colors"
                onClick={() => {
                  window.location.href = `/?search=${encodeURIComponent(tag)}`;
                }}
              >
                {tag}
              </span>
            ))
          ) : (
            <div className="text-sm text-[var(--text-muted)]">No tags yet</div>
          )}
        </div>
      </div>
    </aside>
  );
}
