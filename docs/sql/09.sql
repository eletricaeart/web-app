-- Adiciona a coluna email em profiles

ALTER TABLE public.profiles 
ADD COLUMN email TEXT;

-- Caso você queira que o telefone e o status também sejam salvos
-- vamos garantir que essas colunas existam (seguindo o seu formData)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='whatsapp') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='status') THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'Ativo';
    END IF;
END $$;
