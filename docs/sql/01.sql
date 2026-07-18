-- Criar as Tabelas no Supabase

-- 1. TABELA DE USUÁRIOS (Sincronizada com o Auth do Supabase)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'Eletricista',
  photo_url TEXT,
  whatsapp TEXT,
  specialty TEXT,
  about TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE CLIENTES
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  document TEXT,
  gender TEXT DEFAULT 'masc',
  whatsapp TEXT,
  email TEXT,
  zip TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  obs TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA DE ORÇAMENTOS
CREATE TABLE orcamentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clientes ON DELETE SET NULL,
  client_name_manual TEXT, -- Para clientes não cadastrados
  document_title TEXT NOT NULL,
  subtitle TEXT DEFAULT 'PROPOSTA DE ORÇAMENTO',
  issue_date DATE DEFAULT CURRENT_DATE,
  expiration TEXT DEFAULT '15 dias',
  services_json JSONB NOT NULL, -- Aqui salvamos as cláusulas e itens
  financial_json JSONB NOT NULL, -- {labor, materials, discount, total}
  access_password TEXT NOT NULL, -- O novo padrão XXXX-XXXX-XXXX
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA DE NOTAS TÉCNICAS
CREATE TABLE notas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clientes ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  date DATE DEFAULT CURRENT_DATE,
  is_important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) para segurança
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

-- Criar políticas: "Usuários só vêem seus próprios dados"
CREATE POLICY "Users can manage their own clients" ON clientes FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage their own budgets" ON orcamentos FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Users can manage their own notes" ON notas FOR ALL USING (auth.uid() = owner_id);

-- Política especial: "Público pode ver orçamento se souber o ID" (A senha checamos no código)
CREATE POLICY "Public can view budgets" ON orcamentos FOR SELECT USING (true);
