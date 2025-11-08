import * as Notifications from 'expo-notifications';

export async function requestPushPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) {
    return true;
  }

  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function scheduleReminder(title: string, body: string, seconds = 3600) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds },
  });
}

