import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useAppointments } from '../../hooks/useAppointments';
import { AppointmentCard } from '../../components/AppointmentCard';
import { Colors } from '../../constants/Colors';

export default function ScheduleScreen() {
  const { appointments } = useAppointments();

  return (
    <FlatList
      data={appointments}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => <AppointmentCard appointment={item} />}
      ListHeaderComponent={<Text style={styles.title}>Agenda</Text>}
      ListEmptyComponent={<Text style={styles.empty}>Nenhuma consulta por aqui.</Text>}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  empty: {
    color: Colors.muted,
    textAlign: 'center',
    marginTop: 32,
  },
});

