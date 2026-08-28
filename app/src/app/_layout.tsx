import * as SplashScreen from 'expo-splash-screen';
import ICareBottomTabs from '@/components/ICareBottomTabs';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return <ICareBottomTabs />;
}
