-- Liberar o acesso

-- Remove políticas antigas que podem estar conflitando
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;

-- Política 1: Qualquer um logado pode VER os perfis (para a listagem da Equipe funcionar)
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política 2: Um usuário pode INSERIR ou ATUALIZAR apenas o seu próprio perfil
CREATE POLICY "Users can manage own profile" 
ON public.profiles FOR ALL 
USING (auth.uid() = id);
