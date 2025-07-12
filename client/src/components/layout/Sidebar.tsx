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
    <aside className="lg:w-64 flex-shrink-0 space-y-6">
      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-section-title text-gray-900">Quick Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-caption">Questions</span>
            <span className="text-sm font-medium">{totalQuestions.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption">Answers</span>
            <span className="text-sm font-medium">{totalAnswers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-caption">Resolved</span>
            <span className="text-sm font-medium">{resolvedQuestions.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Popular Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="text-section-title text-gray-900">Popular Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {popularTags.length > 0 ? (
              popularTags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors"
                >
                  {tag}
                </Badge>
              ))
            ) : (
              <div className="text-sm text-gray-500">No tags yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
