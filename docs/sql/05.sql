-- Garantir permissão de edição

-- Garante que qualquer usuário logado possa ver os perfis da equipe
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

-- Garante que um usuário só possa editar o seu próprio perfil
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
