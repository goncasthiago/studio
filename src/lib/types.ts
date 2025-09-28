export type BeadColor = string; // hex code

export type BeadPosition = {
  row: number;
  col: number;
  color: BeadColor;
};

export type Design = {
  id: string;
  name: string;
  imageId: string;
  grid: {
    rows: number;
    cols: number;
  };
  beads: BeadPosition[];
  colorCounts: Record<BeadColor, number>;
  imageUrl?: string;
  imageHint?: string;
  userId?: string;
  creatorName?: string; // This will be the user's nickname
  likedBy?: string[];
  favoritedBy?: string[];
  createdAt?: any;
};

export type Profile = {
  uid: string;
  displayName: string;
  email: string | null;
  nickname: string;
  unlockedTrophies?: string[];
};

export type Trophy = {
  id: string;
  name: string;
  description: string;
  criteria: {
    type: 'login' | 'create' | 'like' | 'favorite';
    count: number;
  };
};
