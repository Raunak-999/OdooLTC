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

export async function createAnswer(answerData: CreateAnswerData, authorId: string, authorName: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'answers'), {
    questionId: answerData.questionId,
    content: answerData.content,
    authorId,
    authorName,
    voteCount: 0,
    isAccepted: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update question's answer count
  await updateDoc(doc(db, 'questions', answerData.questionId), {
    answerCount: increment(1),
    updatedAt: serverTimestamp(),
  });

  // Update user's answers count
  await updateDoc(doc(db, 'users', authorId), {
    answersGiven: increment(1),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function getAnswersForQuestion(questionId: string): Promise<Answer[]> {
  const q = query(
    collection(db, 'answers'),
    where('questionId', '==', questionId),
    orderBy('voteCount', 'desc'),
    orderBy('createdAt', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Answer[];
}

export function subscribeToAnswers(questionId: string, callback: (answers: Answer[]) => void) {
  const q = query(
    collection(db, 'answers'),
    where('questionId', '==', questionId),
    orderBy('voteCount', 'desc'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (querySnapshot) => {
    const answers = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as Answer[];
    
    callback(answers);
  });
}

export async function acceptAnswer(answerId: string, questionId: string): Promise<void> {
  // Mark the answer as accepted
  await updateDoc(doc(db, 'answers', answerId), {
    isAccepted: true,
    updatedAt: serverTimestamp(),
  });

  // Update the question with the accepted answer ID
  await updateDoc(doc(db, 'questions', questionId), {
    acceptedAnswerId: answerId,
    isResolved: true,
    updatedAt: serverTimestamp(),
  });
}
