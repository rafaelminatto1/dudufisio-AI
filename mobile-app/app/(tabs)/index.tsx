import { Redirect } from 'expo-router';
import { Screens } from '../../constants/Config';

export default function TabsIndex() {
  return <Redirect href={Screens.tabs.home} />;
}

