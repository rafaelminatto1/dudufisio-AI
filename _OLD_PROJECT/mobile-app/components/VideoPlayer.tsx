import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Colors } from '../constants/Colors';

type Props = {
  source: string;
};

export function VideoPlayer({ source }: Props) {
  const [isLoading, setLoading] = useState(true);

  const handleLoad = useCallback(() => setLoading(false), []);

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.overlay}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}
      <Video
        style={StyleSheet.absoluteFill}
        source={{ uri: source }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        onLoad={handleLoad}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    backgroundColor: '#0F172A',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
});

