export type User = {
  id: string;
  email: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  followers: string[];
  following: string[];
  verified?: boolean;
};

export type Branch = {
  id: string;
  ideaId: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  parentForkId?: string;
  forks?: Branch[];
};

export type Community = {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  avatarUrl?: string;
  isPrivate: boolean;
};

export type CommunityJoinRequest = {
  id: string;
  communityId: string;
  userId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
};

export type CryptoOrder = {
  id: string;
  userId: string;
  communityName: string;
  communityDescription: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
  createdAt: string;
};

export type Idea = {
  id: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  tags: string[];
  branches: Branch[];
  mediaUrl?: string;
  communityId?: string;
  community?: Community;
};
