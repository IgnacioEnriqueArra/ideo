-- Copy and run this in your Supabase SQL Editor to set up the tables!

-- USERS TABLE
CREATE TABLE public.users (
  id UUID references auth.users NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL UNIQUE,
  avatar TEXT,
  bio TEXT,
  followers UUID[] DEFAULT '{}',
  following UUID[] DEFAULT '{}',
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- IDEAS TABLE
CREATE TABLE public.ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "authorId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  "mediaUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BRANCHES TABLE
CREATE TABLE public.branches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "ideaId" UUID REFERENCES public.ideas(id) ON DELETE CASCADE,
  "authorId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FEEDBACKS TABLE
CREATE TABLE public.feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "branchId" UUID REFERENCES public.branches(id) ON DELETE CASCADE,
  "authorId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LIKES TABLE
CREATE TABLE public.likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  "targetId" UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('idea', 'branch'))
);

-- BOOKMARKS TABLE
CREATE TABLE public.bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "userId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  "ideaId" UUID REFERENCES public.ideas(id) ON DELETE CASCADE
);

-- NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "recipientId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  "actorId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'branch', 'feedback', 'follow')),
  "targetId" UUID NOT NULL,
  read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CONVERSATIONS TABLE
CREATE TABLE public.conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "participantIds" UUID[] DEFAULT '{}',
  "lastMessage" TEXT,
  "lastMessageAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "conversationId" UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
  "senderId" UUID REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Optional, but recommended. Here we make it fully permissive to match Firebase free-flow prototype style)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.ideas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.branches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.feedbacks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.bookmarks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write" ON public.messages FOR ALL USING (true) WITH CHECK (true);
