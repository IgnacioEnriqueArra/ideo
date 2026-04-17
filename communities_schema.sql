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

-- Asegurar que las columnas existan si la tabla ya fue creada
ALTER TABLE communities ADD COLUMN IF NOT EXISTS "isPrivate" BOOLEAN DEFAULT FALSE;

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

-- Habilitar RLS estandar
ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_join_requests ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas previas para evitar error 42710
DROP POLICY IF EXISTS "Enable all for authenticated users" ON communities;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON community_members;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON crypto_orders;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON community_join_requests;

-- Políticas de acceso total (estilo fork.)
CREATE POLICY "Enable all for authenticated users" ON communities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON community_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON crypto_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for authenticated users" ON community_join_requests FOR ALL USING (true) WITH CHECK (true);

-- Vincular ideas a comunidades si no existe la columna
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='ideas' AND column_name='communityId') THEN
    ALTER TABLE ideas ADD COLUMN "communityId" UUID REFERENCES communities(id) ON DELETE CASCADE;
  END IF;
END $$;
