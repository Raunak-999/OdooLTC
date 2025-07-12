import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuestionList } from '@/components/questions/QuestionList';
import { Layout } from '@/components/layout/Layout';
import { useQuestions } from '@/hooks/useQuestions';
import { pluralize } from '@/utils/formatters';

export default function Home() {
  const { questions } = useQuestions();

  return (
    <Layout>
      {/* Questions Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-page-title text-gray-900">All Questions</h1>
          <p className="text-caption mt-1">
            {pluralize(questions.length, 'question')}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Select defaultValue="newest">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="votes">Most Votes</SelectItem>
              <SelectItem value="unanswered">Unanswered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Questions List */}
      <QuestionList />
    </Layout>
  );
}
