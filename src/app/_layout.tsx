import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, useFonts } from '@expo-google-fonts/inter';
import { PlayfairDisplay_600SemiBold, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/state/auth-context';
import { MenuProvider } from '@/state/menu-context';
import { ThemeProvider as AppThemeProvider, useAppTheme } from '@/state/theme-context';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { colors, isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontSize: 16, fontWeight: '600' },
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[itemCode]" options={{ title: 'Item' }} />
        <Stack.Screen name="search" options={{ title: 'Search' }} />
        <Stack.Screen name="cart" options={{ title: 'Your Cart' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="auth/otp-login" options={{ title: 'Sign In', presentation: 'modal' }} />
        <Stack.Screen name="account/profile-settings" options={{ title: 'Profile' }} />
        <Stack.Screen name="account/favorites" options={{ title: 'Favorites' }} />
        <Stack.Screen name="account/order-history" options={{ title: 'My Orders' }} />
        <Stack.Screen name="account/order/[invoice]" options={{ title: 'Order Detail' }} />
        <Stack.Screen name="account/order/[invoice]/review" options={{ title: 'Rate & Review' }} />
        <Stack.Screen name="account/my-reservations" options={{ title: 'My Reservations' }} />
        <Stack.Screen name="account/my-reviews" options={{ title: 'My Reviews' }} />
        <Stack.Screen name="account/theme-settings" options={{ title: 'Appearance' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AppThemeProvider>
      <AuthProvider>
        <MenuProvider>
          <AnimatedSplashOverlay />
          <RootStack />
        </MenuProvider>
      </AuthProvider>
    </AppThemeProvider>
  );
}
