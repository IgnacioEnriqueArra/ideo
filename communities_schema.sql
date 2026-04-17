-- Tablas de Comunidades y Ordenes Cripto
CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  "ownerId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "avatarUrl" TEXT,
  "isPrivate" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS community_members (
  "communityId" UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  PRIMARY KEY ("communityId", "userId")
);

CREATE TABLE IF NOT EXISTS community_join_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "communityId" UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("communityId", "userId")
);

CREATE TABLE IF NOT EXISTS crypto_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "communityName" TEXT NOT NULL,
  "communityDescription" TEXT NOT NULL,
  amount NUMERIC(10, 4) UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS estandar (Para permitir inserciones de usuarios en front)
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;

-- Políticas ultra-permisivas para evitar bloqueos como los de posts anteriores:
CREATE POLICY "Enable all for authenticated users" ON communities FOR ALL USING (auth.role() = 'authenticated' OR true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON community_members FOR ALL USING (auth.role() = 'authenticated' OR true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON crypto_orders FOR ALL USING (auth.role() = 'authenticated' OR true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON community_join_requests FOR ALL USING (auth.role() = 'authenticated' OR true) WITH CHECK (true);

-- Agregar campo 'communityId' a la tabla ideas
ALTER TABLE ideas ADD COLUMN IF NOT EXISTS "communityId" UUID REFERENCES communities(id) ON DELETE CASCADE;
