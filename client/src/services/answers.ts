import {
  collection,
  doc,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Answer, CreateAnswerData } from '@/types';
import { ensureUserProfile } from './auth';

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

export async function createAnswer(answerData: CreateAnswerData, authorId: string, authorName: string): Promise<string> {
  console.log('💬 Answers Service: Creating answer for user:', authorId);
  console.log('💬 Answers Service: Answer data:', answerData);
  
  try {
    // Ensure user profile exists before creating answer
    console.log('💬 Answers Service: Ensuring user profile exists');
    await ensureUserProfile(authorId);
    console.log('💬 Answers Service: User profile ensured');

    // Create the answer document
    console.log('💬 Answers Service: Creating answer document');
    const answerDocData = {
      questionId: answerData.questionId,
      content: answerData.content,
      authorId,
      authorName,
      voteCount: 0,
      isAccepted: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    console.log('💬 Answers Service: Answer document data:', answerDocData);
    const docRef = await addDoc(collection(db, 'answers'), answerDocData);

    console.log('💬 Answers Service: Answer created with ID:', docRef.id);

    // Update question's answer count (with error handling for non-existent questions)
    console.log('💬 Answers Service: Updating question statistics');
    try {
      await updateDoc(doc(db, 'questions', answerData.questionId), {
        answerCount: increment(1),
        updatedAt: serverTimestamp(),
      });
      console.log('💬 Answers Service: Question statistics updated successfully');
    } catch (questionError: any) {
      console.warn('💬 Answers Service: Could not update question statistics:', questionError.message);
      // Don't fail the answer creation if question doesn't exist
      if (questionError.code === 'not-found') {
        console.log('💬 Answers Service: Question not found, but continuing with answer creation');
      } else {
        throw questionError; // Re-throw other errors
      }
    }

    // Update user's answers count (now safe since profile exists)
    console.log('💬 Answers Service: Updating user statistics');
    try {
      await updateDoc(doc(db, 'users', authorId), {
        answersGiven: increment(1),
        updatedAt: serverTimestamp(),
      });
      console.log('💬 Answers Service: User statistics updated successfully');
    } catch (userError: any) {
      console.warn('💬 Answers Service: Could not update user statistics:', userError.message);
      // Don't fail the answer creation if user update fails
    }

    console.log('💬 Answers Service: Answer creation completed successfully');
    return docRef.id;
  } catch (error) {
    console.error('💬 Answers Service: Error creating answer:', error);
    throw error;
  }
}

export async function getAnswersForQuestion(questionId: string): Promise<Answer[]> {
  console.log('💬 Answers Service: Getting answers for question:', questionId);
  
  try {
    // Simplified query to avoid composite index requirement
    const q = query(
      collection(db, 'answers'),
      where('questionId', '==', questionId)
    );
    
    console.log('💬 Answers Service: Executing query for answers');
    const querySnapshot = await getDocs(q);
    console.log('💬 Answers Service: Found answers:', querySnapshot.size);
    
    const answers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      const answer = {
        id: doc.id,
        ...data,
        createdAt: safeTimestampToDate(data.createdAt),
        updatedAt: safeTimestampToDate(data.updatedAt),
      } as Answer;
      
      console.log('💬 Answers Service: Processed answer:', {
        id: answer.id,
        content: answer.content.substring(0, 50) + '...',
        voteCount: answer.voteCount,
        isAccepted: answer.isAccepted
      });
      
      return answer;
    });
    
    // Sort answers in memory: accepted first, then by vote count, then by date
    answers.sort((a, b) => {
      // Accepted answer always comes first
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      
      // Then sort by vote count (highest first)
      if (a.voteCount !== b.voteCount) {
        return b.voteCount - a.voteCount;
      }
      
      // Finally sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    console.log('💬 Answers Service: Returning sorted answers:', answers.length);
    return answers;
  } catch (error) {
    console.error('💬 Answers Service: Error getting answers:', error);
    throw error;
  }
}

export function subscribeToAnswers(questionId: string, callback: (answers: Answer[]) => void) {
  console.log('💬 Answers Service: Setting up real-time subscription for question:', questionId);
  
  // Simplified query to avoid composite index requirement
  const q = query(
    collection(db, 'answers'),
    where('questionId', '==', questionId)
  );

  return onSnapshot(q, (querySnapshot) => {
    console.log('💬 Answers Service: Real-time update received:', querySnapshot.size, 'answers');
    
    const answers = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: safeTimestampToDate(data.createdAt),
        updatedAt: safeTimestampToDate(data.updatedAt),
      } as Answer;
    });
    
    // Sort answers in memory: accepted first, then by vote count, then by date
    answers.sort((a, b) => {
      // Accepted answer always comes first
      if (a.isAccepted && !b.isAccepted) return -1;
      if (!a.isAccepted && b.isAccepted) return 1;
      
      // Then sort by vote count (highest first)
      if (a.voteCount !== b.voteCount) {
        return b.voteCount - a.voteCount;
      }
      
      // Finally sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    console.log('💬 Answers Service: Calling callback with sorted answers:', answers.length);
    callback(answers);
  }, (error) => {
    console.error('💬 Answers Service: Real-time subscription error:', error);
  });
}

export async function acceptAnswer(answerId: string, questionId: string): Promise<void> {
  console.log('💬 Answers Service: Accepting answer:', { answerId, questionId });
  
  try {
    // Mark the answer as accepted
    console.log('💬 Answers Service: Marking answer as accepted');
    await updateDoc(doc(db, 'answers', answerId), {
      isAccepted: true,
      updatedAt: serverTimestamp(),
    });

    // Update the question with the accepted answer ID
    console.log('💬 Answers Service: Updating question with accepted answer');
    await updateDoc(doc(db, 'questions', questionId), {
      acceptedAnswerId: answerId,
      isResolved: true,
      updatedAt: serverTimestamp(),
    });

    console.log('💬 Answers Service: Answer acceptance completed successfully');
  } catch (error) {
    console.error('💬 Answers Service: Error accepting answer:', error);
    throw error;
  }
}
