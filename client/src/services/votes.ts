import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  increment,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Vote } from '@/types';

export async function getUserVote(userId: string, targetId: string): Promise<Vote | null> {
  const q = query(
    collection(db, 'votes'),
    where('userId', '==', userId),
    where('targetId', '==', targetId)
  );
  
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
  } as Vote;
}

export async function castVote(
  userId: string,
  targetId: string,
  targetType: 'question' | 'answer',
  voteType: 1 | -1
): Promise<void> {
  await runTransaction(db, async (transaction) => {
    // Check for existing vote
    const existingVoteQuery = query(
      collection(db, 'votes'),
      where('userId', '==', userId),
      where('targetId', '==', targetId)
    );
    
    const existingVoteSnapshot = await getDocs(existingVoteQuery);
    
    let voteChange = voteType;
    
    if (!existingVoteSnapshot.empty) {
      // User has already voted
      const existingVoteDoc = existingVoteSnapshot.docs[0];
      const existingVote = existingVoteDoc.data();
      
      if (existingVote.voteType === voteType) {
        // Same vote type - remove the vote
        transaction.delete(existingVoteDoc.ref);
        voteChange = -voteType as 1 | -1;
      } else {
        // Different vote type - update the vote
        transaction.update(existingVoteDoc.ref, {
          voteType,
          createdAt: serverTimestamp(),
        });
        voteChange = (voteType - existingVote.voteType) as 1 | -1;
      }
    } else {
      // New vote
      const voteDocRef = doc(collection(db, 'votes'));
      transaction.set(voteDocRef, {
        userId,
        targetId,
        targetType,
        voteType,
        createdAt: serverTimestamp(),
      });
    }

    // Update vote count on the target document
    const targetCollection = targetType === 'question' ? 'questions' : 'answers';
    const targetDocRef = doc(db, targetCollection, targetId);
    transaction.update(targetDocRef, {
      voteCount: increment(voteChange),
      updatedAt: serverTimestamp(),
    });
  });
}

export async function getVotesForTargets(targetIds: string[]): Promise<{ [targetId: string]: Vote[] }> {
  if (targetIds.length === 0) return {};
  
  const q = query(
    collection(db, 'votes'),
    where('targetId', 'in', targetIds)
  );
  
  const querySnapshot = await getDocs(q);
  const votes: { [targetId: string]: Vote[] } = {};
  
  querySnapshot.docs.forEach(doc => {
    const vote = {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    } as Vote;
    
    if (!votes[vote.targetId]) {
      votes[vote.targetId] = [];
    }
    votes[vote.targetId].push(vote);
  });
  
  return votes;
}
