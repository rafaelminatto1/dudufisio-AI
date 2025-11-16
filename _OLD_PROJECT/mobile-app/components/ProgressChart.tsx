import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import type { ExerciseProgressPoint } from '../types';

type Props = {
  data: ExerciseProgressPoint[];
};

export function ProgressChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Sem histórico por enquanto.</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map(point => point.completedExercises), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Evolução semanal</Text>
      <View style={styles.chartArea}>
        {data.map(point => {
          const percent = (point.completedExercises / maxValue) * 100;
          return (
            <View key={point.date} style={styles.barRow}>
              <Text style={styles.barLabel}>{point.date}</Text>
              <View style={styles.barBackground}>
                <View style={[styles.barFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.barValue}>{point.completedExercises}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  chartArea: {
    gap: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabel: {
    width: 60,
    color: Colors.muted,
    fontSize: 12,
  },
  barBackground: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 999,
  },
  barValue: {
    width: 24,
    textAlign: 'right',
    color: '#111827',
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.muted,
  },
});

