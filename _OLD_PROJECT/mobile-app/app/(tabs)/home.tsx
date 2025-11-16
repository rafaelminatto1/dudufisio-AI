import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useEffect, useRef } from 'react';
import { Colors } from '../../constants/Colors';
import { useAuth } from '../../hooks/useAuth';
import { useAppointments } from '../../hooks/useAppointments';
import { AppointmentCard } from '../../components/AppointmentCard';
import { registerPushTokenForUser } from '../../services/notification.service';

export default function HomeScreen() {
  const { user } = useAuth();
  const { appointments } = useAppointments();
  const hasRegisteredPush = useRef(false);

  useEffect(() => {
    if (!user?.id || hasRegisteredPush.current) {
      return;
    }

    hasRegisteredPush.current = true;

    registerPushTokenForUser(user.id).catch((error) => {
      console.warn('[HomeScreen] Falha ao registrar push token', error);
      hasRegisteredPush.current = false;
    });
  }, [user?.id]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Olá, {user?.name ?? 'Paciente'}</Text>
      <Text style={styles.subheading}>Aqui está um resumo do seu acompanhamento.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas consultas</Text>
        {appointments.map(appointment => (
          <AppointmentCard key={appointment.id} appointment={appointment} />
        ))}
        {appointments.length === 0 && (
          <Text style={styles.empty}>Nenhuma consulta agendada. Entre em contato com seu terapeuta.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: Colors.background,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subheading: {
    color: Colors.muted,
  },
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  empty: {
    color: Colors.muted,
    fontStyle: 'italic',
  },
});

