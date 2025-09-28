import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Design } from '@/lib/types';

const DESIGNS_COLLECTION = 'designs';

// Fetches lightweight design data for the gallery view
export async function getDesigns(): Promise<Design[]> {
  try {
    const q = query(
      collection(db, DESIGNS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const designs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Design[];
    return designs;
  } catch (error) {
    console.error('Error getting documents: ', error);
    return [];
  }
}

// Fetches the full design data from the single 'designs' collection
export async function getDesignById(id: string): Promise<Design | undefined> {
  try {
    const designRef = doc(db, DESIGNS_COLLECTION, id);
    const designSnap = await getDoc(designRef);

    if (designSnap.exists()) {
      return { id: designSnap.id, ...designSnap.data() } as Design;
    } else {
      return undefined;
    }
  } catch (error) {
    console.error('[getDesignById] Erro ao buscar documento:', error);
    return undefined;
  }
}

// Adds a new design by writing a single document
export async function addDesign(design: Omit<Design, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, DESIGNS_COLLECTION), {
      ...design,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    throw error;
  }
}

// Updates a design in the single collection
export async function updateDesign(
  id: string,
  design: Partial<Design>
): Promise<void> {
  const designRef = doc(db, DESIGNS_COLLECTION, id);
  await updateDoc(designRef, design);
}

export async function toggleFavorite(
  designId: string,
  userId: string
): Promise<void> {
  const designRef = doc(db, DESIGNS_COLLECTION, designId);
  try {
    const designDoc = await getDoc(designRef);
    if (designDoc.exists()) {
      const designData = designDoc.data();
      const favoritedBy = designData.favoritedBy || [];
      if (favoritedBy.includes(userId)) {
        // Unfavorite
        await updateDoc(designRef, {
          favoritedBy: arrayRemove(userId),
        });
      } else {
        // Favorite
        await updateDoc(designRef, {
          favoritedBy: arrayUnion(userId),
        });
      }
    }
  } catch (error) {
    console.error('Error toggling favorite: ', error);
    throw error;
  }
}

export async function toggleLike(
  designId: string,
  userId: string
): Promise<void> {
  const designRef = doc(db, DESIGNS_COLLECTION, designId);
  try {
    const designDoc = await getDoc(designRef);
    if (designDoc.exists()) {
      const designData = designDoc.data();
      const likedBy = designData.likedBy || [];
      if (likedBy.includes(userId)) {
        // Unlike
        await updateDoc(designRef, {
          likedBy: arrayRemove(userId),
        });
      } else {
        // Like
        await updateDoc(designRef, {
          likedBy: arrayUnion(userId),
        });
      }
    }
  } catch (error) {
    console.error('Error toggling like: ', error);
    throw error;
  }
}
