import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import type { Exercise } from '../types';

type Props = {
  exercise: Exercise;
};

export function ExerciseCard({ exercise }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{exercise.name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{exercise.difficulty.toUpperCase()}</Text>
        </View>
      </View>

      <Text style={styles.description}>{exercise.description}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Feather name="target" size={16} color={Colors.primary} />
          <Text style={styles.metaText}>{exercise.focusArea}</Text>
        </View>
        <View style={styles.metaItem}>
          <Feather name="repeat" size={16} color={Colors.primary} />
          <Text style={styles.metaText}>
            {exercise.recommendedSets}x{exercise.recommendedReps}
          </Text>
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
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  description: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: Colors.muted,
    fontSize: 14,
  },
});

