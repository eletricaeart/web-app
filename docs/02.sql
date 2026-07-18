-- Criar a Tabela de Recibos no Supabase 

CREATE TABLE recibos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users NOT NULL,
  client_id UUID REFERENCES clientes ON DELETE SET NULL,
  client_name_manual TEXT,
  receipt_number TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT,
  description TEXT,
  issue_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own receipts" ON recibos FOR ALL USING (auth.uid() = owner_id);
