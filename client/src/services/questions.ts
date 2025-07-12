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
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Question, CreateQuestionData } from '@/types';

export async function createQuestion(questionData: CreateQuestionData, authorId: string, authorName: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'questions'), {
    title: questionData.title,
    description: questionData.description,
    tags: questionData.tags,
    authorId,
    authorName,
    voteCount: 0,
    answerCount: 0,
    viewCount: 0,
    isResolved: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update user's questions count
  await updateDoc(doc(db, 'users', authorId), {
    questionsAsked: increment(1),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getQuestions(limitCount: number = 20): Promise<Question[]> {
  const q = query(
    collection(db, 'questions'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Question[];
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

  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Question;
}

export function subscribeToQuestions(callback: (questions: Question[]) => void, limitCount: number = 20) {
  const q = query(
    collection(db, 'questions'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (querySnapshot) => {
    const questions = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Question[];
    
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

    const data = docSnap.data();
    const question: Question = {
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as Question;
    
    callback(question);
  });
}
