import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  where,
  serverTimestamp,
  updateDoc,
  increment,
  onSnapshot,
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question, CreateQuestionData } from '@/types';
import { ensureUserProfile } from './auth';

// Helper function to safely convert Firestore data to Question object
function convertFirestoreDocToQuestion(doc: any): Question {
  const data = doc.data();
  
  // Helper function to safely convert Firestore timestamp to Date
  const safeTimestampToDate = (timestamp: any): Date => {
    if (!timestamp) return new Date();
    
    // If it's already a Date object, return it
    if (timestamp instanceof Date) return timestamp;
    
    // If it's a Firestore Timestamp, convert it
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's a string, try to parse it
    if (typeof timestamp === 'string') {
      const parsed = new Date(timestamp);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    
    // If it's a number (timestamp), convert it
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // Fallback to current date
    return new Date();
  };
  
  return {
    id: doc.id,
    title: data.title || 'Untitled Question',
    description: data.description || 'No description available',
    tags: Array.isArray(data.tags) ? data.tags : [],
    authorId: data.authorId || '',
    authorName: data.authorName || 'Anonymous',
    authorPhotoURL: data.authorPhotoURL || undefined,
    voteCount: typeof data.voteCount === 'number' ? data.voteCount : 0,
    answerCount: typeof data.answerCount === 'number' ? data.answerCount : 0,
    viewCount: typeof data.viewCount === 'number' ? data.viewCount : 0,
    acceptedAnswerId: data.acceptedAnswerId || undefined,
    createdAt: safeTimestampToDate(data.createdAt),
    updatedAt: safeTimestampToDate(data.updatedAt),
    isResolved: Boolean(data.isResolved),
  };
}

// Check Firestore connection
async function testFirestoreConnection(): Promise<boolean> {
  try {
    const testDoc = doc(db, 'test', 'connection');
    await getDoc(testDoc);
    return true;
  } catch (error) {
    return false;
  }
}

// Simplified question creation as fallback
async function createQuestionSimple(questionData: CreateQuestionData, authorId: string, authorName: string): Promise<string> {
  console.log('🔄 Using simplified question creation...');
  
  try {
    const simpleQuestionData = {
      title: questionData.title,
      description: questionData.description,
      tags: questionData.tags || [],
      authorId: authorId,
      authorName: authorName,
      createdAt: new Date().toISOString(), // Use simple date instead of serverTimestamp
      updatedAt: new Date().toISOString(),
      voteCount: 0,
      answerCount: 0,
      viewCount: 0,
      isResolved: false
    };
    
    console.log('🔄 Simple question data:', simpleQuestionData);
    
    const questionRef = await addDoc(collection(db, 'questions'), simpleQuestionData);

    
    return questionRef.id;
  } catch (error) {
    console.error('❌ Simple question creation also failed:', error);
    throw error;
  }
}

export async function createQuestion(questionData: CreateQuestionData, authorId: string, authorName: string): Promise<string> {
  console.log('=== QUESTION SERVICE START ===');
  console.log('1. Service called with data:', { questionData, authorId, authorName });
  
  try {
    // Step 1: Validate input data
    console.log('2. Validating input data...');
    if (!authorId) {
      throw new Error('Author ID is required');
    }
    if (!questionData.title) {
      throw new Error('Question title is required');
    }
    if (!questionData.description) {
      throw new Error('Question description is required');
    }
    console.log('3. Input validation passed');

    // Step 2: Test Firestore connection with better error handling
    try {
      const connectionOk = await testFirestoreConnection();
      if (!connectionOk) {
        throw new Error('Firestore connection test failed');
      }
    } catch (connectionError: any) {
      
      // Provide specific error messages based on error type
      if (connectionError.code === 'permission-denied') {
        throw new Error('Firebase permission denied. Please check your security rules.');
      } else if (connectionError.code === 'unavailable') {
        throw new Error('Firebase service is currently unavailable. Please try again later.');
      } else if (connectionError.code === 'network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (connectionError.message.includes('Failed to fetch')) {
        throw new Error('Network connectivity issue. Please check your internet connection.');
      } else {
        throw new Error(`Firebase connection failed: ${connectionError.message}`);
      }
    }

    // Step 3: Ensure user profile exists
    console.log('5. Checking user profile...');
    try {
      await ensureUserProfile(authorId);
      console.log('6. User profile ensured');
    } catch (profileError) {
      console.warn('⚠️ User profile creation failed, continuing anyway:', profileError);
      // Continue without user profile - this shouldn't block question creation
    }

    // Step 4: Create question document
    console.log('7. Creating question document...');
    const completeQuestionData = {
      title: questionData.title,
      description: questionData.description,
      tags: questionData.tags || [],
      authorId: authorId,
      authorName: authorName,
      voteCount: 0,
      answerCount: 0,
      viewCount: 0,
      isResolved: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('8. Complete question data:', completeQuestionData);

    let questionRef;
    try {
      questionRef = await addDoc(collection(db, 'questions'), completeQuestionData);
      console.log('9. Question document created with ID:', questionRef.id);
    } catch (addDocError: any) {
      console.error('❌ Question document creation failed:', addDocError);
      
      // Provide specific error messages for document creation
      if (addDocError.code === 'permission-denied') {
        throw new Error('Permission denied. Please check your Firebase security rules.');
      } else if (addDocError.code === 'unavailable') {
        throw new Error('Firebase service is currently unavailable. Please try again later.');
      } else if (addDocError.code === 'network-request-failed') {
        throw new Error('Network error. Please check your internet connection and try again.');
      }
      
      // Try simplified approach as fallback
      console.log('🔄 Attempting simplified question creation...');
      const simpleId = await createQuestionSimple(questionData, authorId, authorName);
      return simpleId;
    }

    // Step 5: Update user statistics (optional, don't fail if this fails)
    try {
      console.log('10. Updating user statistics...');
      const userRef = doc(db, 'users', authorId);
      await updateDoc(userRef, {
        questionsAsked: increment(1),
        updatedAt: serverTimestamp()
      });
      console.log('11. User statistics updated');
    } catch (statsError) {
      console.warn('⚠️ User statistics update failed (non-critical):', statsError);
    }

    console.log('=== QUESTION SERVICE SUCCESS ===');
    return questionRef.id;

  } catch (error: any) {
    console.error('=== QUESTION SERVICE ERROR ===');
    console.error('Error in createQuestion service:');
    console.error('- Type:', error.constructor.name);
    console.error('- Message:', error.message);
    console.error('- Code:', error.code);
    console.error('- Stack:', error.stack);
    console.error('- Full error object:', error);

    // Try simplified approach as final fallback
    try {
      console.log('🔄 Attempting final fallback - simple question creation...');
      const simpleId = await createQuestionSimple(questionData, authorId, authorName);

      return simpleId;
    } catch (fallbackError) {
      console.error('❌ All question creation methods failed:', fallbackError);
      throw new Error(`Question creation failed: ${error.message}`);
    }
  }
}

export async function getQuestions(limitCount: number = 20): Promise<Question[]> {
  const q = query(
    collection(db, 'questions'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(convertFirestoreDocToQuestion);
}

export async function getQuestion(questionId: string): Promise<Question | null> {
  const docRef = doc(db, 'questions', questionId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  // Increment view count
  await updateDoc(docRef, {
    viewCount: increment(1),
  });

  return convertFirestoreDocToQuestion(docSnap);
}

export function subscribeToQuestions(callback: (questions: Question[]) => void, limitCount: number = 20) {
  const q = query(
    collection(db, 'questions'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (querySnapshot) => {
    const questions = querySnapshot.docs.map(convertFirestoreDocToQuestion);
    callback(questions);
  });
}

export function subscribeToQuestion(questionId: string, callback: (question: Question | null) => void) {
  const docRef = doc(db, 'questions', questionId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (!docSnap.exists()) {
      callback(null);
      return;
    }

    const question = convertFirestoreDocToQuestion(docSnap);
    callback(question);
  });
}
