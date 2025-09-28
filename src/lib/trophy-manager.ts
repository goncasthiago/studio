import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Profile, Trophy } from '@/lib/types';
import { ALL_TROPHIES } from './trophies';
import { getUserProfile } from './user-store';

const DESIGNS_COLLECTION = 'designs';
const USERS_COLLECTION = 'users';

async function getUserStats(userId: string) {
  // Get number of created designs
  const createQuery = query(
    collection(db, DESIGNS_COLLECTION),
    where('userId', '==', userId)
  );
  const createSnapshot = await getDocs(createQuery);
  const createCount = createSnapshot.size;

  // Get number of liked designs
  const likeQuery = query(
    collection(db, DESIGNS_COLLECTION),
    where('likedBy', 'array-contains', userId)
  );
  const likeSnapshot = await getDocs(likeQuery);
  const likeCount = likeSnapshot.size;

  // Get number of favorited designs
  const favoriteQuery = query(
    collection(db, DESIGNS_COLLECTION),
    where('favoritedBy', 'array-contains', userId)
  );
  const favoriteSnapshot = await getDocs(favoriteQuery);
  const favoriteCount = favoriteSnapshot.size;

  return { createCount, likeCount, favoriteCount };
}

export async function checkAndAwardTrophies(
  userId: string
): Promise<Trophy[]> {
  const profile = await getUserProfile(userId);
  if (!profile) return [];

  const unlockedTrophies = profile.unlockedTrophies || [];
  const newlyUnlocked: Trophy[] = [];

  // Always include the login trophy check, as it's the base case
  const stats = {
    login: 1,
    ...(await getUserStats(userId)),
  };
  const counts = {
    login: stats.login,
    create: stats.createCount,
    like: stats.likeCount,
    favorite: stats.favoriteCount,
  };

  for (const trophy of ALL_TROPHIES) {
    const hasTrophy = unlockedTrophies.includes(trophy.id);
    if (hasTrophy) {
      continue;
    }
    
    const userCount = counts[trophy.criteria.type];

    if (userCount >= trophy.criteria.count) {
      newlyUnlocked.push(trophy);
    }
  }

  if (newlyUnlocked.length > 0) {
    const userRef = doc(db, USERS_COLLECTION, userId);
    await updateDoc(userRef, {
      unlockedTrophies: arrayUnion(...newlyUnlocked.map(t => t.id)),
    });
  }

  return newlyUnlocked;
}
