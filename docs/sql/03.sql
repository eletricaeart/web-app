-- adiciona as colunas para cliente não cadastrado em db no orçamento

ALTER TABLE orcamentos 
ADD COLUMN zip TEXT,
ADD COLUMN street TEXT,
ADD COLUMN number TEXT,
ADD COLUMN complement TEXT,
ADD COLUMN neighborhood TEXT,
ADD COLUMN city TEXT;
