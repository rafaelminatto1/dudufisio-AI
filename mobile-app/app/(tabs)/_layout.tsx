import { Tabs } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';

const tabIcons: Record<string, React.ComponentProps<typeof Feather>['name']> = {
  home: 'home',
  exercises: 'activity',
  schedule: 'calendar',
  profile: 'user',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Feather name={tabIcons.home} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: 'Exercícios',
          tabBarIcon: ({ color, size }) => (
            <Feather name={tabIcons.exercises} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, size }) => (
            <Feather name={tabIcons.schedule} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Feather name={tabIcons.profile} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

