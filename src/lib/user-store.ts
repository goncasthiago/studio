import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Profile } from '@/lib/types';
import type { User } from 'firebase/auth';

const USERS_COLLECTION = 'users';

async function isNicknameTaken(nickname: string): Promise<boolean> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, where('nickname', '==', nickname));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
}

async function generateUniqueNickname(displayName: string): Promise<string> {
  let baseNickname = displayName.replace(/\s+/g, '').toLowerCase();
  if (baseNickname.length < 3) {
    baseNickname = `user${baseNickname}`;
  }
  let nickname = baseNickname;
  let attempts = 0;
  
  while (await isNicknameTaken(nickname)) {
    attempts++;
    nickname = `${baseNickname}_${attempts}`;
  }
  
  return nickname;
}

export async function createUserProfile(user: User): Promise<Profile> {
  const userRef = doc(db, USERS_COLLECTION, user.uid);
  const nickname = await generateUniqueNickname(user.displayName || 'user');
  
  const newUserProfile: Profile = {
    uid: user.uid,
    displayName: user.displayName || 'Anonymous User',
    email: user.email,
    nickname: nickname,
    unlockedTrophies: ['login-1'], // Automatically award login trophy
  };
  
  await setDoc(userRef, newUserProfile);
  return newUserProfile;
}

export async function getUserProfile(uid: string): Promise<Profile | null> {
  const docRef = doc(db, USERS_COLLECTION, uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data() as Profile;
  } else {
    return null;
  }
}

export async function updateNickname(uid: string, newNickname: string): Promise<{ success: boolean; message: string }> {
  const isTaken = await isNicknameTaken(newNickname);
  if (isTaken) {
    return { success: false, message: 'Este nickname já está em uso.' };
  }
  
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, { nickname: newNickname });
    return { success: true, message: 'Nickname atualizado com sucesso!' };
  } catch (error) {
    console.error("Error updating nickname: ", error);
    return { success: false, message: 'Ocorreu um erro ao atualizar o nickname.' };
  }
}
