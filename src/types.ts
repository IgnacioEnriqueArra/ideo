export type User = {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio?: string;
  followers: string[];
  following: string[];
};

export type Feedback = {
  id: string;
  branchId: string;
  author: User;
  content: string;
  createdAt: string;
};

export type Branch = {
  id: string;
  ideaId: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  feedbacks: Feedback[];
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
};
