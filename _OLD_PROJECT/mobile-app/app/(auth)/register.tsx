import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Cadastro via aplicativo</Text>
        <Text style={styles.description}>
          O cadastro de novos pacientes é realizado pelo fisioterapeuta em nosso portal web.
          Assim garantimos a validação profissional e o vínculo correto com a clínica.
        </Text>

        <Text style={styles.info}>
          Caso precise de acesso, entre em contato com o seu fisioterapeuta ou equipe de suporte.
        </Text>

        <Link href="/(auth)/login" style={styles.link}>
          Voltar para login
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    color: Colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  info: {
    color: '#111827',
    fontWeight: '500',
    lineHeight: 22,
  },
  link: {
    color: Colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});

