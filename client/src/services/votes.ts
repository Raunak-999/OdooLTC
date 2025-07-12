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

export async function getUserVote(userId: string, targetId: string): Promise<Vote | null> {
  console.log('🗳️ getUserVote called:', { userId, targetId });
  
  try {
    const q = query(
      collection(db, 'votes'),
      where('userId', '==', userId),
      where('targetId', '==', targetId)
    );
    
    console.log('🗳️ getUserVote: Executing query...');
    const querySnapshot = await getDocs(q);
    console.log('🗳️ getUserVote: Query result:', { 
      empty: querySnapshot.empty, 
      size: querySnapshot.size 
    });
    
    if (querySnapshot.empty) {
      console.log('🗳️ getUserVote: No vote found');
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    const vote = {
      id: doc.id,
      ...data,
      createdAt: safeTimestampToDate(data.createdAt),
    } as Vote;
    
    console.log('🗳️ getUserVote: Returning vote:', vote);
    return vote;
  } catch (error) {
    console.error('🗳️ getUserVote: Error:', error);
    throw error;
  }
}

export const updateVoteCount = async (targetId: string, targetType: 'question' | 'answer', voteDelta: 1 | -1) => {
  try {
    const collectionName = targetType === 'question' ? 'questions' : 'answers';
    const docRef = doc(db, collectionName, targetId);
    await updateDoc(docRef, {
      voteCount: increment(voteDelta),
      updatedAt: serverTimestamp()
    });
    console.log('Vote count updated successfully');
  } catch (error) {
    console.error('Error updating vote count:', error);
  }
};

export const castVote = async (userId: string, targetId: string, targetType: 'question' | 'answer', voteType: 1 | -1) => {
  console.log('=== VOTE CASTING START ===');
  console.log('1. Vote parameters:', { userId, targetId, targetType, voteType });
  try {
    // Step 1: Validate input parameters
    console.log('2. Validating vote parameters...');
    if (!userId) throw new Error('User ID is required');
    if (!targetId) throw new Error('Target ID is required');
    if (!['question', 'answer'].includes(targetType)) throw new Error('Invalid target type');
    if (![1, -1].includes(voteType)) throw new Error('Invalid vote type');
    console.log('3. Vote parameters validation passed');

    // Step 2: Check if user already voted
    console.log('4. Checking existing vote...');
    const existingVoteQuery = query(
      collection(db, 'votes'),
      where('userId', '==', userId),
      where('targetId', '==', targetId),
      where('targetType', '==', targetType)
    );
    const existingVoteSnapshot = await getDocs(existingVoteQuery);
    console.log('5. Existing vote check result:', existingVoteSnapshot.size);

    // Step 3: Handle existing vote or create new vote
    if (!existingVoteSnapshot.empty) {
      console.log('6. Updating existing vote...');
      const existingVoteDoc = existingVoteSnapshot.docs[0];
      const existingVoteData = existingVoteDoc.data();
      console.log('7. Existing vote data:', existingVoteData);
      if (existingVoteData.voteType === voteType) {
        // Remove vote if clicking same vote type
        console.log('8. Removing existing vote...');
        await deleteDoc(doc(db, 'votes', existingVoteDoc.id));
        await updateVoteCount(targetId, targetType, -existingVoteData.voteType as 1 | -1);
        console.log('9. Vote removed successfully');
        return { action: 'removed', previousVote: existingVoteData.voteType };
      } else {
        // Update vote type
        console.log('8. Changing vote type...');
        await updateDoc(doc(db, 'votes', existingVoteDoc.id), {
          voteType: voteType,
          updatedAt: serverTimestamp()
        });
        await updateVoteCount(targetId, targetType, (voteType - existingVoteData.voteType) as 1 | -1);
        console.log('9. Vote updated successfully');
        return { action: 'updated', previousVote: existingVoteData.voteType, newVote: voteType };
      }
    } else {
      console.log('6. Creating new vote...');
      const voteData = {
        userId: userId,
        targetId: targetId,
        targetType: targetType,
        voteType: voteType,
        createdAt: serverTimestamp()
      };
      console.log('7. Vote data to create:', voteData);
      const voteRef = await addDoc(collection(db, 'votes'), voteData);
      await updateVoteCount(targetId, targetType, voteType);
      console.log('8. Vote created with ID:', voteRef.id);
      return { action: 'created', newVote: voteType };
    }
  } catch (error: any) {
    console.error('=== VOTE CASTING ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    throw error;
  }
};

export async function getVotesForTargets(targetIds: string[]): Promise<{ [targetId: string]: Vote[] }> {
  console.log('🗳️ getVotesForTargets called:', { targetIds });
  
  if (targetIds.length === 0) return {};
  
  try {
    const q = query(
      collection(db, 'votes'),
      where('targetId', 'in', targetIds)
    );
    
    const querySnapshot = await getDocs(q);
    const votes: { [targetId: string]: Vote[] } = {};
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      const vote = {
        id: doc.id,
        ...data,
        createdAt: safeTimestampToDate(data.createdAt),
      } as Vote;
      
      if (!votes[vote.targetId]) {
        votes[vote.targetId] = [];
      }
      votes[vote.targetId].push(vote);
    });
    
    console.log('🗳️ getVotesForTargets: Returning votes:', votes);
    return votes;
  } catch (error) {
    console.error('🗳️ getVotesForTargets: Error:', error);
    throw error;
  }
}
