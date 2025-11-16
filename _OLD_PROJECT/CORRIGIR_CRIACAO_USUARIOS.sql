-- ============================================================================
-- CORREÇÃO: Permitir Criação de Usuários no Supabase
-- Execute este SQL no Supabase Dashboard → SQL Editor
-- ============================================================================

-- Remover trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar function correta que não falha
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Só criar em users se a tabela existir
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    BEGIN
      INSERT INTO public.users (id, email, name, role)
      VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'Patient')
      )
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      -- Ignorar erros e não bloquear criação do usuário
      RAISE WARNING 'Erro ao criar usuário em users: %', SQLERRM;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();

-- Verificar se foi aplicado
SELECT 
  'Trigger criado com sucesso!' as status,
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

