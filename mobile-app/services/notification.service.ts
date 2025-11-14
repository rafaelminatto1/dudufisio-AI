import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { supabase } from './supabase';

async function getProjectId(): Promise<string | undefined> {
  try {
    return (
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.expoConfig?.projectId ??
      Constants?.manifest2?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId
    );
  } catch {
    return undefined;
  }
}

export async function requestPushPermission(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) {
    return true;
  }

  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

async function getDevicePushToken(): Promise<string | null> {
  try {
    const projectId = await getProjectId();
    const tokenResponse = await Notifications.getDevicePushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    return tokenResponse?.data ?? null;
  } catch (error) {
    console.warn('[notification.service] Failed to obtain device push token', error);
    return null;
  }
}

export async function registerPushTokenForUser(userId: string): Promise<string | null> {
  const hasPermission = await requestPushPermission();
  if (!hasPermission) {
    return null;
  }

  const token = await getDevicePushToken();
  if (!token) {
    return null;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) {
    throw new Error('Usuário não autenticado');
  }

  const deviceBrand = Device.brand ?? 'unknown-brand';
  const deviceModel = Device.modelName ?? 'unknown-model';

  const { error } = await supabase.from('push_notification_tokens').upsert(
    {
      user_id: userId,
      token,
      device_type: 'mobile',
      os: Platform.OS,
      browser: `${deviceBrand}-${deviceModel}`.toLowerCase(),
      enabled: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'token' },
  );

  if (error) {
    throw error;
  }

  return token;
}

export async function disablePushToken(token: string): Promise<void> {
  if (!token) return;
  const { error } = await supabase
    .from('push_notification_tokens')
    .update({ enabled: false })
    .eq('token', token);

  if (error) {
    console.warn('[notification.service] Failed to disable push token', error);
  }
}

export async function scheduleReminder(title: string, body: string, seconds = 3600) {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds },
  });
}

