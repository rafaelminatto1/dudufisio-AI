import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { ExerciseCard } from '../../components/ExerciseCard';
import { ProgressChart } from '../../components/ProgressChart';
import { useExercises } from '../../hooks/useExercises';
import { Colors } from '../../constants/Colors';

export default function ExercisesScreen() {
  const { exercises, progress, isLoading } = useExercises();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={exercises}
      keyExtractor={item => item.id}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Seu programa personalizado</Text>
          <ProgressChart data={progress} />
          <Text style={styles.subtitle}>Exercícios recomendados para esta semana:</Text>
        </View>
      }
      renderItem={({ item }) => <ExerciseCard exercise={item} />}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    gap: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: Colors.muted,
  },
});

