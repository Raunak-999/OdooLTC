import { useLocation } from 'wouter';
import { QuestionForm } from '@/components/questions/QuestionForm';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AskQuestion() {
  const [, setLocation] = useLocation();

  const handleSuccess = () => {
    setLocation('/');
  };

  return (
    <ProtectedRoute>
      <Layout showSidebar={false}>
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                <h1 className="text-section-title text-gray-900">Ask a Question</h1>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <QuestionForm onSuccess={handleSuccess} />
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
