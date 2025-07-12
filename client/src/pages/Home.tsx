import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionList } from '@/components/questions/QuestionList';
import { Layout } from '@/components/layout/Layout';
import { useQuestions } from '@/hooks/useQuestions';
import { pluralize } from '@/utils/formatters';
import { Pagination } from '@/components/Pagination';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search } from 'lucide-react';

export default function Home() {
  const [location] = useLocation();
  const { questions } = useQuestions();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'most-voted' | 'most-answered' | 'unanswered'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;

  // Get search query from URL using wouter location
  const urlParams = new URLSearchParams(location.split('?')[1]);
  const searchQuery = urlParams.get('search') || undefined;
  const isSearching = !!searchQuery;

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Filter and sort questions (reuse logic from QuestionList)
  let filteredQuestions = questions;
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filteredQuestions = questions.filter(question => 
      question.title.toLowerCase().includes(query) ||
      question.description.toLowerCase().includes(query) ||
      question.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  let sortedQuestions = [...filteredQuestions];
  switch (sortBy) {
    case 'oldest':
      sortedQuestions.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'most-voted':
      sortedQuestions.sort((a, b) => b.voteCount - a.voteCount);
      break;
    case 'most-answered':
      sortedQuestions.sort((a, b) => b.answerCount - a.answerCount);
      break;
    case 'unanswered':
      sortedQuestions = sortedQuestions.filter(q => q.answerCount === 0);
      break;
    case 'newest':
    default:
      sortedQuestions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const totalPages = Math.ceil(sortedQuestions.length / questionsPerPage) || 1;
  const startIndex = (currentPage - 1) * questionsPerPage;
  const paginatedQuestions = sortedQuestions.slice(startIndex, startIndex + questionsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.replaceState({}, '', '/');
    // Use wouter navigation to home
    window.location.href = '/';
  };

  return (
    <Layout>
      {/* Search Results Header */}
      {isSearching && (
        <div className="mb-6">
          {/* Back to All Questions Button */}
          <Button
            onClick={handleClearSearch}
            variant="ghost"
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Questions</span>
          </Button>
          
          {/* Search Results Header */}
          <div className="flex items-center space-x-3 mb-2">
            <Search className="w-6 h-6 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">
              Search Results for "{searchQuery}"
            </h1>
          </div>
          
          <p className="text-gray-400">
            {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} matching your search
          </p>
        </div>
      )}

      {/* Regular Questions Header */}
      {!isSearching && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 mt-2">
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-[var(--text-primary)] leading-tight">
              <span className="inline-block text-2xl">📝</span>
              All Questions
            </h1>
            <p className="text-base text-[var(--text-muted)] mt-2 font-medium">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
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
      )}

      {/* Questions List */}
      <QuestionList questions={paginatedQuestions} />

      {/* Show message if no search results */}
      {isSearching && filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No questions found</div>
          <p className="text-gray-500 mb-4">Try adjusting your search terms</p>
          <Button onClick={handleClearSearch} variant="outline">
            Back to All Questions
          </Button>
        </div>
      )}

      {/* Pagination - hide during search or show for search results */}
      {(!isSearching || filteredQuestions.length > 0) && (
        <div className="flex justify-center items-center mt-8 mb-8">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </Layout>
  );
}
