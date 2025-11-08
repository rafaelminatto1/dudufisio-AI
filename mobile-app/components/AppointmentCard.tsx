import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import type { Appointment } from '../types';

type Props = {
  appointment: Appointment;
};

const statusColors: Record<Appointment['status'], string> = {
  scheduled: Colors.primary,
  completed: Colors.success,
  cancelled: Colors.danger,
};

export function AppointmentCard({ appointment }: Props) {
  const statusColor = statusColors[appointment.status];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Feather name="calendar" size={20} color={Colors.primary} />
        <Text style={styles.title}>{appointment.therapist}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>{appointment.status}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Feather name="clock" size={16} color={Colors.muted} />
          <Text style={styles.detailText}>
            {appointment.date} · {appointment.startTime}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="map-pin" size={16} color={Colors.muted} />
          <Text style={styles.detailText}>{appointment.location}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    textTransform: 'capitalize',
    fontWeight: '600',
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    color: Colors.muted,
    fontSize: 14,
  },
});

