export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  bio?: string;
  reputation: number;
  questionsAsked: number;
  answersGiven: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  title: string;
  description: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  voteCount: number;
  answerCount: number;
  viewCount: number;
  acceptedAnswerId?: string;
  createdAt: Date;
  updatedAt: Date;
  isResolved: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  voteCount: number;
  isAccepted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  id: string;
  userId: string;
  targetId: string; // questionId or answerId
  targetType: 'question' | 'answer';
  voteType: 1 | -1; // 1 for upvote, -1 for downvote
  createdAt: Date;
}

export interface Tag {
  name: string;
  description?: string;
  usageCount: number;
  createdAt: Date;
}

export interface CreateQuestionData {
  title: string;
  description: string;
  tags: string[];
}

export interface CreateAnswerData {
  content: string;
  questionId: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}
