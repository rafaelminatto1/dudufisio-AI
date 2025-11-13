-- ============================================================================
-- MIGRATION: Corrigir trigger on_auth_user_created
-- ============================================================================

-- Remover trigger problemático
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- Função que não falha
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    INSERT INTO public.users (id, auth_id, email, full_name, role)
    VALUES (
      gen_random_uuid(),
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    )
    ON CONFLICT (auth_id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar usuário em users: %', SQLERRM;
  END;
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
