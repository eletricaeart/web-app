-- -- Adiciona a coluna que está faltando em profiles

ALTER TABLE public.profiles 
ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Aproveitando, vamos garantir que a coluna updated_at também esteja lá
-- (caso ela não tenha sido criada antes)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='profiles' AND column_name='updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;
