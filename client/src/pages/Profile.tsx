import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileTextIcon, MessageSquareIcon, SettingsIcon, UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, pluralize } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';
import { useQuestions } from '@/hooks/useQuestions';
import { useAnswers } from '@/hooks/useAnswers';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { questions = [] } = useQuestions(100);
  // We'll fetch all answers and filter by user
  const [allAnswers, setAllAnswers] = useState<any[]>([]);
  useEffect(() => {
    // Fetch all answers for all questions
    // Here, we just simulate with empty for now or you can implement a real fetch
    setAllAnswers([]); // TODO: Replace with real fetch if available
  }, []);

  // Get tab from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const tabParam = urlParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam || 'overview');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without page reload
    const newUrl = value === 'overview' ? '/profile' : `/profile?tab=${value}`;
    setLocation(newUrl);
  };

  if (!user) {
    return null;
  }

  // Filter questions and answers by user
  const userQuestions = questions.filter(q => q.authorId === user.uid);
  const userAnswers = allAnswers.filter(a => a.authorId === user.uid);

  // Enhanced Profile Header
  const ProfileHeader = () => (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-8 mb-6">
      <div className="flex items-start space-x-6">
        {/* User Avatar - Enhanced */}
        <div className="relative">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-blue-500">
            {user.displayName?.charAt(0) || 'R'}
          </div>
          {/* Online status indicator */}
          <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900"></div>
        </div>
        {/* User Info - Expanded */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white mb-2">{user.displayName || user.email?.split('@')[0]}</h1>
          <p className="text-gray-400 mb-4">{user.email}</p>
          {/* User Stats Row */}
          <div className="flex items-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-900 text-blue-200 text-sm font-medium rounded-full">
                {user.reputation || 0} reputation
              </span>
            </div>
            <div className="text-gray-400 text-sm">
              Member since {formatDate(user.createdAt)}
            </div>
            <div className="text-gray-400 text-sm">
              Last seen today
            </div>
          </div>
          {/* Quick Stats Badges */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 px-3 py-1 bg-green-900/30 border border-green-600 rounded-md">
              <span className="text-green-400 text-sm">📝</span>
              <span className="text-green-400 text-sm font-medium">{userQuestions.length} Questions</span>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1 bg-blue-900/30 border border-blue-600 rounded-md">
              <span className="text-blue-400 text-sm">💬</span>
              <span className="text-blue-400 text-sm font-medium">{userAnswers.length} Answers</span>
            </div>
            <div className="flex items-center space-x-1 px-3 py-1 bg-purple-900/30 border border-purple-600 rounded-md">
              <span className="text-purple-400 text-sm">✓</span>
              <span className="text-purple-400 text-sm font-medium">0 Accepted</span>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 rounded-lg transition-colors">
            Share Profile
          </button>
        </div>
      </div>
    </div>
  );

  // Enhanced Tab Navigation
  const ProfileTabs = () => (
    <div className="flex space-x-1 mb-8 bg-gray-800 p-1 rounded-lg">
      {[
        { id: 'overview', label: 'Overview', icon: '👤', count: null },
        { id: 'questions', label: 'My Questions', icon: '📝', count: userQuestions.length },
        { id: 'answers', label: 'My Answers', icon: '💬', count: userAnswers.length },
        { id: 'settings', label: 'Settings', icon: '⚙️', count: null }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={`flex items-center space-x-2 px-4 py-3 rounded-md transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <span>{tab.icon}</span>
          <span className="font-medium">{tab.label}</span>
          {tab.count !== null && (
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              activeTab === tab.id ? 'bg-blue-500' : 'bg-gray-600'
            }`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  // My Questions Tab
  const MyQuestionsTab = () => {
    if (!userQuestions || userQuestions.length === 0) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-white mb-2">No questions yet</h3>
          <p className="text-gray-400 mb-6">Start by asking your first question to the community!</p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors" onClick={() => setLocation('/ask')}>
            Ask Your First Question
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">My Questions ({userQuestions.length})</h2>
        </div>
        {userQuestions.map(question => (
          <div key={question.id} className="bg-gray-900 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-bold text-white mb-2">{question.title}</h3>
            <p className="text-gray-400 mb-2">{question.description}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-blue-400">{question.answerCount} Answers</span>
              <span className="text-gray-400">{formatDate(question.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // My Answers Tab (placeholder, as we don't have real answer data here)
  const MyAnswersTab = () => {
    if (!userAnswers || userAnswers.length === 0) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-12 text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No answers yet</h3>
          <p className="text-gray-400 mb-6">Start by answering questions to help the community!</p>
        </div>
      );
    }
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">My Answers ({userAnswers.length})</h2>
        </div>
        {/* Render answer cards here if available */}
      </div>
    );
  };

  // Overview Tab (dashboard cards)
  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Questions</h3>
            <span className="text-2xl">📝</span>
          </div>
          <div className="text-3xl font-bold text-green-400 mb-2">{userQuestions.length}</div>
          <div className="text-sm text-gray-400">Total questions asked</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Answers</h3>
            <span className="text-2xl">💬</span>
          </div>
          <div className="text-3xl font-bold text-blue-400 mb-2">{userAnswers.length}</div>
          <div className="text-sm text-gray-400">Total answers given</div>
        </div>
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Reputation</h3>
            <span className="text-2xl">🏆</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400 mb-2">{user.reputation}</div>
          <div className="text-sm text-gray-400">Reputation points</div>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <Layout>
        <div className="space-y-6">
          <ProfileHeader />
          <ProfileTabs />
          <div>
            {activeTab === 'overview' && <OverviewTab />}
            {activeTab === 'questions' && <MyQuestionsTab />}
            {activeTab === 'answers' && <MyAnswersTab />}
            {activeTab === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input 
                      id="displayName" 
                      defaultValue={user.displayName || ''} 
                      placeholder="Enter your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      defaultValue={user.bio || ''} 
                      placeholder="Tell us about yourself"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      defaultValue={user.email} 
                      disabled 
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Settings saved",
                        description: "Your profile settings have been updated.",
                      });
                    }}
                  >
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
