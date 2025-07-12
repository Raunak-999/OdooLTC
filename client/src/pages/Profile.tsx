import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, pluralize } from '@/utils/formatters';

export default function Profile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          {/* User Profile Header */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                  <AvatarFallback className="text-2xl">
                    {(user.displayName || 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-page-title text-gray-900">{user.displayName || 'User'}</h1>
                  <p className="text-caption">{user.email}</p>
                  
                  <div className="flex items-center space-x-4 mt-4">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {user.reputation} reputation
                    </Badge>
                    <span className="text-caption">
                      Member since {formatDate(user.createdAt)}
                    </span>
                  </div>

                  {user.bio && (
                    <p className="text-body text-gray-700 mt-4">{user.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Questions Asked</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {user.questionsAsked}
                </div>
                <p className="text-caption mt-1">
                  {pluralize(user.questionsAsked, 'question')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Answers Given</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {user.answersGiven}
                </div>
                <p className="text-caption mt-1">
                  {pluralize(user.answersGiven, 'answer')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-center">Reputation</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {user.reputation}
                </div>
                <p className="text-caption mt-1">reputation points</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
