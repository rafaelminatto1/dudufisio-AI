// hooks/atendimento/useAtendimentoKeyboardShortcuts.ts
import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

interface UseKeyboardShortcutsOptions {
  onSave?: () => void;
  onFinish?: () => void;
  onGenerateAI?: () => void;
  onRepeatConduct?: () => void;
  onToggleContext?: () => void;
  onSwitchTab?: (tabIndex: number) => void;
}

export const useAtendimentoKeyboardShortcuts = (
  options: UseKeyboardShortcutsOptions
) => {
  // Ctrl+S - Salvar manualmente
  useHotkeys('ctrl+s', (e) => {
    e.preventDefault();
    options.onSave?.();
  }, { enableOnFormTags: true });

  // Ctrl+Enter - Finalizar sessão
  useHotkeys('ctrl+enter', (e) => {
    e.preventDefault();
    options.onFinish?.();
  }, { enableOnFormTags: true });

  // Ctrl+G - Gerar sugestão IA
  useHotkeys('ctrl+g', (e) => {
    e.preventDefault();
    options.onGenerateAI?.();
  }, { enableOnFormTags: true });

  // Ctrl+R - Repetir conduta
  useHotkeys('ctrl+r', (e) => {
    e.preventDefault();
    options.onRepeatConduct?.();
  }, { enableOnFormTags: true });

  // Ctrl+H - Toggle painel contexto
  useHotkeys('ctrl+h', (e) => {
    e.preventDefault();
    options.onToggleContext?.();
  }, { enableOnFormTags: true });

  // Ctrl+1-4 - Trocar tabs
  useHotkeys('ctrl+1', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(0); // SOAP
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+2', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(1); // Métricas
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+3', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(2); // IA
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+4', (e) => {
    e.preventDefault();
    options.onSwitchTab?.(3); // Anexos
  }, { enableOnFormTags: true });

  // Log de atalhos disponíveis (dev mode)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Atalhos de teclado disponíveis:');
      console.log('  Ctrl+S: Salvar manualmente');
      console.log('  Ctrl+Enter: Finalizar sessão');
      console.log('  Ctrl+G: Gerar sugestão IA');
      console.log('  Ctrl+R: Repetir conduta');
      console.log('  Ctrl+H: Toggle painel contexto');
      console.log('  Ctrl+1-4: Trocar tabs');
    }
  }, []);
};
