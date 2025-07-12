import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionList } from '@/components/questions/QuestionList';
import { Layout } from '@/components/layout/Layout';
import { useQuestions } from '@/hooks/useQuestions';
import { pluralize } from '@/utils/formatters';

export default function Home() {
  const { questions } = useQuestions();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-voted' | 'most-answered' | 'unanswered'>('newest');
  
  // Get search query from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get('search') || undefined;

  return (
    <Layout>
      {/* Questions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-page-title text-gray-900">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Questions'}
          </h1>
          <p className="text-caption mt-1">
            {searchQuery ? `Questions matching your search` : pluralize(questions.length, 'question')}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="most-voted">Most Voted</SelectItem>
              <SelectItem value="most-answered">Most Answered</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions List */}
      <QuestionList searchQuery={searchQuery} sortBy={sortBy} />
    </Layout>
  );
}
