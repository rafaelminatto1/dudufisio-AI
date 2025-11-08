import { useState } from 'react';
import { Link, router } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/Colors';
import { Screens } from '../../constants/Config';

export default function LoginScreen() {
  const { login, isLoading, error, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('demo@dudufisio.com');
  const [password, setPassword] = useState('demo1234');

  const handleSubmit = async () => {
    await login({ email, password });
    if (!error) {
      router.replace(Screens.tabs.home);
    }
  };

  if (isAuthenticated) {
    router.replace(Screens.tabs.home);
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', default: undefined })}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Bem-vindo ao dudufisio</Text>
        <Text style={styles.subtitle}>Faça login para acompanhar seu tratamento.</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Senha</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
        </View>

        {!!error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <Link href={Screens.auth.register} style={styles.link}>
          Não possui conta? Criar cadastro
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: Colors.muted,
    fontSize: 14,
  },
  formGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: Colors.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: Colors.danger,
    fontSize: 14,
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
  },
});

