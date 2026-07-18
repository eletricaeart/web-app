-- Automatizar a criação de perfil para novos usuarios

-- Função que será executada automaticamente
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data->>'name', 'Eletricista');
  return new;
end;
$$;

-- Gatilho (Trigger) que chama a função após um insert em auth.users
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
