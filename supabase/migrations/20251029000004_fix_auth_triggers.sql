-- ============================================================================
-- FIX: Corrigir triggers de autenticação que estão impedindo criação de usuários
-- ============================================================================

-- Remover trigger problemático se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Criar function correta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se existe tabela users
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    INSERT INTO public.users (id, email, name, role)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'Patient')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Recriar trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
-- Comentário
COMMENT ON FUNCTION public.handle_new_user() IS 'Trigger para criar registro em users quando novo usuário se autentica';
